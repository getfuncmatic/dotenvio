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
  it ('should noop if no DOTENVIO params are provided', async () => {
    delete process.env['DOTENVIO_ACCESS_KEY_ID']
    delete process.env['DOTENVIO_SECRET_ACCESS_KEY']
    delete process.env['REDIS_BLAH']
    var dotenvio_noconf = dotenvio.create()
    var vars = await dotenvio_noconf.config()
    expect(vars).toBe(null)
    expect(process.env['DOTENVIO_ACCESS_KEY_ID']).toBeFalsy()
    expect(process.env['DOTENVIO_SECRET_ACCESS_KEY']).toBeFalsy()
    expect(process.env['REDIS_BLAH']).toBeFalsy()
  })
})
