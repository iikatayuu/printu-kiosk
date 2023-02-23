
const cron = require('node-cron')
const axios = require('axios').default

function start () {
  cron.schedule('*/3 * * * *', async () => {
    const data = new FormData()
    data.set('pass', process.env.ACTIVE_PASS)
    await axios.post(`${process.env.SERVER_API}/api/active.php`, data)
  })
}

module.exports = { start }
