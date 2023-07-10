const express = require("express");
const cors = require("./corsmiddleware");
const ethUtil = require("ethereumjs-util");

const app = express();
app.use(express.json());
app.use(cors());

// Step 1: Client sends address to server and receives a unique message to sign
app.post("/api/getMessage", (req, res) => {
  const { address } = req.body;

  console.log("Address", address);
  // Generate a unique message to sign (you can customize this logic)
  // have Nonce and Save that nonce inside DB again account
  const messageToSign = `Sign this message for address: ${address}`;

  res.json({ messageToSign });
});

// Step 4: Client sends address, signature, and message back to the server
app.post("/api/verifySignature", (req, res) => {
  const { address, signature, message } = req.body;

  // Step 5: Server uses ecRecover on message and signature and makes sure the address is the one that signed the message
  // Here you would implement the logic to verify the signature using an Ethereum library or web3.js

  console.log(
    "\n\naddress",
    address,
    "\nsignature",
    signature,
    "\nmessage",
    message
  );
  //   const isValid = true; // Placeholder logic, you need to implement the actual verification
  //   if (isValid) {
  //     // Generate and return an authentication token
  //     const authToken = "your-auth-token"; // Placeholder token, you need to generate a secure token
  //     res.json({ isValid: true, authToken });
  //   } else {
  //     res.json({ isValid: false });
  //   }
  // const { address, signature, message } = req.body;

  // Step 5: Server uses ecRecover on message and signature and makes sure the address is the one that signed the message
  const messageBuffer = Buffer.from(message);
  const messageHash = ethUtil.hashPersonalMessage(messageBuffer);
  const signatureBuffer = ethUtil.toBuffer(signature);
  const signatureParams = ethUtil.fromRpcSig(signatureBuffer);

  const publicKey = ethUtil.ecrecover(
    messageHash,
    signatureParams.v,
    signatureParams.r,
    signatureParams.s
  );
  const recoveredAddress = ethUtil.bufferToHex(ethUtil.pubToAddress(publicKey));

  if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
    // Generate and return an authentication token
    const authToken = "your-auth-token"; // Placeholder token, you need to generate a secure token

    res.json({ isValid: true, authToken });
  } else {
    res.json({ isValid: false });
  }
});

app.listen(5000, () => console.log("Server listening at port 5000"));
