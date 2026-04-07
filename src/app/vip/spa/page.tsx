import type { Metadata } from 'next'
import SpaAuthForm from './SpaAuthForm'

export const metadata: Metadata = {
  title: 'The Spa in Ligonier — VIP Portal',
  description: 'Access your personalized spa management dashboard. Automated appointments, client retention, AI booking assistant.',
}

const FEATURES = [
  'Automated appointment management',
  'Personalized client follow-up',
  'AI-powered booking assistant',
  'Birthday campaigns',
  'Client retention scoring',
]

export default function SpaVipPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Lato:wght@300;400;700&display=swap');
      `}</style>
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        fontFamily: "'Lato', sans-serif",
        color: '#272727',
      }}>
        {/* Left Panel — Brand */}
        <div style={{
          flex: '0 0 45%',
          background: 'linear-gradient(175deg, #570301 0%, #3d0201 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px 48px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative circles */}
          <div style={{
            position: 'absolute',
            top: '-80px',
            right: '-80px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            border: '1px solid rgba(200, 121, 45, 0.15)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-120px',
            left: '-60px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            border: '1px solid rgba(244, 220, 208, 0.08)',
          }} />

          <div style={{
            maxWidth: '380px',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
          }}>
            {/* Decorative divider */}
            <div style={{
              width: '60px',
              height: '1px',
              background: '#C8792D',
              margin: '0 auto 32px',
            }} />

            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '42px',
              fontWeight: 300,
              color: '#F4DCD0',
              lineHeight: 1.2,
              margin: '0 0 8px',
              letterSpacing: '1px',
            }}>
              The Spa
            </h1>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '18px',
              fontWeight: 400,
              color: 'rgba(244, 220, 208, 0.7)',
              margin: '0 0 24px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
            }}>
              in Ligonier
            </p>

            {/* Decorative divider */}
            <div style={{
              width: '40px',
              height: '1px',
              background: 'rgba(200, 121, 45, 0.4)',
              margin: '0 auto 32px',
            }} />

            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '22px',
              fontWeight: 400,
              fontStyle: 'italic',
              color: '#C8792D',
              margin: '0 0 48px',
              lineHeight: 1.5,
            }}>
              Your wellness, orchestrated.
            </p>

            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: '0 0 0',
              textAlign: 'left',
            }}>
              {FEATURES.map((feature) => (
                <li key={feature} style={{
                  fontSize: '14px',
                  color: 'rgba(244, 220, 208, 0.75)',
                  padding: '10px 0',
                  borderBottom: '1px solid rgba(244, 220, 208, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  letterSpacing: '0.3px',
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#C8792D',
                    flexShrink: 0,
                  }} />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Powered by 0nMCP */}
          <div style={{
            position: 'absolute',
            bottom: '28px',
            left: 0,
            right: 0,
            textAlign: 'center',
          }}>
            <span style={{
              fontSize: '11px',
              color: 'rgba(244, 220, 208, 0.3)',
              letterSpacing: '1px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#7ed957',
                display: 'inline-block',
                boxShadow: '0 0 6px rgba(126, 217, 87, 0.4)',
              }} />
              Powered by 0nMCP
            </span>
          </div>
        </div>

        {/* Right Panel — Auth Form */}
        <div style={{
          flex: 1,
          background: '#FAEEE8',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px 48px',
        }}>
          <SpaAuthForm />
        </div>
      </div>
    </>
  )
}
