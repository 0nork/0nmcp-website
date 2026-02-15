export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      {children}
    </div>
  )
}
