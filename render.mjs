// render.mjs
// Renders a NUMERIKA.LAB reel HTML file frame by frame with Puppeteer and
// encodes the frames into an MP4 (H.264) with ffmpeg.
//
// Supports two animation engines:
//   - v1 (default): animations.jsx — window.NK_ready / NK_DURATION / NK_seek(t),
//     content root at '#reel-root'.
//   - v3 (--engine=v3): animations-v3.jsx — CompositionStage, which exposes
//     the exportable root as '[data-om-exportable-video-with-duration-secs]'
//     and seeks via a 'data-om-seek-to-time-frame' CustomEvent.
//
// Usage:
//   node render.mjs [--html="NUMERIKA.LAB Reel Lunes.html"] [--fps=30] [--scale=1]
//                   [--out=numerika-reel-lunes.mp4] [--keep-frames] [--engine=v1|v3]

import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { mkdir, rm } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CHROMIUM_PATH = '/opt/pw-browsers/chromium';
const FFMPEG_PATH = '/usr/bin/ffmpeg';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jsx': 'text/babel; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.png': 'image/png',
  '.json': 'application/json; charset=utf-8',
};

// A tiny static file server so the page loads over http:// instead of
// file:// — Babel-standalone's <script src="*.jsx"> uses XHR to fetch
// the source, which the browser blocks under file:// CORS rules.
function startStaticServer(rootDir) {
  return new Promise((resolve) => {
    const server = http.createServer(async (req, res) => {
      try {
        const urlPath = decodeURIComponent(req.url.split('?')[0]);
        const filePath = path.join(rootDir, urlPath);
        if (!filePath.startsWith(rootDir)) {
          res.writeHead(403);
          res.end();
          return;
        }
        const st = await stat(filePath);
        const target = st.isDirectory() ? path.join(filePath, 'index.html') : filePath;
        const ext = path.extname(target);
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
        createReadStream(target).pipe(res);
      } catch {
        res.writeHead(404);
        res.end('Not found');
      }
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v === undefined ? true : v];
  })
);

const HTML_FILE_NAME = args.html || 'NUMERIKA.LAB Reel Lunes.html';
const FPS = Number(args.fps || 30);
const SCALE = Number(args.scale || 1);
const DEFAULT_OUT = 'numerika-reel-' + path.basename(HTML_FILE_NAME, '.html')
  .toLowerCase()
  .replace(/^numerika\.lab reel /, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '') + '.mp4';
const OUT_FILE = path.join(__dirname, args.out || DEFAULT_OUT);
const KEEP_FRAMES = Boolean(args['keep-frames']);
const FRAMES_DIR = path.join(__dirname, '.render-frames-' + path.basename(OUT_FILE, '.mp4'));
const ENGINE = args.engine || 'v1';

const WIDTH = 1080;
const HEIGHT = 1920;
const BAR_H = 44; // Stage's fixed playback-bar height, kept to force scale=1

function sh(cmd, cmdArgs) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, cmdArgs, { stdio: 'inherit' });
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited with ${code}`))));
    p.on('error', reject);
  });
}

async function main() {
  console.log('› Preparando carpeta de frames…');
  await rm(FRAMES_DIR, { recursive: true, force: true });
  await mkdir(FRAMES_DIR, { recursive: true });

  console.log('› Arrancando servidor estático local…');
  const server = await startStaticServer(__dirname);
  const port = server.address().port;

  console.log('› Lanzando Chromium…');
  const browser = await puppeteer.launch({
    executablePath: CHROMIUM_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--force-color-profile=srgb',
      '--font-render-hinting=none',
      '--disable-lcd-text',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: WIDTH,
      height: HEIGHT + BAR_H,
      deviceScaleFactor: SCALE,
    });

    page.on('pageerror', (err) => console.error('  [pageerror]', err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') console.error('  [console]', msg.text());
    });

    const pageUrl = `http://127.0.0.1:${port}/${encodeURIComponent(HTML_FILE_NAME)}`;
    console.log('› Cargando', pageUrl);
    await page.goto(pageUrl, { waitUntil: 'load' });

    // Fonts are self-hosted locally (assets/fonts); give them a moment to
    // settle. document.fonts.ready can take a few seconds in this sandbox
    // (background Chromium network noise slows the renderer), so cap the
    // wait rather than block on it indefinitely.
    await Promise.race([
      page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {}),
      new Promise((resolve) => setTimeout(resolve, 8000)),
    ]);

    let duration, target;
    if (ENGINE === 'v3') {
      const sel = '[data-om-exportable-video-with-duration-secs]';
      console.log('› Esperando la raíz exportable del motor v3…');
      target = await page.waitForSelector(sel, { timeout: 30000 });
      duration = await page.evaluate(
        (s) => parseFloat(document.querySelector(s).getAttribute('data-om-exportable-video-with-duration-secs')),
        sel
      );
    } else {
      console.log('› Esperando a que la escena esté lista (window.NK_ready)…');
      await page.waitForFunction('window.NK_ready === true', { timeout: 30000 });
      duration = await page.evaluate(() => window.NK_DURATION);
      target = await page.waitForSelector('#reel-root');
    }
    console.log(`› Duración detectada: ${duration}s @ ${FPS}fps (motor ${ENGINE})`);

    const totalFrames = Math.ceil(duration * FPS);

    for (let i = 0; i < totalFrames; i++) {
      const t = i / FPS;
      if (ENGINE === 'v3') {
        await page.evaluate((sel, time) => {
          document.querySelector(sel).dispatchEvent(new CustomEvent('data-om-seek-to-time-frame', {
            detail: { time, sync: true, playing: false },
          }));
        }, '[data-om-exportable-video-with-duration-secs]', t);
      } else {
        await page.evaluate((time) => window.NK_seek(time), t);
      }
      // Two RAF ticks so React has committed and the browser has painted.
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      );
      const framePath = path.join(FRAMES_DIR, `frame_${String(i).padStart(5, '0')}.png`);
      await target.screenshot({ path: framePath });
      if (i % FPS === 0 || i === totalFrames - 1) {
        console.log(`  frame ${i + 1}/${totalFrames} (t=${t.toFixed(2)}s)`);
      }
    }

    console.log('› Todos los frames capturados.');
  } finally {
    await browser.close();
    server.close();
  }

  console.log('› Codificando MP4 con ffmpeg…');
  await sh(FFMPEG_PATH, [
    '-y',
    '-framerate', String(FPS),
    '-i', path.join(FRAMES_DIR, 'frame_%05d.png'),
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-profile:v', 'high',
    '-crf', '18',
    '-movflags', '+faststart',
    OUT_FILE,
  ]);

  if (!KEEP_FRAMES) {
    console.log('› Limpiando frames temporales…');
    await rm(FRAMES_DIR, { recursive: true, force: true });
  }

  console.log(`✔ Listo: ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
