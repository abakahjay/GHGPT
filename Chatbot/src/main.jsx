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
// Browsers only re-check sw.js on their own schedule (up to a day), so ask for
// updates on every launch, whenever the tab comes back into view, and hourly.
registerSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    if (!registration) return;
    const check = () => registration.update().catch(() => {});
    check();
    setInterval(check, 60 * 60 * 1000);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') check();
    });
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ChakraProvider theme={theme}>
      <App/>
    </ChakraProvider>
  </StrictMode>
)
