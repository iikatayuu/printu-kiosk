
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const express = require('express')
const dotenv = require('dotenv')
const { print, getDefaultPrinter } = require('unix-print')

let configPath = path.resolve(__dirname, '.env.local')
if (!fs.existsSync(configPath)) configPath = path.resolve(__dirname, '.env')
dotenv.config({ path: configPath })

if (process.platform !== 'linux') {
  console.error('This program only supports Linux')
  process.exit(1)
}

const defaultPrinter = getDefaultPrinter()
if (defaultPrinter === null) {
  console.error('No printer detected')
  process.exit(1)
}

const tmpDir = path.resolve(__dirname, 'tmp')
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

const app = express()
const port = process.env.PORT || '3001'
const publicPath = path.resolve(__dirname, 'build')
const printPostOptions = {
  limit: '50mb',
  type: 'application/pdf'
}

app.use('/', express.static(publicPath))

app.post('/print', express.raw(printPostOptions), (req, res) => {
  const buffer = req.body
  let pdfpath = ''
  while (pdfpath === '') {
    const random = Buffer.from(crypto.randomBytes(4)).toString('hex')
    const filepath = path.resolve(__dirname, `tmp/${random}.pdf`)
    if (!fs.existsSync(filepath)) pdfpath = filepath
  }

  fs.writeFileSync(pdfpath, buffer)
  print(pdfpath, undefined, ['-m'])
    .then((value) => {
      console.log(value)
      fs.unlinkSync(pdfpath)
      res.json({
        success: true,
        hash: crypto.createHash('md5').update(buffer).digest('hex')
      })
    }).catch((error) => {
      console.error(error)
      res.json({ success: false })
    })
})

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`)
})
