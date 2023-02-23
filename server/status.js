
const cron = require('node-cron')
const axios = require('axios').default

async function sendStatus () {
  const data = new FormData()
  data.set('pass', process.env.ACTIVE_PASS)
  await axios.post(`${process.env.SERVER_API}/api/active.php`, data)
}

function start () {
  sendStatus()
  cron.schedule('*/3 * * * *', async () => {
    await sendStatus()
  })
}

module.exports = { start }
