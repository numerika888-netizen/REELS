/* global React, ReactDOM, CompositionStage, Shot, Captions, useComposition, Easing, animate, interpolate, clamp */
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
};

function Line({ T, children, at, size, color = CREAM, bg, font = ANTON, italic = false, lh = 1.15, ls = ".01em" }) {
  const inP = MOTION.enter(at)(T);
  if (T < at - 0.05) return null;
  const ty = (1 - inP) * 60;
  return (
    <div style={{ overflow: "hidden", paddingTop: "0.32em", paddingBottom: "0.05em" }}>
      <div style={{
        display: "inline-block", fontFamily: font, fontSize: size, lineHeight: lh, color,
        textTransform: italic ? "none" : "uppercase", fontStyle: italic ? "italic" : "normal",
        letterSpacing: ls, transform: `translateY(${ty}%)`, opacity: inP,
        background: bg, padding: bg ? "0.04em 0.2em" : 0, whiteSpace: "pre",
      }}>{children}</div>
    </div>
  );
}

function Kicker({ T, at, children, color = ORANGE }) {
  const inP = MOTION.enter(at, 0.45)(T);
  if (T < at - 0.05) return null;
  return (
    <div style={{
      fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: ".24em",
      textTransform: "uppercase", color, opacity: inP, transform: `translateY(${(1 - inP) * 12}px)`,
    }}>{children}</div>
  );
}

