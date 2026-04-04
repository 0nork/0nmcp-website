'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function ExitIntent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (document.cookie.includes('w0n_exit_dismissed')) return

    const handle = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setShow(true)
        document.cookie = `w0n_exit_dismissed=1; path=/; max-age=86400; SameSite=Lax`
        document.removeEventListener('mouseout', handle)
      }
    }

    const t = setTimeout(() => {
      document.addEventListener('mouseout', handle)
    }, 5000)

    return () => { clearTimeout(t); document.removeEventListener('mouseout', handle) }
  }, [])

  if (!show) return null

  return (
    <>
      <style>{`
        @keyframes w0nExitBg{0%{opacity:0}100%{opacity:1}}
        @keyframes w0nExitIn{0%{opacity:0;transform:scale(0.92) translateY(20px)}100%{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes w0nExitGlow{0%,100%{box-shadow:0 0 40px rgba(126,217,87,0.06)}50%{box-shadow:0 0 60px rgba(126,217,87,0.15)}}
        .w0n-exit-bg{animation:w0nExitBg .3s ease forwards}
        .w0n-exit-box{animation:w0nExitIn .4s cubic-bezier(0.16,1,0.3,1) forwards}
        .w0n-exit-cta{transition:transform .15s ease,box-shadow .15s ease}
        .w0n-exit-cta:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(126,217,87,0.4)!important}
      `}</style>
      <div
        className="w0n-exit-bg"
        onClick={() => setShow(false)}
        role="dialog"
        aria-modal="true"
        aria-label="Special offer"
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <div
          className="w0n-exit-box"
          onClick={e => e.stopPropagation()}
          style={{
            maxWidth: 460, width: '100%', padding: '2.75rem 2rem',
            borderRadius: '20px',
            background: 'linear-gradient(160deg, #13131d 0%, #0B0F19 100%)',
            border: '1px solid rgba(126,217,87,0.2)',
            boxShadow: '0 0 80px rgba(126,217,87,0.06), 0 25px 60px rgba(0,0,0,0.6)',
            textAlign: 'center', position: 'relative',
            animation: 'w0nExitGlow 3s ease-in-out infinite',
          }}
        >
          <button
            onClick={() => setShow(false)}
            style={{
              position: 'absolute', top: '1rem', right: '1.25rem',
              background: 'none', border: 'none', color: 'var(--text-muted)',
              fontSize: '1.4rem', cursor: 'pointer', padding: '0.25rem',
              lineHeight: 1, transition: 'color 0.15s',
            }}
            aria-label="Close"
          >
            &times;
          </button>

          <Image
            src="/brand/web0n-icon.jpg"
            alt="web0n"
            width={52} height={52}
            style={{ borderRadius: 14, margin: '0 auto 1.25rem', display: 'block', boxShadow: '0 4px 20px rgba(126,217,87,0.15)' }}
          />
          <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.2 }}>
            Wait &mdash; Your Competitors<br />
            <span style={{ color: '#6EE05A' }}>Already Have Websites</span>
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.65, marginBottom: '1.5rem', maxWidth: 360, margin: '0 auto 1.5rem' }}>
            <strong style={{ color: '#fff' }}>88% of consumers</strong> research businesses online before visiting.
            Don&apos;t lose them to a competitor with a better site.
          </p>

          <div style={{
            display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.5rem',
            fontSize: '0.75rem', color: 'var(--text-muted)',
          }}>
            {['5 Pages', 'CRM Included', 'Live in Days'].map(t => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ color: '#6EE05A', fontWeight: 700 }}>&#10003;</span> {t}
              </span>
            ))}
          </div>

          <Link
            href="/onboard"
            className="w0n-exit-cta"
            style={{
              display: 'block', padding: '0.9rem 1.5rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6EE05A, #4CAF3D)',
              color: '#0B0F19', fontWeight: 700, fontSize: '1.05rem',
              textDecoration: 'none',
              boxShadow: '0 4px 24px rgba(126,217,87,0.3)',
            }}
          >
            Get My Website &mdash; $1,997
          </Link>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '0.75rem' }}>
            50/50 payment &bull; No monthly fees &bull; 2 rounds of revisions
          </p>
        </div>
      </div>
    </>
  )
}
