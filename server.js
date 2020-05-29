const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const debug = require('debug')('app:startup');

const app = require('./index');
// debug(process.env);

// STARTS the SERVER
const port = process.env.PORT || 8000;
app.listen(port, '127.0.0.1', () => debug(`Listening on port ${port}...`));
