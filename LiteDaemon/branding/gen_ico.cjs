const { default: pngToIco } = require('png-to-ico')
const fs = require('fs')

const dir = 'C:\\Users\\adhit\\Desktop\\project flow\\flowlite\\src-tauri\\icons'

pngToIco([
  dir + '\\32x32.png',
  dir + '\\64x64.png',
  dir + '\\128x128.png',
  dir + '\\icon.png',
])
  .then(buf => {
    fs.writeFileSync(dir + '\\icon.ico', buf)
    console.log('icon.ico done! Size:', buf.length, 'bytes')
  })
  .catch(e => console.error('Error:', e.message))
