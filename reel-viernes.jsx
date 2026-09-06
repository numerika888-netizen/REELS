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

const DUR = 37;

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

function BodyLine({ children, delay = 0, size = 48, color = CREAM, align = "left", dur = 0.6, maxW = 880 }) {
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

function Kicker({ children, delay = 0, color = ORANGE, size = 26, ls = ".28em" }) {
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

function Background() {
  return (
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(120% 90% at 50% 12%, ${NAVY} 0%, ${NAVY2} 100%)`, overflow: "hidden" }}>
      <OrbitRings cx={940} cy={340} base={130} color={SKY} op={0.14} speed={8} count={3} />
      <OrbitRings cx={130} cy={1600} base={160} color={ORANGE} op={0.12} speed={6} count={2} />
    </div>
  );
}

function TopBrand() {
  const t = useTime();
  const bright = t > 32.5 ? 0.95 : 0.4;
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

/* ---------- "manos escribiendo cálculos": libreta con líneas que se van trazando ---------- */
function NotebookCalc({ delay = 0 }) {
  const { localTime } = useSprite();
  const rows = [
    "P(7) E(5) D(4) R(9) O(6) = 31",
    "3 + 1 = 4",
    "SENDERO NATAL → 4",
  ];
  return (
    <div style={{
      width: 620, background: CREAM, borderRadius: 6, padding: "36px 40px",
      boxShadow: "0 30px 70px rgba(0,0,0,.45)", transform: "rotate(-1.4deg)",
    }}>
      {rows.map((r, i) => {
        const p = ease(localTime, delay + i * 0.55, 0.65, Easing.easeInOutCubic);
        return (
          <div key={i} style={{ marginBottom: 22, position: "relative", height: 40 }}>
            <div style={{
              fontFamily: MONO, fontWeight: 700, fontSize: 30, color: NAVY,
              clipPath: `inset(0 ${100 - p * 100}% 0 0)`, whiteSpace: "nowrap",
            }}>{r}</div>
            <div style={{
              position: "absolute", left: 0, bottom: -4, height: 3, background: ORANGE,
              width: `${p * 100}%`,
            }} />
          </div>
        );
      })}
    </div>
  );
}

/* ---------- capas de papel superpuestas (las capas del estudio) ---------- */
const LAYERS = [
  { t: "Número de vida" },
  { t: "Tu misión" },
  { t: "Tus dones" },
  { t: "Energía en sombra" },
  { t: "Pináculos y escollos" },
  { t: "Tu karma" },
];
function LayerStack({ delay = 0 }) {
  const { localTime } = useSprite();
  return (
    <div style={{ position: "relative", width: 640, height: 700 }}>
      {LAYERS.map((l, i) => {
        const d = delay + i * 0.62;
        const p = ease(localTime, d, 0.6, Easing.easeOutBack || Easing.easeOutCubic);
        const restY = i * 106;
        const startY = -220;
        const y = startY + (restY - startY) * p;
        const rot = (i % 2 === 0 ? -1 : 1) * (2.2 - p * 2.2);
        return (
          <div key={i} style={{
            position: "absolute", left: "50%", top: 0, width: 560, height: 88,
            transform: `translate(-50%, ${y}px) rotate(${rot}deg)`,
            opacity: p,
            background: i === LAYERS.length - 1 ? ORANGE : "rgba(239,230,214,0.97)",
            borderRadius: 8, boxShadow: "0 14px 30px rgba(0,0,0,.35)",
            display: "flex", alignItems: "center", padding: "0 30px",
            zIndex: i,
          }}>
            <span style={{
              fontFamily: ARCHIVO, fontWeight: 800, fontSize: 32,
              color: i === LAYERS.length - 1 ? CREAM : NAVY,
            }}>{l.t}</span>
          </div>
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

/* ---------- portada estilizada del Estudio (corte final) ---------- */
function StudyCover({ delay = 0 }) {
  const { localTime } = useSprite();
  const p = ease(localTime, delay, 0.8, Easing.easeOutCubic);
  return (
    <div style={{
      width: 480, height: 620, borderRadius: 8, background: `linear-gradient(155deg, ${NAVY2}, ${NAVY})`,
      border: `1px solid rgba(239,230,214,.25)`, boxShadow: "0 30px 70px rgba(0,0,0,.5)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18,
      opacity: p, transform: `scale(${0.85 + p * 0.15})`,
    }}>
      <div style={{ width: 66, height: 1, background: ORANGE }} />
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 18, letterSpacing: ".3em", color: SKY }}>NUMERIKA.LAB</div>
      <div style={{ fontFamily: SERIF, fontSize: 46, color: CREAM, textAlign: "center", lineHeight: 1.1, padding: "0 30px" }}>Estudio<br />Numerológico</div>
      <div style={{ width: 66, height: 1, background: ORANGE }} />
    </div>
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
      <Sprite start={0.1} end={5.0}>
        <SceneBox>
          <MaskLine size={64} delay={0.1} color={CREAM} lh={1.08} padTop="0.34em">SI ALGUIEN TE CALCULA TU ESTUDIO</MaskLine>
          <div style={{ marginTop: 6 }}>
            <MaskLine size={64} delay={0.5} color={CREAM} lh={1.08} padTop="0.3em">EN 2 MINUTOS,</MaskLine>
          </div>
          <div style={{ marginTop: 14 }}>
            <MaskLine size={96} delay={0.95} color={NAVY} bg={ORANGE} lh={1.0}>DESCONFÍA.</MaskLine>
          </div>
        </SceneBox>
      </Sprite>

      {/* S2 — no es un solo número */}
      <Sprite start={5.0} end={9.6}>
        <SceneBox justify="center" align="flex-start">
          <BodyLine delay={0.1} size={50} color={CREAM}>Una carta completa no es un solo número.</BodyLine>
          <div style={{ marginTop: 20 }}>
            <MaskLine size={62} delay={0.85} color={NAVY} bg={ORANGE} lh={1.08}>SON VARIAS CAPAS TRABAJANDO JUNTAS.</MaskLine>
          </div>
        </SceneBox>
      </Sprite>

      {/* S3 — libreta / cálculo (b-roll estilizado) */}
      <Sprite start={9.6} end={15.4}>
        <SceneBox justify="center" align="center">
          <div style={{ marginBottom: 30 }}>
            <Kicker delay={0.05}>capa 1 · tu número de vida</Kicker>
          </div>
          <NotebookCalc delay={0.35} />
        </SceneBox>
      </Sprite>

      {/* S4 — stack de capas */}
      <Sprite start={15.4} end={25.4}>
        <SceneBox justify="center" align="center">
          <div style={{ marginBottom: 14 }}>
            <Kicker delay={0.05}>tu misión · tus dones · tu sombra</Kicker>
          </div>
          <LayerStack delay={0.3} />
        </SceneBox>
      </Sprite>

      {/* S5 — sombra: tu mayor fortaleza */}
      <Sprite start={25.4} end={29.0}>
        <SceneBox justify="center" align="flex-start">
          <BodyLine delay={0.1} size={46} color={CREAM}>
            Tu energía en sombra — esa parte que rechazas —
          </BodyLine>
          <div style={{ marginTop: 18 }}>
            <MaskLine size={58} delay={0.75} color={NAVY} bg={ORANGE} lh={1.1}>BIEN ENTENDIDA, ES TU MAYOR FORTALEZA.</MaskLine>
          </div>
        </SceneBox>
      </Sprite>

      {/* S6 — interpretado junto, no por separado */}
      <Sprite start={29.0} end={33.0}>
        <SceneBox justify="center" align="center">
          <div style={{ textAlign: "center" }}>
            <MaskLine size={64} delay={0.1} color={CREAM} align="center" lh={1.05} padTop="0.3em">TODO ESTO,</MaskLine>
            <div style={{ marginTop: 8 }}>
              <MaskLine size={64} delay={0.45} color={NAVY} bg={ORANGE} align="center" lh={1.0}>INTERPRETADO JUNTO.</MaskLine>
            </div>
            <div style={{ marginTop: 20 }}>
              <BodyLine delay={0.95} size={38} color={SKY} align="center">Por eso importa quién te lo hace.</BodyLine>
            </div>
          </div>
        </SceneBox>
      </Sprite>

      {/* S7 — cierre + portada + CTA */}
      <Sprite start={33.0} end={DUR} keepMounted>
        <SceneBox justify="center" align="center">
          <div style={{ marginBottom: 26 }}>
            <MaskLine size={46} delay={0.1} italic font={SERIF} ls="0" color={SKY} align="center" lh={1.2} padTop="0.34em" noExit>en numerika no improvisamos tu carta.</MaskLine>
            <div style={{ marginTop: 12 }}>
              <MaskLine size={66} delay={0.5} color={NAVY} bg={ORANGE} align="center" lh={1.0} noExit>LA ELABORAMOS CON MÉTODO.</MaskLine>
            </div>
          </div>
          <StudyCover delay={0.95} />
          <Follow delay={1.7} />
        </SceneBox>
      </Sprite>
    </div>
  );
}

function Follow({ delay }) {
  const { localTime } = useSprite();
  const p = ease(localTime, delay, 0.6, Easing.easeOutCubic);
  return (
    <div style={{ marginTop: 34, textAlign: "center", opacity: p, transform: `translateY(${(1 - p) * 14}px)` }}>
      <div style={{ marginTop: 4, display: "inline-flex", alignItems: "center", gap: 14, fontFamily: ARCHIVO, fontWeight: 700, fontSize: 28, color: CREAM, border: `2px solid ${CREAM}`, borderRadius: 50, padding: "14px 30px" }}>
        Solicita tu Estudio — Link en bio
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke={CREAM} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
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
    <Stage width={1080} height={1920} duration={DUR} background={NAVY} persistKey="nk-reel-viernes" loop={false}>
      <Scenes />
      <RenderBridge />
    </Stage>
  );
}

Object.assign(window, { Scenes, App, DUR, NAVY, CREAM, ORANGE, SKY });

const _root = document.getElementById("root");
if (_root) ReactDOM.createRoot(_root).render(<App />);
