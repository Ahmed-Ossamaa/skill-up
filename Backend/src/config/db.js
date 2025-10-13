const mongoose = require('mongoose');

class Database {
    static instance = null;

    constructor() {
        if (Database.instance) {
            return Database.instance;
        }
        Database.instance = this;
    }

    async connect(db) {
        try {
            await mongoose.connect(process.env.MONGO_URL);
            console.log(`Connected to ${db} Database`);
        } catch (error) {
            console.error("Error connecting to database", error);
            process.exit(1);
        }
    }
}

module.exports = new Database();