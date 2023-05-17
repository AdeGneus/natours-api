const express = require('express');

const app = express();

const port = 8000;

app.get('/', (req, res) => {
  res.status(200).send('hello from the server');
});

app.listen(port, () => {
  console.log(`App listening on ${port}`);
});
