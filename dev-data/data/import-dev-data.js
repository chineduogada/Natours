const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('../../models/tourModel');
const Review = require('../../models/reviewModel');
const User = require('../../models/userModel');

// SET ENV VARIABLES
require('dotenv').config();

// CONNECT TO THE DB
mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB connection successful'))
  .catch((ex) => console.log(ex, 'failed to connect to the DB'));

// READ JSON FILE
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')
);
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/users.json`, 'utf-8')
);

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Tour.create(tours);
    await Review.create(reviews);
    await User.create(users, { validateBeforeSave: false });
    console.log('Data successfully loaded...');
  } catch (ex) {
    console.log(ex, 'failed to import data into db!!!!');
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await Review.deleteMany();
    await User.deleteMany();
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












