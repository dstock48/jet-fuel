const express = require('express');
const bodyParser = require('body-parser');
const shortHash = require('short-hash');
const validUrl = require('valid-url');

const app = express();

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.set('port', process.env.PORT || 8888);

function requireHTTPS(redirectLocalhost) {
    return function(req, res, next) {
        if (req.hostname === 'localhost' && !redirectLocalhost) {
            return next();
        }
        if (isSecure(req)) {
            return next();
        }
        // Note that we do not keep the port as we are using req.hostname
        // and not req.headers.host. The port number does not really have
        // a meaning in most cloud deployments since they port forward.
        res.redirect('https://' + req.hostname + req.originalUrl);
    };
};

function isSecure(req) {
    // Check the trivial case first.
    if (req.secure) {
        return true;
    }
    // Check if we are behind Application Request Routing (ARR).
    // This is typical for Azure.
    if (req.headers['x-arr-log-id']) {
        return typeof req.headers['x-arr-ssl'] === 'string';
    }
    // Check for forwarded protocol header.
    // This is typical for AWS.
    return req.headers['x-forwarded-proto'] === 'https';
}


app.use('/', httpsRedirect());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`)
})

app.get('/shrt/:short_url', (req, res) => {
  const shortUrl = req.params.short_url

  database('links')
    .where('short_url', shortUrl)
    .select('long_url')
      .then(longUrl => {
        res.status(302).redirect(longUrl[0].long_url)
      })
})

app.route('/api/v1/folders')
  .get((req, res) => {
    database('folders').select()
      .then(folders => {
        res.status(200).json(folders);
      })
      .catch(err => {
        res.status(500).json({ err });
      })
  })
  .post((req, res) => {
    const newFolder = req.body;

    for (let requiredParam of ['folder_name']) {
      if (!newFolder[requiredParam]) {
        return res.status(422).json({ error: `Missing required parameter: ${requiredParam}`})
      }
    }
    database('folders').insert(newFolder, '*')
      .then(folder => {
        res.status(201).json(folder[0])
      })
      .catch(err => {
        res.status(500).json({ err });
      });
  })

app.route('/api/v1/links')
  .get((req, res) => {
    database('links').select()
      .then(links => {
        res.status(200).json(links)
      })
      .catch(err => {
        res.status(500).json({ err })
      })
  })
  .post((req, res) => {
    const newLink = req.body;

    if (!validUrl.isWebUri(newLink.long_url)) {
      return res.status(422).json({ error: `"${newLink.long_url}" is not a valid URL`})
    }

    newLink.short_url = shortHash(newLink.long_url)

    for (let requiredParam of ['long_url', 'short_url', 'title', 'folder_id']) {
      if (!newLink[requiredParam]) {
        return res.status(422).json({ error: `Missing required parameter: ${requiredParam}`})
      }
    }

    database('links').insert(newLink, '*')
      .then(link => {
        res.status(201).json(link[0])
      })
      .catch(err => {
        res.status(500).json({ err })
      })
  })

app.listen(app.get('port'), () => {
  const portNum = app.get('port')
  console.log(`Jet Fuel URL Shortener is running on http://localhost:${portNum}`);
})


module.exports = app;
