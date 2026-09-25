import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css';//This is for the styles
import './main.css';//This is for the styles
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import theme from './theme.js';

// The PWA plugin only emits sw.js in production builds.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch((error) => {
    console.error('Service Worker registration failed:', error);
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ChakraProvider theme={theme}>
      <App/>
    </ChakraProvider>
  </StrictMode>
)
