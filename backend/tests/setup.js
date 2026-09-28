const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { seedInitialData } = require('../services/seedService');

let mongod;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
  }
  await seedInitialData();
});

// We keep connection alive for all suites in band, closing on process exit
afterAll(async () => {
  // No-op here so subsequent suites can reuse the in-memory DB
});
