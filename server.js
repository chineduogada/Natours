const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const mongoose = require('mongoose');
const debug = require('debug')('app:startup');
const app = require('./index');

// debug(process.env);

// CONNECT MONGODB
const DB = process.env.DATABASE_LOCAL;

mongoose
  .connect(DB)
  .then(() => debug('successfully connected to mongodb...'))
  .catch((ex) => debug(ex, "couldn't connect to mongodb"));

const tourSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'a tour must have a "name"'],
    unique: true,
  },
  price: { type: Number, required: [true, 'a tour must have a "price"'] },
  rating: {
    type: Number,
    default: 4.5,
  },
});

const Tour = mongoose.model('Tour', tourSchema);

const tourTest = new Tour({
  name: 'the park camper',
  price: 997,
});

tourTest
  .save()
  .then((doc) => debug(doc))
  .catch((ex) => debug(ex));

// STARTS the SERVER
const port = process.env.PORT || 8000;
app.listen(port, '127.0.0.1', () => debug(`Listening on port ${port}...`));
