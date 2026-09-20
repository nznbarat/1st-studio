/* ══════════════════════════════════════════════════════════════════════
   1st Studio — Claude-ийн даалгаврууд

   Дөрвөн ажил:
     1. aiCamera   — монгол өгүүлбэр → камерын хөдөлгөөн
     2. aiShots    — нэг дүр зураг → 3 өөр шотын санал
     3. aiPrompt   — AI видеоны промтыг сайжруулах
     4. aiTerm     — нэр томъёоны гүнзгий тайлбар (Толь)

   Claude-ийн хариуг ХЭЗЭЭ Ч шууд ажиллуулахгүй. Зөвхөн программын
   өөрийн танигч (promptToCamera) ойлгодог үгийг л буцаадаг ба
   бүх тоог хязгаарт нь багтаан шалгана.
   ══════════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  const T = root.AITASK = {};

  /* Программын танигч ойлгодог бүх тушаал. Claude зөвхөн эднээс сонгоно. */
  const VOCAB = [
    'MOVEMENT (combine with " then " between steps):',
    '  orbit N degrees clockwise | orbit N degrees counter-clockwise   (N = 45/90/180/270/360)',
    '  dolly in | dolly out | push in | pull back',
    '  crane up | crane down',
    '  zoom in | zoom out | dolly zoom',
    '  pan left | pan right | whip pan',
    '  tilt up | tilt down',
    '  truck left | truck right',
    '  static | handheld | fly by | spiral | follow | reveal',
    'ANGLE:  low angle | high angle | eye level | top down | dutch',
    'SHOT SIZE:  extreme close-up | close-up | medium close | medium shot |',
    '            full shot | wide shot | extreme wide',
    'SPEED:  slow | fast   or an explicit "6 seconds"',
    'ENVIRONMENT id (env): blender | night | dusk | snow | dawn | noir | void'
  ].join('\n');

  const SYS = [
    'You are the shot-planning assistant inside "1st Studio — Camera Director",',
    'a 3D camera blocking tool used by a Mongolian filmmaker.',
    'The user writes in Mongolian. You translate their intent into the exact',
    'camera command vocabulary the tool\'s parser understands.',
    '',
    'RULES',
    '- "command" must use ONLY the phrases listed below, in English, lowercase.',
    '- Join separate moves with " then " (at most 3 steps).',
    '- Always include one shot size and one angle when the user implies them.',
    '- "explain" is written in simple, warm Mongolian for an older beginner.',
    '  Say what the camera does and WHY it suits the scene. 2-3 short sentences.',
    '- Never invent vocabulary. Never output code. Return JSON only.',
    '',
    VOCAB
  ].join('\n');

  const ENV_IDS = ['blender', 'night', 'dusk', 'snow', 'dawn', 'noir', 'void'];

  /* ── Хариуг цэвэрлэх, хязгаарт багтаах ── */
  const clampN = (v, lo, hi, dflt) => {
    const n = +v;
    return isFinite(n) ? Math.min(hi, Math.max(lo, n)) : dflt;
  };
  const cleanCmd = s => String(s || '').replace(/[^\x20-\x7e]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
  const cleanMn = (s, max) => String(s || '').replace(/[\u0000-\u0008\u000b-\u001f]/g, ' ').trim().slice(0, max || 700);

  /** Claude-ийн буцаасан төлөвлөгөөг найдвартай болгоно */
  T.sanitize = function (p) {
    p = p && typeof p === 'object' ? p : {};
    const env = ENV_IDS.indexOf(String(p.env || '')) >= 0 ? String(p.env) : null;
    return {
      command: cleanCmd(p.command),
      duration: p.duration == null ? null : clampN(p.duration, 0.5, 60, null),
      people: p.people == null ? null : Math.round(clampN(p.people, 0, 8, 0)),
      env: env,
      scene: cleanMn(p.scene, 200),
      explain: cleanMn(p.explain, 900),
      title: cleanMn(p.title, 80),
      why: cleanMn(p.why, 400)
    };
  };

  /* ══ 1. Монголоор бичихэд камер үүсгэх ══ */
  T.camera = async function (mn) {
    const plan = await root.CLA.askJSON(
      'Дүр зураг (монголоор):\n' + String(mn || '').slice(0, 1500) + '\n\n' +
      'Return JSON exactly like:\n' +
      '{"command":"...","duration":6,"people":2,"env":"studio-id",' +
      '"scene":"short English description of the setting",' +
      '"explain":"Монголоор тайлбар"}\n' +
      'duration is seconds (2-20). people is how many human figures the scene needs (0-8).',
      1400, { system: SYS, temperature: 0.3 }
    );
    return T.sanitize(plan);
  };

  /* ══ 2. Гурван шотын санал ══ */
  T.shots = async function (mn) {
    const arr = await root.CLA.askJSON(
      'Дүр зураг (монголоор):\n' + String(mn || '').slice(0, 1500) + '\n\n' +
      'Propose THREE clearly different camera treatments for this scene.\n' +
      'Return a JSON array of exactly 3 objects:\n' +
      '[{"title":"Монгол нэр (3-5 үг)","command":"...","duration":6,"people":2,' +
      '"env":"studio-id","why":"Яагаад тохирохыг монголоор 1-2 өгүүлбэр"}]\n' +
      'Make them genuinely different: e.g. one intimate, one wide and slow, one energetic.',
      2000, { system: SYS, temperature: 0.7 }
    );
    return (Array.isArray(arr) ? arr : []).slice(0, 3).map(T.sanitize).filter(p => p.command);
  };

  /* ══ 3. AI видеоны промтыг сайжруулах ══ */
  T.prompt = async function (current, target) {
    const who = {
      sora: 'OpenAI Sora 2', veo: 'Google Veo 3', runway: 'Runway Gen-4',
      kling: 'Kling', luma: 'Luma Dream Machine', generic: 'a modern text-to-video model'
    }[target] || 'a modern text-to-video model';
    return cleanMn(await root.CLA.ask(
      'Here is a camera-blocking prompt generated by a 3D previz tool:\n\n' +
      String(current || '').slice(0, 4000) + '\n\n' +
      'Rewrite it as one polished English prompt for ' + who + '.\n' +
      'Keep EVERY camera instruction, lens value, timing and subject placement exactly as given —\n' +
      'they come from real 3D blocking and must not change. Add only what is missing:\n' +
      'lighting quality, texture and material detail, mood, and film-stock feel.\n' +
      'One flowing paragraph, no headings, no bullet points, no preamble. Output the prompt only.',
      1500, { temperature: 0.5 }
    ), 4000);
  };

  /* ══ 4. Нэр томъёоны тайлбар (Толь) ══ */
  T.term = async function (word, context) {
    return cleanMn(await root.CLA.ask(
      'Кино, камер, Blender-ийн нэр томъёо: «' + String(word || '').slice(0, 120) + '»\n' +
      (context ? 'Толь дээрх товч тайлбар: ' + String(context).slice(0, 600) + '\n' : '') +
      '\nЭнэ үгийг МОНГОЛООР тайлбарлана уу. Уншигч нь 60 гаруй настай, ' +
      'программчлал мэдэхгүй, кино хийж сурч байгаа хүн.\n' +
      'Бүтэц:\n' +
      '1) Нэг өгүүлбэрээр энгийнээр\n' +
      '2) Яагаад хэрэгтэй, хэзээ хэрэглэдэг вэ\n' +
      '3) Амьдрал дээрх жишээ (монгол кино, байгаль, өдөр тутмын зүйлтэй зүйрлэ)\n' +
      '4) Blender эсвэл 1st Studio дээр хаана байдаг вэ\n' +
      'Тодорхой, богино өгүүлбэр. Товчилсон англи үг хэрэглэвэл хажууд нь монголоор тайлбарла.',
      1400, { temperature: 0.4 }
    ), 3000);
  };

  T.VOCAB = VOCAB;
  T.SYSTEM = SYS;
})(window);
