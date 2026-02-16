interface ServiceLogoProps {
  src: string | null | undefined
  alt: string
  size?: number
  className?: string
  icon?: string
}

export default function ServiceLogo({
  src,
  alt,
  size = 24,
  className,
  icon,
}: ServiceLogoProps) {
  if (src) {
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
  if (icon) {
    return (
      <span
        className={className}
        style={{ fontSize: size * 0.75, lineHeight: `${size}px`, display: 'inline-block', width: size, height: size, textAlign: 'center' }}
        role="img"
        aria-label={alt}
      >
        {icon}
      </span>
    )
  }
  return null
}
