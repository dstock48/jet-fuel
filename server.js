const express = require('express');
const bodyParser = require('body-parser');

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

app.locals.links = [
  {
    longUrl: 'www.google.com'
  },
  {
    longUrl: 'www.yahoo.com'
  },
  {
    longUrl: 'www.bing.com'
  }
];

// GET method for root path to serve up the HTML file
app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`)
})


// FOLDERS ROUTE
app.route('/api/v1/folders')
  // GET method for 'folders' route
  .get((req, res) => {
    database('folders').select()
      .then(folders => {
        res.status(200).json(folders);
      })
      .catch(err => {
        res.status(500).json({ err });
      })
  })
  // POST method for 'folders' route
  .post((req, res) => {
    // grab the body from the request obj and store it in the 'newFolder' variable
    const newFolder = req.body;

    // check to make sure that the body contains a value in the defined required parameter
    // if it does not, return an error informing the user that they must provide that data
    for (let requiredParam of ['folder_name']) {
      if (!newFolder[requiredParam]) {
        return res.status(422).json({ error: `Missing required parameter: ${requiredParam}`})
      }
    }
    // go to the folders table in the database and insert the new folder
    database('folders').insert(newFolder, 'id')
      .then(folder => {
        // send back a success code and the id number of the new folder
        res.status(201).json({ id: folder[0] })
      })
      .catch(err => {
        res.status(500).json({ err });
      });
  })

// LINKS ROUTE
app.route('/api/v1/links')
  // GET method for 'links' route
  .get((req, res) => {
    database('links').select()
      .then(links => {
        res.status(200).json(links)
      })
      .catch(err => {
        res.status(500).json({ err })
      })
  })
  // POST method for 'links' route
  .post((req, res) => {
    const newLink = req.body;

    for (let requiredParam of ['long_url', 'title', 'folder_id']) {
      if (!newLink[requiredParam]) {
        return res.status(422).json({ error: `Missing required parameter: ${requiredParam}`})
      }
    }

    database('links').insert(newLink, 'id')
      .then(link => {
        res.status(201).json({ id: link[0] })
      })
      .catch(err => {
        res.status(500).json({ err })
      })
  })

// tell server to listen for requests from the predefined port number
app.listen(app.get('port'), () => {
  const portNum = app.get('port')
  console.log(`Jet Fuel URL Shortener is running on http://localhost:${portNum}`);
})
