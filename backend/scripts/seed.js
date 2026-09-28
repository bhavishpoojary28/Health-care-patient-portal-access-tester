require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const { seedInitialData } = require('../services/seedService');

const run = async () => {
  try {
    await connectDB();
    await seedInitialData();
    console.log('Seeding completed.');
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

run();
