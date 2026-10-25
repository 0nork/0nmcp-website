'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

/** One line at the top of every public page: 0nMCP is now 0n3. Dismiss is remembered per browser. */
export default function AnnounceBar() {
  const [hidden, setHidden] = useState(true)
  useEffect(() => { try { setHidden(localStorage.getItem('0n3.announce.v1') === '1') } catch { setHidden(false) } }, [])
  if (hidden) return null
  return (
    <div className="relative z-[2] flex items-center justify-center gap-3 px-4 py-2 text-[13px] font-medium" style={{ background: '#171717', color: '#fff', borderBottom: '1px solid rgba(110,224,90,.35)' }}>
      <span className="inline-block h-2 w-2 rounded-full" style={{ background: '#6EE05A', boxShadow: '0 0 10px rgba(110,224,90,.8)' }} />
      <span><b>0nMCP is now 0n3.</b> Every app you own, one sign-in, AI that executes.</span>
      <Link href="/0n3" className="rounded-full px-3 py-1 font-semibold" style={{ background: '#6EE05A', color: '#171717' }}>See what changed</Link>
      <button aria-label="Dismiss" onClick={() => { try { localStorage.setItem('0n3.announce.v1', '1') } catch {} setHidden(true) }} className="ml-2 opacity-60 hover:opacity-100">✕</button>
    </div>
  )
}
