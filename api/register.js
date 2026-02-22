const { MongoClient } = require("mongodb");
const { MONGO_URL, MAX_USERS } = require("../config");

module.exports = async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db("dinuwhDB");
    const users = db.collection("users");

    const count = await users.countDocuments();
    if (count >= MAX_USERS) {
        return res.status(400).json({ message: "Maximum users reached (50)" });
    }

    const { username, password } = req.body;

    const existing = await users.findOne({ username });
    if (existing) {
        return res.status(400).json({ message: "Username already exists" });
    }

    await users.insertOne({ username, password });

    res.status(200).json({ message: "Registered successfully" });
};
