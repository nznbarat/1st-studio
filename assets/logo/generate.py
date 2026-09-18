# "AND" sport wordmark v2 — new angular (octagonal) letterforms, clearly different from the original.
# Letters in a 100-unit tall box, stem width 26. Hand-built paths, no fonts needed.

A = ("M0,100 L30,0 L66,0 L96,100 L70,100 L64,80 L32,80 L26,100 Z "     # flat apex, notch below crossbar
     "M42.2,46 L53.8,46 L58,60 L38,60 Z")                              # slit counter (sport style)   w=96
N = ("M0,100 L0,12 L12,0 L26,0 L58,52 L58,0 L84,0 L84,88 L72,100 "
     "L58,100 L26,48 L26,100 Z")                                       # chamfered corners            w=84
D = ("M0,0 L62,0 L88,26 L88,74 L62,100 L0,100 Z "
     "M26,22 L47,22 L62,37 L62,63 L47,78 L26,78 Z")                    # hexagonal D                  w=88

AX, NX, DX = 0, 88, 162
GAP  = 7          # knockout gap where letters overlap
SKEW = -14        # italic slant

def letters(dark, red):
    return f"""
  <defs>
    <mask id="mA" maskUnits="userSpaceOnUse" x="-500" y="-500" width="2000" height="2000">
      <rect x="-500" y="-500" width="2000" height="2000" fill="white"/>
      <path transform="translate({NX},0)" d="{N}" fill="black" stroke="black" stroke-width="{GAP}" stroke-linejoin="miter" stroke-miterlimit="8"/>
    </mask>
    <mask id="mN" maskUnits="userSpaceOnUse" x="-500" y="-500" width="2000" height="2000">
      <rect x="-500" y="-500" width="2000" height="2000" fill="white"/>
      <path transform="translate({DX},0)" d="{D}" fill="black" stroke="black" stroke-width="{GAP}" stroke-linejoin="miter" stroke-miterlimit="8"/>
    </mask>
  </defs>
  <path transform="translate({AX},0)" d="{A}" fill="{dark}" fill-rule="evenodd" mask="url(#mA)"/>
  <path transform="translate({NX},0)" d="{N}" fill="{red}"  mask="url(#mN)"/>
  <path transform="translate({DX},0)" d="{D}" fill="{dark}" fill-rule="evenodd"/>"""

def speed_marks(dark, red):
    # three motion dashes on the left + tapered underline bar
    return f"""
  <path d="M-60,20 H-24 L-18,32 H-54 Z"  fill="{red}"/>
  <path d="M-78,44 H-16 L-10,56 H-72 Z"  fill="{red}"/>
  <path d="M-50,68 H-8  L-2,80  H-44 Z"  fill="{red}"/>
  <path d="M0,112 H160 V124 H0 Z" fill="{dark}"/>
  <path d="M160,112 H250 L270,118 L250,124 H160 Z" fill="{red}"/>"""

def svg(body, w, h, bg=None):
    bgrect = f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ""
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">\n{bgrect}{body}\n</svg>\n'

BLACK, RED, WHITE, NAVY = "#111111", "#A6191E", "#FFFFFF", "#0B0E14"

# 1 clean (transparent)
open("and-logo-clean.svg","w").write(svg(f"""
<g transform="translate(36,20) skewX({SKEW})">{letters(BLACK, RED)}
</g>""", 300, 140))

# 2 speed (transparent)
open("and-logo-speed.svg","w").write(svg(f"""
<g transform="translate(108,20) skewX({SKEW})">{speed_marks(BLACK, RED)}{letters(BLACK, RED)}
</g>""", 400, 165))

# 3 dark background
open("and-logo-dark.svg","w").write(svg(f"""
<g transform="translate(134,44) skewX({SKEW})">{speed_marks(WHITE, RED)}{letters(WHITE, RED)}
</g>""", 440, 210, bg=NAVY))

# 4 emblem plate
open("and-logo-emblem.svg","w").write(svg(f"""
<g transform="translate(62,34) skewX({SKEW})">
  <path d="M-30,-18 H290 V130 H-30 Z" fill="{BLACK}"/>
  <path d="M-30,-18 H290 V-8 H-30 Z"  fill="{RED}"/>
  <path d="M-30,120 H290 V130 H-30 Z" fill="{RED}"/>
  <g transform="translate(12,6)">{letters(WHITE, RED)}</g>
</g>""", 380, 180))
print("ok")
