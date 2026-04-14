const { MongoClient } = require('mongodb');

const connectToUserDb = async (uri) => {
    try {
        const client = new MongoClient(uri, {
            serverSelectionTimeoutMS: 5000,
        });
        await client.connect();
        return client;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        throw new Error('Could not connect to the database. Please check your URI and network.');
    }
};

module.exports = { connectToUserDb };
