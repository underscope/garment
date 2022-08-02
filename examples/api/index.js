const express = require('express')
const { Garment } = require('../../dist/index.cjs')
const config = require('./config')

const { log } = console
const app = express()
const garment = new Garment(config.storage)

app.get('/', async (_, res) => {
  const catalog = await garment.source().list()
  res.json(catalog)
})

app.get('/repository/:id', async ({ params, query }, res) => {
  const eager = !!query.eager
  const public = !!query.public
  const repository = await garment.source().get(params.id, { eager })
  if (public) await repository.makePublic()
  res.json(repository)
})

app.listen(config.port, () => {
  log(`Garment API example listening on port ${config.port}`)
})
