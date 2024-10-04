"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AllBalancesResponse, Sdk, TokenId } from "@unique-nft/sdk/full";
import { Copy } from "lucide-react";
import { InjectedAccount } from "@polkadot/extension-inject/types";
import { NFTComponent } from "./NFTs";
import { X } from "lucide-react"; // Import the X icon
import { ApiPromise, WsProvider } from "@polkadot/api";
import { useToast } from "../Components/ToastProvider";
import { Result } from "./Result";
import Papa from "papaparse";

const parachains = [
  { name: "Polkadot", prefix: 0 },
  { name: "Kusama", prefix: 2 },
  { name: "Acala", prefix: 7875 },
  { name: "Astar", prefix: 5 },
  { name: "Moonbeam", prefix: 1284 },
  { name: "Phala", prefix: 30 },
  { name: "Parallel", prefix: 10000 },
  { name: "Bifrost", prefix: 6 },
  { name: "Centrifuge", prefix: 36 },
  { name: "KILT Spiritnet", prefix: 38 },
  { name: "Litentry", prefix: 31 },
  { name: "Manta", prefix: 77 },
  { name: "Darwinia", prefix: 18 },
  { name: "Equilibrium", prefix: 67 },
  { name: "HydraDX", prefix: 63 },
  { name: "Interlay", prefix: 2032 },
  { name: "Mangata", prefix: 2110 },
  { name: "Unique Network", prefix: 7391 },
];

interface addressInput {
  connectedAccount?: InjectedAccount | null;
  inputs?: string[];
}
const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

const textVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

const nftVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.1, duration: 0.3 },
  }),
};

const SkeletonNFT = () => (
  <div className="bg-gray-400 rounded-lg p-4 shadow-md">
    <div className="w-full h-40 bg-black rounded-lg mb-2 animate-pulse"></div>
    <div className="h-4 bg-black rounded w-3/4 mb-2 animate-pulse"></div>
    <div className="h-3 bg-black rounded w-1/2 animate-pulse"></div>
  </div>
);

