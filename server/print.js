
const fs = require('node:fs').promises
const path = require('node:path')
const crypto = require('node:crypto')
const util = require('node:util')
const exec = util.promisify(require('node:child_process').exec)
const express = require('express')
const multer = require('multer')
const pdfjam = require('pdfjam')
const asyncWrap = require('./utils/async-wrap')

const router = express.Router()
const upload = multer()
const uploadPrint = upload.fields([
  {
    name: 'pdf',
    maxCount: 1
  }
])

async function isPrinting () {
  const { stdout } = await exec('lpstat -o', { windowsHide: true })
  return stdout !== ''
}

router.get('/', asyncWrap(async (req, res) => {
  res.json({
    success: true,
    printing: await isPrinting()
  })
}))

router.delete('/', asyncWrap(async (req, res) => {
  await exec('cancel -a', { windowsHide: true })
  res.json({ success: true })
}))

router.post('/', uploadPrint, asyncWrap(async (req, res) => {
  const printing = await isPrinting()
  if (printing) {
    return res.json({
      success: false,
      message: 'Server is busy printing...'
    })
  }

  const buffer = req.files.pdf[0].buffer
  const page = parseInt(req.body.page)
  const npps = parseInt(req.body.npps)
  const color = req.body.color
  const copies = parseInt(req.body.copies)
  const papersize = '{21.6cm,27.9cm}'

  let filename = ''
  let pdfpath = ''
  while (pdfpath === '') {
    const random = Buffer.from(crypto.randomBytes(4)).toString('hex')
    const filepath = path.resolve(__dirname, `../tmp/${random}.pdf`)
    try {
      await fs.access(filepath, fs.constants.F_OK)
    } catch (error) {
      filename = random
      pdfpath = filepath
    }
  }

  await fs.writeFile(pdfpath, buffer)
  if (npps === 2) {
    await pdfjam.nup(pdfpath, 2, 1, { papersize })
  } else if (npps === 4) {
    await pdfjam.nup(pdfpath, 2, 2, { papersize })
  } else if (npps === 6) {
    await pdfjam.nup(pdfpath, 3, 2, {
      orientation: 'landscape',
      papersize
    })
  } else if (npps === 9) {
    await pdfjam.nup(pdfpath, 3, 3, { papersize })
  }

  if (npps > 1) {
    const newpath = path.resolve(__dirname, `../tmp/${filename}-pdfjam.pdf`)
    await fs.unlink(pdfpath)

    pdfpath = newpath
  }

  const pdfroot = path.resolve(__dirname, `../tmp/${filename}`)
  await exec(`pdftoppm -jpeg -f ${page} -l ${page} "${pdfpath}" "${pdfroot}"`, { windowsHide: true })
  const previewPath = `${pdfroot}-${page}.jpg`
  const previewBuffer = await fs.readFile(previewPath, { encoding: 'base64' })
  const previewUri = `data:image/jpeg;base64,${previewBuffer}`
  await fs.unlink(previewPath)

  await exec(`lp -s -P ${page} -n ${copies} -o media=Letter "${pdfpath}"`, { windowsHide: true })
  await fs.unlink(pdfpath)

  res.json({
    success: true,
    hash: crypto.createHash('md5').update(buffer).digest('hex'),
    preview: previewUri
  })
}))

module.exports = router
