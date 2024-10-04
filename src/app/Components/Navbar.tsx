"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { InjectedAccount } from "@polkadot/extension-inject/types";
import { useToast } from "../hooks/use-toast";
import { useTheme } from "next-themes";

interface NavbarProps {
  onConnect: () => void;
  connectedAccount: InjectedAccount | null;
  onDisconnect: () => void;
}

export function Navbar({
  onConnect,
  connectedAccount,
  onDisconnect,
}: NavbarProps) {
  const [mounted, setMounted] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const { showToast, toast, ToastComponent } = useToast();

  const { theme, setTheme } = useTheme();
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    showToast("Address copied to clipboard!");
  };

  return (
    <nav className="z-50 py-2 bg-white dark:bg-gray-900 dark:shadow-lg dark:bg-opacity-50 shadow-lg px-4 fixed w-full mx-auto">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 dark:text-white p-2 rounded-lg">
          <div className="w-4 h-4 bg-pink-600 rounded-full" />
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            Workit-Dot
          </div>
        </div>

        <div className="flex items-center gap-4 space-x-4">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {theme === "dark" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          {connectedAccount ? (
            <div className="flex items-center gap-2 space-x-2">
              <div className="relative">
                <p
                  className="text-gray-900 dark:text-white p-2 bg-gray-100 dark:bg-gray-900 rounded-lg font-semibold cursor-pointer transition-transform duration-200 transform hover:scale-105 active:scale-95"
                  onClick={() => handleCopy(connectedAccount.address)}
                  onMouseEnter={() => setIsTooltipVisible(true)}
                  onMouseLeave={() => setIsTooltipVisible(false)}
                >
                  {truncateAddress(connectedAccount.address)}
                </p>
                {isTooltipVisible && (
                  <span className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-full bg-gray-800 text-white text-xs rounded p-1 mt-1 whitespace-nowrap transition-opacity duration-200">
                    Click to copy
                  </span>
                )}
              </div>
              <button
                onClick={onDisconnect}
                className="bg-red-600 text-white py-2 font-semibold px-4 rounded-lg"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={onConnect}
              className="bg-pink-600 font-mono text-white py-2 px-4 rounded-lg"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      {/* Render the Toast component */}
      {toast.isVisible && <ToastComponent />}
    </nav>
  );
}
