import React, { useEffect, useState } from "react";
import axios from "axios";
// import { QRCodeCanvas } from "qrcode.react";

const LoginWith2FA = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  // const [secret, setSecret] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState();

  console.log(users, "users");

  useEffect(() => {
    const getAllUsers = async () => {
      const allUsers = await axios.get("http://localhost:5000/all-users");
      setUsers(allUsers.data.allUsers);
    };

    getAllUsers();
  }, []);

  console.log(qrCodeDataUrl, "qr code data url");

  // generate user's secret and qr code
  const generateSecret = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/generate-secret",
        { email }
      );
      const { secret, qrCodeDataUrl } = response.data;
      // setSecret(secret);
      setQrCodeDataUrl(qrCodeDataUrl);
      setMessage("Secret and QR code generated successfully");
    } catch (error) {
      console.error(error);
      setMessage("Error generating secret and QR code");
    }
  };

  // verify entered otp
  const verifyOTP = async () => {
    try {
      const response = await axios.post("http://localhost:5000/verify-otp", {
        email: selectedUser,
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
        columnGap: "50px",
        // flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          border: "2px solid black",
          padding: "50px",
          height: "500px",
          width: "450px",
        }}
      >
        <h1>Enable 2FA</h1>
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
      </div>
      <div
        style={{
          border: "2px solid black",
          padding: "50px",
          height: "500px",
          width: "450px",
        }}
      >
        <h1>Verify user</h1>
        <div>
          <select onChange={(e) => setSelectedUser(e.target.value)}>
            <option hidden selected>
              select a user
            </option>
            {users.map((user) => (
              <option>{user.email}</option>
            ))}
          </select>
          <br />
          <label>OTP:</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <button onClick={verifyOTP}>Verify OTP</button>
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default LoginWith2FA;
