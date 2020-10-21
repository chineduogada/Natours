// SET ENV VARIABLES
 require('dotenv').config();

const mongoose = require('mongoose');
const fs = require('fs');
const TourModel = require('../../models/tourModel');

// CONNECT TO THE DB
mongoose
  .connect('mongodb://localhost:27017/natours')
  .then(() => console.log('DB connection successful'))
  .catch((ex) => console.log(ex, 'failed to connect to the DB'));

// READ JSON FILE
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')
);

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await TourModel.create(tours);
    console.log('Data successfully loaded...');
  } catch (ex) {
    console.log(ex, 'failed to import data into db!!!!');
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await TourModel.deleteMany();
    console.log('All data successfully deleted...');
  } catch (ex) {
    console.log(ex, 'failed to delete all data into db!!!!');
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
} else {
  console.log(
    'please specify either of the flags \n --> "--delete" or "--import" <--'
  );
  process.exit();
}



