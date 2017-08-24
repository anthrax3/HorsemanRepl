const http = require('http')
const path = require('path')
const fs = require('fs')
const notifier = require('node-notifier')
const Horseman = require('node-horseman')
const Promise = require('bluebird')

const app = http.createServer(handler)
const io = require('socket.io')(app)

const userAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36'
const horsemanConfig = {
  timeout: Infinity,
  switchToNewTab: true,
  cookiesFile: path.join(__dirname, 'cookies.txt'),
  phantomPath: '/usr/local/bin/phantomjs',
  debugPort: 3334,
}

app.listen(3333, () => {
  console.log('REPL is running. Open http://localhost:3333 in your browser.')
})

function handler(req, res) {
  if (req.connection.remoteAddress !== '::1') {
    res.writeHead(401)
    res.end()
    return
  }
  fs.readFile(__dirname + '/client.html',
    function (err, data) {
      if (err) {
        res.writeHead(500)
        return res.end('Error loading index.html')
      }
      res.writeHead(200)
      res.end(data)
    })
}

let nextUserId = 1

io.on('connection', (socket) => {
  socket.on('summon', (size) => {
    socket.userNum = nextUserId
    nextUserId++
    notifier.notify({
      'title': 'Horseman REPL',
      'message': `User #${socket.userNum} connected.`
    })

    const horseman = new Horseman(horsemanConfig)
    horseman.userAgent(userAgent)
    horseman.viewport(size.width, size.height)
    socket.emit('ready')

    let promiseChain = Promise.resolve()
    socket.on('execute', (code) => {
      console.info(`.then(()=> {\n  return ${code}\n})`)
      const initialTime = process.hrtime()
      promiseChain = promiseChain
        .then(() => eval(code))
        .tap(() => {
          const elapsedTime = process.hrtime(initialTime)
          const elapsedSeconds = elapsedTime[0] + elapsedTime[1] / 1000000000
          notifier.notify({
            title: 'Horseman REPL',
            message: `Success! Execution Time: ${elapsedSeconds.toFixed(3)}s`,
          })
        })
        .then(() => horseman.screenshotBase64('PNG'))
        .then((imageData) => {
          socket.emit('displayImage', imageData)
        })
        .catch((error) => {
          console.error(error)
          notifier.notify({
            'title': `Error (User ${socket.userNum})`,
            'message': error.message
          })
        })
    })

    socket.on('disconnect', () => {
      notifier.notify({
        'title': 'Horseman REPL',
        'message': `User #${socket.userNum} disconnected.`
      })
      horseman.close()
    })
  })
})
