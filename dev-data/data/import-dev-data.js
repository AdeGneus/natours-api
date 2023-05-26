const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE_LOCAL;

mongoose.connect(DB).then(() => console.log('DB Connection successful!'));

// READ JSON file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

// Import data
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data loaded');
  } catch (error) {
    console.error(error);
  }
  process.exit();
};

// Delete all data from DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data deleted');
  } catch (error) {
    console.error(error);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
