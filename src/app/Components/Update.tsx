"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AllBalancesResponse, Sdk, TokenId } from "@unique-nft/sdk/full";
import { Copy, X } from "lucide-react"; // Import necessary icons
import { InjectedAccount } from "@polkadot/extension-inject/types";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { useToast } from "../Components/ToastProvider";
import Papa from "papaparse"; // Add Papa Parse for CSV file parsing

const parachains = [
  { name: "Polkadot", prefix: 0 },
  { name: "Kusama", prefix: 2 },
  // Add other parachains as necessary...
];

interface AddressInput {
  connectedAccount?: InjectedAccount | null;
  inputs?: string[]; // For manual text input or parsed file input
}

export const PolkadotPageComponent = ({ connectedAccount }: { connectedAccount: InjectedAccount | null }) => {
  const [nfts, setNfts] = useState<TokenId[]>([]);
  const [loading, setLoading] = useState(true);
  const [convertedAddresses, setConvertedAddresses] = useState<string[]>([]);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isManualInput, setIsManualInput] = useState(true);
  const { showToast } = useToast();

  const sdk = new Sdk({ baseUrl: "https://rest.unique.network/unique/v1" });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    showToast("Address copied to clipboard!");
  };

  const AddressConversion = async (addressInput: AddressInput): Promise<string[]> => {
    const { decodeAddress, encodeAddress } = await import("@polkadot/util-crypto");
    let convertedAddresses: string[] = [];

    if (addressInput.connectedAccount) {
      // Handle connected account conversion
      const publicKey = decodeAddress(addressInput.connectedAccount.address);
      const convertedAddress = encodeAddress(publicKey, 7391); // Convert to Unique Network
      return [convertedAddress];
    } else if (addressInput.inputs) {
      // Handle manual or file input conversion
      for (const input of addressInput.inputs) {
        try {
          const publicKey = decodeAddress(input);
          const converted = encodeAddress(publicKey, 7391);
          convertedAddresses.push(converted);
        } catch (error) {
          console.error("Error converting address:", error);
        }
      }
      return convertedAddresses;
    }

    return [];
  };

  const handleAddressConversion = async () => {
    let inputAddresses: string[] = [];

    if (file) {
      // Parse CSV file
      await new Promise<void>((resolve) => {
        Papa.parse(file, {
          complete: (results: any) => {
            inputAddresses = results.data.map((row: any) => row[0]); // Assuming addresses are in the first column
            resolve();
          },
        });
      });
    } else if (addresses.length > 0) {
      inputAddresses = addresses;
    }

    if (inputAddresses.length > 0 || connectedAccount) {
      const converted = await AddressConversion({
        connectedAccount: connectedAccount || null,
        inputs: inputAddresses.length > 0 ? inputAddresses : undefined,
      });
      setConvertedAddresses(converted);
    } else {
      showToast("No addresses to convert.");
    }
  };

  return (
    <motion.div
      className="dark:bg-black bg-white min-h-screen p-4 sm:p-8"
    >
      <div className="grid container mt-20 mx-auto grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div className="md:col-span-2">
          <div className="p-8 rounded-xl shadow-lg bg-white dark:bg-gray-800 bg-opacity-50 dark:bg-opacity-50 backdrop-blur-md">
            <h2 className="text-4xl mb-6 font-extrabold tracking-tight">
              Welcome {connectedAccount ? connectedAccount.name : ""}
            </h2>
            <div className="space-y-4">
              <p className="text-lg flex items-center">
                <span className="font-semibold mr-2">Address:</span>
                <span className="text-pink-600">{connectedAccount?.address}</span>
                {connectedAccount && <Copy className="ml-2 cursor-pointer" size={20} onClick={() => handleCopy(connectedAccount.address)} />}
              </p>
              <button
                onClick={handleAddressConversion}
                className="w-full py-2 px-4 bg-pink-600 text-white rounded-md hover:bg-pink-700"
              >
                Convert
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div>
          <div className="p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800">
            <h3 className="text-xl mb-4">Manual Input</h3>
            {isManualInput ? (
              <textarea
                className="w-full h-40 p-2 border rounded-md"
                placeholder="Enter addresses, one per line"
                value={addresses.join("\n")}
                onChange={(e) => setAddresses(e.target.value.split("\n"))}
              />
            ) : (
              <input type="file" accept=".csv" onChange={handleFileChange} />
            )}
            <div className="mt-4">
              <button
                onClick={handleAddressConversion}
                className="w-full py-2 px-4 bg-pink-600 text-white rounded-md hover:bg-pink-700"
              >
                Convert
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div>
          <div className="p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800">
            <h3 className="text-xl mb-4">Conversion Results</h3>
            <textarea
              className="w-full h-40 p-2 border-2 rounded-md"
              value={convertedAddresses.join("\n")}
              readOnly
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
