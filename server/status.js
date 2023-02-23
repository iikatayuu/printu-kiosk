
const cron = require('node-cron')
const axios = require('axios').default

async function sendStatus () {
  await axios.post(`${process.env.REACT_APP_SERVER_API}/api/active.php`, {
    pass: process.env.ACTIVE_PASS
  })
}

function start () {
  sendStatus()
  cron.schedule('*/3 * * * *', async () => {
    await sendStatus()
  })
}

module.exports = { start }
