/* global React, ReactDOM, Stage, Sprite, useTime, useSprite, useTimeline, Easing, clamp */
const { useState, useEffect } = React;

const NAVY = "#0E2440";
const CREAM = "#EFE6D6";
const SKY = "#AECEE2";
const ORANGE = "#E2673C";
const ANTON = '"Anton", sans-serif';
const SERIF = '"DM Serif Display", Georgia, serif';
const MONO = '"Space Mono", monospace';
const ARCHIVO = '"Archivo", sans-serif';

const DUR = 18;

function ease(localTime, delay, dur, fn = Easing.easeOutExpo) {
  return fn(clamp((localTime - delay) / dur, 0, 1));
}

const MAXW = 936;
function MaskLine({ children, size, delay = 0, dur = 0.7, color = NAVY, bg, lh = 0.9, ls = ".01em", font = ANTON, italic = false, exitDur = 0.4, align = "left", padTop = "0.42em", noExit = false }) {
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

function BodyLine({ children, delay = 0, size = 50, color = NAVY, align = "left", dur = 0.6, maxW = 880 }) {
  const { localTime, duration } = useSprite();
  const p = ease(localTime, delay, dur, Easing.easeOutCubic);
  const exitStart = duration - 0.4;
  const out = Easing.easeInCubic(clamp((localTime - exitStart) / 0.4, 0, 1));
  return (
    <div style={{
      fontFamily: ARCHIVO, fontWeight: 700, fontSize: size, lineHeight: 1.32, color,
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

/* ---------- fondo de marca: crema, no navy ---------- */
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
    <div style={{ position: "absolute", inset: 0, background: CREAM, overflow: "hidden" }}>
      <OrbitRings cx={940} cy={340} base={130} color={NAVY} op={0.08} speed={8} count={3} />
      <OrbitRings cx={130} cy={1600} base={160} color={ORANGE} op={0.1} speed={6} count={2} />
    </div>
  );
}

function TopBrand() {
  const t = useTime();
  const bright = t > 14 ? 0.9 : 0.4;
  return (
    <div style={{
      position: "absolute", top: 70, left: 0, right: 0, display: "flex", justifyContent: "center",
      gap: 11, alignItems: "center", fontFamily: MONO, fontWeight: 700, fontSize: 24,
      letterSpacing: ".18em", color: NAVY, opacity: bright, transition: "opacity .3s",
    }}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10.5" stroke={NAVY} strokeWidth="1.4" opacity=".5" />
        <circle cx="12" cy="12" r="6.5" stroke={NAVY} strokeWidth="1.4" opacity=".8" />
        <circle cx="12" cy="12" r="2.6" fill={ORANGE} />
      </svg>
      NUMERIKA<span style={{ color: ORANGE }}>.LAB</span>
    </div>
  );
}

/* ---------- flecha animada apuntando hacia abajo (a comentarios) ---------- */
function BounceArrow() {
  const t = useTime();
  const bob = Math.sin(t * 2.4) * 14;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transform: `translateY(${bob}px)` }}>
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
        <path d="M12 4v14M6 13l6 6 6-6" stroke={ORANGE} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/* ---------- input-pill simulando un comentario de fecha ---------- */
function DateChip({ delay = 0 }) {
  const { localTime } = useSprite();
  const p = ease(localTime, delay, 0.55, Easing.easeOutBack || Easing.easeOutCubic);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14, padding: "20px 34px", borderRadius: 60,
      background: NAVY, opacity: p, transform: `scale(${0.8 + p * 0.2})`,
    }}>
      <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 34, color: CREAM, letterSpacing: ".04em" }}>DD / MM / AAAA</span>
    </div>
  );
}

/* ---------- escenas ---------- */
function Scenes() {
  return (
    <div id="reel-root" data-screen-label="0s" style={{ position: "absolute", inset: 0, overflow: "hidden", background: CREAM }}>
      <Background />
      <TopBrand />
      <Ticker />

      {/* S1 — HOOK: comenta tu fecha */}
      <Sprite start={0.1} end={6.0}>
        <SceneBox justify="center" align="center">
          <div style={{ textAlign: "center" }}>
            <MaskLine size={70} delay={0.1} color={NAVY} align="center" lh={1.05} padTop="0.3em">COMENTA TU</MaskLine>
            <div style={{ marginTop: 6 }}>
              <MaskLine size={70} delay={0.45} color={NAVY} align="center" lh={1.05} padTop="0.3em">FECHA DE</MaskLine>
            </div>
            <div style={{ marginTop: 12 }}>
              <MaskLine size={82} delay={0.8} color={CREAM} bg={ORANGE} align="center" lh={1.0}>NACIMIENTO 👇</MaskLine>
            </div>
            <div style={{ marginTop: 18 }}>
              <BodyLine delay={1.45} size={34} color={NAVY} align="center" maxW={640}>día, mes y año</BodyLine>
            </div>
          </div>
          <div style={{ marginTop: 42 }}>
            <DateChip delay={1.9} />
          </div>
          <div style={{ marginTop: 34 }}>
            <BounceArrow />
          </div>
        </SceneBox>
      </Sprite>

      {/* S2 — te digo tu reto principal */}
      <Sprite start={6.0} end={12.0}>
        <SceneBox justify="center" align="center">
          <div style={{ textAlign: "center" }}>
            <BodyLine delay={0.1} size={44} color={NAVY} align="center">Te voy a decir cuál es</BodyLine>
            <div style={{ marginTop: 16 }}>
              <MaskLine size={72} delay={0.6} color={NAVY} align="center" lh={1.02} padTop="0.3em">EL RETO PRINCIPAL</MaskLine>
            </div>
            <div style={{ marginTop: 8 }}>
              <MaskLine size={72} delay={0.95} color={CREAM} bg={ORANGE} align="center" lh={1.0}>QUE TUS NÚMEROS TE MARCAN.</MaskLine>
            </div>
          </div>
        </SceneBox>
      </Sprite>

      {/* S3 — cierre: lectura completa / Estudio en bio */}
      <Sprite start={12.0} end={DUR} keepMounted>
        <SceneBox justify="center" align="center">
          <div style={{ textAlign: "center" }}>
            <MaskLine size={44} delay={0.1} italic font={SERIF} ls="0" color={NAVY} align="center" lh={1.25} padTop="0.34em" noExit>¿quieres la lectura completa,</MaskLine>
            <div style={{ marginTop: 2 }}>
              <MaskLine size={44} delay={0.35} italic font={SERIF} ls="0" color={NAVY} align="center" lh={1.25} padTop="0.1em" noExit>con todo lo que dicen tus números?</MaskLine>
            </div>
            <div style={{ marginTop: 26 }}>
              <MaskLine size={60} delay={0.9} color={NAVY} align="center" lh={1.0} noExit>TU ESTUDIO NUMEROLÓGICO</MaskLine>
            </div>
            <div style={{ marginTop: 8 }}>
              <MaskLine size={60} delay={1.2} color={CREAM} bg={ORANGE} align="center" lh={0.98} noExit>EN EL LINK DE LA BIO.</MaskLine>
            </div>
          </div>
        </SceneBox>
      </Sprite>
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
    <Stage width={1080} height={1920} duration={DUR} background={CREAM} persistKey="nk-reel-domingo" loop={false}>
      <Scenes />
      <RenderBridge />
    </Stage>
  );
}

Object.assign(window, { Scenes, App, DUR, NAVY, CREAM, ORANGE, SKY });

const _root = document.getElementById("root");
if (_root) ReactDOM.createRoot(_root).render(<App />);
