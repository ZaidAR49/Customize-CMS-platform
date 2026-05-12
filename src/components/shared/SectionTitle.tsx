interface SectionTitleProps {
  title: string
  subtitle?: string
  centered?: boolean
  light?: boolean
}

export function SectionTitle({ title, subtitle, centered = true, light = false }: SectionTitleProps) {
  return (
    <div className={`mb-12 ${centered ? 'text-center' : ''}`}>
      <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${light ? 'text-white' : 'text-(--fcps-primary-dark)'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`text-lg max-w-2xl ${centered ? 'mx-auto' : ''} ${light ? 'text-white/80' : 'text-(--fcps-gray-text)'}`}>
          {subtitle}
        </p>
      )}
      <div className={`mt-4 h-1 w-20 rounded-full ${centered ? 'mx-auto' : ''} ${light ? 'bg-white/50' : 'bg-(--fcps-primary-light)'}`} />
    </div>
  )
}
