"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react' // Import the X icon

const parachains = [
    { name: "Unique Network", prefix: 7391 },
    { name: "Acala", prefix: 7875 },
    { name: "Moonbeam", prefix: 1284 },
    { name: "Phala Network", prefix: 10006 },
    { name: "Astar", prefix: 2006 },
    { name: "Parallel", prefix: 10000 },
  ];
export default function Component({ convert }: { convert: () => Promise<void> }) {
  const [isManualInput, setIsManualInput] = useState(true)
  const [addresses, setAddresses] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [parachain, setParachain] = useState(parachains[0])


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleConvert = () => {
     convert()
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className=" text-black  dark:text-white"
    >
      <div className="max-w-2xl mx-auto">
        <motion.h1 
          className="text-3xl font-bold mb-6 text-center"
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
            <div className={`relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600`}></div>
            <span className="ml-3 text-sm font-medium">{isManualInput ? "File upload" : "Manual input"}</span>
          </label>
         
        </div>

        <motion.div 
          className="mb-4"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: isManualInput ? 'auto' : 0, opacity: isManualInput ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <textarea
            className={`w-full h-40 p-2 border rounded-md {isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-300'} transition-colors duration-200`}
            placeholder="Enter addresses, one per line"
            value={addresses}
            onChange={(e) => setAddresses(e.target.value)}
          ></textarea>
          {addresses && (
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setAddresses('')}
              aria-label="Clear text"
            >
              <X size={18} />
            </button>
          )}
        </motion.div>

        <motion.div 
          className="mb-4"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: !isManualInput ? 'auto' : 0, opacity: !isManualInput ? 1 : 0, visibility: !isManualInput ? 'visible' : 'hidden' }}
          transition={{ duration: 0.3 }}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className={`w-full p-2 border rounded-md  file:bg-purple-600 file:text-white file:border-0 file:px-4 file:py-2 file:mr-4 file:rounded-md`}
          />
        </motion.div>

        <div className="mb-4">
          <select
            value={parachain.name}
            onChange={(e) => setParachain(parachains.find(p => p.name === e.target.value)!)}
            className={`w-1/2 p-2 border rounded-md `}
          >
            {parachains.map((p) => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleConvert}
          className="w-full py-2 px-4 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
        >
          Convert
        </motion.button>
      </div>
    </motion.div>
  )
}