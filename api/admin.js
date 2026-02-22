const { MongoClient } = require("mongodb");
const { MONGO_URL, ADMIN_KEY } = require("../config");

module.exports = async (req, res) => {

    const client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db("dinuwhDB");
    const users = db.collection("users");

    if (req.method === "POST") {

        const { key } = req.body;

        if (key !== ADMIN_KEY) {
            return res.status(400).json({ message: "Invalid Admin Key" });
        }

        const allUsers = await users.find().toArray();
        return res.status(200).json({ users: allUsers });
    }

    if (req.method === "DELETE") {

        const { username } = req.body;
        await users.deleteOne({ username });
        return res.status(200).json({ message: "User deleted" });
    }

};
