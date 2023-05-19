const schedule = require("node-schedule")

console.log("test")

schedule.scheduleJob('*/1 * * * *', () => {
  console.log('hello world')
})
