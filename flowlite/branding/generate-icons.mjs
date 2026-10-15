/**
 * LiteDaemon — Icon Generator Script
 * Converts the source JPG icon to all required formats and sizes.
 *
 * Outputs to src-tauri/icons/ (the location Tauri expects)
 *
 * Run: node flowlite/branding/generate-icons.mjs
 *
 * Requires: npm install --save-dev sharp
 */

import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SOURCE   = path.join(__dirname, 'icon_source.png')
const OUT_DIR  = path.join(__dirname, '../../src-tauri/icons')

// All sizes Tauri needs
const SIZES = [
  { file: '32x32.png',       size: 32  },
  { file: '64x64.png',       size: 64  },
  { file: '128x128.png',     size: 128 },
  { file: '128x128@2x.png',  size: 256 },
  { file: 'icon.png',        size: 512 },
]

async function run() {
  console.log('📦 LiteDaemon Icon Generator')
  console.log('Source:', SOURCE)
  console.log('Output:', OUT_DIR)

  // Read source JPG and convert to PNG base
  const sourceBuffer = await sharp(SOURCE)
    .resize(1024, 1024, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  // Generate each PNG size
  for (const { file, size } of SIZES) {
    const outPath = path.join(OUT_DIR, file)
    await sharp(sourceBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outPath)
    console.log(`✅ Generated ${file} (${size}x${size})`)
  }

  console.log('\n⚠️  Note: icon.ico (Windows) and icon.icns (Mac) require platform tools.')
  console.log('   Windows .ico: Use https://convertio.co/png-ico/ with icon.png (512px)')
  console.log('   Mac .icns:    Built automatically by Tauri on macOS during build')
  console.log('\n✨ PNG icons done! Run "npm run tauri build" to create the full installers.')
}

run().catch(console.error)
