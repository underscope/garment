import { Garment } from '@tailor-cms/garment'
import express from 'express'

import config from '../../config.js'

const app = express()

const { log } = console

const garment = new Garment(config.storage)

app.get('/', async (_, res) => {
  const catalog = await garment.source().list()
  res.json(catalog)
})

app.get('/repository/:id', async ({ params, query }, res) => {
  const signAssets = !!query.public
  const opts = { eager: !!query.eager }
  const repository = query.snapshot
    ? await garment.snapshot().get(params.id, query.snapshot, opts)
    : await garment.source().get(params.id, opts)
  if (signAssets)
    await repository.makePublic()
  res.json({
    size: repository.size,
    location: repository.path,
    containers: repository.containers,
    data: repository,
  })
})

app.get('/repository/:id/snapshot', async ({ params }, res) => {
  const repository = await garment.source().get(params.id)
  await repository.snapshot()
  res.json({ repository })
})

app.listen(config.port, () => {
  log(`Garment API example listening on port ${config.port}`)
})
