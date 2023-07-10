import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

export default function SignComponent() {
  const [signedAccount, setSignedAccount] = useState(false);

  const setupConnections = async () => {
    if (window.ethereum != null) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = (await signer).address;
      console.log("Address Old Way", address);
      await Func2();
      return { address, network };
    } else {
      console.log("No Ether wallet available");
      return false;
    }
  };

  async function tocall() {
    await setupConnections();
  }
  useEffect(() => {
    tocall();
    if (signedAccount === false) {
      setSignedAccount(true);
    }
  }, [signedAccount]);

  // Connect to the Ethereum provider (MetaMask)
  async function connectToProvider() {
    if (typeof window.ethereum !== "undefined") {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      return provider;
    } else {
      throw new Error(
        "Please install a Web3 Wallet to access the Ethereum network."
      );
    }
  }

  // Get the current connected account
  async function getCurrentAccount() {
    const provider = await connectToProvider();
    const signer = provider.getSigner();
    const currentAccount = (await signer).address;
    return currentAccount;
  }
  async function Func2() {
    // Usage example
    getCurrentAccount()
      .then((account) => {
        console.log("Current account:", account);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
  return <div></div>;
}
