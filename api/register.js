const { MongoClient } = require("mongodb");
const { MONGO_URL, MAX_USERS } = require("../config");
const { otpStore } = require("./sendOtp");

module.exports = async (req, res) => {

    if (req.method !== "POST")
        return res.status(405).json({ message: "Method not allowed" });

    const { username, password, email, phone, otp } = req.body;

    const savedOtp = otpStore[email];

    if (!savedOtp || savedOtp.otp !== otp || Date.now() > savedOtp.expire)
        return res.status(400).json({ message: "Invalid or expired OTP" });

    const client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db("dinuwhDB");
    const users = db.collection("users");

    const count = await users.countDocuments();
    if (count >= MAX_USERS)
        return res.status(400).json({ message: "Maximum users reached" });

    const phoneRegex = /^(947\d{8}|\+947\d{8}|07\d{8})$/;
    if (!phoneRegex.test(phone))
        return res.status(400).json({ message: "Invalid phone format" });

    const emailExists = await users.findOne({ email });
    const phoneExists = await users.findOne({ phone });

    if (emailExists) return res.status(400).json({ message: "Email already used" });
    if (phoneExists) return res.status(400).json({ message: "Phone already used" });

    await users.insertOne({
        username,
        password,
        email,
        phone,
        createdAt: new Date()
    });

    delete otpStore[email];

    res.status(200).json({ message: "Registered successfully" });
};
