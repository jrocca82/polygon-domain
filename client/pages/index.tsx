import {
  Flex,
  Heading,
  Text,
  Image,
  Button,
  Input,
  Spinner,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import { useContext, useState } from "react";
import { ConnectionContext } from "../contexts/ConnectionContext";
import { ethers } from "ethers";

const Home: NextPage = () => {
  const TWITTER_HANDLE = "jo_rocca";
  const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

  const { accounts, connectWallet, contract, error } =
    useContext(ConnectionContext);

  const [domain, setDomain] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [record, setRecord] = useState<string>("");
  const [mintError, setMintError] = useState<string>("");

  const mintDomain = async () => {
    // Don't run if the domain is empty
    if (!domain) {
      return;
    }
    // Alert the user if the domain is too short
    if (domain.length < 3) {
      setMintError("Domain must be at least 3 characters long");
      return;
    }
    // Calculate price based on length of domain
    // 3 chars = 0.5 MATIC, 4 chars = 0.3 MATIC, 5 or more = 0.1 MATIC
    const price =
      domain.length === 3 ? "0.5" : domain.length === 4 ? "0.3" : "0.1";
    setLoading(true);
    try {
      if (accounts && contract) {
        let tx = await contract.register(domain, {
          value: ethers.utils.parseEther(price),
        });
        // Wait for the transaction to be mined
        const receipt = await tx.wait();

        // Check if the transaction was successfully completed
        if (receipt.status === 1) {
          console.log(
            "Domain minted! https://mumbai.polygonscan.com/tx/" + tx.hash
          );

          // Set the record for the domain
          tx = await contract.setRecord(domain, record);
          await tx.wait();

          console.log(
            "Record set! https://mumbai.polygonscan.com/tx/" + tx.hash
          );

          setRecord("");
          setDomain("");
        } else {
          setMintError("Transaction failed! Please try again");
        }
      }
    } catch (error) {
      console.log(error);
      setMintError("Minting failed! Please try again");
    }
    setLoading(false);
  };

  return (
    <Flex flexDir="column" alignItems="center">
      <Head>
        <title>Polygon Naming Service</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Flex flexDir="column" textAlign="center">
        <Heading marginY="40px">🙈🙉🙊🫡 Wicked Name Service</Heading>
        <Text mb="30px">Your immortal API on the blockchain!</Text>
        <iframe
          src="https://giphy.com/embed/uUmg3nS7hm4JhYcEA5"
          width="480"
          height="269"
          frameBorder="0"
          allowFullScreen
        ></iframe>
        <p>
          <a href="https://giphy.com/gifs/broadwaycom-broadway-wicked-15-uUmg3nS7hm4JhYcEA5">
            via GIPHY
          </a>
        </p>
      </Flex>

      {accounts ? (
        <Flex
          flexDir="column"
          my="30px"
          height="170px"
          justify="space-between"
          textAlign="center"
        >
          {error ? (
            <Text color="red">{error}</Text>
          ) : (
            <>
              <Text>
                Connected! Please fill out the form below to register your
                domain name!
              </Text>

              <Input
                placeholder="Domain name"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
              <Input
                placeholder="Your most wicked power"
                value={record}
                onChange={(e) => setRecord(e.target.value)}
              />
            </>
          )}
          {loading ? (
            <>
              <Spinner alignSelf="center" />
              <Text>
                Please confirm transactions in your Metamask (there should be 2)
              </Text>
            </>
          ) : (
            <Button onClick={mintDomain}>Register</Button>
          )}
          {mintError ? <Text>{mintError}</Text> : null}
        </Flex>
      ) : (
        <Button my="30px" onClick={connectWallet}>
          Connect wallet
        </Button>
      )}

      <Flex flexDir="column" alignItems="center">
        <a href={TWITTER_LINK} target="_blank" rel="noreferrer">
          <Image
            src="/twitter-logo.png"
            alt="Twitter Logo"
            width={50}
            alignSelf="center"
          />
        </a>
      </Flex>
    </Flex>
  );
};

export default Home;
