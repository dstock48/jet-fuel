const express = require('express');
const bodyParser = require('body-parser');
const shortHash = require('short-hash');
const validUrl = require('valid-url');

// creates the express app and gives access to all the express methods (USE, GET, POST, etc...)
const app = express();

// get env variable or default to 'development'
const environment = process.env.NODE_ENV || 'development';
// set the configuration variable based on the current working environment
const configuration = require('./knexfile')[environment];
// set the database variable based on the configuration
const database = require('knex')(configuration);

// set the port number based on the env variable or default to port 8888
app.set('port', process.env.PORT || 8888);

// use bodyParser to automatically parse the response body in JSON
app.use(bodyParser.json())
// allow url encoding for url queries
app.use(bodyParser.urlencoded({extended: true}));
// tell express where to look for static resources
app.use(express.static('public'))


// GET method for root path to serve up the HTML file
app.get('/', (req, res) => {
  // respond by sending the index.html file to the browser located in public folder in the root directory
  res.sendFile(`${__dirname}/index.html`)
})

// GET method for shortened URL path to redirect to the corresponding long URL
app.get('/shrt/:short_url', (req, res) => {
  const shortUrl = req.params.short_url

  database('links')  // look in the 'links' table of the DB
    .where('short_url', shortUrl)  // find a record that matches the short URL being requested
    .select('long_url')  // select that record's long URL
      .then(longUrl => {
        // respond with a redirect status code and a command that tells the browser to redirect to the long URL
        res.status(302).redirect(longUrl[0].long_url)
      })
})


// FOLDERS ROUTE
app.route('/api/v1/folders')
  // GET method for 'folders' route
  .get((req, res) => {
    // look in the 'folders' table of the DB and select all records
    database('folders').select()
      .then(folders => {
        // respond with a success status and send the array of folder objects back to the client in JSON format
        res.status(200).json(folders);
      })
      .catch(err => {
        // if there is an error, send back an error status and an object containing the error
        res.status(500).json({ err });
      })
  })
  // POST method for 'folders' route
  .post((req, res) => {
    // grab the body from the request obj and store it in the 'newFolder' variable
    const newFolder = req.body;

    // check to make sure that the body object contains a value in the required key name
    for (let requiredParam of ['folder_name']) {
      if (!newFolder[requiredParam]) {
        // if it does not, return an error informing the user that they must provide that data
        return res.status(422).json({ error: `Missing required parameter: ${requiredParam}`})
      }
    }
    // go to the 'folders' table in the database and insert the new folder
    database('folders').insert(newFolder, '*')
      .then(folder => {
        // send back a success code and all the information about the new folder
        res.status(201).json(folder[0])
      })
      .catch(err => {
        // send back an error code and an object with the error message
        res.status(500).json({ err });
      });
  })

// LINKS ROUTE
app.route('/api/v1/links')
  // GET method for 'links' route
  .get((req, res) => {
    // look in the 'links' table of the DB and select all of the records
    database('links').select()
      .then(links => {
        // respond with a sucess status and send the array of link objects back to the client in JSON format
        res.status(200).json(links)
      })
      .catch(err => {
        // if there is an error, send back an error status and an object containing the error
        res.status(500).json({ err })
      })
  })
  // POST method for 'links' route
  .post((req, res) => {
    const newLink = req.body;

    // check to see if the input value from the URL field is a valid web URI
    if (!validUrl.isWebUri(newLink.long_url)) {
      // if it is not, return an error status code with an error object
      return res.status(422).json({ error: `"${newLink.long_url}" is not a valid URL`})
    }

    // add a key of 'short_url' to the request body object containing a value of the shortened URL slug
    newLink.short_url = shortHash(newLink.long_url)

    // check to make sure that the body object contains a value in each of the required key names
    for (let requiredParam of ['long_url', 'short_url', 'title', 'folder_id']) {
      if (!newLink[requiredParam]) {
        // if it does not, return an error informing the user that they must provide that data
        return res.status(422).json({ error: `Missing required parameter: ${requiredParam}`})
      }
    }

    database('links').insert(newLink, '*')
      .then(link => {
        // send back a success code and all the information about the new link
        res.status(201).json(link[0])
      })
      .catch(err => {
        // if there is an error, send back an error code with an error object
        res.status(500).json({ err })
      })
  })

// tell server to listen for requests from the predefined port number
app.listen(app.get('port'), () => {
  const portNum = app.get('port')
  console.log(`Jet Fuel URL Shortener is running on http://localhost:${portNum}`);
})


module.exports = app;
