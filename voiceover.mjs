// voiceover.mjs
// Generates a Spanish voiceover from a text script with a local, free TTS
// engine (espeak-ng, formant synthesis — no network, no API key) and mixes
// it into an already-rendered reel with ffmpeg.
//
// No ElevenLabs / OpenAI TTS key is configured in this environment, and
// network access to cloud TTS endpoints (e.g. Microsoft's edge-tts) is
// blocked by the sandbox's egress policy, so this uses the offline fallback
// explicitly allowed by the request: espeak-ng, with a built-in female
// voice ("Alicia": gender=female, pitch 180-275, no MBROLA diphone-mismatch
// issues seen with the mb-es3 package on this system).
//
// Usage:
//   node voiceover.mjs --text=assets/voiceover/reel-viernes.txt \
//                       --video=numerika-reel-viernes.mp4 \
//                       --final=numerika-reel-viernes-final.mp4 \
//                       [--voice=es+Alicia] [--speed=175] [--voz=voz.mp3]

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v === undefined ? true : v];
  })
);

const TEXT_FILE = path.resolve(args.text || 'assets/voiceover/reel-viernes.txt');
const VOICE = args.voice || 'es+Alicia';
const SPEED = args.speed || '175';
const VIDEO = path.resolve(args.video || 'numerika-reel-viernes.mp4');
const VOZ_WAV = path.join(__dirname, '.voz-tmp.wav');
const VOZ_MP3 = path.resolve(args.voz || 'voz.mp3');
const FINAL = path.resolve(args.final || 'final.mp4');

function sh(cmd, cmdArgs) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, cmdArgs, { stdio: 'inherit' });
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited with ${code}`))));
    p.on('error', reject);
  });
}

async function main() {
  console.log(`› Generando voz (espeak-ng, voz "${VOICE}", local y gratis) desde ${TEXT_FILE}…`);
  await sh('espeak-ng', ['-v', VOICE, '-s', String(SPEED), '-f', TEXT_FILE, '--stdout', '-w', VOZ_WAV]);

  console.log('› Convirtiendo a MP3…');
  await sh('ffmpeg', ['-y', '-i', VOZ_WAV, '-codec:a', 'libmp3lame', '-qscale:a', '2', VOZ_MP3]);

  console.log('› Mezclando voz con el vídeo (ffmpeg -shortest)…');
  await sh('ffmpeg', [
    '-y',
    '-i', VIDEO,
    '-i', VOZ_MP3,
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-shortest',
    FINAL,
  ]);

  await sh('rm', ['-f', VOZ_WAV]);
  console.log(`✔ Listo: ${VOZ_MP3} (voz) y ${FINAL} (vídeo + voz)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
