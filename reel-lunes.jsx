/* global React, ReactDOM, Stage, Sprite, useTime, useSprite, useTimeline, Easing, clamp */
const { useState, useEffect } = React;

const NAVY = "#0E2440";
const NAVY2 = "#0A1B30";
const CREAM = "#EFE6D6";
const SKY = "#AECEE2";
const ORANGE = "#E2673C";
const ANTON = '"Anton", sans-serif';
const SERIF = '"DM Serif Display", Georgia, serif';
const MONO = '"Space Mono", monospace';
const ARCHIVO = '"Archivo", sans-serif';

const DUR = 30;

function ease(localTime, delay, dur, fn = Easing.easeOutExpo) {
  return fn(clamp((localTime - delay) / dur, 0, 1));
}

const MAXW = 936;
function MaskLine({ children, size, delay = 0, dur = 0.7, color = CREAM, bg, lh = 0.9, ls = ".01em", font = ANTON, italic = false, exitDur = 0.4, align = "left", padTop = "0.42em", noExit = false }) {
  const { localTime, duration } = useSprite();
  const ref = React.useRef(null);
  const [fit, setFit] = useState(1);
  useEffect(() => {
    let alive = true;
    const measure = () => {
      const el = ref.current;
      if (!el || !alive) return;
      const natural = el.scrollWidth;
      const next = natural > MAXW ? MAXW / natural : 1;
      setFit((prev) => (Math.abs(next - prev) > 0.004 ? next : prev));
    };
    measure();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => requestAnimationFrame(() => requestAnimationFrame(measure)));
    }
    return () => { alive = false; };
  }, [children, size]);
  const p = ease(localTime, delay, dur);
  const exitStart = duration - exitDur;
  const out = noExit ? 0 : Easing.easeInCubic(clamp((localTime - exitStart) / exitDur, 0, 1));
  const ty = (1 - p) * 118 - out * 45;
  return (
    <div style={{ overflow: "hidden", paddingTop: padTop, paddingBottom: "0.05em" }}>
      <div ref={ref} style={{
        display: "inline-block",
        fontFamily: font, fontSize: size, lineHeight: lh, color,
        textTransform: italic ? "none" : "uppercase",
        fontStyle: italic ? "italic" : "normal",
        letterSpacing: ls,
        transform: `translateY(${ty}%) scale(${fit})`,
        transformOrigin: align === "center" ? "center top" : "left top",
        opacity: 1 - out,
        background: bg, padding: bg ? "0.04em 0.2em" : 0,
        willChange: "transform, opacity", whiteSpace: "pre",
      }}>{children}</div>
    </div>
  );
}

function BodyLine({ children, delay = 0, size = 46, color = CREAM, align = "left", dur = 0.6, maxW = 880 }) {
  const { localTime, duration } = useSprite();
  const p = ease(localTime, delay, dur, Easing.easeOutCubic);
  const exitStart = duration - 0.4;
  const out = Easing.easeInCubic(clamp((localTime - exitStart) / 0.4, 0, 1));
  return (
    <div style={{
      fontFamily: ARCHIVO, fontWeight: 600, fontSize: size, lineHeight: 1.32, color,
      textAlign: align, maxWidth: maxW,
      opacity: p * (1 - out), transform: `translateY(${(1 - p) * 22}px)`,
    }}>{children}</div>
  );
}

function Kicker({ children, delay = 0, color = ORANGE, size = 24, ls = ".3em" }) {
  const { localTime, duration } = useSprite();
  const p = ease(localTime, delay, 0.45, Easing.easeOutCubic);
  const out = Easing.easeInCubic(clamp((localTime - (duration - 0.4)) / 0.4, 0, 1));
  return (
    <div style={{
      fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: ls,
      textTransform: "uppercase", color, opacity: p * (1 - out),
      transform: `translateY(${(1 - p) * 12}px)`,
    }}>{children}</div>
  );
}

function SceneBox({ children, justify = "center", align = "flex-start" }) {
  return (
    <div style={{
      position: "absolute", inset: 0, display: "flex", flexDirection: "column",
      justifyContent: justify, alignItems: align, padding: "0 72px",
    }}>{children}</div>
  );
}

