import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css';//This is for the styles
import './main.css';//This is for the styles
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import theme from './theme.js';
import { registerSW } from 'virtual:pwa-register';
import './utils/installPrompt.js'; // start listening for the install prompt right away

// Register the PWA service worker. With registerType "autoUpdate" the page
// reloads itself as soon as a new deploy is available, so visitors never get
// stuck on a stale cached build.
registerSW({ immediate: true });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ChakraProvider theme={theme}>
      <App/>
    </ChakraProvider>
  </StrictMode>
)
