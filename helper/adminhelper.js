const bcrypt = require('bcrypt');
const ObjectId = require("objectid");
const db = require("../config/connectDB");

module.exports = {
    CHECK_ADMIN: (data) => {
        return new Promise(async (resolve, reject) => {
            try {
                let admin = await db.get().collection(process.env.ADMIN_COLLECTION).findOne({ email: data.email });
                
                if (!admin)
                    return reject({ reason: "Email is not registred" });
                
                bcrypt.compare(data.password, admin.password)
                    .then(result => {
                        if (!result)
                            return reject({reason: "Incorrect password"});
                        return resolve(admin);
                    });
            } catch (err) {
                return reject({ reason: "Couldn't complete the operation." });
            }
        })
    },

    ADD_USER: (data) => {
        return new Promise(async (resolve, reject) => {
            try {
                let admin = await db.get().collection(process.env.USER_COLLECTION).findOne({ email: data.email });
                
                if (admin)
                    throw `${data.email} is already a user`;
                
                bcrypt.hash(data.password, 10, (err, hash) => {
                    if (err)
                        throw "Failed to add the user";
                    
                    data.password = hash;
                    delete data.confirmPassword;

                    db.get().collection(process.env.USER_COLLECTION).insertOne(data)
                        .then(rtnData => resolve({ message: `${data.email} is added` }))
                        .catch(err => { throw "Failed to add the user" });
                })
            } catch (err) {
                return reject({ reason: err });
            }
        })
    },

    GET_ALL_USERS: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let users = await db.get().collection(process.env.USER_COLLECTION).find().toArray();
                users.map((elem, index) => elem.index = index + 1);
                return resolve(users);
            } catch (err) {
                return reject({ reason: "Failed to fetch users" });
            }
        })
    },

    DELETE_USER: (email) => {
        return new Promise(async (resolve, reject) => {
            try {
                let user = await db.get().collection(process.env.USER_COLLECTION).findOneAndDelete({ email: email });

                return resolve({ message: `${user.value.email} is removed` });
            } catch (err) {
                return reject({ reason: `Failed to delete ${email}` });
            }
        })
    },
    
    GET_USER: (email) => {
        return new Promise(async (resolve, reject) => {
            try {
                let user = await db.get().collection(process.env.USER_COLLECTION).findOne({ email: email });
                return resolve(user);
            } catch (err) {
                return reject({ reason: `Failed to find ${email}` });
            }
        })
    },  
    
    SEARCH_USER: (search) => {
        return new Promise(async (resolve, reject) => {
            try {
                let users = await db.get().collection(process.env.USER_COLLECTION).find({ $text: { $search: search } }).toArray();
                return resolve(users);
            } catch (err) {
                return reject({ reason: `Failed to find ${email}` });
            }
        })
    }, 

    UPDATE_USER: (id, data) => {
        console.log(id,data);
        return new Promise(async (resolve, reject) => {
            try {
                let user = await db.get().collection(process.env.USER_COLLECTION)
                    .findOneAndUpdate(
                        { _id: ObjectId(id) },
                        { $set: { name: data.name, email: data.email } }
                    );
                return resolve({ email: user.value.email, message: "Successfully updated" });
            } catch (err) {
                console.log(err);
                return reject({ reason: `Updation faild.` });
            }
        })
    }
}