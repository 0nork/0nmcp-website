interface ServiceLogoProps {
  src: string | null | undefined
  alt: string
  size?: number
  className?: string
}

export default function ServiceLogo({
  src,
  alt,
  size = 24,
  className,
}: ServiceLogoProps) {
  if (!src) return null
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      style={{ display: 'inline-block', flexShrink: 0 }}
      loading="lazy"
    />
  )
}
