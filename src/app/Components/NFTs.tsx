"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import React from "react"
import { DecodedAttributeDto, Sdk, TokenByIdResponse, TokenId, TokenProperty } from "@unique-nft/sdk/full"
// import { UniqueSDK } from '@unique-nft/sdk'

interface NFTComponentProps {
  nft: TokenId
}

interface NftData {
    collectionId: number;
    tokenId: number;
    owner: string;
    name: string | undefined;
    description: string | undefined;
    image: string | null | undefined;
    attributes: Record<string, DecodedAttributeDto>;
    properties: TokenProperty[];
}

export function NFTComponent({ nft }: NFTComponentProps) {
  const [nftData, setNftData] = useState<TokenByIdResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [parsedData, setParsedData] = useState<NftData | null>(null)

  useEffect(() => {
    const fetchNFTs = async () => {
      if (nft) {
        setLoading(true)
        try {
          const sdk = new Sdk({ baseUrl: 'https://rest.unique.network/unique/v1' })
          const fetchedNFTs = await sdk.token.get({ tokenId: nft.tokenId, collectionId: nft.collectionId })
            setNftData(fetchedNFTs)
            setParsedData(parseNftData(fetchedNFTs))
        } catch (error) {
          console.error("Error fetching NFTs:", error)
        } finally {
          setLoading(false)
        }
      }
    }
    fetchNFTs()
  }, [nft])

  function parseNftData(nftData: TokenByIdResponse) {
    return {
      collectionId: nftData.collectionId,
      tokenId: nftData.tokenId,
      owner: nftData.owner,
      name: nftData.name?._,
      description: nftData.description?._,
      image: nftData.image.fullUrl,
      attributes: nftData.attributes,
      properties: nftData.properties,
      // Add other fields as needed
    };
  }


  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-t-xl">
          <h2 className=" text-3xl font-bold">{parsedData?.name? parsedData.name: ""}</h2>
          <p className=" text-sm font-bold">{parsedData?.collectionId}</p>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="p-6">
            {parsedData ? (
              <motion.div
                  key={parsedData.tokenId}
                  className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 shadow-md transform hover:scale-105 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <img 
                    src={ parsedData.image || "/placeholder.svg?height=160&width=160"} 
                    alt={ parsedData.name? parsedData.name : "NFT"} 
                    className="w-full h-auto p-2 mb-4 object-cover rounded-lg"
                  />
                  <h3 className="text-lg font-semibold text-gray-800 dark: truncate">
                    {parsedData.name? parsedData.name :<span className="text-pink-600 w-5 h-5 rounded-full bg-pink-600 animate-bounce delay-150"/>}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">ID: {parsedData.tokenId}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Owner:{ `${parsedData.owner.slice(0, 6)}...${parsedData.owner.slice(-4)}`}</p>
                {/* {parsedData.properties.map((property: TokenProperty) => (
                  <p key={property.key} className="text-xs  bg bg-pink-600 text-white px-2 py-1 rounded-md dark:text-gray-300">
                    <span className="font-bold">{property.key}:</span> {property.value}
                  </p>
                ))} */}
                </motion.div>
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-xl text-gray-600 dark:text-gray-400">No NFTs found for this address.</p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}