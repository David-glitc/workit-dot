import { useState } from "react";
import { Copy, Check, X } from "lucide-react";
import { useToast } from "./ToastProvider";
import { motion } from "framer-motion"

interface ResultProps {
  convertedAddresses: string[];
  onClose: () => void;
}

export function Result({ convertedAddresses }: ResultProps) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(convertedAddresses.join("\n"));
    setCopied(true);
    showToast("Addresses copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-12 rounded-xl shadow-lg bg-white dark:bg-gray-800 bg-opacity-50 dark:bg-opacity-50 backdrop-blur-md transition-all duration-300 hover:shadow-2xl min-h-full">
      <motion.h1
        className="text-xl mb-6 font-bold text-center"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        Converted Addresses
      </motion.h1>
      <textarea
        value={convertedAddresses.join("\n")}
        readOnly
        className="mt-2 min-h-[70%] w-full border border-gray-300 rounded-lg p-2  dark:text-white"
        aria-label="Converted addresses"
      />
      <div className="flex justify-end mt-4">
        <button
          onClick={handleCopy}
          className="bg-pink-600 text-white px-4 py-2 rounded"
        >
          {copied ? (
            <>
              <Check className="inline h-4 w-4 mr-1" /> Copied!
            </>
          ) : (
            <>
              <Copy className="inline h-4 w-4 mr-1" /> Copy to Clipboard
            </>
          )}
        </button>
      </div>
    </div>
  );
}
