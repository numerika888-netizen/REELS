/* global React, CompositionStage, Shot, Captions, useComposition, Easing, animate, interpolate, clamp */
const NAVY = "#0E2440";
const CREAM = "#EFE6D6";
const SKY = "#AECEE2";
const ORANGE = "#E2673C";
const ANTON = '"Anton", sans-serif';
const SERIF = '"DM Serif Display", Georgia, serif';
const MONO = '"Space Mono", monospace';
const ARCHIVO = '"Archivo", sans-serif';

const MOTION = {
  enter: (start, dur = 0.6) => animate({ from: 0, to: 1, start, end: start + dur, ease: Easing.easeOutCubic }),
  exit: (end, dur = 0.4) => animate({ from: 0, to: 1, start: end - dur, end, ease: Easing.easeInCubic }),
};

function Line({ T, children, at, holdUntil, size, color = CREAM, bg, font = ANTON, italic = false, lh = 1.05, ls = ".01em", padTop = "0.32em" }) {
  const inP = MOTION.enter(at)(T);
  const outP = holdUntil != null ? MOTION.exit(holdUntil)(T) : 0;
  const visible = T >= at - 0.05 && (holdUntil == null || T <= holdUntil + 0.05);
  if (!visible) return null;
  const ty = (1 - inP) * 60 - outP * 30;
  return (
    <div style={{ overflow: "hidden", paddingTop: padTop, paddingBottom: "0.05em" }}>
      <div style={{
        display: "inline-block", fontFamily: font, fontSize: size, lineHeight: lh, color,
        textTransform: italic ? "none" : "uppercase", fontStyle: italic ? "italic" : "normal",
        letterSpacing: ls, transform: `translateY(${ty}%)`, opacity: inP * (1 - outP),
        background: bg, padding: bg ? "0.04em 0.2em" : 0, whiteSpace: "pre",
      }}>{children}</div>
    </div>
  );
}

function Kicker({ T, at, holdUntil, children, color = ORANGE }) {
  const inP = MOTION.enter(at, 0.45)(T);
  const outP = holdUntil != null ? MOTION.exit(holdUntil)(T) : 0;
  const visible = T >= at - 0.05 && (holdUntil == null || T <= holdUntil + 0.05);
  if (!visible) return null;
  return (
    <div style={{
      fontFamily: MONO, fontWeight: 700, fontSize: 32, letterSpacing: ".24em",
      textTransform: "uppercase", color, opacity: inP * (1 - outP),
      transform: `translateY(${(1 - inP) * 12}px)`,
    }}>{children}</div>
  );
}

function SceneBox({ children }) {
  return (
    <div style={{
      position: "absolute", inset: 0, display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "flex-start", padding: "0 72px", zIndex: 2,
    }}>{children}</div>
  );
}

/* franja decorativa luz/sombra a la derecha — nunca cruza la zona de texto (padding 72px + maxWidth ≤780px) */
function ShadowStrip({ T, total }) {
  const p = clamp(T / total, 0, 1);
  const split = 84 + p * 6;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: NAVY }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, left: `${split}%`, right: 0, background: CREAM }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, left: `${split}%`, width: 3, background: ORANGE, opacity: .85 }} />
      <svg width="40%" height="100%" viewBox="0 0 400 1920" style={{ position: "absolute", left: 0, top: 0, opacity: .08 }}>
        <circle cx="60" cy="1500" r="220" stroke={SKY} strokeWidth="1.5" fill="none" strokeDasharray="3 9" />
        <circle cx="30" cy="380" r="140" stroke={SKY} strokeWidth="1.5" fill="none" strokeDasharray="3 9" />
      </svg>
    </div>
  );
}

