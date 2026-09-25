import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Registered from main.jsx via virtual:pwa-register.
      injectRegister: false,
      workbox: {
        // Set explicitly: the plugin only adds these itself when injectRegister
        // is 'auto', and without them a new deploy waits until every tab closes.
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
      },
      manifest: {
        name: 'GH-GPT',
        short_name: 'GH-GPT',
        description: 'Your AI assistant for writing, coding and idea generation.',
        theme_color: '#0b0a12',
        background_color: '#0b0a12',
        display: 'standalone',
        start_url: '/dashboard',
        icons: [
          { src: 'fav.svg', sizes: 'any', type: 'image/svg+xml' },
          { src: 'bot.png', sizes: '1000x1000', type: 'image/png', purpose: 'any' },
        ],
      },
    }),
  ],
  server: {
    port: 7009,
  },
  test: {//This is how we setup the tests
    environment: 'jsdom',
    setupFiles: './setupTests.js',
  }
})
// Regular Colors
// console.log('\x1b[31m%s\x1b[0m', 'This is red');       // Red text
// console.log('\x1b[32m%s\x1b[0m', 'This is green');     // Green text
// console.log('\x1b[33m%s\x1b[0m', 'This is yellow');    // Yellow text
// console.log('\x1b[34m%s\x1b[0m', 'This is blue');      // Blue text
// console.log('\x1b[35m%s\x1b[0m', 'This is magenta');   // Magenta text
// console.log('\x1b[36m%s\x1b[0m', 'This is cyan');      // Cyan text
// console.log('\x1b[37m%s\x1b[0m', 'This is white');     // White text

// // Background Colors
// console.log('\x1b[41m%s\x1b[0m', 'This has red background'); // Red background
// console.log('\x1b[42m%s\x1b[0m', 'This has green background'); // Green background

// // Bold and Underline
// console.log('\x1b[1m%s\x1b[0m', 'This is bold');        // Bold text
// console.log('\x1b[4m%s\x1b[0m', 'This is underlined');  // Underlined text

// // Reset Style
// console.log('\x1b[0m%s\x1b[0m', 'This is normal again'); // Reset style


//npm install @chakra-ui/icons @chakra-ui/react