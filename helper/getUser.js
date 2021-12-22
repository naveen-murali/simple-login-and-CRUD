const { ObjectId } = require("mongodb");
const { get } = require("../config/connectDB");

module.exports = (id) => {
    return new Promise((resolve, reject) => {
        get()
            .collection(process.env.USER_COLLECTION)
            .findOne({ _id: ObjectId(id) })
            .then(user => resolve({ user, status: true }))
            .catch(err => resolve({ status: false }));
    })
}