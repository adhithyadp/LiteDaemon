const sharp = require('sharp')
const path = require('path')

const SRC = 'C:\\Users\\adhit\\.gemini\\antigravity-ide\\brain\\fe547041-ef1e-46b9-a537-e52d8db54d91\\flowlite_icon_raw_1792003601931.jpg'
const OUT = 'C:\\Users\\adhit\\Desktop\\project flow\\flowlite\\src-tauri\\icons'

const SIZES = [
  { file: '32x32.png',      size: 32  },
  { file: '64x64.png',      size: 64  },
  { file: '128x128.png',    size: 128 },
  { file: '128x128@2x.png', size: 256 },
  { file: 'icon.png',       size: 512 },
]

async function run() {
  console.log('LiteDaemon Icon Generator')
  console.log('Source:', SRC)
  console.log('Output:', OUT)

  const base = await sharp(SRC)
    .resize(1024, 1024, { fit: 'contain', background: { r: 27, g: 27, b: 36, alpha: 0 } })
    .png()
    .toBuffer()

  for (const { file, size } of SIZES) {
    const outPath = path.join(OUT, file)
    await sharp(base).resize(size, size).png().toFile(outPath)
    console.log('Generated:', file, `(${size}x${size})`)
  }

  console.log('All PNG icons done!')
}

run().catch(console.error)