function Body({ T, at, children, size = 46, color = CREAM, maxW = 620 }) {
  const inP = MOTION.enter(at)(T);
  if (T < at - 0.05) return null;
  return (
    <div style={{
      fontFamily: ARCHIVO, fontWeight: 700, fontSize: size, lineHeight: 1.32, color, maxWidth: maxW,
      opacity: inP, transform: `translateY(${(1 - inP) * 22}px)`,
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

function LabelTag({ text = "INFJ", strike = false }) {
  return (
    <span style={{
      display: "inline-block", fontFamily: MONO, fontWeight: 700, fontSize: 30,
      letterSpacing: ".1em", color: "#8a93a3", border: "1.5px solid #8a93a3",
      borderRadius: 999, padding: "10px 22px", position: "relative",
    }}>
      {text}
      {strike && <span style={{ position: "absolute", left: -4, right: -4, top: "50%", height: 2, background: ORANGE, transform: "translateY(-50%) rotate(-4deg)" }} />}
    </span>
  );
}

function Orbit() {
  return (
    <svg width="30%" height="100%" viewBox="0 0 300 1920" style={{ position: "absolute", right: 0, top: 0, opacity: .08 }}>
      <circle cx="230" cy="1500" r="200" stroke={SKY} strokeWidth="1.5" fill="none" strokeDasharray="3 9" />
      <circle cx="260" cy="380" r="130" stroke={SKY} strokeWidth="1.5" fill="none" strokeDasharray="3 9" />
    </svg>
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
  const cH = CUES.Hook || 0, cE = CUES.Etiqueta || 0, cP = CUES.Patron || 0, cR = CUES.Rastrea || 0, cC = CUES.Cierre || 0;
  const total = authoredTotal || 0;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: NAVY }}>
      <Orbit />
      <TopBrand />

      {/* HOOK — mitad etiqueta tachada / mitad Numerika */}
      <Shot from={cH} to={cE}>
        <SceneBox>
          <div style={{ marginBottom: 26, opacity: MOTION.enter(cH + 0.15)(T) }}>
            <LabelTag text="INFJ" strike={T > cH + 0.9} />
          </div>
          <Line T={T} at={cH + 0.1} size={54}>UN TEST TE DICE</Line>
          <div style={{ marginTop: 4 }}><Line T={T} at={cH + 0.35} size={54}>QUE ERES «INFJ».</Line></div>
          <div style={{ marginTop: 14 }}>
            <Line T={T} at={cH + 0.9} size={60} color={NAVY} bg={ORANGE} lh={1.05}>NO TE DICE POR QUÉ</Line>
          </div>
          <div style={{ marginTop: 4 }}>
            <Line T={T} at={cH + 1.15} size={60} color={NAVY} bg={ORANGE} lh={1.05}>SIGUES REPITIENDO LO MISMO.</Line>
          </div>
        </SceneBox>
      </Shot>

      {/* ETIQUETA — te pone una etiqueta, te dice cómo eres */}
      <Shot from={cE} to={cP}>
        <SceneBox>
          <Kicker T={T} at={cE + 0.1}>Los test de personalidad</Kicker>
          <div style={{ marginTop: 20 }}>
            <Body T={T} at={cE + 0.4} size={50}>te ponen una etiqueta.</Body>
          </div>
          <div style={{ marginTop: 8 }}>
            <Body T={T} at={cE + 0.75} size={50}>Te dicen cómo eres.</Body>
          </div>
        </SceneBox>
      </Shot>

      {/* PATRÓN — pero no te dice por qué */}
      <Shot from={cP} to={cR}>
        <SceneBox>
          <Body T={T} at={cP + 0.1} size={44} maxW={640}>
            Pero no te dicen por qué a los seis meses de cada relación sales corriendo.
          </Body>
          <div style={{ marginTop: 18 }}>
            <Body T={T} at={cP + 1.6} size={44} maxW={640}>
              Ni por qué el dinero se te escapa siempre en el mismo punto.
            </Body>
          </div>
          <div style={{ marginTop: 18 }}>
            <Body T={T} at={cP + 3.1} size={44} maxW={640} color={SKY}>
              Como si fuera un guion que no escribiste tú.
            </Body>
          </div>
        </SceneBox>
      </Shot>

      {/* RASTREA — el estudio numerológico rastrea el patrón */}
      <Shot from={cR} to={cC}>
        <SceneBox>
          <Kicker T={T} at={cR + 0.1}>Un Estudio Numerológico</Kicker>
          <div style={{ marginTop: 18 }}>
            <Line T={T} at={cR + 0.4} size={52} lh={1.15}>NO DESCRIBE TU</Line>
          </div>
          <div style={{ marginTop: 2 }}>
            <Line T={T} at={cR + 0.6} size={52} lh={1.15}>PERSONALIDAD.</Line>
          </div>
          <div style={{ marginTop: 16 }}>
            <Line T={T} at={cR + 1.05} size={62} color={NAVY} bg={SKY} lh={1.05}>RASTREA EL PATRÓN.</Line>
          </div>
          <div style={{ marginTop: 22 }}>
            <Body T={T} at={cR + 1.75} size={40} maxW={640} color={SKY}>
              Te dice de dónde viene, qué lo activa, y qué tienes que hacer para dejar de repetirlo.
            </Body>
          </div>
        </SceneBox>
      </Shot>

      {/* CIERRE */}
      <Shot from={cC} to={total}>
        <SceneBox>
          <Line T={T} at={cC + 0.1} font={SERIF} ls="0" size={40} lh={1.3}>UNA ETIQUETA SE LEE UNA VEZ</Line>
          <div style={{ marginTop: 2 }}>
            <Line T={T} at={cC + 0.35} font={SERIF} ls="0" size={40} lh={1.3}>Y SE OLVIDA.</Line>
          </div>
          <div style={{ marginTop: 18 }}>
            <Line T={T} at={cC + 0.75} size={54} color={NAVY} bg={ORANGE} lh={1.05}>UN PATRÓN IDENTIFICADO,</Line>
          </div>
          <div style={{ marginTop: 4 }}>
            <Line T={T} at={cC + 0.95} size={54} color={NAVY} bg={ORANGE} lh={1.05}>SE PUEDE ROMPER.</Line>
          </div>
          <div style={{ marginTop: 30 }}>
            <Body T={T} at={cC + 1.5} size={36} maxW={640}>
              Si ya sabes cómo eres pero sigues sin saber por qué te pasa lo mismo una y otra vez —
            </Body>
          </div>
          <div style={{ marginTop: 14 }}>
            <Kicker T={T} at={cC + 2.4}>numerika.lab · link en bio</Kicker>
          </div>
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
