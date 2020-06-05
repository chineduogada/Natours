const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const mongoose = require('mongoose');
const debug = require('debug')('app:startup');
const app = require('./app');

// debug(process.env);

// CONNECT MONGODB
const DB = process.env.DATABASE_LOCAL;

mongoose
  .connect(DB)
  .then(() => debug('successfully connected to mongodb...'))
  .catch((ex) => debug(ex, "couldn't connect to mongodb"));

// STARTS the SERVER
const port = process.env.PORT || 8000;
app.listen(port, '127.0.0.1', () => debug(`Listening on port ${port}...`));
