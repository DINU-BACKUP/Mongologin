const nodemailer = require("nodemailer");
const { EMAIL_USER, EMAIL_PASS } = require("../config");

let otpStore = {}; // temporary memory store

module.exports = async (req, res) => {

    if (req.method !== "POST")
        return res.status(405).json({ message: "Method not allowed" });

    const { email } = req.body;

    if (!email.endsWith("@gmail.com"))
        return res.status(400).json({ message: "Email must end with @gmail.com" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[email] = {
        otp,
        expire: Date.now() + 300000 // 5 minutes
    };

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: EMAIL_USER,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP is ${otp}`
    });

    res.status(200).json({ message: "OTP sent" });
};

module.exports.otpStore = otpStore;
