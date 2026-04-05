import React from 'react'

const OnMcpLogo = ({ className, variant = 'white' }: { className?: string; variant?: 'white' | 'black' }) => (
  <img 
    src={variant === 'white' ? '/brand/0n-logo-white.svg' : '/brand/0n-logo-black.svg'} 
    alt="0nMCP" 
    className={className}
    style={{ height: 32, width: 'auto' }}
  />
)

export default OnMcpLogo
