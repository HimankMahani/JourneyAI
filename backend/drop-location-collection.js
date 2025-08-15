import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const dropLocationCollection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check if collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const locationCollection = collections.find(col => col.name === 'locations');
    
    if (locationCollection) {
      await mongoose.connection.db.dropCollection('locations');
      console.log('✅ Successfully dropped locations collection');
    } else {
      console.log('ℹ️  Locations collection does not exist');
    }
    
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

dropLocationCollection();
