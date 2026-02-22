const nodemailer = require("nodemailer");
const { EMAIL_USER, EMAIL_PASS } = require("../config");

let otpStore = {};
let resendControl = {};

module.exports = async (req, res) => {

    if (req.method !== "POST")
        return res.status(405).json({ message: "Method not allowed" });

    const { email } = req.body;

    if (!email || !email.endsWith("@gmail.com"))
        return res.status(400).json({ message: "Email must end with @gmail.com" });

    // resend control (60 sec wait)
    const lastSent = resendControl[email];
    if (lastSent && Date.now() - lastSent < 60000) {
        return res.status(429).json({ message: "Wait 60 seconds before resend" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[email] = {
        otp,
        expire: Date.now() + 300000 // 5 minutes
    };

    resendControl[email] = Date.now();

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
        text: `Your OTP is ${otp}. It expires in 5 minutes.`
    });

    res.status(200).json({ message: "OTP sent successfully" });
};

module.exports.otpStore = otpStore;
