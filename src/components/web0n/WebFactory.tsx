'use client'

export default function WebFactory() {
  return (
    <section
      aria-label="The web0n Factory — How we build your website"
      style={{
        position: 'relative',
        margin: '2.5rem -1.5rem 0',
        padding: '2.5rem 1.5rem 1.5rem',
        background: 'linear-gradient(180deg, #0d0d16 0%, #0B0F19 100%)',
        borderTop: '1px solid rgba(110, 224, 90, 0.12)',
        borderBottom: '1px solid rgba(110, 224, 90, 0.12)',
        overflow: 'hidden',
      }}
    >
      {/* Top glow line */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '50%', height: '1px',
        background: 'linear-gradient(90deg, transparent, #6EE05A, transparent)',
        boxShadow: '0 0 30px 8px rgba(110, 224, 90, 0.1)',
      }} />

      <style>{`
        /* === FACTORY STATIONS === */
        .w0n-row{display:flex;align-items:flex-start;justify-content:center;gap:0;max-width:1100px;margin:0 auto}
        .w0n-st{flex:0 0 170px;text-align:center;position:relative}
        .w0n-arr{flex:0 0 32px;display:flex;align-items:center;justify-content:center;align-self:center;margin-top:6px;position:relative;height:90px}

        .w0n-num{width:30px;height:30px;margin:0 auto 6px;border-radius:50%;background:linear-gradient(135deg,#6EE05A,#4CAF3D);color:#0B0F19;font-size:0.7rem;font-weight:800;display:flex;align-items:center;justify-content:center;font-family:var(--font-display)}
        .w0n-card{width:150px;height:95px;margin:0 auto;border-radius:10px;background:#111119;border:1px solid rgba(126,217,87,0.12);overflow:hidden;position:relative}
        .w0n-lbl{font-size:0.6rem;font-weight:700;letter-spacing:0.15em;color:#6EE05A;margin-top:8px;text-transform:uppercase}
        .w0n-desc{font-size:0.7rem;color:rgba(255,255,255,0.35);margin-top:2px}

        /* === FLOW ARROWS === */
        .w0n-dot{width:5px;height:5px;border-radius:50%;background:#6EE05A;position:absolute;opacity:0;animation:w0nFlow 2s ease-in-out infinite}
        .w0n-dot:nth-child(1){animation-delay:0s}
        .w0n-dot:nth-child(2){animation-delay:0.5s}
        .w0n-dot:nth-child(3){animation-delay:1s}

        /* === INTAKE MOCKUP === */
        .w0n-mk-intake{padding:10px 12px;display:flex;flex-direction:column;gap:6px}
        .w0n-mk-bar{height:6px;border-radius:3px;background:rgba(126,217,87,0.25);animation:w0nFill 3s ease-in-out infinite}
        .w0n-mk-bar:nth-child(1){animation-delay:0s;--fw:65%}
        .w0n-mk-bar:nth-child(2){animation-delay:0.4s;--fw:85%}
        .w0n-mk-bar:nth-child(3){animation-delay:0.8s;--fw:50%}
        .w0n-mk-bar:nth-child(4){animation-delay:1.2s;--fw:70%}
        .w0n-mk-bar:nth-child(5){animation-delay:1.6s;--fw:40%}

        /* === DESIGN MOCKUP === */
        .w0n-mk-design{padding:6px}
        .w0n-mk-hero{height:28px;border-radius:4px;background:linear-gradient(135deg,rgba(126,217,87,0.2),rgba(0,212,255,0.15));margin-bottom:6px}
        .w0n-mk-swatches{display:flex;gap:4px;margin-bottom:5px}
        .w0n-mk-swatch{flex:1;height:14px;border-radius:3px}
        .w0n-mk-swatch:nth-child(1){animation:w0nC1 4s ease infinite}
        .w0n-mk-swatch:nth-child(2){animation:w0nC2 4s ease infinite}
        .w0n-mk-swatch:nth-child(3){animation:w0nC3 4s ease infinite}
        .w0n-mk-cols{display:flex;gap:4px}
        .w0n-mk-col{flex:1;height:22px;border-radius:3px;background:var(--border)}

        /* === BUILD MOCKUP === */
        .w0n-mk-build{padding:8px 10px;font-family:'JetBrains Mono',monospace;font-size:0.5rem;line-height:1.7;display:flex;flex-direction:column;gap:1px}
        .w0n-mk-ln{opacity:0;animation:w0nCode 4s ease-in-out infinite;white-space:nowrap;overflow:hidden}
        .w0n-mk-ln:nth-child(1){color:#6EE05A;animation-delay:0s}
        .w0n-mk-ln:nth-child(2){color:#00d4ff;animation-delay:0.5s;padding-left:8px}
        .w0n-mk-ln:nth-child(3){color:#a78bfa;animation-delay:1s;padding-left:8px}
        .w0n-mk-ln:nth-child(4){color:#6EE05A;animation-delay:1.5s;padding-left:8px}
        .w0n-mk-ln:nth-child(5){color:rgba(255,255,255,0.5);animation-delay:2s}
        .w0n-mk-cursor{display:inline-block;width:4px;height:8px;background:#6EE05A;animation:w0nBlink 1s step-end infinite;vertical-align:middle;margin-left:2px}

        /* === REVIEW MOCKUP === */
        .w0n-mk-review{padding:8px 10px;display:flex;flex-direction:column;gap:5px}
        .w0n-mk-chk{display:flex;align-items:center;gap:5px;font-size:0.55rem;color:rgba(255,255,255,0.5);opacity:0;transform:translateX(-4px)}
        .w0n-mk-chk:nth-child(1){animation:w0nCheck 5s ease-in-out infinite;animation-delay:0.2s}
        .w0n-mk-chk:nth-child(2){animation:w0nCheck 5s ease-in-out infinite;animation-delay:0.7s}
        .w0n-mk-chk:nth-child(3){animation:w0nCheck 5s ease-in-out infinite;animation-delay:1.2s}
        .w0n-mk-chk:nth-child(4){animation:w0nCheck 5s ease-in-out infinite;animation-delay:1.7s}
        .w0n-mk-chk-icon{width:14px;height:14px;border-radius:50%;background:rgba(126,217,87,0.2);display:flex;align-items:center;justify-content:center;font-size:0.5rem;color:#6EE05A;flex-shrink:0}

        /* === LAUNCH MOCKUP === */
        .w0n-mk-launch{position:relative;height:100%}
        .w0n-mk-bbar{height:16px;background:#1a1a24;display:flex;align-items:center;padding:0 6px;gap:3px;border-bottom:1px solid var(--border)}
        .w0n-mk-bdot{width:5px;height:5px;border-radius:50%}
        .w0n-mk-burl{font-size:0.45rem;color:rgba(255,255,255,0.3);margin-left:4px;flex:1}
        .w0n-mk-live{font-size:0.4rem;font-weight:800;color:#6EE05A;letter-spacing:0.05em;padding:1px 5px;border-radius:3px;background:rgba(126,217,87,0.15);animation:w0nPulse 2s ease-in-out infinite}
        .w0n-mk-site{padding:6px;display:flex;flex-direction:column;gap:4px}
        .w0n-mk-shero{height:24px;border-radius:4px;background:linear-gradient(135deg,#6EE05A,#4CAF3D);opacity:0.7}
        .w0n-mk-srow{display:flex;gap:3px}
        .w0n-mk-sblock{flex:1;height:12px;border-radius:3px;background:rgba(126,217,87,0.12)}
        .w0n-mk-scta{height:10px;width:60%;border-radius:3px;background:rgba(126,217,87,0.3);margin:0 auto}

        /* === CONVEYOR BELT === */
        .w0n-belt{margin-top:20px;height:40px;overflow:hidden;position:relative;border-radius:6px;background:#08080d;border:1px solid rgba(126,217,87,0.08)}
        .w0n-belt-track{display:flex;align-items:center;height:100%;animation:w0nBelt 18s linear infinite;width:max-content}
        .w0n-belt-set{display:flex;align-items:center;gap:0;flex-shrink:0}
        .w0n-belt-item{flex-shrink:0;height:26px;padding:0 10px;border-radius:4px;font-size:0.6rem;font-weight:600;display:flex;align-items:center;gap:4px;margin:0 6px;white-space:nowrap}
        .w0n-belt-arr{color:rgba(126,217,87,0.3);font-size:0.7rem;flex-shrink:0;margin:0 2px}
        .w0n-bi-intake{background:rgba(126,217,87,0.1);color:#6EE05A;border:1px solid rgba(126,217,87,0.15)}
        .w0n-bi-design{background:rgba(0,212,255,0.1);color:#00d4ff;border:1px solid rgba(0,212,255,0.15)}
        .w0n-bi-build{background:rgba(167,139,250,0.1);color:#a78bfa;border:1px solid rgba(167,139,250,0.15)}
        .w0n-bi-review{background:rgba(255,200,50,0.1);color:#ffc832;border:1px solid rgba(255,200,50,0.15)}
        .w0n-bi-launch{background:rgba(126,217,87,0.15);color:#6EE05A;border:1px solid rgba(126,217,87,0.25);box-shadow:0 0 8px rgba(126,217,87,0.1)}
        .w0n-belt-line{position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,rgba(126,217,87,0.2),rgba(126,217,87,0.4),rgba(126,217,87,0.2),transparent)}

        /* === GEARS === */
        .w0n-gear{position:absolute;opacity:0.08;animation:w0nGear 6s linear infinite}

        /* === KEYFRAMES === */
        @keyframes w0nFlow{0%{left:-5px;opacity:0}15%{opacity:1}85%{opacity:1}100%{left:calc(100% + 5px);opacity:0}}
        @keyframes w0nFill{0%,10%{width:0}30%,70%{width:var(--fw,60%)}85%,100%{width:0}}
        @keyframes w0nC1{0%,100%{background:#6EE05A}33%{background:#00d4ff}66%{background:#a78bfa}}
        @keyframes w0nC2{0%,100%{background:#00d4ff}33%{background:#a78bfa}66%{background:#6EE05A}}
        @keyframes w0nC3{0%,100%{background:#a78bfa}33%{background:#6EE05A}66%{background:#00d4ff}}
        @keyframes w0nCode{0%,10%{opacity:0;transform:translateX(-4px)}20%,80%{opacity:1;transform:translateX(0)}90%,100%{opacity:0;transform:translateX(0)}}
        @keyframes w0nCheck{0%,10%{opacity:0;transform:translateX(-4px)}25%,75%{opacity:1;transform:translateX(0)}90%,100%{opacity:0;transform:translateX(-4px)}}
        @keyframes w0nPulse{0%,100%{box-shadow:0 0 4px rgba(126,217,87,0.3)}50%{box-shadow:0 0 10px rgba(126,217,87,0.6),0 0 20px rgba(126,217,87,0.2)}}
        @keyframes w0nBlink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes w0nBelt{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes w0nGear{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}

        @media(max-width:860px){
          .w0n-row{overflow-x:auto;justify-content:flex-start;padding-bottom:8px;-webkit-overflow-scrolling:touch;scrollbar-width:none}
          .w0n-row::-webkit-scrollbar{display:none}
          .w0n-st{flex:0 0 145px}
          .w0n-arr{flex:0 0 20px}
        }
        @media(prefers-reduced-motion:reduce){
          .w0n-mk-bar,.w0n-mk-swatch,.w0n-mk-ln,.w0n-mk-chk,.w0n-mk-live,.w0n-dot,.w0n-belt-track,.w0n-gear,.w0n-mk-cursor{animation:none!important;opacity:1!important;width:var(--fw,60%)!important;transform:none!important}
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Factory heading */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{
            fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: '#6EE05A', opacity: 0.7,
          }}>
            The web0n Factory
          </span>
        </div>

        {/* === 5 FACTORY STATIONS === */}
        <div className="w0n-row">
          {/* INTAKE */}
          <div className="w0n-st">
            <div className="w0n-num">01</div>
            <div className="w0n-card">
              <div className="w0n-mk-intake">
                <div className="w0n-mk-bar" />
                <div className="w0n-mk-bar" />
                <div className="w0n-mk-bar" />
                <div className="w0n-mk-bar" />
                <div className="w0n-mk-bar" />
              </div>
            </div>
            <div className="w0n-lbl">Intake</div>
            <div className="w0n-desc">Your info goes in</div>
          </div>

          {/* Arrow 1 */}
          <div className="w0n-arr">
            <div className="w0n-dot" /><div className="w0n-dot" /><div className="w0n-dot" />
          </div>

          {/* DESIGN */}
          <div className="w0n-st">
            <div className="w0n-num">02</div>
            <div className="w0n-card">
              <div className="w0n-mk-design">
                <div className="w0n-mk-hero" />
                <div className="w0n-mk-swatches">
                  <div className="w0n-mk-swatch" />
                  <div className="w0n-mk-swatch" />
                  <div className="w0n-mk-swatch" />
                </div>
                <div className="w0n-mk-cols">
                  <div className="w0n-mk-col" />
                  <div className="w0n-mk-col" />
                  <div className="w0n-mk-col" />
                </div>
              </div>
            </div>
            <div className="w0n-lbl">Design</div>
            <div className="w0n-desc">We craft the look</div>
          </div>

          {/* Arrow 2 */}
          <div className="w0n-arr">
            <div className="w0n-dot" /><div className="w0n-dot" /><div className="w0n-dot" />
          </div>

          {/* BUILD */}
          <div className="w0n-st">
            <div className="w0n-num">03</div>
            <div className="w0n-card">
              <div className="w0n-mk-build">
                <div className="w0n-mk-ln">{'const hero = styled`'}</div>
                <div className="w0n-mk-ln">{'background: grad...'}</div>
                <div className="w0n-mk-ln">{'padding: 4rem 2rem'}</div>
                <div className="w0n-mk-ln">{'color: $brand'}</div>
                <div className="w0n-mk-ln">{'`'}<span className="w0n-mk-cursor" /></div>
              </div>
            </div>
            <div className="w0n-lbl">Build</div>
            <div className="w0n-desc">Code comes alive</div>
          </div>

          {/* Arrow 3 */}
          <div className="w0n-arr">
            <div className="w0n-dot" /><div className="w0n-dot" /><div className="w0n-dot" />
          </div>

          {/* REVIEW */}
          <div className="w0n-st">
            <div className="w0n-num">04</div>
            <div className="w0n-card">
              <div className="w0n-mk-review">
                <div className="w0n-mk-chk"><div className="w0n-mk-chk-icon">&#10003;</div>Mobile-ready</div>
                <div className="w0n-mk-chk"><div className="w0n-mk-chk-icon">&#10003;</div>SEO optimized</div>
                <div className="w0n-mk-chk"><div className="w0n-mk-chk-icon">&#10003;</div>Speed: 98/100</div>
                <div className="w0n-mk-chk"><div className="w0n-mk-chk-icon">&#10003;</div>Forms active</div>
              </div>
            </div>
            <div className="w0n-lbl">Review</div>
            <div className="w0n-desc">Quality assured</div>
          </div>

          {/* Arrow 4 */}
          <div className="w0n-arr">
            <div className="w0n-dot" /><div className="w0n-dot" /><div className="w0n-dot" />
          </div>

          {/* LAUNCH */}
          <div className="w0n-st">
            <div className="w0n-num">05</div>
            <div className="w0n-card" style={{ borderColor: 'rgba(126,217,87,0.25)' }}>
              <div className="w0n-mk-launch">
                <div className="w0n-mk-bbar">
                  <div className="w0n-mk-bdot" style={{ background: '#ff5f57' }} />
                  <div className="w0n-mk-bdot" style={{ background: '#ffbd2e' }} />
                  <div className="w0n-mk-bdot" style={{ background: '#28c840' }} />
                  <div className="w0n-mk-burl">yourbiz.com</div>
                  <div className="w0n-mk-live">LIVE</div>
                </div>
                <div className="w0n-mk-site">
                  <div className="w0n-mk-shero" />
                  <div className="w0n-mk-srow">
                    <div className="w0n-mk-sblock" />
                    <div className="w0n-mk-sblock" />
                    <div className="w0n-mk-sblock" />
                  </div>
                  <div className="w0n-mk-scta" />
                </div>
              </div>
            </div>
            <div className="w0n-lbl">Launch</div>
            <div className="w0n-desc">You go live</div>
          </div>
        </div>

        {/* === CONVEYOR BELT === */}
        <div className="w0n-belt">
          <div className="w0n-belt-track">
            {[0, 1].map(set => (
              <div className="w0n-belt-set" key={set}>
                <div className="w0n-belt-item w0n-bi-intake">Intake</div>
                <span className="w0n-belt-arr">&rarr;</span>
                <div className="w0n-belt-item w0n-bi-design">Design</div>
                <span className="w0n-belt-arr">&rarr;</span>
                <div className="w0n-belt-item w0n-bi-build">Build</div>
                <span className="w0n-belt-arr">&rarr;</span>
                <div className="w0n-belt-item w0n-bi-review">Review</div>
                <span className="w0n-belt-arr">&rarr;</span>
                <div className="w0n-belt-item w0n-bi-launch">LIVE</div>
                <span className="w0n-belt-arr" style={{ margin: '0 12px' }}>&bull;</span>
              </div>
            ))}
          </div>
          <div className="w0n-belt-line" />
        </div>
      </div>

      {/* Decorative gears */}
      <svg className="w0n-gear" style={{ position: 'absolute', top: 20, left: '8%', width: 40, height: 40 }} viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="8" fill="none" stroke="#6EE05A" strokeWidth="2"/>
        {[0,45,90,135,180,225,270,315].map(a => (
          <rect key={a} x="18" y="4" width="4" height="6" rx="1" fill="#6EE05A" transform={`rotate(${a} 20 20)`}/>
        ))}
      </svg>
      <svg className="w0n-gear" style={{ position: 'absolute', bottom: 55, right: '6%', width: 50, height: 50, animationDirection: 'reverse', animationDuration: '8s' }} viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="8" fill="none" stroke="#6EE05A" strokeWidth="2"/>
        {[0,45,90,135,180,225,270,315].map(a => (
          <rect key={a} x="18" y="4" width="4" height="6" rx="1" fill="#6EE05A" transform={`rotate(${a} 20 20)`}/>
        ))}
      </svg>
    </section>
  )
}
