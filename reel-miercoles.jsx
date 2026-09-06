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

const DUR = 27;

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

function BodyLine({ children, delay = 0, size = 44, color = CREAM, align = "left", dur = 0.6, maxW = 880 }) {
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

/* ---------- fondo: 100% marca, sin motivos de "descifrado" ---------- */
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
  const bright = t > 22.5 ? 0.95 : 0.4;
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

/* ---------- tachar "mercurio retrógrado" ---------- */
function StrikeLine({ delay = 0 }) {
  const { localTime } = useSprite();
  const p = ease(localTime, delay, 0.6, Easing.easeOutCubic);
  const strike = ease(localTime, delay + 0.35, 0.5, Easing.easeInOutCubic);
  return (
    <div style={{ position: "relative", display: "inline-block", opacity: p, transform: `translateY(${(1 - p) * 18}px)` }}>
      <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 60, color: SKY }}>"Mercurio retrógrado"</span>
      <div style={{
        position: "absolute", left: 0, top: "50%", height: 4, background: ORANGE,
        width: `${strike * 100}%`, transformOrigin: "left center",
      }} />
    </div>
  );
}

/* ---------- 3 patrones que se repiten ---------- */
const PATTERNS = ["Dinero que se va.", "Relaciones que se repiten.", "Trabajos que no encajan."];
function PatternList({ delay = 0 }) {
  const { localTime } = useSprite();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {PATTERNS.map((p_, i) => {
        const p = ease(localTime, delay + i * 0.4, 0.55, Easing.easeOutCubic);
        return (
          <div key={i} style={{
            fontFamily: ARCHIVO, fontWeight: 700, fontSize: 52, color: CREAM,
            opacity: p, transform: `translateX(${(1 - p) * 34}px)`,
            borderLeft: `4px solid ${ORANGE}`, paddingLeft: 24,
          }}>{p_}</div>
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

      {/* S1 — HOOK: manifiesto */}
      <Sprite start={0.1} end={4.0}>
        <SceneBox>
          <MaskLine size={82} delay={0.1} color={CREAM} lh={1.04} padTop="0.34em">NUMERIKA</MaskLine>
          <MaskLine size={82} delay={0.4} color={CREAM} lh={1.04} padTop="0.3em">NO TE DICE</MaskLine>
          <div style={{ marginTop: 10 }}>
            <MaskLine size={94} delay={0.75} color={NAVY} bg={ORANGE} lh={1.0}>TU HORÓSCOPO.</MaskLine>
          </div>
        </SceneBox>
      </Sprite>

      {/* S2 — tachar mercurio retrógrado */}
      <Sprite start={4.0} end={8.4}>
        <SceneBox justify="center" align="flex-start">
          <div style={{ marginBottom: 26 }}>
            <Kicker delay={0.05}>no te vamos a decir que</Kicker>
          </div>
          <StrikeLine delay={0.2} />
          <div style={{ marginTop: 26 }}>
            <BodyLine delay={0.9} size={48} color={CREAM}>
              es la razón de que tu vida esté patas arriba.
            </BodyLine>
          </div>
        </SceneBox>
      </Sprite>

      {/* S3 — algo más concreto */}
      <Sprite start={8.4} end={13.4}>
        <SceneBox justify="center" align="flex-start">
          <BodyLine delay={0.1} size={52} color={CREAM}>
            Te vamos a enseñar algo mucho más concreto:
          </BodyLine>
          <div style={{ marginTop: 20 }}>
            <MaskLine size={66} delay={0.85} color={NAVY} bg={ORANGE} lh={1.1}>QUÉ DICEN TUS NÚMEROS SOBRE POR QUÉ SE REPITEN TUS PATRONES.</MaskLine>
          </div>
        </SceneBox>
      </Sprite>

      {/* S4 — los 3 patrones */}
      <Sprite start={13.4} end={19.0}>
        <SceneBox justify="center" align="flex-start">
          <div style={{ marginBottom: 30 }}>
            <Kicker delay={0.05}>y qué puedes hacer para romperlos</Kicker>
          </div>
          <PatternList delay={0.3} />
        </SceneBox>
      </Sprite>

      {/* S5 — tus números tienen la respuesta */}
      <Sprite start={19.0} end={23.0}>
        <SceneBox justify="center" align="center">
          <div style={{ textAlign: "center" }}>
            <MaskLine size={70} delay={0.1} color={CREAM} align="center" lh={1.0} padTop="0.3em">TUS NÚMEROS YA</MaskLine>
            <div style={{ marginTop: 8 }}>
              <MaskLine size={70} delay={0.45} color={NAVY} bg={ORANGE} align="center" lh={0.98}>TIENEN LA RESPUESTA.</MaskLine>
            </div>
          </div>
        </SceneBox>
      </Sprite>

      {/* S6 — cierre + CTA */}
      <Sprite start={23.0} end={DUR} keepMounted>
        <SceneBox justify="center" align="center">
          <div style={{ marginBottom: 24 }}><GlyphDraw delay={0.1} /></div>
          <div style={{ textAlign: "center" }}>
            <MaskLine size={44} delay={0.4} italic font={SERIF} ls="0" color={SKY} align="center" lh={1.2} padTop="0.34em" noExit>numerología aplicada, práctica y real.</MaskLine>
            <div style={{ marginTop: 14 }}>
              <MaskLine size={64} delay={0.8} lh={1.0} align="center" noExit>MÉTODO.</MaskLine>
            </div>
            <div style={{ marginTop: 6 }}>
              <MaskLine size={64} delay={1.1} color={NAVY} bg={ORANGE} align="center" lh={0.98} noExit>NO CUENTO CHINO.</MaskLine>
            </div>
          </div>
          <Follow delay={1.85} />
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
        Solicita tu Estudio Numerológico
      </div>
      <div style={{ marginTop: 28, display: "inline-flex", alignItems: "center", gap: 14, fontFamily: ARCHIVO, fontWeight: 700, fontSize: 30, color: CREAM, border: `2px solid ${CREAM}`, borderRadius: 50, padding: "16px 34px" }}>
        Link en bio
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
    <Stage width={1080} height={1920} duration={DUR} background={NAVY} persistKey="nk-reel-miercoles" loop={false}>
      <Scenes />
      <RenderBridge />
    </Stage>
  );
}

Object.assign(window, { Scenes, App, DUR, NAVY, CREAM, ORANGE, SKY });

const _root = document.getElementById("root");
if (_root) ReactDOM.createRoot(_root).render(<App />);
