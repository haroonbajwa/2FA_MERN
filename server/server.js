const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

(async () => {
  try {
    console.log("Starting");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
})();

const User = mongoose.model(
  "User",
  {
    email: String,
    secret: String,
  },
  "users"
);

// route for adding a user
app.post("/add-user", async (req, res) => {
  try {
    const { email } = req.body;
    console.log(req.body, "req body");

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // Generate a new secret for the user
    const secret = speakeasy.generateSecret({ length: 20 });

    // Save the user to the database
    const newUser = await User.create({ email, secret: secret.base32 });

    res.json({ success: true, user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error adding user" });
  }
});

app.post("/generate-secret", async (req, res) => {
  try {
    const { email } = req.body;

    // Generate a new secret for the user
    const secret = speakeasy.generateSecret({ length: 20 });
    const otpAuthUrl = speakeasy.otpauthURL({
      secret: secret.base32,
      label: "YourApp",
      issuer: "YourApp",
    });

    // Save the secret to the user in the database
    await User.findOneAndUpdate(
      { email },
      { secret: secret.base32 },
      { upsert: true }
    );

    // Generate a QR code for the user to scan with the Microsoft Authenticator App
    const qrCodeDataUrl = await qrcode.toDataURL(otpAuthUrl, { width: 300 });
    console.log(qrCodeDataUrl, "qrcode");

    res.json({ success: true, secret: secret.base32, qrCodeDataUrl });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error generating secret" });
  }
});

app.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    console.log(user.secret, "user secret: ");
    console.log(otp, "otp");

    // Verify the provided OTP
    const verified = speakeasy.totp.verify({
      secret: user.secret,
      // encoding: "base32",
      token: otp,
    });

    if (verified) {
      res.json({ success: true, message: "OTP verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error verifying OTP" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