function TopBrand() {
  return (
    <div style={{
      position: "absolute", top: 70, left: 0, right: 0, display: "flex", justifyContent: "center",
      gap: 11, alignItems: "center", fontFamily: MONO, fontWeight: 700, fontSize: 24,
      letterSpacing: ".18em", color: CREAM, zIndex: 3,
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

function Piece() {
  const { T, CUES, authoredTotal } = useComposition();
  const cH = CUES.Hook || 0, cN = CUES.Numero || 0, cE = CUES.Evitas || 0, cI = CUES.Importante || 0, cF = CUES.Fortaleza || 0, cC = CUES.Cierre || 0;
  const total = authoredTotal || 0;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: NAVY }}>
      <ShadowStrip T={T} total={total} />
      <TopBrand />

      <Shot from={cH} to={cN}>
        <SceneBox>
          <Line T={T} at={cH + 0.1} size={64}>HAY UNA PARTE</Line>
          <div style={{ marginTop: 6 }}><Line T={T} at={cH + 0.4} size={64}>DE TI QUE LLEVAS</Line></div>
          <div style={{ marginTop: 14 }}><Line T={T} at={cH + 0.72} size={72} color={NAVY} bg={ORANGE}>AÑOS RECHAZANDO.</Line></div>
        </SceneBox>
      </Shot>

      <Shot from={cN} to={cE}>
        <SceneBox>
          <Kicker T={T} at={cN + 0.1}>Tu carta numerológica</Kicker>
          <div style={{ marginTop: 20 }}>
            <div style={{ fontFamily: ARCHIVO, fontWeight: 700, fontSize: 52, lineHeight: 1.32, color: CREAM, maxWidth: 600,
              opacity: MOTION.enter(cN + 0.4)(T), transform: `translateY(${(1 - MOTION.enter(cN + 0.4)(T)) * 22}px)` }}>
              tiene un número que casi nadie quiere mirar:
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Line T={T} at={cN + 0.95} size={66} color={ORANGE} font={SERIF} italic ls="0" lh={1.15}>tu energía en sombra.</Line>
          </div>
        </SceneBox>
      </Shot>

      <Shot from={cE} to={cI}>
        <SceneBox>
          <div style={{ fontFamily: ARCHIVO, fontWeight: 700, fontSize: 54, lineHeight: 1.32, color: CREAM, maxWidth: 600,
            opacity: MOTION.enter(cE + 0.1)(T), transform: `translateY(${(1 - MOTION.enter(cE + 0.1)(T)) * 22}px)` }}>
            Es la parte de ti que evitas, que te avergüenza, o que directamente niegas que existe.
          </div>
        </SceneBox>
      </Shot>

      <Shot from={cI} to={cF}>
        <SceneBox>
          <Kicker T={T} at={cI + 0.1}>Lo importante</Kicker>
          <div style={{ marginTop: 18 }}><Line T={T} at={cI + 0.4} size={56} lh={1.15}>NO ES UN DEFECTO</Line></div>
          <div style={{ marginTop: 4 }}><Line T={T} at={cI + 0.65} size={56} lh={1.15}>QUE HAY QUE ESCONDER.</Line></div>
          <div style={{ marginTop: 16 }}><Line T={T} at={cI + 1.05} size={62} color={NAVY} bg={SKY} lh={1.05}>ES UNA FUERZA QUE</Line></div>
          <div style={{ marginTop: 4 }}><Line T={T} at={cI + 1.25} size={62} color={NAVY} bg={SKY} lh={1.05}>NO HAS APRENDIDO A USAR.</Line></div>
        </SceneBox>
      </Shot>

      <Shot from={cF} to={cC}>
        <SceneBox>
          <Line T={T} at={cF + 0.1} size={44} font={SERIF} italic ls="0" lh={1.3}>Lo que rechazas de ti mismo,</Line>
          <div style={{ marginTop: 2 }}><Line T={T} at={cF + 0.35} size={44} font={SERIF} italic ls="0" lh={1.3}>bien entendido, se convierte en</Line></div>
          <div style={{ marginTop: 18 }}><Line T={T} at={cF + 0.85} size={68} color={NAVY} bg={ORANGE}>TU MAYOR FORTALEZA.</Line></div>
        </SceneBox>
      </Shot>

      <Shot from={cC} to={total}>
        <SceneBox>
          <div style={{ fontFamily: ARCHIVO, fontWeight: 700, fontSize: 48, lineHeight: 1.32, color: CREAM, maxWidth: 600,
            opacity: MOTION.enter(cC + 0.1)(T) }}>
            En tu Estudio Numerológico te decimos exactamente cuál es tu sombra —
          </div>
          <div style={{ marginTop: 20 }}><Line T={T} at={cC + 0.55} size={58} color={NAVY} bg={SKY} lh={1.05}>Y QUÉ HACER CON ELLA.</Line></div>
          <div style={{ marginTop: 30 }}><Kicker T={T} at={cC + 1.05}>numerika.lab</Kicker></div>
        </SceneBox>
      </Shot>
    </div>
  );
}

function App() {
  return (
    <CompositionStage width={1080} height={1920} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg={NAVY}>
      <Piece />
    </CompositionStage>
  );
}

Object.assign(window, { App, Piece });
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
