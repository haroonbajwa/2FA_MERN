import React, { useState } from "react";
import axios from "axios";
// import { QRCodeCanvas } from "qrcode.react";

const LoginWith2FA = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [secret, setSecret] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");

  console.log(qrCodeDataUrl, "qr code data url");

  const generateSecret = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/generate-secret",
        { email }
      );
      const { secret, qrCodeDataUrl } = response.data;
      setSecret(secret);
      setQrCodeDataUrl(qrCodeDataUrl);
      setMessage("Secret and QR code generated successfully");
    } catch (error) {
      console.error(error);
      setMessage("Error generating secret and QR code");
    }
  };

  const verifyOTP = async () => {
    try {
      const response = await axios.post("http://localhost:5000/verify-otp", {
        email,
        otp,
      });
      setMessage(response.data.message);
    } catch (error) {
      console.error(error);
      setMessage("Error verifying OTP");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <label>Email:</label>
      <input
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button onClick={generateSecret}>Generate Secret and QR Code</button>

      {qrCodeDataUrl && (
        <>
          <p>Scan the QR code with the Microsoft Authenticator App</p>
          <img src={qrCodeDataUrl} alt="QR Code" />
        </>
      )}

      {/* {qrCodeDataUrl && (
        <div>
          <p>Scan the QR code with the Microsoft Authenticator App:</p>
          <QRCodeCanvas value={qrCodeDataUrl} />
        </div>
      )} */}

      {secret && (
        <div>
          <label>OTP:</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <button onClick={verifyOTP}>Verify OTP</button>
        </div>
      )}

      <p>{message}</p>
    </div>
  );
};

export default LoginWith2FA;
