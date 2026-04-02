import type { Metadata } from 'next'
import Link from 'next/link'
import { STATS_DISPLAY } from '@/data/stats'

export const metadata: Metadata = {
  title: '0nGram — 0n Inside Telegram',
  description: `Full AI command center inside Telegram. Mini App dashboard, AI chat bot, inline queries, Telegram Stars payments. ${STATS_DISPLAY.tools} tools for 500M+ mini app users.`,
  alternates: { canonical: 'https://www.0nmcp.com/downloads/ongram' },
}

const TELEGRAM_BLUE = '#229ED9'
const ON_GREEN = '#6EE05A'

export default function OnGramPage() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '5rem', background: '#fafbfc' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        <Link href="/downloads" style={{ fontSize: 12, color: ON_GREEN, textDecoration: 'none' }}>
          &larr; All Downloads
        </Link>

        {/* Hero */}
        <div style={{ marginTop: 16, marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, background: TELEGRAM_BLUE,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 24,
              boxShadow: `0 8px 24px rgba(34,158,217,0.3)`,
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-8.609 3.33c-2.068.8-4.133 1.598-5.724 2.21a405.15 405.15 0 0 1-2.849 1.09c-.42.147-.99.332-1.473.901-.728.855-.749 2.042.086 2.858.39.38.868.586 1.285.725l.005.002 3.688 1.21.836 2.573.014.043c.258.755.59 1.277 1.08 1.592.497.319 1.06.363 1.555.336l.014-.001 2.317-.197 2.857 2.178c.338.257.744.473 1.212.573a2.18 2.18 0 0 0 1.407-.153c.487-.21.847-.564 1.084-.95.238-.387.37-.81.454-1.2l2.832-14.345c.147-.722.14-1.5-.34-2.137-.483-.64-1.218-.84-1.755-.862zm-.095 1.493c.143.005.2.03.247.092.047.063.11.248.026.668l-2.82 14.29c-.06.279-.148.498-.248.664a.718.718 0 0 1-.32.304.693.693 0 0 1-.455.04c-.155-.034-.365-.124-.584-.29l-3.465-2.642-.005-.004-.004-.003a.728.728 0 0 0-.63-.153.727.727 0 0 0-.474.384l-.003.006-1.204 2.11-.014-.01.003-.014-.006.003-.004.01-.002.014-.002.01-1.184-3.64 8.768-7.632a.75.75 0 0 0-.524-1.285.75.75 0 0 0-.462.18l-10.09 8.466-.003-.002-.002-.002-3.742-1.228c-.42-.138-.624-.24-.723-.314a.6.6 0 0 1 .006-.005l.008-.005c.01-.007.025-.018.1-.048.15-.058.373-.14.664-.248a401 401 0 0 0 5.683-2.193l8.609-3.33c.202-.078.32-.1.373-.101z" fill="currentColor" stroke="none"/>
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 900, color: '#1a1a1a', margin: 0 }}>0nGram</h1>
              <p style={{ fontSize: 14, color: '#888', margin: 0 }}>0n Inside Telegram</p>
            </div>
          </div>
          <p style={{ fontSize: 17, color: '#555', lineHeight: 1.8 }}>
            Your entire AI command center running inside Telegram. Full dashboard as a Mini App, AI chat bot, inline queries in any conversation, and Telegram Stars payments. 500M+ monthly mini app users.
          </p>
        </div>

        {/* Install Methods */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', marginBottom: 16 }}>Three Ways to Use 0nGram</h2>
          <div style={{ display: 'grid', gap: 16 }}>

            {/* Card 1: Mini App */}
            <div style={{
              background: '#fff', borderRadius: 16, padding: 28,
              border: `2px solid ${TELEGRAM_BLUE}`,
              boxShadow: `0 4px 20px rgba(34,158,217,0.12)`,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 12, right: 16,
                background: TELEGRAM_BLUE, color: '#fff',
                fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 6,
                textTransform: 'uppercase', letterSpacing: 1,
              }}>Featured</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: TELEGRAM_BLUE, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                Mini App
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>Full Dashboard Inside Telegram</div>
              <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7, marginBottom: 16 }}>
                Opens command.0nmcp.com as a Telegram Mini App. Full-screen mode, home screen shortcuts, native look and feel. The entire 0nAI experience without leaving Telegram.
              </p>
              <a
                href="https://t.me/0nGramBot/app"
                target="_blank"
                rel="noopener"
                style={{
                  display: 'inline-block', padding: '10px 24px', borderRadius: 10,
                  background: TELEGRAM_BLUE, color: '#fff', fontWeight: 700, fontSize: 14,
                  textDecoration: 'none', boxShadow: `0 4px 12px rgba(34,158,217,0.3)`,
                }}
              >
                Open Mini App &rarr;
              </a>
            </div>

            {/* Card 2: Bot Chat */}
            <div style={{
              background: '#fff', borderRadius: 16, padding: 28,
              border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: ON_GREEN, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                Bot Chat
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>AI Assistant in Your Pocket</div>
              <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7, marginBottom: 16 }}>
                Message @0nGramBot for instant AI responses. Threaded conversations, streaming responses, full Knowledge Layer access. Your personal AI that lives in Telegram.
              </p>
              <a
                href="https://t.me/0nGramBot"
                target="_blank"
                rel="noopener"
                style={{
                  display: 'inline-block', padding: '10px 24px', borderRadius: 10,
                  background: '#1a1a1a', color: '#fff', fontWeight: 700, fontSize: 14,
                  textDecoration: 'none',
                }}
              >
                Start Chatting &rarr;
              </a>
            </div>

            {/* Card 3: Inline Mode */}
            <div style={{
              background: '#fff', borderRadius: 16, padding: 28,
              border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                Inline Mode
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>Use 0n in Any Chat</div>
              <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7, marginBottom: 16 }}>
                Type <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>@0nGramBot</code> in any conversation to run workflows, search contacts, check status. Share results as rich cards in any chat.
              </p>
              <div style={{
                display: 'inline-block', padding: '10px 24px', borderRadius: 10,
                background: '#f3f4f6', color: '#888', fontWeight: 700, fontSize: 14,
              }}>
                Available in Any Chat
              </div>
            </div>
          </div>
        </section>

        {/* What 0nGram Includes */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', marginBottom: 16 }}>What 0nGram Includes</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {[
              { num: '1', title: 'Mini App', desc: 'Full 0nAI dashboard — chat, tasks, files, Knowledge Layer — all inside Telegram.' },
              { num: '2', title: 'AI Chat Bot', desc: 'Ollama/Groq-powered responses with your Knowledge Layer. Fast, private, contextual.' },
              { num: '3', title: 'Inline Queries', desc: '@0nGramBot in any chat for viral tool access. Share AI results with anyone.' },
              { num: '4', title: 'Telegram Stars', desc: 'Pay per execution with Telegram\'s digital currency. Frictionless micropayments.' },
              { num: '5', title: 'Stripe Payments', desc: 'Premium services via native Telegram payment UI. Seamless checkout.' },
              { num: '6', title: 'Login Widget', desc: '"Login with Telegram" on 0nmcp.com. One-tap authentication.' },
              { num: '7', title: 'Zero Auth', desc: 'Telegram identity passed automatically. No passwords, no login screens needed.' },
              { num: '8', title: 'Home Screen', desc: 'Add to phone home screen. Works like a native app — instant access.' },
            ].map(f => (
              <div key={f.num} style={{
                background: '#fff', borderRadius: 14, padding: 20,
                border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: `linear-gradient(135deg, ${TELEGRAM_BLUE}, ${ON_GREEN})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 12, fontWeight: 900, marginBottom: 10,
                }}>{f.num}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Bar */}
        <section style={{ marginBottom: 40 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
            background: '#1a1a1a', borderRadius: 16, overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          }}>
            {[
              { value: '950M', label: 'Telegram Users' },
              { value: '500M', label: 'Mini App Users' },
              { value: '0%', label: 'Stripe Commission' },
              { value: STATS_DISPLAY.tools, label: 'Tools Available' },
            ].map((s, i) => (
              <div key={s.label} style={{
                padding: '24px 16px', textAlign: 'center',
                borderRight: i < 3 ? '1px solid #333' : 'none',
              }}>
                <div style={{
                  fontSize: 24, fontWeight: 900,
                  background: `linear-gradient(135deg, ${TELEGRAM_BLUE}, ${ON_GREEN})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#999', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div style={{
          borderRadius: 16, padding: '2.5rem 2rem', textAlign: 'center',
          background: `linear-gradient(135deg, ${TELEGRAM_BLUE}, #1a8fc2)`,
          color: '#fff', boxShadow: '0 12px 40px rgba(34,158,217,0.25)',
        }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Coming Soon — Get Notified</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 24 }}>
            Be first to access 0nGram when it launches. Enter your email below.
          </p>
          <form
            action="/api/request-access"
            method="POST"
            style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}
          >
            <input type="hidden" name="type" value="ongram-waitlist" />
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              style={{
                padding: '12px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 14,
                width: 260, outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '12px 28px', borderRadius: 10, background: '#fff',
                color: TELEGRAM_BLUE, fontWeight: 800, fontSize: 14,
                border: 'none', cursor: 'pointer',
              }}
            >
              Notify Me
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
