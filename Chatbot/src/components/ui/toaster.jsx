import { createStandaloneToast } from '@chakra-ui/react'
import theme from '../../theme'

// Chakra v2 toasts usable outside React components: toaster({ title, status }).
// Render <Toaster /> once if you use it (ChakraProvider already covers in-app toasts).
const { ToastContainer, toast } = createStandaloneToast({ theme })

// eslint-disable-next-line react-refresh/only-export-components
export const toaster = toast

export const Toaster = () => <ToastContainer />
