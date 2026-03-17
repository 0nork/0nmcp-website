// app/install/error/page.tsx

export default async function InstallError({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>
}) {
  const params = await searchParams
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#080B0F', padding:32 }}>
      <div style={{ background:'#0E1117', border:'1px solid rgba(255,80,80,.25)', borderRadius:16, padding:40, maxWidth:480, textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>&#x26A0;&#xFE0F;</div>
        <h1 style={{ fontFamily:'Barlow,sans-serif', fontWeight:900, fontSize:28, color:'#e2e8f0', margin:'0 0 12px' }}>
          Install failed
        </h1>
        <p style={{ fontFamily:'JetBrains Mono,monospace', fontSize:13, color:'#ff6b6b', margin:'0 0 24px' }}>
          {params.reason ? decodeURIComponent(params.reason) : 'Unknown error'}
        </p>
        <p style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:14, color:'#7a8694' }}>
          Contact <a href="mailto:mike@0ncore.com" style={{ color:'#6EE05A' }}>mike@0ncore.com</a> for help.
        </p>
      </div>
    </div>
  )
}
