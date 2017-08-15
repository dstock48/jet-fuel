const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.set('port', process.env.PORT || 8888);

app.use(bodyParser.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`)
});

app.listen(app.get('port'), () => {
  console.log(
    `JetFuel URL Shortener is running on http://localhost:${app.get('port')}`
  );
})
