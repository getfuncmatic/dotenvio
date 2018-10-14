require('dotenv').config()
const dotenvio = require('../lib/dotenvio')

describe('Configuration', async () => {
  it ('should create dotenvio client from env variables', async () => {
    expect(dotenvio).toMatchObject({
      accessKeyId: process.env.DOTENVIO_ACCESS_KEY_ID,
      secretAccessKey: process.env.DOTENVIO_SECRET_ACCESS_KEY
    })
  })
})

describe('Request', async () => {
  it ('should create dotenvio client from env variables', async () => {
    var vars = await dotenvio.config()
    expect(vars).toMatchObject({
      REDIS_BLAH: 'helloworld'
    })
    expect(process.env).toMatchObject({
      REDIS_BLAH: 'helloworld'
    })
  })
})
