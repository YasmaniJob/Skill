/**
 * Genera los iconos PWA requeridos a partir de logo.png
 * Salida: public/icons/icon-192.png y public/icons/icon-512.png
 */
import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const src  = join(root, 'public', 'logo.png');
const dest = join(root, 'public', 'icons');

mkdirSync(dest, { recursive: true });

const sizes = [192, 512];

for (const size of sizes) {
  const out = join(dest, `icon-${size}.png`);
  await sharp(src)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png()
    .toFile(out);
  console.log(`✓ icon-${size}.png generado`);
}

// Icono maskable: padding del 10% para zona segura
const maskableOut = join(dest, 'icon-512-maskable.png');
const padding = Math.round(512 * 0.1);
const innerSize = 512 - padding * 2;

await sharp(src)
  .resize(innerSize, innerSize, {
    fit: 'contain',
    background: { r: 79, g: 70, b: 229, alpha: 1 } // color primario #4f46e5
  })
  .extend({
    top: padding, bottom: padding, left: padding, right: padding,
    background: { r: 79, g: 70, b: 229, alpha: 1 }
  })
  .png()
  .toFile(maskableOut);

console.log('✓ icon-512-maskable.png generado');
console.log('\nIconos PWA generados correctamente en public/icons/');
