const debug = require('debug')('app:startup');
const { sendRes } = require('./utils');
const express = require('express');
const app = express();

app.use(express.json());

app.get('/api/v1/tours', (_req, res) => {
  sendRes.success(res, 200, [1, 2, 3], 'tours');
});

const port = process.env.PORT || 8000;
app.listen(port, '127.0.0.1', () => debug(`Listening on port ${port}...`));
