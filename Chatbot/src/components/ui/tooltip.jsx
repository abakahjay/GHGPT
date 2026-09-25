import { Tooltip as ChakraTooltip } from '@chakra-ui/react'
import { forwardRef } from 'react'

// Chakra v2 tooltip with the v3-style props (content, showArrow, disabled).
export const Tooltip = forwardRef(function Tooltip(props, ref) {
  const { showArrow, children, disabled, content, ...rest } = props
  if (disabled) return children
  return (
    <ChakraTooltip ref={ref} label={content} hasArrow={showArrow} {...rest}>
      {children}
    </ChakraTooltip>
  )
})
