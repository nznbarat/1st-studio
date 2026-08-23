"""Тушаалын мөрний интерфейс.

    python -m v2v3d run --input ./videos --output ./output --style 3d-render
    python -m v2v3d plan --input ./videos          # өртөг, төлөвлөгөө (API дуудахгүй)
    python -m v2v3d styles                          # бэлэн загварууд
    python -m v2v3d schema --provider fal           # API‑гийн бодит талбарууд
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

from . import __version__
from . import comfy_workflow as wf
from . import config as cfg
from . import doctor as doc
from .config import DEFAULT_ENDPOINTS, Settings
from .media import has_ffmpeg
from .pipeline import plan_batch, run_batch
from .styles import build_prompt, load_styles

DEFAULT_WORKFLOW = Path(__file__).resolve().parent.parent / "workflows" / "wan-vace-v2v.api.json"


# ---------------------------------------------------------------------------
# Аргументууд
# ---------------------------------------------------------------------------
def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="v2v3d",
        description="Видео багцыг Seedance 2.5‑аар 3D render загварт хөрвүүлэх.",
    )
    parser.add_argument("--version", action="version", version=f"v2v3d {__version__}")
    sub = parser.add_subparsers(dest="command", required=True)

    run = sub.add_parser("run", help="багцыг хөрвүүлэх")
    plan = sub.add_parser("plan", help="төлөвлөгөө ба өртгийг харах (API дуудахгүй)")
    for p in (run, plan):
        _add_common(p)

    run.add_argument("--dry-run", action="store_true", help="зөвхөн төлөвлөгөөг харуулна")
    run.add_argument("--keep-work", action="store_true", help="түр файлуудыг үлдээх")

    sub.add_parser("styles", help="бэлэн загваруудыг жагсаах")

    schema = sub.add_parser("schema", help="provider‑ийн бодит оролтын талбарууд")
    schema.add_argument("--provider", default="fal", choices=sorted(DEFAULT_ENDPOINTS))
    schema.add_argument("--endpoint", default=None)

    doctor = sub.add_parser("doctor", help="ComfyUI сервер ба workflow‑г шалгах")
    doctor.add_argument("--endpoint", default=DEFAULT_ENDPOINTS["comfy"], help="ComfyUI хаяг")
    doctor.add_argument("--workflow", type=Path, default=None, help="API‑форматтай workflow")
    doctor.add_argument("--map", action="append", default=[], metavar="НЭР=ЗАНГИЛАА.ОРОЛТ")
    return parser


def _add_common(p: argparse.ArgumentParser) -> None:
    p.add_argument("--input", "-i", required=True, type=Path, help="mp4 хавтас")
    p.add_argument("--output", "-o", type=Path, default=Path("output"), help="гаралтын хавтас (анхдагч: ./output)")

    p.add_argument("--style", default="3d-render", help="загварын нэр (styles командыг үзнэ үү)")
    p.add_argument("--prompt", default=None, help="загварыг орлох өөрийн промт")
    p.add_argument("--prompt-file", type=Path, default=None, help="промтыг файлаас унших")
    p.add_argument("--extra-prompt", default=None, help="промтын төгсгөлд нэмэх өгүүлбэр")

    p.add_argument("--provider", default=os.environ.get("V2V3D_PROVIDER", "fal"), choices=sorted(DEFAULT_ENDPOINTS))
    p.add_argument("--endpoint", default=os.environ.get("V2V3D_ENDPOINT"), help="загварын endpoint‑ыг дарах")

    p.add_argument("--resolution", default="720p", choices=list(cfg.RESOLUTIONS))
    p.add_argument("--aspect-ratio", default="auto", choices=list(cfg.ASPECT_RATIOS))
    p.add_argument("--duration", default="auto", help="'auto' (эх хэсгийн урттай тэнцүү) эсвэл 4–30")
    p.add_argument("--audio", action="store_true", help="дуу үүсгэх")
    p.add_argument("--seed", type=int, default=None)
    p.add_argument("--style-image", action="append", default=[], metavar="ЗАМ|URL",
                   help="загварын лавлагаа зураг (олон удаа өгч болно)")

    p.add_argument("--long-video", default="segment", choices=("segment", "trim", "whole", "skip"),
                   help="хязгаараас урт видеог яах вэ")
    p.add_argument("--chunk-seconds", type=int, default=None,
                   help="хэсэг бүрийн урт (анхдагч: fal 10с, comfy 5с)")
    p.add_argument("--max-ref-seconds", type=int, default=None,
                   help="нэг хүсэлтэд өгөх хамгийн урт хэсэг (provider‑ийн хязгаарыг дарна)")
    p.add_argument("--reencode-split", action="store_true", help="хэрчихдээ дахин кодлох (илүү нарийвчлалтай)")

    p.add_argument("--recursive", "-r", action="store_true", help="дэд хавтсуудыг ч хамруулах")
    p.add_argument("--ext", nargs="+", default=list(cfg.VIDEO_EXTENSIONS), help="хамрах өргөтгөлүүд")
    p.add_argument("--concurrency", "-c", type=int, default=None,
                   help="зэрэг ажиллах файлын тоо (анхдагч: fal 2, comfy 1 — нэг GPU)")
    p.add_argument("--retries", type=int, default=3, help="алдаа гарвал дахин оролдох тоо")
    p.add_argument("--limit", type=int, default=None, help="эхний N файлыг л авах (турших)")
    p.add_argument("--overwrite", action="store_true", help="байгаа гаралтыг дарж бичих")
    p.add_argument("--set", action="append", default=[], metavar="ТҮЛХҮҮР=УТГА",
                   help="payload‑д нэмэлт талбар (comfy үед ЗАНГИЛАА.ОРОЛТ=УТГА)")

    comfy = p.add_argument_group("локал ComfyUI (--provider comfy)")
    comfy.add_argument("--workflow", type=Path, default=None,
                       help=f"API‑форматтай workflow (анхдагч: {DEFAULT_WORKFLOW.name})")
    comfy.add_argument("--fps", type=int, default=16, help="загварын кадрын давтамж")
    comfy.add_argument("--strength", type=float, default=None,
                       help="VACE хяналтын хүч 0–1 (бага = илүү эрх чөлөө)")
    comfy.add_argument("--map", action="append", default=[], metavar="НЭР=ЗАНГИЛАА.ОРОЛТ",
                       help="оруулах цэгийг гараар заах (авто‑танилтыг дарна)")


def settings_from_args(args) -> Settings:
    prompt = args.prompt
    if args.prompt_file:
        prompt = args.prompt_file.read_text(encoding="utf-8").strip()

    limits = cfg.PROVIDER_LIMITS.get(args.provider, cfg.PROVIDER_LIMITS["fal"])
    chunk = args.chunk_seconds or limits.default_chunk_seconds
    concurrency = args.concurrency or (1 if args.provider == "comfy" else 2)

    if args.provider == "comfy":
        extra = {
            "workflow": str(args.workflow or DEFAULT_WORKFLOW),
            "fps": args.fps,
            "strength": args.strength,
            "mapping": wf.parse_mapping(args.map),
            "overrides": parse_set(args.set),
        }
    else:
        extra = parse_set(args.set)

    return Settings(
        input_dir=args.input,
        output_dir=args.output,
        provider=args.provider,
        endpoint=args.endpoint,
        prompt=build_prompt(args.style, prompt, args.extra_prompt),
        style=args.style,
        resolution=args.resolution,
        aspect_ratio=args.aspect_ratio,
        duration=args.duration,
        generate_audio=args.audio,
        seed=args.seed,
        style_images=list(args.style_image),
        long_video=args.long_video,
        chunk_seconds=chunk,
        reencode_split=args.reencode_split,
        max_ref_seconds=args.max_ref_seconds,
        recursive=args.recursive,
        extensions=tuple(args.ext),
        concurrency=concurrency,
        retries=args.retries,
        limit=args.limit,
        overwrite=args.overwrite,
        dry_run=getattr(args, "dry_run", False),
        keep_work=getattr(args, "keep_work", False),
        extra=extra,
    )


def parse_set(pairs: list[str]) -> dict:
    """--set key=value → dict.  Утгыг JSON‑оор уншиж, болохгүй бол мөрөөр авна."""
    out: dict = {}
    for item in pairs:
        key, sep, value = item.partition("=")
        if not sep:
            raise SystemExit(f"--set '{item}' буруу — ТҮЛХҮҮР=УТГА хэлбэртэй байна")
        try:
            out[key.strip()] = json.loads(value)
        except json.JSONDecodeError:
            out[key.strip()] = value
    return out


# ---------------------------------------------------------------------------
# Командууд
# ---------------------------------------------------------------------------
def cmd_styles() -> int:
    print("Бэлэн загварууд:\n")
    for style in load_styles().values():
        print(f"  {style.id:<14} {style.name}")
        print(f"  {'':<14} {style.desc}\n")
    print("Хэрэглэх:  python -m v2v3d run -i ./videos --style clay")
    return 0


def cmd_schema(args) -> int:
    from .providers import get_provider

    endpoint = args.endpoint or DEFAULT_ENDPOINTS[args.provider]
    provider = get_provider(args.provider, endpoint)
    url = provider.schema_url()
    headers = {"User-Agent": "v2v3d/1.0"}
    if args.provider == "replicate" and os.environ.get("REPLICATE_API_TOKEN"):
        headers["Authorization"] = f"Bearer {os.environ['REPLICATE_API_TOKEN']}"

    print(f"Endpoint: {endpoint}\nСхем: {url}\n")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=60) as resp:
            doc = json.loads(resp.read().decode("utf-8"))
    except (urllib.error.URLError, json.JSONDecodeError, TimeoutError) as exc:
        print(f"⚠️  Схем татаж чадсангүй: {exc}")
        print("   Загварын хуудсыг гараар нээж талбарын нэрсийг шалгаад,")
        print("   шаардвал --set эсвэл V2V3D_RP_*_FIELD орчны хувьсагчаар тохируулна уу.")
        return 1

    for name, props in _input_fields(doc).items():
        kind = props.get("type", "?")
        title = props.get("title") or props.get("description") or ""
        print(f"  {name:<20} {kind:<10} {str(title)[:60]}")
    return 0


def _input_fields(doc: dict) -> dict:
    """OpenAPI бичиг баримтаас оролтын талбаруудыг гаргаж авна."""
    schemas = doc.get("components", {}).get("schemas", {})
    for key, value in schemas.items():
        if "input" in key.lower() and isinstance(value.get("properties"), dict):
            return value["properties"]
    # Replicate: latest_version.openapi_schema дотор байрлана
    nested = doc.get("latest_version", {}).get("openapi_schema")
    if isinstance(nested, dict):
        return _input_fields(nested)
    return {}


def cmd_doctor(args) -> int:
    """ComfyUI сервер асаалттай эсэх, workflow нь тэр сервер дээр ажиллах эсэхийг шалгана."""
    endpoint = args.endpoint.rstrip("/")
    path = args.workflow or DEFAULT_WORKFLOW
    print(f"ComfyUI : {endpoint}\nWorkflow: {path}\n")

    try:
        workflow = wf.load_workflow(path)
    except (wf.WorkflowError, OSError, json.JSONDecodeError) as exc:
        print(f"❌ {exc}")
        return 2

    try:
        targets = wf.resolve_targets(workflow)
        targets.update(wf.parse_mapping(args.map))
    except wf.WorkflowError as exc:
        print(f"❌ {exc}")
        return 2

    print("Оруулах цэгүүд (авто‑танилт):")
    for name in wf.TARGET_NAMES:
        target = targets.get(name)
        print(f"  {name:<9} {target if target else '— олдсонгүй'}")
    missing = [n for n in ("video", "prompt") if n not in targets]
    if missing:
        print(f"\n❌ Заавал хэрэгтэй цэг олдсонгүй: {', '.join(missing)}")
        print("   --map video=ЗАНГИЛАА.ОРОЛТ гэж зааж өгнө үү.")

    print()
    try:
        request = urllib.request.Request(f"{endpoint}/object_info", headers={"User-Agent": "v2v3d/1.0"})
        with urllib.request.urlopen(request, timeout=120) as resp:
            object_info = json.loads(resp.read().decode("utf-8"))
    except (urllib.error.URLError, json.JSONDecodeError, TimeoutError) as exc:
        print(f"⚠️  Сервертэй холбогдож чадсангүй: {exc}")
        print("   ComfyUI‑гаа асаагаад дахин оролдоно уу (--endpoint‑ыг шалгах).")
        return 1

    issues = doc.check_workflow(workflow, object_info)
    for level, message in issues:
        print(f"  {'❌' if level == doc.ERROR else '⚠️ '} {message}")
    errors, warnings = doc.summarize(issues)
    if not issues:
        print("✅ Workflow сервер дээрх зангилаа, моделиудтай бүрэн таарч байна.")
    else:
        print(f"\nАлдаа {errors} · Сануулга {warnings}")
    return 1 if (errors or missing) else 0


def cmd_plan(settings: Settings, prompt: str) -> int:
    errors = settings.validate()
    if errors:
        for e in errors:
            print(f"⚠️  {e}")
        return 2
    if not settings.input_dir.is_dir():
        print(f"⚠️  '{settings.input_dir}' хавтас олдсонгүй")
        return 2

    plans = plan_batch(settings)
    if not plans:
        print(f"⚠️  {settings.input_dir} дотор видео олдсонгүй")
        return 1

    print(f"Provider : {settings.provider} — {settings.resolved_endpoint()}"
          f"{'  (локал, төлбөргүй)' if settings.is_local else ''}")
    print(f"Загвар   : {settings.style}   Нягтрал: {settings.resolution}")
    print(f"Промт    : {prompt[:110]}{'…' if len(prompt) > 110 else ''}\n")

    total = 0.0
    for plan in plans:
        if plan.skipped:
            print(f"  ⏭  {plan.key:<34} {plan.skipped}")
            continue
        total += plan.cost
        cost = "төлбөргүй" if settings.is_local else f"≈ ${plan.cost:.2f}"
        print(f"  ▸  {plan.key:<34} {plan.duration:6.1f}с  {len(plan.segments)} хэсэг  {cost}")
    todo = [p for p in plans if not p.skipped]
    if settings.is_local:
        print(f"\n  Нийт {len(todo)} файл — локал ComfyUI дээр төлбөргүй")
    else:
        print(f"\n  Нийт {len(todo)} файл, ойролцоо өртөг ≈ ${total:.2f} (USD, батлагаагүй тооцоо)")
    return 0


def cmd_run(settings: Settings, prompt: str) -> int:
    if settings.dry_run:
        return cmd_plan(settings, prompt)

    code = cmd_plan(settings, prompt)
    if code != 0:
        return code
    print()

    counts = run_batch(settings, prompt)
    print(
        f"\nДүн: болсон {counts.get('done', 0)} · "
        f"алгассан {counts.get('skipped', 0)} · алдаатай {counts.get('error', 0)}"
    )
    return 1 if counts.get("error") else 0


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)

    if args.command == "styles":
        return cmd_styles()
    if args.command == "schema":
        return cmd_schema(args)
    if args.command == "doctor":
        return cmd_doctor(args)

    try:
        settings = settings_from_args(args)
    except KeyError as exc:
        print(f"⚠️  {exc.args[0]}")
        return 2

    if args.provider == "comfy" and not Path(settings.extra["workflow"]).exists():
        print(f"⚠️  Workflow олдсонгүй: {settings.extra['workflow']}")
        print("   ComfyUI‑гаасаа API‑форматтай workflow экспортлоод --workflow‑оор зааж өгнө үү.")
        return 2

    if not has_ffmpeg():
        print("⚠️  ffmpeg/ffprobe олдсонгүй — хэрчих, наах, урт хэмжих боломжгүй.")
        print("   Суулгах:  apt install ffmpeg  |  brew install ffmpeg")
        return 2

    if args.command == "plan":
        return cmd_plan(settings, settings.prompt)
    return cmd_run(settings, settings.prompt)


if __name__ == "__main__":  # pragma: no cover
    sys.exit(main())
