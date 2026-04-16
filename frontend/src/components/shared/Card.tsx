import type { ReactNode } from "react"

type CardProps = {
  title?: string
  subtitle?: string
  children: ReactNode
}

export function Card({ title, subtitle, children }: CardProps) {
  return (
    <section className="card-panel">
      {(title || subtitle) && (
        <header className="card-panel__header">
          {title ? <h3>{title}</h3> : null}
          {subtitle ? <p>{subtitle}</p> : null}
        </header>
      )}
      {children}
    </section>
  )
}
