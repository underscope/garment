const express = require('express')
const app = express()

const { log } = console
const port = 3030

app.get('/', (_, res) => {
  res.send('Hello World, from express')
})

app.listen(port, () => {
  log(`Garment example API listening on port ${port}`)
})
