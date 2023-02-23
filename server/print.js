
const fs = require('node:fs').promises
const path = require('node:path')
const crypto = require('node:crypto')
const util = require('node:util')
const exec = util.promisify(require('node:child_process').exec)
const express = require('express')
const asyncWrap = require('./utils/async-wrap')

const router = express.Router()
const printPostOptions = {
  limit: process.env.FILE_LIMIT,
  type: 'application/pdf'
}

async function getJobs () {
  const { stdout } = await exec('lpstat -o')
  return stdout !== '' ? stdout.split('\n') : []
}

router.get('/', asyncWrap(async (req, res) => {
  const jobs = await getJobs()
  res.json({
    success: true,
    pages: jobs.length
  })
}))

router.delete('/', asyncWrap(async (req, res) => {
  await exec('cancel -a')
  res.json({ success: true })
}))

router.post('/', express.raw(printPostOptions), asyncWrap(async (req, res) => {
  const busy = await isBusy()
  if (busy) {
    return res.json({
      success: false,
      message: 'Server is busy printing...'
    })
  }

  const buffer = req.body
  let pdfpath = ''
  while (pdfpath === '') {
    const random = Buffer.from(crypto.randomBytes(4)).toString('hex')
    const filepath = path.resolve(__dirname, `tmp/${random}.pdf`)
    try {
      await fs.access(filepath, fs.constants.F_OK)
    } catch (error) {
      pdfpath = filepath
    }
  }

  await fs.writeFile(pdfpath, buffer)
  await exec(`lp "${pdfpath}"`)
  await fs.unlink(pdfpath)

  res.json({
    success: true,
    hash: crypto.createHash('md5').update(buffer).digest('hex')
  })
}))

module.exports = router
