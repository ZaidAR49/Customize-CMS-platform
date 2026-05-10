export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4'
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-[var(--fcps-primary-light)] border-t-[var(--fcps-primary)]`}
      />
    </div>
  )
}
