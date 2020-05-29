const app = require('./index');
const debug = require('debug')('app:startup');

// STARTS the SERVER
const port = process.env.PORT || 8000;
app.listen(port, '127.0.0.1', () => debug(`Listening on port ${port}...`));
