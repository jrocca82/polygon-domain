import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { ConnectionContextProvider } from "../contexts/ConnectionContext";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ConnectionContextProvider>
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </ConnectionContextProvider>
  );
}

export default MyApp;
