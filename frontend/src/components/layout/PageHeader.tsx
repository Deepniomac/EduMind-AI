type PageHeaderProps = {
  eyebrow: string
  title: string
  description: string
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <div className="page-header">
      <p className="page-header__eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="page-header__description">{description}</p>
    </div>
  )
}
