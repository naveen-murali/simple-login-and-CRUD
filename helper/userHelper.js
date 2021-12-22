const bcrypt = require('bcrypt');
const db = require("../config/connectDB");

module.exports = {
    CHECK_USER: (data) => {
        return new Promise(async (resolve, reject) => {
            try {
                let user = await db.get().collection(process.env.USER_COLLECTION).findOne({ email: data.email });
                
                if (!user)
                    return reject({ reason: "Email is not registred" });
                
                bcrypt.compare(data.password, user.password)
                    .then(result => {
                        if (!result)
                            return reject({user: "Incorrect password"});
                        return resolve(user);
                    });
            } catch (err) {
                return reject({ reason: "Couldn't complete the operation." });
            }
        })
    },
    SIGNUP: (data) => {
        return new Promise(async (resolve, reject) => {
            try {
                delete data.confirmPassword;
                let user = await db.get().collection(process.env.USER_COLLECTION).findOne({ email: data.email });
                
                if (user)
                    throw { reason: "Email is already registred" };

                bcrypt.hash(data.password, 10, async (err, hash) => {
                    if (err)
                        throw{ reason: "Couldn't complete the task" };
                    
                    data.password = hash;
                    user = await db.get().collection(process.env.USER_COLLECTION).insertOne(data);

                    if (!user.insertedId)
                        throw { reason: "Failed to add the user." };
                    
                    return resolve({ message: `SignUp success full, Please login` });
                });
            } catch (err) {
                return reject({ reason: err.reason ? err.reason : "Couldn't complete the operation." });
            }
        })
    }
}