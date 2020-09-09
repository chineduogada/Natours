// SET ENV VARIABLES
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const mongoose = require('mongoose');
const debug = require('debug')('app:startup');
const fs = require('fs');
const TourModel = require('../../models/tourModel');

// CONNECT TO THE DB
mongoose
  .connect('mongodb://localhost:27017/natours')
  .then(() => debug('DB connection successful'))
  .catch((ex) => debug(ex, 'failed to connect to the DB'));

// READ JSON FILE
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await TourModel.create(tours);
    debug('Data successfully loaded...');
  } catch (ex) {
    debug(ex, 'failed to import data into db!!!!');
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await TourModel.deleteMany();
    debug('All data successfully deleted...');
  } catch (ex) {
    debug(ex, 'failed to delete all data into db!!!!');
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
} else {
  debug(
    'please specify either of the flags \n --> "--delete" or "--import" <--'
  );
  process.exit();
}

