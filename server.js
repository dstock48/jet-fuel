const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.set('port', process.env.PORT || 8888);

app.use(bodyParser.json())
app.use(express.static('public'))

app.locals.urls = {
  1: 'www.google.com',
  2: 'www.yahoo.com',
  3: 'www.bing.com'
};

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`)
});

app.get('/api/v1/urls', (req, res) => {
  res.status(200).json(app.locals.urls)
})

app.listen(app.get('port'), () => {
  const portNum = app.get('port')
  console.log(`Jet Fuel URL Shortener is running on http://localhost:${portNum}`);
})
