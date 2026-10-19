import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerServiceWorker } from '../js/pwa.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (file) => readFileSync(join(root, file), 'utf8');

function walk(dir) {
  const full = join(root, dir);
  return readdirSync(full, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function pngSize(file) {
  const buffer = readFileSync(join(root, file));
  assert.equal(buffer.toString('hex', 0, 8), '89504e470d0a1a0a', `${file} is not a PNG`);
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

test('the manifest has the fields an installable app needs', () => {
  const manifest = JSON.parse(read('manifest.webmanifest'));
  assert.equal(manifest.name, 'SkillForge Academy');
  assert.ok(manifest.short_name.length > 0);
  assert.equal(manifest.start_url, './index.html');
  assert.equal(manifest.scope, './');
  assert.equal(manifest.display, 'standalone');
  assert.match(manifest.background_color, /^#[0-9a-f]{6}$/i);
  assert.match(manifest.theme_color, /^#[0-9a-f]{6}$/i);
  assert.ok(manifest.icons.length >= 2);
  const sizes = new Set(manifest.icons.map((icon) => icon.sizes));
  assert.ok(sizes.has('192x192'));
  assert.ok(sizes.has('512x512'));
  assert.ok(manifest.icons.some((icon) => icon.purpose === 'maskable'));
});

test('every manifest icon exists and has the size it claims', () => {
  const manifest = JSON.parse(read('manifest.webmanifest'));
  for (const icon of manifest.icons) {
    assert.ok(existsSync(join(root, icon.src)), `${icon.src} is missing`);
    const [width, height] = icon.sizes.split('x').map(Number);
    assert.deepEqual(pngSize(icon.src), { width, height }, icon.src);
  }
});

test('the page links the manifest, the icons and a theme color', () => {
  const html = read('index.html');
  assert.match(html, /<link rel="manifest" href="manifest\.webmanifest">/);
  assert.match(html, /<meta name="theme-color" content="#2b5fd9">/);
  assert.match(html, /<link rel="apple-touch-icon" href="icons\/apple-touch-icon\.png">/);
  assert.match(html, /<link rel="icon"[^>]+href="icons\/icon-192\.png">/);
});

test('the app registers the service worker', () => {
  const main = read('js/main.js');
  assert.match(main, /import \{ registerServiceWorker \} from '\.\/pwa\.js';/);
  assert.match(main, /registerServiceWorker\(\);/);
});

test('the service worker caches every app file and cleans old caches', () => {
  const sw = read('service-worker.js');
  const match = sw.match(/const CORE_ASSETS = \[([\s\S]*?)\];/);
  assert.ok(match, 'CORE_ASSETS list not found');
  const assets = [...match[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);

  assert.equal(new Set(assets).size, assets.length, 'CORE_ASSETS has duplicates');
  for (const asset of assets) {
    assert.ok(asset.startsWith('./'), asset);
    assert.ok(existsSync(join(root, asset.slice(2))), `${asset} does not exist`);
  }

  const appFiles = ['js', 'content', 'css'].flatMap((dir) => walk(dir)
    .filter((file) => /\.(js|css)$/.test(file))
    .map((file) => `./${relative(root, join(root, file)).split(sep).join('/')}`));
  for (const file of appFiles) assert.ok(assets.includes(file), `${file} is not cached`);

  assert.match(sw, /const CACHE_NAME = 'skillforge-v\d+';/);
  assert.match(sw, /addEventListener\('install'/);
  assert.match(sw, /addEventListener\('activate'/);
  assert.match(sw, /addEventListener\('fetch'/);
  assert.match(sw, /caches\.delete/);
  assert.match(sw, /caches\.match\('\.\/index\.html'\)/);
});

test('service worker registration is safe when the browser has none or it fails', async () => {
  assert.equal(await registerServiceWorker(undefined), null);
  assert.equal(await registerServiceWorker({}), null);

  const calls = [];
  const registration = { scope: 'test' };
  const navigatorLike = { serviceWorker: { register: async (url) => { calls.push(url); return registration; } } };
  assert.equal(await registerServiceWorker(navigatorLike), registration);
  assert.deepEqual(calls, ['./service-worker.js']);

  const failing = { serviceWorker: { register: async () => { throw new Error('blocked'); } } };
  assert.equal(await registerServiceWorker(failing), null);

  const throwing = { serviceWorker: { register: () => { throw new Error('insecure context'); } } };
  assert.equal(await registerServiceWorker(throwing), null);
});
