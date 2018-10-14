const url = require('url')
const https = require('https')
const DOTENVIO_ENDPOINT = 'https://api.dotenv.io/dev'

class Dotenv {

  constructor(options) { 
    options = options || { }
    this.endpoint = options.endpoint || DOTENVIO_ENDPOINT
    this.accessKeyId = options.accessKeyId || process.env.DOTENVIO_ACCESS_KEY_ID
    this.secretAccessKey = options.secretAccessKey || process.env.DOTENVIO_SECRET_ACCESS_KEY    
  }

  async config() {
    var { statusCode, headers, data } = await getRequestPromise(this.requestOptions())
    if (statusCode != 200) {
      throw new Error(`${statusCode} ${data.errorMessage}`)
    }
    for (var key in data.vars) {
      process.env[key] = data.vars[key]
    }
    return data.vars
  }

  requestOptions() {
    var options = urlToOptions(new url.URL(`${this.endpoint}/files/${this.accessKeyId}/decrypt`))
    options.headers = {
      'Accept': 'application/json',
      'X-Funcmatic-Env-Secret': this.secretAccessKey
    }
    console.log("options", JSON.stringify(options, null, 2))
    return options
  }
}

async function getRequestPromise(options) {
  return new Promise((resolve, reject) => {
    var datastr = ''
    https.get(options, (res) => {
      var statusCode = res.statusCode
      var headers = res.headers
      var data = null
      res.setEncoding('utf8')
      res.on('data', (d) => {
        datastr += d
      })
      res.on('end', () => {
        data = JSON.parse(datastr)
        resolve({ statusCode, headers, data })
      })
    }).on('error', (e) => {
      reject(err)
    })
  })
}

function urlToOptions(url) {
  var options = {
    protocol: url.protocol,
    hostname: url.hostname,
    hash: url.hash,
    search: url.search,
    pathname: url.pathname,
    path: `${url.pathname}${url.search}`,
    href: url.href
  };
  if (url.port !== '') {
    options.port = Number(url.port);
  }
  if (url.username || url.password) {
    options.auth = `${url.username}:${url.password}`;
  }
  return options;
}

function createClient(options) {
  options = options || { }
  return new Dotenv(options)
}

var dotenv = createClient()
dotenv.create = createClient
dotenv.Dotenv = Dotenv

module.exports = dotenv
module.exports.default = dotenv