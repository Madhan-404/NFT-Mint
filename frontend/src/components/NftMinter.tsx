import { PublicKey } from "@metaplex-foundation/js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair } from "@solana/web3.js";
import { useNetworkConfiguration } from "contexts/NetworkConfigurationProvider";
import Image from "next/image";
import { FC, useCallback, useState } from "react";
import { mintWithMetaplexJs } from "utils/metaplex";
import { notify } from "utils/notifications";

const TOKEN_NAME = "NFT Minter";
const TOKEN_SYMBOL = "NFTM";
const TOKEN_DESCRIPTION = "Sol NFT Minter";
const WORKSHOP_COLLECTION = new PublicKey("64zpqUioSkzVQJ5XdBUr8pK6iL9vC4uyktoxQTjNWPWX");

export const NftMinter: FC = () => {
    const { connection } = useConnection();
    const { networkConfiguration } = useNetworkConfiguration();
    const wallet = useWallet();

    const [image, setImage] = useState(null);
    const [createObjectURL, setCreateObjectURL] = useState(null);

    const [ mintAddress, setMintAddress ] = useState(null);
    const [ mintSignature, setMintSignature ] = useState(null);

    const uploadImage = async (event) => {
        if (event.target.files && event.target.files[0]) {
            const uploadedImage = event.target.files[0];
            setImage(uploadedImage);
            setCreateObjectURL(URL.createObjectURL(uploadedImage));
            const body = new FormData();
            body.append("file", uploadedImage);
            await fetch("/api/upload", {
                method: "POST",
                body,
            }).catch((res) => {
                notify({ type: 'error', message: `Upload failed!`, description: res});
                console.log('error', `Upload failed! ${res}`);
            });
        };
    };

    const onClickMintNft = useCallback(async () => {
        if (!wallet.publicKey) {
            console.log('error', 'Wallet not connected!');
            notify({ type: 'error', message: 'error', description: 'Wallet not connected!' });
            return;
        };
    
        // Mint with MetaplexJS
        const [mintAddress, signature] = await mintWithMetaplexJs(
            connection,
            networkConfiguration,
            wallet,
            TOKEN_NAME,
            TOKEN_SYMBOL,
            TOKEN_DESCRIPTION,
            WORKSHOP_COLLECTION,
            image,
        ).catch(error => {
            console.error('Error minting with MetaplexJS:', error);
            notify({ type: 'error', message: 'Error minting NFT' });
            return [null, null]; // Return null values if minting fails
        });
    
        // Set mint address and signature states
        setMintAddress(mintAddress);
        setMintSignature(signature);
    
        // Delay before sending the POST request (adjust the timeout as needed)
        setTimeout(() => {
            if (mintAddress && signature) {
                // Send POST request to backend
                fetch("https://nft-mint-backend.vercel.app/minter", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        address: mintAddress,
                        txHash: signature
                    })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to submit mint data to backend');
                    }
                    console.log('Mint data submitted to backend successfully');
                })
                .catch(error => {
                    console.error('Error submitting mint data to backend:', error);
                    notify({ type: 'error', message: 'Error submitting mint data to backend' });
                });
            }
        }, 5000); // Delay for 5 seconds (adjust as needed)
    }, [wallet, connection, networkConfiguration, image]);

    return (
        <div>
            <div className="mx-auto flex flex-col">
                {createObjectURL && <Image className="mx-auto mb-4" alt='uploadedImage' width='300' height='300' src={createObjectURL}/>}
                {!mintAddress && !mintSignature && <div className="mx-auto text-center mb-2">
                    <input className="mx-auto" type="file" onChange={uploadImage} />
                </div>}
            </div>
            <div className="flex flex-row justify-center">
                <div className="relative group items-center">
                    
                    { createObjectURL && !mintAddress && !mintSignature && 
                    <div>
                        <div className=""></div>
                        <button
                            className="px-8 m-2 mt-4 w-40 h-14 btn animate-pulse bg-gradient-to-br from-orange-300 to-orange-500 hover:from-white hover:to-orange-300 text-black text-lg"
                            onClick={onClickMintNft}
                            >
                                <span>Mint!</span>
                
                        </button>
                    </div>
                    }

                    {mintAddress && mintSignature && 
                    <div>
                        <h4 className="md:w-full text-2x1 md:text-4xl text-center text-slate-300 my-2">
                            <p>Mint successful!</p>
                            <p className="text-xl mt-4 mb-2">
                                Mint address: <span className="font-bold text-lime-500">
                                    <a 
                                        className="border-b-2 border-transparent hover:border-lime-500"
                                        target='_blank' 
                                        rel='noopener noreferrer' 
                                        href={`https://explorer.solana.com/address/${mintAddress}?cluster=${networkConfiguration}`}
                                    >{mintAddress}</a>
                                </span>
                            </p>
                            <p className="text-xl">
                                Tx signature: <span className="font-bold text-amber-600">
                                    <a 
                                        className="border-b-2 border-transparent hover:border-amber-600"
                                        target='_blank' 
                                        rel='noopener noreferrer' 
                                        href={`https://explorer.solana.com/tx/${mintSignature}?cluster=${networkConfiguration}`}
                                    >{mintSignature}</a>
                                </span>
                            </p>
                        </h4>
                    </div>
                    }
                </div>
            </div>
        </div>
    )
}