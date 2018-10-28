const url = require('url')
const https = require('https')
const aws4 = require('aws4')
const DOTENVIO_ENDPOINT = 'https://api.dotenv.io/dev'

class Dotenv {

  constructor(options) { 
    options = options || { }
    this.endpoint = options.endpoint || DOTENVIO_ENDPOINT
    this.accessKeyId = options.accessKeyId || process.env.DOTENVIO_ACCESS_KEY_ID
    this.secretAccessKey = options.secretAccessKey || process.env.DOTENVIO_SECRET_ACCESS_KEY    
  }

  async config(options) {
    options = options || { }
    // noop if necessary parameters are not provided
    // this lets someone use file-based dotenv in local development mode
    if (!this.endpoint || !this.accessKeyId || !this.secretAccessKey) {
      return null
    }
    var { statusCode, headers, data } = await getRequestPromise(this.signedRequestOptions())
    if (statusCode != 200) {
      throw new Error(`${statusCode} ${data.errorMessage}`)
    }
    for (var key in data.vars) {
      process.env[key] = data.vars[key]
    }
    return data.vars
  }

  credentials() {
    return {
      accessKeyId: this.accessKeyId,
      secretAccessKey: this.secretAccessKey
    }
  }
  
  signedRequestOptions() {
    var options = urlToOptions(new url.URL(`${this.endpoint}/files/${this.accessKeyId}/decrypt2`))
    options.headers = {
      'Accept': 'application/json'
    }
    var signed = aws4.sign(options, this.credentials())
    // Hack: we also send the generated header as a custom header. API Gateways 
    // seems to strip out 'Authorization' header when it is AWS4-HMAC-SHA256 
    signed.headers['X-Dotenvio-Authorization'] = signed.headers['Authorization']
    console.log("SIGNED", signed)
    return signed
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