export const PolkadotPageComponent = (
  connectedAccount: InjectedAccount | null
) => {
  const [nfts, setNfts] = useState<TokenId[]>([]);
  const [peopleNfts, setPeopleNfts] = useState<TokenId[]>([]);
  const [loading, setLoading] = useState(true);
  const [convertedAddress, setConvertedAddress] = useState("");
  const [balance, setBalance] = useState<AllBalancesResponse>();
  const [isManualInput, setIsManualInput] = useState(true);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [fileAddresses, setFileAddresses] = useState<string[]>([]);
  const [parachain, setParachain] = useState(parachains[0]);
  const [polkadotBalance, setPolkadotBalance] = useState<string | null>(null);
  const { showToast } = useToast();
  const [showResult, setShowResult] = useState(false);
  const [convertedAddresses, setConvertedAddresses] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files) {
        Papa.parse(e.target.files[0], {
          header: false,
          complete: (results) => {
            const rawStrings = results.data.map((row: any) => row[0] || "");
            setFileAddresses(rawStrings);
          },
        });
      }
      console.log(fileAddresses);
    } catch (error) {
      console.error("Error parsing file:", error);
    }
  };

  const sdk = new Sdk({
    baseUrl: "https://rest.unique.network/unique/v1",
  });

  const fetchPolkadotBalance = async () => {
    if (connectedAccount) {
      try {
        // Initialize Polkadot API
        const wsProvider = new WsProvider("wss://rpc.polkadot.io"); // Use Polkadot RPC endpoint
        const api = await ApiPromise.create({ provider: wsProvider });

        // Query the balance of the connected account
        await api.query.system.account(
          connectedAccount.address,
          ({
            nonce,
            data: balance,
          }: {
            nonce: any;
            data: { free: any; reserved: any };
          }) => {
            setPolkadotBalance(balance.free.toHuman());
            console.log(balance.free);
          }
        );
      } catch (error) {
        console.error("Error fetching Polkadot balance:", error);
      }
    }
  };

  const fetchNFTs = async () => {
    if (connectedAccount) {
      setLoading(true);
      try {
        AddressConversion({ connectedAccount }).then((address) => {
          if (typeof address === "string") {
            sdk.token
              .accountTokens({ address, collectionId: 717 })
              .then((fetchedNFTs) => {
                setNfts(fetchedNFTs.tokens);
              });
          } else if (Array.isArray(address)) {
            address.forEach((address) => {
              sdk.token
                .accountTokens({ address, collectionId: 717 })
                .then((fetchedNFTs) => {
                  setPeopleNfts(fetchedNFTs.tokens);
                });
            });
          }
        });
      } catch (error) {
        console.error("Error fetching NFTs:", error);
      } finally {
        setTimeout(() => setLoading(false), 1500);
      }
    }
  };
  useEffect(() => {
    const getBalance = async () => {
      try {
        const balance = await sdk.balance.get({
          address: connectedAccount?.address ? connectedAccount.address : "",
        });
        setBalance(balance);
        console.log(balance);
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };
    AddressConversion({ connectedAccount }).then((address) => {
      if (typeof address === "string") {
        setConvertedAddress(address);
      }
    });

    getBalance();
  }, [connectedAccount]);

  useEffect(() => {
    fetchNFTs();
  }, [connectedAccount]);

  useEffect(() => {
    fetchPolkadotBalance();
  }, [connectedAccount]);

  useEffect(() => {
    convertConnectedAccount();
    convertFileInput();
  }, [connectedAccount, convertedAddress, parachain, fileAddresses]);

  const handleCopy = (convertedAddress: string) => {
    navigator.clipboard.writeText(convertedAddress);
    showToast("Address copied to clipboard!");
  };

  const convertConnectedAccount = async () => {
    if (connectedAccount) {
      await AddressConversion({ connectedAccount }).then((value) => {
        if (typeof value === "string") {
          setConvertedAddress(value);
          setShowResult(true);
        }
      });
    }
  };

  const convertManualInput = async () => {
    if (addresses) {
      await AddressConversion({ inputs: addresses }).then((value) => {
        if (Array.isArray(value)) {
          setConvertedAddresses(value);
          setShowResult(true);
        }
      });
    }
  };

  const convertFileInput = async () => {
    if (fileAddresses) {
      console.log(fileAddresses[0]);
      console.log(typeof fileAddresses[0]);
      await AddressConversion({ inputs: fileAddresses }).then((value) => {
        if (Array.isArray(value)) {
          setConvertedAddresses(value);
          setShowResult(true);
        }
      });
    }
  };
  const handleAddressConversion = async () => {
    if (isManualInput) {
      convertManualInput();
    } else {
      convertFileInput();
    }
  };

  const AddressConversion = async (
    address: addressInput
  ): Promise<string | string[]> => {
    const { decodeAddress, encodeAddress } = await import(
      "@polkadot/util-crypto"
    );
    try {
      let convertedAddresses: string[] = [];
      let convertedAddress: string;

      if (address.connectedAccount) {
        const publicKey = decodeAddress(address.connectedAccount.address);
        convertedAddress = encodeAddress(publicKey, parachain.prefix);

        return convertedAddress;
      } else if (address.inputs) {
        address.inputs.forEach(async (address) => {
          const publicKey = decodeAddress(address);
          const converted = encodeAddress(publicKey, parachain.prefix);

          convertedAddresses.push(converted);
        });
      }
      return convertedAddresses.length === 1
        ? convertedAddresses[0]
        : convertedAddresses;
    } catch (error) {
      console.error("Error converting address:", error);
      return "Invalid address";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="dark:bg-black  bg-white min-h-screen p-4 sm:p-8"
    >
      <div className="grid container mt-20 mx-auto grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="md:col-span-2"
        >
          <motion.div
            className="p-8 rounded-xl shadow-lg bg-white dark:bg-gray-800 bg-opacity-50 dark:bg-opacity-50 backdrop-blur-md transition-all duration-300 hover:shadow-2xl"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <motion.h2
              className="text-2xl mb-6 font-extrabold tracking-tight"
              variants={textVariants}
            >
              <span className="text-fuchsia-600 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 to-pink-600">
                Welcome
              </span>{" "}
              {connectedAccount ? connectedAccount.name : ""}
            </motion.h2>
            <motion.div className="space-y-4" variants={textVariants}>
              <p className="break-all text-lg flex items-center">
                <span className="font-semibold mr-2">Address:</span>{" "}
                <span className="text-pink-600 inline-flex font-medium flex-grow">
                  {connectedAccount?.address}
                  <Copy
                    className="cursor-pointer font-bold ml-2"
                    size={20}
                    onClick={() => handleCopy(connectedAccount?.address || "")}
                  />
                </span>
              </p>
              <p className="break-all text-lg flex items-center">
                <span className="font-semibold mr-2">Polkadot:</span>{" "}
                <span className="text-pink-600 font-medium flex-grow">
                  {polkadotBalance}{" "}
                  <span className="text-lg text-pink-600 font-semibold">
                    DOT
                  </span>
                </span>
              </p>
              <p className="break-all text-lg flex items-center">
                <span className="font-semibold mr-2">{parachain.name}</span>{" "}
                <span className="text-blue-600 inline-flex font-medium flex-grow">
                  {convertedAddress}
                  <Copy
                    className="cursor-pointer font-bold  ml-2"
                    size={20}
                    onClick={() => handleCopy(convertedAddress)}
                  />
                </span>
              </p>
              <div className="flex items-center space-x-2 mt-4">
                <span className="font-semibold text-lg">
                  Unique network balance:
                </span>
                {balance !== undefined ? (
                  <span className="text-blue-500 flex items-center">
                    <span className="text-xl font-semibold">
                      {balance.availableBalance.formatted}
                    </span>
                    <span className="text-lg font-semibold ml-1">UNQ</span>
                  </span>
                ) : (
                  <motion.div
                    className="w-4 h-4 bg-pink-600 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                )}
              </div>
            </motion.div>
            <div className="my-4 space-y-2 gap-4 space-x-4 w-1/3">
              <label className=" ">Select Parachain</label>
              <select
                value={parachain.name}
                onChange={(e) =>
                  setParachain(
                    parachains.find((p) => p.name === e.target.value)!
                  )
                }
                className={` bg-black dark:bg-opacity-40 dark:text- max-h-[200px] bg-opacity-20 p-2 border rounded-md `}
              >
                {parachains.map((p) => (
                  <option
                    className="bg-black max-h-[200px] bg-opacity-20"
                    key={p.name}
                    value={p.name}
                  >
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        </motion.div>

        {/* Second Row */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <div className="p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800 bg-opacity-50 dark:bg-opacity-50 backdrop-blur-md transition-all duration-300 hover:shadow-2xl h-full">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-black dark:text-white"
            >
              <div className="max-w-2xl mx-auto">
                <motion.h1
                  className="text-xl font-bold mb-6 text-center"
                  initial={{ y: -50 }}
                  animate={{ y: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  Address Converter
                </motion.h1>

                <div className="mb-4 flex justify-between items-center">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={isManualInput}
                      onChange={() => setIsManualInput(!isManualInput)}
                    />
                    <div
                      className={`relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600`}
                    ></div>
                    <span className="ml-3 text-sm font-medium">
                      {isManualInput ? "File upload" : "Manual input"}
                    </span>
                  </label>
                </div>

                <motion.div
                  className="mb-4 "
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: isManualInput ? "auto" : 0,
                    opacity: isManualInput ? 1 : 0,
                    visibility: isManualInput ? "visible" : "hidden",
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <textarea
                    className={`w-full relative h-40 p-2 border rounded-md `}
                    placeholder="Enter addresses, one per line"
                    value={addresses.join("\n")}
                    onChange={(e) => setAddresses(e.target.value.split("\n"))}
                  >
                    {" "}
                  </textarea>
                  {addresses.length > 0 && (
                    <button
                      className="justify-items-end  inline-flex rounded-xl px-2 bg-opacity-30 items-center right-2 font-bold bg-gray-400"
                      onClick={() => setAddresses([])}
                      aria-label="Clear text"
                    >
                      <X size={18} /> Clear
                    </button>
                  )}
                </motion.div>

                <motion.div
                  className="mb-4"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: !isManualInput ? "auto" : 0,
                    opacity: !isManualInput ? 1 : 0,
                    visibility: !isManualInput ? "visible" : "hidden",
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className={`w-full p-2 border rounded-md file:bg-purple-600 file:text-white file:border-0 file:px-4 file:py-2 file:mr-4 file:rounded-md`}
                  />
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddressConversion}
                  className="w-full py-2 px-4 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
                >
                  Convert
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <Result
            convertedAddresses={convertedAddresses}
            onClose={() => setShowResult(false)}
          />
        </motion.div>
      </div>

      <div className="container my-6 mx-auto">
        {nfts.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold mb-6 p-4 text-center">
              Your NFTs
            </h2>
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className=" container mx-auto bg-white gap-4 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
            >
              {nfts.map((nft, index) => (
                <NFTComponent key={index} nft={nft} />
              ))}
            </motion.div>
          </>
        ) : (
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="md:col-span-2  text-center grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
          >
            <p className=" text-4xl font-bold">No NFTs found</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
