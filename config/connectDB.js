const mongodb = require('mongodb');

const status = {
    db: null
};
module.exports = {
    connect: async () => {
        try {
            let client = new mongodb.MongoClient(process.env.MONGO_URL);
            let connection = await client.connect();
            let db = connection.db(process.env.DB);
            status.db = db;

            console.log("[ Success ]: MongoDB is connected");
        } catch (err) {
            console.log("[ Error ] :  Couldn't connect to the database ");
            console.log(err);
            process.exit(1);
        }
    }, 

    get: () => {
        return status.db;
    }
}
