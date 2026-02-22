const { MongoClient } = require("mongodb");
const { MONGO_URL } = require("../config");

module.exports = async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db("dinuwhDB");
    const users = db.collection("users");

    const { username, password } = req.body;

    const user = await users.findOne({ username, password });

    if (!user) {
        return res.status(400).json({ message: "Invalid username or password" });
    }

    res.status(200).json({ message: "Login success" });
};
