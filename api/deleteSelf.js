const { MongoClient } = require("mongodb");
const { MONGO_URL } = require("../config");

module.exports = async (req, res) => {

    if (req.method !== "DELETE")
        return res.status(405).json({ message: "Method not allowed" });

    const client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db("dinuwhDB");
    const users = db.collection("users");

    const { username, confirm } = req.body;

    if (username !== confirm)
        return res.status(400).json({ message: "Username confirmation failed" });

    await users.deleteOne({ username });
    res.status(200).json({ message: "Account deleted" });
};
