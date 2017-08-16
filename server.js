const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.set('port', process.env.PORT || 8888);

app.use(bodyParser.json())
app.use(express.static('public'))

app.locals.urls = [
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

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`)
})

app.route('/api/v1/urls')
  .get((req, res) => {
    res.status(200).json(app.locals.urls)
  })
  .post((req, res) => {
    app.locals.urls.push(req.body)
    console.log(app.locals.urls);
  })

app.listen(app.get('port'), () => {
  const portNum = app.get('port')
  console.log(`Jet Fuel URL Shortener is running on http://localhost:${portNum}`);
})
