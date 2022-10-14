import {
  Flex,
  Heading,
  Text,
  Image,
  Button,
  Input,
  Spinner,
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import type { NextPage } from "next";
import Head from "next/head";
import { useContext, useEffect, useState } from "react";
import { ConnectionContext } from "../contexts/ConnectionContext";
import { ethers } from "ethers";
import { NamingRecord } from "../types/record";

const Home: NextPage = () => {
  const TWITTER_HANDLE = "jo_rocca";
  const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
  const tld = ".wicked";

  const { accounts, connectWallet, contract, error, network } =
    useContext(ConnectionContext);

  const [domain, setDomain] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [record, setRecord] = useState<string>("");
  const [mintError, setMintError] = useState<string>("");
  const [editing, setEditing] = useState<boolean>(false);
  const [mints, setMints] = useState<NamingRecord[]>([]);

  const fetchMints = async () => {
    try {
      if (accounts && contract) {
        const names = await contract.getAllNames();

        // For each name, get the record and the address
        const mintRecords = await Promise.all(
          names.map(async (name: string) => {
            const mintRecord = await contract.records(name);
            const owner = await contract.domains(name);
            return {
              id: names.indexOf(name),
              name: name,
              record: mintRecord,
              owner: owner,
            };
          })
        );

        console.log("MINTS FETCHED ", mintRecords);
        setMints(mintRecords);
      }
    } catch (error) {
      console.log(error);
    }
  };

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

          setTimeout(() => {
            fetchMints();
          }, 2000);

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

  const updateDomain = async () => {
    if (!record || !domain) {
      return;
    }
    setLoading(true);
    console.log("Updating domain", domain, "with record", record);
    try {
      if (accounts && contract) {
        let tx = await contract.setRecord(domain, record);
        await tx.wait();
        console.log("Record set https://mumbai.polygonscan.com/tx/" + tx.hash);

        fetchMints();
        setRecord("");
        setDomain("");
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
    setEditing(false);
  };

  const editRecord = (name: string) => {
    console.log("Editing record for", name);
    setEditing(true);
    setDomain(name);
  };

  useEffect(() => {
    if (network) {
      fetchMints();
    }
  }, [accounts, network]);

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
          justify="space-between"
          textAlign="center"
        >
          {error ? (
            <Text color="red">{error}</Text>
          ) : (
            <Flex
              flexDir="column"
              height="150px"
              justify="space-between"
              mb="30px"
              width="100vw"
              maxWidth="500px"
            >
              <Text>
                {editing
                  ? "Edit your record below:"
                  : " Connected! Please fill out the form below to register your domain name!"}
              </Text>

              <Input
                placeholder="Domain name"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                disabled={editing ? true : false}
              />
              <Input
                placeholder="Your most wicked power"
                value={record}
                onChange={(e) => setRecord(e.target.value)}
              />
            </Flex>
          )}
          {loading ? (
            <>
              <Spinner alignSelf="center" />
              <Text>Please confirm transaction(s) in your Metamask</Text>
            </>
          ) : null}
          {mintError ? <Text>{mintError}</Text> : null}
          {!editing && (
            <Button onClick={mintDomain} disabled={loading}>
              Register
            </Button>
          )}
        </Flex>
      ) : (
        <Button my="30px" onClick={connectWallet}>
          Connect wallet
        </Button>
      )}
      {editing ? (
        <Flex
          width="100vw"
          maxWidth="500px"
          justify="space-around"
          mt="-20px"
          mb="20px"
        >
          <Button disabled={loading} onClick={updateDomain}>
            Set record
          </Button>
          <Button
            onClick={() => {
              setEditing(false);
            }}
          >
            Cancel
          </Button>
        </Flex>
      ) : (
        <>
          {mints.length > 0 && (
            <Flex
              flexDir="column"
              my="30px"
              border="1px solid black"
              borderRadius="15px"
              textAlign="center"
            >
              <Text textDecor="underline">Registered names:</Text>
              {mints.map((mint) => {
                return (
                  <Flex
                    key={mint.id}
                    w="100%"
                    justify="space-around"
                    flexDir="column"
                    textAlign="left"
                    padding="10px"
                    my="10px"
                    bgColor={mint.id % 1 === 0 ? "rgb(155,202,71)" : "white"}
                  >
                    <Text>Token Id: {mint.id}</Text>
                    <Text>
                      Name: {mint.name}
                      {tld}
                    </Text>
                    <Text>
                      Wicked power: {mint.record}
                      {accounts &&
                      mint.owner.toLowerCase() === accounts[0].toLowerCase() ? (
                        <EditIcon
                          onClick={() => editRecord(mint.name)}
                          ml="5px"
                        />
                      ) : null}
                    </Text>
                    <Text>Owner: {mint.owner}</Text>
                  </Flex>
                );
              })}
            </Flex>
          )}
        </>
      )}

      <Flex flexDir="column" alignItems="center" mb="15px">
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
