const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/healthcare_portal';
    mongoose.set('strictQuery', false);

    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
      console.log(`[DB] Connected to MongoDB: ${mongoose.connection.host}/${mongoose.connection.name}`);
    } catch (localErr) {
      console.warn(`[DB] Local MongoDB connection to ${mongoUri} failed: ${localErr.message}`);
      console.log('[DB] Launching fallback In-Memory MongoDB Server...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const inMemoryUri = mongod.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`[DB] Connected to Fallback In-Memory MongoDB at: ${inMemoryUri}`);
    }
    return mongoose.connection;
  } catch (error) {
    console.error(`[DB Error]: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongod) await mongod.stop();
  } catch (error) {
    console.error(`[DB Disconnect Error]: ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };
