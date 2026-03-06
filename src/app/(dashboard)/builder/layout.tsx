export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ height: '100%', overflow: 'hidden' }}>
      {children}
    </div>
  )
}
