import { ChakraProvider } from '@chakra-ui/react'
import theme from '../../theme'

// Same provider setup as main.jsx, for tests or isolated renders.
export function Provider({ children }) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>
}
