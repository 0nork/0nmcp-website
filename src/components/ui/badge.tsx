import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive'
  children: React.ReactNode
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'on-badge',
        variant === 'secondary' && 'on-badge-secondary',
        variant === 'outline' && 'on-badge-outline',
        variant === 'destructive' && 'on-badge-destructive',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
