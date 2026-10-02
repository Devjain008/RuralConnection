const User = require("../models/User");

class UserRepository {
    async createUser(userData) {
        return await User.create(userData);
    }

    async findByEmail(email, selectPassword = false) {
        let query = User.findOne({ email });
        if (selectPassword) {
            query = query.select("+password");
        }
        return await query.exec();
    }

    async findByEmailOrUsername(identifier, selectPassword = false) {
        const normalized = identifier.toLowerCase().trim();
        let query = User.findOne({
            $or: [
                { email: normalized },
                { username: normalized }
            ]
        });
        if (selectPassword) {
            query = query.select("+password");
        }
        return await query.exec();
    }

    async findById(id) {
        return await User.findById(id).exec();
    }

    async updateById(id, updateData) {
        return await User.findByIdAndUpdate(id, updateData, {
            returnDocument: "after",
            runValidators: true
        }).exec();
    }
}

module.exports = new UserRepository();
