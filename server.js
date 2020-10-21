require('dotenv').config();

const mongoose = require('mongoose');
const debug = require('debug')('app:startup');

process.on('uncaughtException', (err) => {
  console.error(err.stack, err.name, err.message);

  console.error('UNCAUGHT EXCEPTION: Shutting down...');
  process.exit(1);
});

const app = require('./app');

// debug(process.env);

// CONNECT MONGODB
const DB = process.env.DATABASE_LOCAL;

mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
}).then(() => debug('successfully connected to mongodb...'));
// .catch((ex) => debug(ex, "couldn't connect to mongodb"));

// STARTS the SERVER
const port = process.env.PORT || 8000;
const server = app.listen(port, '127.0.0.1', () =>
  debug(`Listening on port ${port}...`)
);

process.on('unhandledRejection', (err) => {
  console.error(err.stack, err.name, err.message);
  console.error('UNHANDLED REJECTION: Shutting down...');
  server.close(() => process.exit(1));
});