/* ---------- fondo ---------- */
function OrbitRings({ cx, cy, base, color, op, speed, count = 3 }) {
  const t = useTime();
  return (
    <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: count }).map((_, i) => {
        const r = base + i * base * 0.55;
        const ang = (t * speed * (i % 2 ? -1 : 1) + i * 70) * Math.PI / 180;
        const dx = cx + r * Math.cos(ang);
        const dy = cy + r * Math.sin(ang);
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={r} stroke={color} strokeWidth="1.5" fill="none" opacity={op} strokeDasharray="3 10" />
            <circle cx={dx} cy={dy} r={5} fill={color} opacity={op * 2.2} />
          </g>
        );
      })}
    </svg>
  );
}

function DigitRain() {
  const t = useTime();
  const cols = 9;
  return (
    <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: cols }).map((_, c) => {
        const x = 60 + c * 120;
        const speed = 60 + (c % 4) * 26;
        const y = ((t * speed + c * 240) % 2200) - 140;
        const n = ((c * 3 + Math.floor(t + c)) % 9) + 1;
        return (
          <text key={c} x={x} y={y} fill={CREAM} opacity="0.05"
            style={{ fontFamily: SERIF, fontSize: 120 }}>{n}</text>
        );
      })}
    </svg>
  );
}

function Background() {
  return (
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(120% 90% at 50% 12%, ${NAVY} 0%, ${NAVY2} 100%)`, overflow: "hidden" }}>
      <DigitRain />
      <OrbitRings cx={940} cy={360} base={120} color={SKY} op={0.15} speed={9} count={3} />
      <OrbitRings cx={150} cy={1560} base={150} color={ORANGE} op={0.13} speed={7} count={2} />
    </div>
  );
}

function TopBrand() {
  const t = useTime();
  const bright = t > 25.5 ? 0.95 : 0.4;
  return (
    <div style={{
      position: "absolute", top: 70, left: 0, right: 0, display: "flex", justifyContent: "center",
      gap: 11, alignItems: "center", fontFamily: MONO, fontWeight: 700, fontSize: 24,
      letterSpacing: ".18em", color: CREAM, opacity: bright, transition: "opacity .3s",
    }}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10.5" stroke={CREAM} strokeWidth="1.4" opacity=".5" />
        <circle cx="12" cy="12" r="6.5" stroke={CREAM} strokeWidth="1.4" opacity=".8" />
        <circle cx="12" cy="12" r="2.6" fill={ORANGE} />
      </svg>
      NUMERIKA<span style={{ color: ORANGE }}>.LAB</span>
    </div>
  );
}

/* ---------- motivo: puerta que se abre (número = puerta) ---------- */
function DoorGlyph({ delay = 0 }) {
  const { localTime } = useSprite();
  const p = ease(localTime, delay, 1.1, Easing.easeInOutCubic);
  const openL = p * 34;
  const openR = p * 34;
  return (
    <svg width="260" height="320" viewBox="0 0 260 320" fill="none">
      <rect x="10" y="6" width="240" height="308" rx="6" stroke={SKY} strokeWidth="3" opacity="0.55" />
      <rect x="18" y={14} width="94" height="292" rx="4" fill={NAVY2} stroke={CREAM} strokeWidth="2"
        style={{ transformOrigin: "18px 160px", transform: `rotateY(${-openL}deg)` }} opacity="0.92" />
      <rect x="148" y={14} width="94" height="292" rx="4" fill={NAVY2} stroke={CREAM} strokeWidth="2"
        style={{ transformOrigin: "242px 160px", transform: `rotateY(${openR}deg)` }} opacity="0.92" />
      <circle cx="130" cy="160" r={26 + p * 30} fill={ORANGE} opacity={0.25 + p * 0.55} />
      <text x="130" y="176" textAnchor="middle" fontFamily={SERIF} fontSize="58" fill={CREAM} opacity={0.4 + p * 0.6}>7</text>
    </svg>
  );
}

/* ---------- innovación: dial de lecciones (número → lección distinta) ---------- */
const LESSONS = [
  { n: "1", w: "soltar el control" },
  { n: "5", w: "dejar de posponer" },
  { n: "7", w: "confiar en su voz" },
];
function LessonDial() {
  const { localTime } = useSprite();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26, width: "100%" }}>
      {LESSONS.map((l, i) => {
        const d = 0.15 + i * 0.55;
        const p = ease(localTime, d, 0.6, Easing.easeOutCubic);
        return (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 26,
            opacity: p, transform: `translateX(${(1 - p) * 40}px)`,
          }}>
            <div style={{
              width: 96, height: 96, borderRadius: "50%", flexShrink: 0,
              background: i === 1 ? ORANGE : "rgba(239,230,214,0.08)",
              border: i === 1 ? "none" : `2px solid rgba(239,230,214,0.3)`,
              display: "grid", placeItems: "center",
            }}>
              <span style={{ fontFamily: SERIF, fontSize: 44, color: i === 1 ? NAVY : CREAM }}>{l.n}</span>
            </div>
            <span style={{ fontFamily: ARCHIVO, fontWeight: 600, fontSize: 38, color: CREAM }}>viene a {l.w}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- 3 áreas: dinero / trabajo / relaciones ---------- */
const AREAS = ["Dinero", "Trabajo", "Relaciones"];
function AreaChips({ delay = 0 }) {
  const { localTime } = useSprite();
  return (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
      {AREAS.map((a, i) => {
        const p = ease(localTime, delay + i * 0.18, 0.5, Easing.easeOutBack || Easing.easeOutCubic);
        return (
          <div key={i} style={{
            padding: "18px 32px", borderRadius: 50, border: `2px solid ${ORANGE}`,
            fontFamily: ARCHIVO, fontWeight: 700, fontSize: 34, color: CREAM,
            opacity: p, transform: `scale(${0.7 + p * 0.3})`,
          }}>{a}</div>
        );
      })}
    </div>
  );
}

function GlyphDraw({ delay = 0 }) {
  const { localTime } = useSprite();
  const p = ease(localTime, delay, 1.0, Easing.easeInOutCubic);
  const rings = [88, 58, 30];
  return (
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
      {rings.map((r, i) => {
        const c = 2 * Math.PI * r;
        const pp = clamp((p - i * 0.12) / 0.7, 0, 1);
        return (
          <circle key={i} cx="100" cy="100" r={r} stroke={i === 1 ? ORANGE : CREAM}
            strokeWidth={i === 2 ? 6 : 3} fill="none"
            strokeDasharray={c} strokeDashoffset={c * (1 - pp)}
            transform="rotate(-90 100 100)" opacity={i === 0 ? 0.6 : 1} />
        );
      })}
    </svg>
  );
}

/* ---------- escenas ---------- */
function Scenes() {
  return (
    <div id="reel-root" data-screen-label="0s" style={{ position: "absolute", inset: 0, overflow: "hidden", background: NAVY }}>
      <Background />
      <TopBrand />
      <Ticker />

      {/* S1 — HOOK */}
      <Sprite start={0.1} end={4.2}>
        <SceneBox>
          <MaskLine size={78} delay={0.1} color={CREAM} lh={1.06} padTop="0.34em">TU NÚMERO</MaskLine>
          <MaskLine size={78} delay={0.4} color={CREAM} lh={1.06} padTop="0.3em">DE VIDA NO</MaskLine>
          <div style={{ marginTop: 10 }}>
            <MaskLine size={90} delay={0.75} color={NAVY} bg={ORANGE} lh={1.0}>SE CALCULA</MaskLine>
          </div>
          <div style={{ marginTop: 20 }}>
            <BodyLine delay={1.35} size={38} color={SKY}>sumando tu fecha de nacimiento y ya está.</BodyLine>
          </div>
        </SceneBox>
      </Sprite>

      {/* S2 — sí hay una suma, pero... */}
      <Sprite start={4.2} end={9.2}>
        <SceneBox justify="center" align="flex-start">
          <BodyLine delay={0.1} size={44} color={CREAM}>Sí, hay una suma.</BodyLine>
          <div style={{ marginTop: 18 }}>
            <BodyLine delay={0.55} size={44} color={CREAM}>
              Pero lo que de verdad importa no es el número —
            </BodyLine>
          </div>
          <div style={{ marginTop: 18 }}>
            <MaskLine size={64} delay={1.3} color={NAVY} bg={ORANGE} lh={1.08}>ES LO QUE TE PIDE RESOLVER.</MaskLine>
          </div>
        </SceneBox>
      </Sprite>

      {/* S3 — cada número carga una lección */}
      <Sprite start={9.2} end={15.0}>
        <SceneBox justify="center" align="flex-start">
          <div style={{ marginBottom: 30 }}>
            <Kicker delay={0.05}>cada número carga una lección distinta</Kicker>
          </div>
          <LessonDial />
        </SceneBox>
      </Sprite>

      {/* S4 — el número es la puerta */}
      <Sprite start={15.0} end={19.4}>
        <SceneBox justify="center" align="center">
          <div style={{ marginBottom: 34 }}><DoorGlyph delay={0.1} /></div>
          <div style={{ textAlign: "center" }}>
            <MaskLine size={62} delay={0.55} italic font={SERIF} ls="0" color={SKY} align="center" lh={1.1} padTop="0.3em">el número es solo la puerta.</MaskLine>
            <div style={{ marginTop: 10 }}>
              <MaskLine size={62} delay={0.95} color={NAVY} bg={ORANGE} align="center" lh={1.08}>LA INTERPRETACIÓN TE CAMBIA ALGO.</MaskLine>
            </div>
          </div>
        </SceneBox>
      </Sprite>

      {/* S5 — no un dato, una lectura completa */}
      <Sprite start={19.4} end={25.4}>
        <SceneBox justify="center" align="center">
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <MaskLine size={56} delay={0.05} italic font={SERIF} ls="0" color={SKY} align="center" lh={1.12} padTop="0.3em">en numerika no te damos un dato.</MaskLine>
            <div style={{ marginTop: 10 }}>
              <MaskLine size={80} delay={0.5} color={CREAM} align="center" lh={1.02} padTop="0.3em">TE DAMOS UNA</MaskLine>
            </div>
            <div style={{ marginTop: 6 }}>
              <MaskLine size={80} delay={0.85} color={NAVY} bg={ORANGE} align="center" lh={1.0}>LECTURA COMPLETA.</MaskLine>
            </div>
          </div>
          <AreaChips delay={1.5} />
        </SceneBox>
      </Sprite>

      {/* S6 — cierre + CTA */}
      <Sprite start={25.4} end={DUR} keepMounted>
        <SceneBox justify="center" align="center">
          <div style={{ marginBottom: 24 }}><GlyphDraw delay={0.1} /></div>
          <div style={{ textAlign: "center" }}>
            <MaskLine size={50} delay={0.4} italic font={SERIF} ls="0" color={SKY} align="center" lh={1.15} padTop="0.34em" noExit>¿quieres saber qué te pide el tuyo?</MaskLine>
            <div style={{ marginTop: 14 }}>
              <MaskLine size={72} delay={0.8} lh={0.98} align="center" noExit>DÉJAME TU FECHA</MaskLine>
            </div>
            <div style={{ marginTop: 6 }}>
              <MaskLine size={72} delay={1.15} color={NAVY} bg={ORANGE} align="center" lh={0.98} noExit>EN COMENTARIOS 👇</MaskLine>
            </div>
          </div>
          <Follow delay={1.9} />
        </SceneBox>
      </Sprite>
    </div>
  );
}

function Follow({ delay }) {
  const { localTime } = useSprite();
  const p = ease(localTime, delay, 0.6, Easing.easeOutCubic);
  return (
    <div style={{ marginTop: 40, textAlign: "center", opacity: p, transform: `translateY(${(1 - p) * 14}px)` }}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: ".2em", color: SKY, textTransform: "uppercase" }}>
        Método. No cuento chino.
      </div>
      <div style={{ marginTop: 28, display: "inline-flex", alignItems: "center", gap: 14, fontFamily: ARCHIVO, fontWeight: 700, fontSize: 30, color: CREAM, border: `2px solid ${CREAM}`, borderRadius: 50, padding: "16px 34px" }}>
        @numerika.lab
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke={CREAM} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
    </div>
  );
}

function Ticker() {
  const t = useTime();
  useEffect(() => {
    const el = document.getElementById("reel-root");
    if (el) el.setAttribute("data-screen-label", `${Math.floor(t)}s`);
  }, [Math.floor(t)]);
  return null;
}

function RenderBridge() {
  const { setTime, setPlaying, duration } = useTimeline();
  useEffect(() => {
    window.NK_DURATION = duration;
    window.NK_seek = (t) => { setPlaying(false); setTime(Math.max(0, Math.min(duration, t))); };
    window.NK_play = () => setPlaying(true);
    window.NK_ready = true;
  }, [setTime, setPlaying, duration]);
  return null;
}

function App() {
  return (
    <Stage width={1080} height={1920} duration={DUR} background={NAVY} persistKey="nk-reel-lunes" loop={false}>
      <Scenes />
      <RenderBridge />
    </Stage>
  );
}

Object.assign(window, { Scenes, App, DUR, NAVY, CREAM, ORANGE, SKY });

const _root = document.getElementById("root");
if (_root) ReactDOM.createRoot(_root).render(<App />);
