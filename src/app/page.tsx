"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Navbar } from "./Components/Navbar";
import { PolkadotPageComponent } from "./Components/Polkadot-page";
import type { InjectedAccount, InjectedAccountWithMeta } from "@polkadot/extension-inject/types";

export default function Home() {
  const [connectedAccount, setConnectedAccount] =
    useState<InjectedAccount | null>(null);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const connectWallet = async () => {
    if (typeof window === "undefined") return;

    try {
      const { web3Enable, web3Accounts } = await import(
        "@polkadot/extension-dapp"
      );
      const extensions = await web3Enable("workit-polkadot");
      if (extensions.length === 0) {
        console.error(
          "No Polkadot extension detected. Please install Polkadot{.js} extension."
        );
        // extensions[1].accounts.subscribe(((acc)=>{
        //   setConnectedAccount(acc[1])
        // }))
        return;
      }

      const accounts = await web3Accounts();
      if (accounts.length === 0) {
        console.error(
          "No accounts found. Please add an account in your Polkadot extension."
        );
        return;
      }

      const selectedAccount = accounts[0];
      setConnectedAccount(selectedAccount);
    } catch (error) {
      console.error("Failed to connect to wallet. Please try again.");
    }
  };

  const disconnectWallet = () => {
    setConnectedAccount(null);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className={`${theme === "dark" ? "dark" : ""} bg-white gap-10 dark:bg-black`}>
     
        <Navbar
          onConnect={connectWallet}
          connectedAccount={connectedAccount}
          onDisconnect={disconnectWallet}
        />
      {connectedAccount ? (
        <PolkadotPageComponent {...connectedAccount} />
      ) : (
        <div className="flex justify-center gap-4 items-center h-screen">
          <div className=" h-5 w-5 bg-pink-600 rounded-full" />
          <h1 className="text-4xl font-bold">
            Connect your wallet to continue
          </h1>
        </div>
      )}
    </div>
  );
}
