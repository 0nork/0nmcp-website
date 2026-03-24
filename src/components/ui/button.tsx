import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline' | 'secondary' | 'destructive'
  size?: 'default' | 'sm' | 'icon'
  children: React.ReactNode
}

export function Button({ variant = 'default', size = 'default', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'on-btn',
        variant === 'ghost' && 'on-btn-ghost',
        variant === 'outline' && 'on-btn-outline',
        variant === 'secondary' && 'on-btn-secondary',
        variant === 'destructive' && 'on-btn-destructive',
        size === 'sm' && 'on-btn-sm',
        size === 'icon' && 'on-btn-icon',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
