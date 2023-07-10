import React, { useState } from "react";

export default function SignComp2() {
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [token, setToken] = useState("");

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSignatureChange = (e) => {
    setSignature(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Step 1: Client sends address to server and receives a unique message to sign
      const response = await fetch("/api/getMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      });

      const { messageToSign } = await response.json();

      // Step 2: Client asks wallet to sign the message
      const signedMessage = await window.ethereum.request({
        method: "personal_sign",
        params: [messageToSign, address],
        from: address,
      });

      // Step 3: Wallet returns the signature to the client
      setSignature(signedMessage);

      // Step 4: Client sends address, signature, and message back to the server
      const verifyResponse = await fetch("/api/verifySignature", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address, signature: signedMessage, message }),
      });

      const { isValid, authToken } = await verifyResponse.json();

      if (isValid) {
        // Step 5: Server returns a token that client can use to make authenticated requests
        setToken(authToken);
      } else {
        // Signature verification failed
        console.log("Invalid signature");
      }
    } catch (error) {
      console.log("Error:", error);
    }
  };

  return (
    <div>
      <h1>Signature Verification</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Address:</label>
          <input type='text' value={address} onChange={handleAddressChange} />
        </div>
        <div>
          <label>Message:</label>
          <input type='text' value={message} onChange={handleMessageChange} />
        </div>
        <div>
          <label>Signature:</label>
          <input
            type='text'
            value={signature}
            onChange={handleSignatureChange}
          />
        </div>
        <button type='submit'>Verify Signature</button>
      </form>
      {token && <div>Auth Token: {token}</div>}
    </div>
  );
}
