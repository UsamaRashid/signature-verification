import React, { useState } from "react";
import { ethers } from "ethers";

export default function VerifyAccount() {
  //   const [isConnected, setisConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [authenticated, setAuthenticared] = useState(false);
  // Get Initial Address
  const getWalletAddress = async () => {
    if (window.ethereum != null) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      console.log("Connected Address", address);
      setAccount(address);
      return address;
    } else {
      throw new Error("No Ether wallet available");
    }
  };

  async function setupConnections() {
    const address = await getWalletAddress();
    console.log("Addr", address);
  }

  async function signatureVerification() {
    const requestOptions = {
      method: "POST", // or 'PUT', 'PATCH', etc.
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: account }), // Convert your data to a JSON string
    };
    fetch(
      // `http://localhost:5000/api/getMessage`
      `https://signature-verification-w2yj.vercel.app/api/getMessage`,
      requestOptions
    )
      .then(async (res) => {
        //   const resJson = await res.json();
        const resJson = await res.json();
        console.log("result is ", resJson.messageToSign);
        return resJson.messageToSign;
      })
      .then(async (messageToSign) => {
        const signature = await window.ethereum.request({
          method: "personal_sign",
          params: [messageToSign, account],
          from: account,
        });
        // const signature = await signedMessage.text();
        console.log("signedMessage", signature);
        return { signature, messageToSign };
      })
      .then(async ({ signature, messageToSign }) => {
        const requestOptions2 = {
          method: "POST", // or 'PUT', 'PATCH', etc.
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: account,
            // "0xa3b8221494f71CE842d8A301A152Ff04800dEf8F"
            signature: signature,
            message: messageToSign,
          }), // Convert your data to a JSON string
        };
        const result = await fetch(
          // `http://localhost:5000/api/verifySignature`
          `https://signature-verification-w2yj.vercel.app/api/verifySignature`,
          requestOptions2
        );
        const res = await result.json();
        if (res.isValid === true) {
          document.cookie = `Token=${res.authToken}`;
          setAuthenticared(true);
        }
        console.log("Res", res);
      })
      .catch((e) => {
        console.log("Error", e);
      });
  }

  return (
    <div>
      <p>Sign to Verify</p>
      {!account && <button onClick={() => setupConnections()}>Connect</button>}
      {account && <>Connected Account:{account}</>}
      {account && !authenticated && (
        <button
          onClick={() => {
            signatureVerification();
          }}
        >
          Sign In
        </button>
      )}
      {authenticated && <div> Authenticated</div>}
    </div>
  );
}
