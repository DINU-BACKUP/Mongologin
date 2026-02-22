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
        return res.status(400).json({ message: "Maximum users reached" });
    }

    const { username, password, email, phone } = req.body;

    const userExists = await users.findOne({ username });
    const emailExists = await users.findOne({ email });
    const phoneExists = await users.findOne({ phone });

    if (userExists) return res.status(400).json({ message: "Username exists" });
    if (emailExists) return res.status(400).json({ message: "Email already used" });
    if (phoneExists) return res.status(400).json({ message: "Phone already used" });

    await users.insertOne({
        username,
        password,
        email,
        phone,
        createdAt: new Date()
    });

    res.status(200).json({ message: "Registered successfully" });
};
