const express = require("express");
// const cors = require("./corsmiddleware");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const mongoose = require("mongoose");

const ethUtil = require("ethereumjs-util");

const app = express();
// Configure body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.json());
app.use(require("cors")());

// Generate a random nonce
function generateNonce() {
  return crypto.randomBytes(16).toString("hex");
}

// Define a schema for the signatures
const signatureSchema = new mongoose.Schema({
  signature: String,
  address: String,
  nonce: String,
  timestamp: Date,
});

// Define a schema for the signatures Auth token
const signatureTokenSchema = new mongoose.Schema({
  address: String,
  authToken: String,
});

// Create a model for the signatures
const Signature = mongoose.model("Signature", signatureSchema);

// Create a model for the  Auth token
const SignatureToken = mongoose.model("SignatureToken", signatureTokenSchema);

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://usama:12345@cluster0.ol3kboj.mongodb.net/SignatureVerfication",
    // "mongodb://localhost:27017/"
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connection to DB is established");
  })
  .catch((e) => {
    console.log("Error", e);
  });

// Step 1: Client sends address to server and receives a unique message to sign
app.post("/api/getMessage", async (req, res) => {
  const { address } = req.body;

  console.log("Address", address);
  // Generate a unique message to sign (you can customize this logic)
  // have Nonce and Save that nonce inside DB again account
  const nonce = generateNonce();
  const timestamp = new Date();

  // Save the nonce and timestamp in the database
  const signature = new Signature({
    nonce,
    address,
    timestamp,
  });

  // Check if the account already exists
  Signature.findOne({ address })
    .then((existingSignature) => {
      if (existingSignature) {
        // Account already exists, update the nonce and timestamp
        existingSignature.nonce = nonce;
        existingSignature.timestamp = timestamp;
        return existingSignature.save();
      } else {
        // Account doesn't exist, create a new entry
        const signature = new Signature({
          address,
          nonce,
          timestamp,
        });
        return signature.save();
      }
    })
    .then(() => {
      console.log("Account updated or created successfully.");
    })
    .catch((err) => {
      console.error(err);
    });

  const messageToSign = `Sign this message for address: ${address}\n Nonce: ${nonce}\n Timestamp: ${timestamp}`;

  res.json({ messageToSign });
});

// Step 4: Client sends address, signature, and message back to the server
app.post("/api/verifySignature", async (req, res) => {
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

  const storedMessage = await Signature.findOne({ address });
  const storedMessageNonce = storedMessage.nonce;
  console.log("message found!", storedMessage.nonce);

  const nonceRegex = /Nonce:\s*(\w+)/;
  const match = message.match(nonceRegex);

  let MessageNonce;
  if (match && match[1]) {
    MessageNonce = match[1];
  }

  console.log("MessageNonce", MessageNonce);

  if (storedMessageNonce != MessageNonce) {
    res.json({ isValid: false });
  }
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
    // const authToken = "your-auth-token"; // Placeholder token, you need to generate a secure token
    const authToken = generateNonce();
    SignatureToken.findOne({ address })
      .then((existingSignature) => {
        if (existingSignature) {
          // Token already exists for this address, update the nonce and timestamp
          existingSignature.authToken = authToken;
          return existingSignature.save();
        } else {
          // Account doesn't exist, create a new entry
          const signatureTokenature = new SignatureToken({
            address,
            authToken,
          });
          return signatureTokenature.save();
        }
      })
      .then(() => {
        console.log("Token updated or created successfully.");
      })
      .catch((err) => {
        console.error(err);
      });

    res.json({ isValid: true, authToken });
  } else {
    res.json({ isValid: false });
  }
});

app.post("/api/verifySignature2", (req, res) => {
  const nonce = generateNonce();
  console.log("generateNonce", nonce);
  res.send();
});

app.get("/api/something", (req, res) => {
  return "Hello World ";
});

// mongodb://localhost:27017
app.listen(5000, () => console.log("Server listening at port 5000"));
