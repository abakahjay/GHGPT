// Chakra UI v2 color-mode helpers. The app itself uses ColorModeToggle directly.
import ColorModeToggle from './ColorModeToggle'

export function ColorModeProvider({ children }) {
  // Chakra v2's ChakraProvider (main.jsx) already manages color mode.
  return children
}

export function ColorModeButton(props) {
  return <ColorModeToggle {...props} />
}
