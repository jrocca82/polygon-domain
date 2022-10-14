import { ethers } from "ethers";
import React, {
  ReactNode,
  createContext,
  useState,
  useCallback,
} from "react";
import domainsContract from "../abi/Domains.json";

interface IConnectionContext {
  ethersProvider: ethers.providers.Web3Provider | undefined;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  accounts: string[] | undefined;
  contract: ethers.Contract | undefined;
  error: string | undefined;
  network: ethers.providers.Network | undefined;
}

export const ConnectionContext = createContext({} as IConnectionContext);

export const ConnectionContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [ethersProvider, setEthersProvider] =
    useState<ethers.providers.Web3Provider>();
  const [network, setNetwork] = useState<ethers.providers.Network>();
  const [accounts, setAccounts] = useState<string[]>();
  const [contract, setContract] = useState<ethers.Contract>();
  const [error, setError] = useState<string>();
  const contractAddress = "0xF50f6F3FEaE075066e3eb6bAfd601690aC32a244";
  
  const connectWallet = useCallback(async () => {
    //@ts-ignore
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    if(!provider) {
      setError("Please install Metamask!");
      return;
    }
    
    const signer = provider.getSigner();
    const network = await provider.getNetwork();
    
    if(network.chainId !== 80001){
      setError("Please connect to Mumbai testnet and refresh the page.");
    }

    const contract = new ethers.Contract(contractAddress, domainsContract.abi, signer);
    await provider.send("eth_requestAccounts", []);
    const accounts = await provider.listAccounts();

    setAccounts(accounts)
    setEthersProvider(provider);
    setContract(contract);
    setNetwork(network);
  }, []);

  // set states to initial setting when user disconnect from wallet / auth0
  const disconnectWallet = async () => {
    setEthersProvider(undefined);
  };

  return (
    <ConnectionContext.Provider
      value={{
        accounts,
        ethersProvider,
        connectWallet,
        disconnectWallet,
        contract,
        error,
        network
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};