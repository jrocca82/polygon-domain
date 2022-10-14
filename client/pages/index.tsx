import { Flex, Heading, Text, Image, Button } from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import { useContext } from "react";
import { ConnectionContext } from "../contexts/ConnectionContext";

const Home: NextPage = () => {
  const TWITTER_HANDLE = "jo_rocca";
  const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

  const { accounts, connectWallet } = useContext(ConnectionContext);

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
        <Text my="30px">Connected!</Text>
      ) : (
        <Button my="30px" onClick={connectWallet}>Connect wallet</Button>
      )}

      <Flex>
        <a href={TWITTER_LINK} target="_blank">
          <Image src="/twitter-logo.png" alt="Twitter Logo" width={50} />
        </a>
      </Flex>
    </Flex>
  );
};

export default Home;
