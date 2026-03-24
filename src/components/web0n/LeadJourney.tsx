'use client'

export default function LeadJourney() {
  return (
    <section
      aria-label="The Lead Journey — How your CRM captures and converts customers"
      style={{
        position: 'relative',
        margin: '2rem -1.5rem 0',
        padding: '2.5rem 1.5rem 1.5rem',
        background: 'linear-gradient(180deg, #0d0d16 0%, #0B0F19 100%)',
        borderTop: '1px solid rgba(0, 212, 255, 0.12)',
        borderBottom: '1px solid rgba(0, 212, 255, 0.12)',
        overflow: 'hidden',
      }}
    >
      {/* Top glow line */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '50%', height: '1px',
        background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
        boxShadow: '0 0 30px 8px rgba(0, 212, 255, 0.1)',
      }} />

      <style>{`
        /* === LEAD JOURNEY STATIONS === */
        .lj-row{display:flex;align-items:flex-start;justify-content:center;gap:0;max-width:1100px;margin:0 auto}
        .lj-st{flex:0 0 170px;text-align:center;position:relative}
        .lj-arr{flex:0 0 32px;display:flex;align-items:center;justify-content:center;align-self:center;margin-top:6px;position:relative;height:90px}

        .lj-num{width:30px;height:30px;margin:0 auto 6px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:800;font-family:var(--font-display)}
        .lj-card{width:150px;height:95px;margin:0 auto;border-radius:10px;background:#111119;overflow:hidden;position:relative}
        .lj-lbl{font-size:0.6rem;font-weight:700;letter-spacing:0.15em;margin-top:8px;text-transform:uppercase}
        .lj-desc{font-size:0.7rem;color:rgba(255,255,255,0.35);margin-top:2px}

        /* === FLOW ARROWS === */
        .lj-dot{width:5px;height:5px;border-radius:50%;position:absolute;opacity:0;animation:ljFlow 2s ease-in-out infinite}
        .lj-dot:nth-child(1){animation-delay:0s}
        .lj-dot:nth-child(2){animation-delay:0.5s}
        .lj-dot:nth-child(3){animation-delay:1s}

        /* === FORM FILL MOCKUP === */
        .lj-mk-form{padding:10px 12px;display:flex;flex-direction:column;gap:5px}
        .lj-mk-field{height:10px;border-radius:4px;background:rgba(126,217,87,0.08);border:1px solid rgba(126,217,87,0.12);position:relative;overflow:hidden}
        .lj-mk-field::after{content:'';position:absolute;left:0;top:0;bottom:0;background:rgba(126,217,87,0.2);border-radius:4px;animation:ljFieldFill 4s ease-in-out infinite}
        .lj-mk-field:nth-child(1)::after{animation-delay:0s;--lj-fw:75%}
        .lj-mk-field:nth-child(2)::after{animation-delay:0.4s;--lj-fw:90%}
        .lj-mk-field:nth-child(3)::after{animation-delay:0.8s;--lj-fw:55%}
        .lj-mk-submit{height:14px;border-radius:4px;background:linear-gradient(135deg,rgba(126,217,87,0.4),rgba(126,217,87,0.25));margin-top:2px;display:flex;align-items:center;justify-content:center;font-size:0.4rem;font-weight:700;color:#6EE05A;letter-spacing:0.05em;animation:ljPulseBtn 3s ease-in-out infinite}

        /* === EMAIL MOCKUP === */
        .lj-mk-email{padding:8px 10px;display:flex;flex-direction:column;gap:4px}
        .lj-mk-env{width:40px;height:28px;margin:4px auto 6px;position:relative}
        .lj-mk-env-body{width:40px;height:22px;border-radius:3px;background:rgba(0,212,255,0.15);border:1px solid rgba(0,212,255,0.2)}
        .lj-mk-env-flap{position:absolute;top:0;left:0;width:0;height:0;border-left:20px solid transparent;border-right:20px solid transparent;border-top:12px solid rgba(0,212,255,0.25);animation:ljFlapOpen 3s ease-in-out infinite}
        .lj-mk-email-line{height:4px;border-radius:2px;background:rgba(0,212,255,0.15)}
        .lj-mk-email-line:nth-child(2){width:85%;animation:ljEmailReveal 3s ease-in-out infinite;animation-delay:0.3s}
        .lj-mk-email-line:nth-child(3){width:60%;animation:ljEmailReveal 3s ease-in-out infinite;animation-delay:0.6s}
        .lj-mk-email-cta{height:8px;width:50%;border-radius:3px;background:rgba(0,212,255,0.3);margin:4px auto 0;font-size:0.35rem;display:flex;align-items:center;justify-content:center;color:#00d4ff;font-weight:700;animation:ljPulseBtn 3s ease-in-out infinite 1s}

        /* === BOOKING MOCKUP === */
        .lj-mk-book{padding:6px 8px}
        .lj-mk-cal-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
        .lj-mk-cal-mo{font-size:0.45rem;font-weight:700;color:rgba(167,139,250,0.7)}
        .lj-mk-cal-nav{font-size:0.5rem;color:rgba(167,139,250,0.4)}
        .lj-mk-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}
        .lj-mk-cal-day{width:100%;aspect-ratio:1;border-radius:2px;background:rgba(255,255,255,0.03);display:flex;align-items:center;justify-content:center;font-size:0.35rem;color:rgba(255,255,255,0.25)}
        .lj-mk-cal-day.lj-active{background:rgba(167,139,250,0.3);color:#a78bfa;font-weight:700;animation:ljCalPick 4s ease-in-out infinite;border:1px solid rgba(167,139,250,0.4)}
        .lj-mk-cal-day.lj-past{opacity:0.3}
        .lj-mk-time{margin-top:4px;display:flex;gap:3px;justify-content:center}
        .lj-mk-time-slot{font-size:0.35rem;padding:2px 5px;border-radius:3px;background:rgba(167,139,250,0.1);color:rgba(167,139,250,0.6);border:1px solid rgba(167,139,250,0.15)}
        .lj-mk-time-slot.lj-picked{background:rgba(167,139,250,0.3);color:#a78bfa;border-color:rgba(167,139,250,0.4);animation:ljPulseBtn 3s ease-in-out infinite 0.5s}

        /* === PURCHASE MOCKUP === */
        .lj-mk-buy{padding:8px 10px;display:flex;flex-direction:column;align-items:center;gap:4px}
        .lj-mk-product{width:55px;height:28px;border-radius:4px;background:linear-gradient(135deg,rgba(255,200,50,0.12),rgba(255,107,157,0.12));border:1px solid rgba(255,200,50,0.15);display:flex;align-items:center;justify-content:center;margin-bottom:2px}
        .lj-mk-product-icon{font-size:0.8rem}
        .lj-mk-price{font-size:0.55rem;font-weight:800;color:#ffc832}
        .lj-mk-card-row{display:flex;align-items:center;gap:4px;margin-top:2px}
        .lj-mk-cc{width:30px;height:8px;border-radius:2px;background:rgba(255,200,50,0.15);border:1px solid rgba(255,200,50,0.12)}
        .lj-mk-cc-dots{font-size:0.3rem;color:rgba(255,200,50,0.4);letter-spacing:1px}
        .lj-mk-pay-btn{height:12px;width:70%;border-radius:3px;background:linear-gradient(135deg,rgba(255,200,50,0.3),rgba(255,107,157,0.2));margin-top:2px;display:flex;align-items:center;justify-content:center;font-size:0.4rem;font-weight:700;color:#ffc832;animation:ljPaySlide 4s ease-in-out infinite}

        /* === REVIEW MOCKUP === */
        .lj-mk-rev{padding:10px 12px;display:flex;flex-direction:column;align-items:center;gap:4px}
        .lj-mk-stars{display:flex;gap:2px;margin-bottom:4px}
        .lj-mk-star{font-size:0.7rem;opacity:0;transform:scale(0.5);color:#ffc832}
        .lj-mk-star:nth-child(1){animation:ljStarPop 5s ease-in-out infinite;animation-delay:0.2s}
        .lj-mk-star:nth-child(2){animation:ljStarPop 5s ease-in-out infinite;animation-delay:0.5s}
        .lj-mk-star:nth-child(3){animation:ljStarPop 5s ease-in-out infinite;animation-delay:0.8s}
        .lj-mk-star:nth-child(4){animation:ljStarPop 5s ease-in-out infinite;animation-delay:1.1s}
        .lj-mk-star:nth-child(5){animation:ljStarPop 5s ease-in-out infinite;animation-delay:1.4s}
        .lj-mk-rev-text{font-size:0.45rem;color:rgba(255,255,255,0.4);text-align:center;line-height:1.4;opacity:0;animation:ljRevealText 5s ease-in-out infinite 1.8s}
        .lj-mk-rev-badge{margin-top:4px;font-size:0.35rem;font-weight:700;color:#6EE05A;padding:2px 6px;border-radius:3px;background:rgba(126,217,87,0.15);border:1px solid rgba(126,217,87,0.2);opacity:0;animation:ljRevealText 5s ease-in-out infinite 2.2s}

        /* === CONVEYOR BELT === */
        .lj-belt{margin-top:20px;height:40px;overflow:hidden;position:relative;border-radius:6px;background:#08080d;border:1px solid rgba(0,212,255,0.08)}
        .lj-belt-track{display:flex;align-items:center;height:100%;animation:ljBelt 20s linear infinite;width:max-content}
        .lj-belt-set{display:flex;align-items:center;gap:0;flex-shrink:0}
        .lj-belt-item{flex-shrink:0;height:26px;padding:0 10px;border-radius:4px;font-size:0.6rem;font-weight:600;display:flex;align-items:center;gap:4px;margin:0 6px;white-space:nowrap}
        .lj-belt-arr{color:rgba(0,212,255,0.3);font-size:0.7rem;flex-shrink:0;margin:0 2px}
        .lj-bi-form{background:rgba(126,217,87,0.1);color:#6EE05A;border:1px solid rgba(126,217,87,0.15)}
        .lj-bi-email{background:rgba(0,212,255,0.1);color:#00d4ff;border:1px solid rgba(0,212,255,0.15)}
        .lj-bi-book{background:rgba(167,139,250,0.1);color:#a78bfa;border:1px solid rgba(167,139,250,0.15)}
        .lj-bi-buy{background:rgba(255,200,50,0.1);color:#ffc832;border:1px solid rgba(255,200,50,0.15)}
        .lj-bi-review{background:rgba(126,217,87,0.15);color:#6EE05A;border:1px solid rgba(126,217,87,0.25);box-shadow:0 0 8px rgba(126,217,87,0.1)}
        .lj-belt-line{position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,rgba(0,212,255,0.2),rgba(126,217,87,0.4),rgba(0,212,255,0.2),transparent)}

        /* === KEYFRAMES === */
        @keyframes ljFlow{0%{left:-5px;opacity:0}15%{opacity:1}85%{opacity:1}100%{left:calc(100% + 5px);opacity:0}}
        @keyframes ljFieldFill{0%,10%{width:0}30%,70%{width:var(--lj-fw,60%)}85%,100%{width:0}}
        @keyframes ljPulseBtn{0%,100%{opacity:0.7;transform:scale(1)}50%{opacity:1;transform:scale(1.02)}}
        @keyframes ljFlapOpen{0%,20%{border-top-width:12px}40%,60%{border-top-width:4px}80%,100%{border-top-width:12px}}
        @keyframes ljEmailReveal{0%,15%{opacity:0;transform:translateY(3px)}30%,70%{opacity:1;transform:translateY(0)}85%,100%{opacity:0;transform:translateY(-2px)}}
        @keyframes ljCalPick{0%,20%{box-shadow:none}40%,60%{box-shadow:0 0 8px rgba(167,139,250,0.4)}80%,100%{box-shadow:none}}
        @keyframes ljPaySlide{0%,15%{opacity:0.5;transform:translateY(2px)}35%,65%{opacity:1;transform:translateY(0)}85%,100%{opacity:0.5;transform:translateY(2px)}}
        @keyframes ljStarPop{0%,10%{opacity:0;transform:scale(0.3)}25%,75%{opacity:1;transform:scale(1)}90%,100%{opacity:0;transform:scale(0.3)}}
        @keyframes ljRevealText{0%,15%{opacity:0;transform:translateY(4px)}35%,65%{opacity:1;transform:translateY(0)}85%,100%{opacity:0;transform:translateY(-4px)}}
        @keyframes ljBelt{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}

        @media(max-width:860px){
          .lj-row{overflow-x:auto;justify-content:flex-start;padding-bottom:8px;-webkit-overflow-scrolling:touch;scrollbar-width:none}
          .lj-row::-webkit-scrollbar{display:none}
          .lj-st{flex:0 0 145px}
          .lj-arr{flex:0 0 20px}
        }
        @media(prefers-reduced-motion:reduce){
          .lj-mk-field::after,.lj-mk-submit,.lj-mk-env-flap,.lj-mk-email-line,.lj-mk-email-cta,.lj-mk-cal-day.lj-active,.lj-mk-time-slot.lj-picked,.lj-mk-pay-btn,.lj-mk-star,.lj-mk-rev-text,.lj-mk-rev-badge,.lj-dot,.lj-belt-track{animation:none!important;opacity:1!important;transform:none!important;width:var(--lj-fw,60%)!important}
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Journey heading */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{
            fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: '#00d4ff', opacity: 0.7,
          }}>
            The Lead Journey
          </span>
        </div>

        {/* === 5 JOURNEY STATIONS === */}
        <div className="lj-row">
          {/* FORM FILL */}
          <div className="lj-st">
            <div className="lj-num" style={{ background: 'linear-gradient(135deg, #6EE05A, #4CAF3D)', color: '#0B0F19' }}>01</div>
            <div className="lj-card" style={{ border: '1px solid rgba(126,217,87,0.12)' }}>
              <div className="lj-mk-form">
                <div className="lj-mk-field" />
                <div className="lj-mk-field" />
                <div className="lj-mk-field" />
                <div className="lj-mk-submit">SUBMIT</div>
              </div>
            </div>
            <div className="lj-lbl" style={{ color: '#6EE05A' }}>Form Fill</div>
            <div className="lj-desc">Lead submits info</div>
          </div>

          {/* Arrow 1 */}
          <div className="lj-arr">
            <div className="lj-dot" style={{ background: '#6EE05A' }} />
            <div className="lj-dot" style={{ background: '#00d4ff' }} />
            <div className="lj-dot" style={{ background: '#00d4ff' }} />
          </div>

          {/* EMAIL */}
          <div className="lj-st">
            <div className="lj-num" style={{ background: 'linear-gradient(135deg, #00d4ff, #0099cc)', color: '#0B0F19' }}>02</div>
            <div className="lj-card" style={{ border: '1px solid rgba(0,212,255,0.12)' }}>
              <div className="lj-mk-email">
                <div className="lj-mk-env">
                  <div className="lj-mk-env-body" />
                  <div className="lj-mk-env-flap" />
                </div>
                <div className="lj-mk-email-line" />
                <div className="lj-mk-email-line" />
                <div className="lj-mk-email-cta">BOOK NOW</div>
              </div>
            </div>
            <div className="lj-lbl" style={{ color: '#00d4ff' }}>Email Sent</div>
            <div className="lj-desc">Invitation to book</div>
          </div>

          {/* Arrow 2 */}
          <div className="lj-arr">
            <div className="lj-dot" style={{ background: '#00d4ff' }} />
            <div className="lj-dot" style={{ background: '#a78bfa' }} />
            <div className="lj-dot" style={{ background: '#a78bfa' }} />
          </div>

          {/* BOOKING */}
          <div className="lj-st">
            <div className="lj-num" style={{ background: 'linear-gradient(135deg, #a78bfa, #7c5fc7)', color: '#0B0F19' }}>03</div>
            <div className="lj-card" style={{ border: '1px solid rgba(167,139,250,0.12)' }}>
              <div className="lj-mk-book">
                <div className="lj-mk-cal-head">
                  <span className="lj-mk-cal-nav">&lsaquo;</span>
                  <span className="lj-mk-cal-mo">March</span>
                  <span className="lj-mk-cal-nav">&rsaquo;</span>
                </div>
                <div className="lj-mk-cal-grid">
                  {Array.from({ length: 28 }, (_, d) => (
                    <div
                      key={d}
                      className={`lj-mk-cal-day${d === 14 ? ' lj-active' : ''}${d < 5 ? ' lj-past' : ''}`}
                    >
                      {d + 1}
                    </div>
                  ))}
                </div>
                <div className="lj-mk-time">
                  <span className="lj-mk-time-slot">10am</span>
                  <span className="lj-mk-time-slot lj-picked">2pm</span>
                  <span className="lj-mk-time-slot">4pm</span>
                </div>
              </div>
            </div>
            <div className="lj-lbl" style={{ color: '#a78bfa' }}>Booked</div>
            <div className="lj-desc">Appointment set</div>
          </div>

          {/* Arrow 3 */}
          <div className="lj-arr">
            <div className="lj-dot" style={{ background: '#a78bfa' }} />
            <div className="lj-dot" style={{ background: '#ffc832' }} />
            <div className="lj-dot" style={{ background: '#ffc832' }} />
          </div>

          {/* PURCHASE */}
          <div className="lj-st">
            <div className="lj-num" style={{ background: 'linear-gradient(135deg, #ffc832, #ff9500)', color: '#0B0F19' }}>04</div>
            <div className="lj-card" style={{ border: '1px solid rgba(255,200,50,0.12)' }}>
              <div className="lj-mk-buy">
                <div className="lj-mk-product">
                  <span className="lj-mk-product-icon">&#9733;</span>
                </div>
                <div className="lj-mk-price">$249.00</div>
                <div className="lj-mk-card-row">
                  <div className="lj-mk-cc" />
                  <span className="lj-mk-cc-dots">&bull;&bull;&bull;&bull; 4242</span>
                </div>
                <div className="lj-mk-pay-btn">PAY NOW</div>
              </div>
            </div>
            <div className="lj-lbl" style={{ color: '#ffc832' }}>Purchase</div>
            <div className="lj-desc">Buys the product</div>
          </div>

          {/* Arrow 4 */}
          <div className="lj-arr">
            <div className="lj-dot" style={{ background: '#ffc832' }} />
            <div className="lj-dot" style={{ background: '#6EE05A' }} />
            <div className="lj-dot" style={{ background: '#6EE05A' }} />
          </div>

          {/* 5-STAR REVIEW */}
          <div className="lj-st">
            <div className="lj-num" style={{ background: 'linear-gradient(135deg, #6EE05A, #4CAF3D)', color: '#0B0F19' }}>05</div>
            <div className="lj-card" style={{ borderColor: 'rgba(126,217,87,0.25)' }}>
              <div className="lj-mk-rev">
                <div className="lj-mk-stars">
                  <span className="lj-mk-star">&#9733;</span>
                  <span className="lj-mk-star">&#9733;</span>
                  <span className="lj-mk-star">&#9733;</span>
                  <span className="lj-mk-star">&#9733;</span>
                  <span className="lj-mk-star">&#9733;</span>
                </div>
                <div className="lj-mk-rev-text">&ldquo;Amazing service! Highly recommend.&rdquo;</div>
                <div className="lj-mk-rev-badge">VERIFIED</div>
              </div>
            </div>
            <div className="lj-lbl" style={{ color: '#6EE05A' }}>5-Star Review</div>
            <div className="lj-desc">Customer for life</div>
          </div>
        </div>

        {/* === CONVEYOR BELT === */}
        <div className="lj-belt">
          <div className="lj-belt-track">
            {[0, 1].map(set => (
              <div className="lj-belt-set" key={set}>
                <div className="lj-belt-item lj-bi-form">Form Fill</div>
                <span className="lj-belt-arr">&rarr;</span>
                <div className="lj-belt-item lj-bi-email">Email</div>
                <span className="lj-belt-arr">&rarr;</span>
                <div className="lj-belt-item lj-bi-book">Booking</div>
                <span className="lj-belt-arr">&rarr;</span>
                <div className="lj-belt-item lj-bi-buy">Purchase</div>
                <span className="lj-belt-arr">&rarr;</span>
                <div className="lj-belt-item lj-bi-review">5-Star Review</div>
                <span className="lj-belt-arr" style={{ margin: '0 12px' }}>&bull;</span>
              </div>
            ))}
          </div>
          <div className="lj-belt-line" />
        </div>
      </div>

      {/* Decorative elements */}
      <svg style={{ position: 'absolute', top: 20, right: '8%', width: 40, height: 40, opacity: 0.06, animation: 'ljPulseBtn 4s ease-in-out infinite' }} viewBox="0 0 40 40">
        <path d="M20 2l5 10 10 2-7 7 2 10-10-5-10 5 2-10-7-7 10-2z" fill="#00d4ff" />
      </svg>
      <svg style={{ position: 'absolute', bottom: 55, left: '6%', width: 35, height: 35, opacity: 0.06, animation: 'ljPulseBtn 5s ease-in-out infinite 1s' }} viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="12" fill="none" stroke="#a78bfa" strokeWidth="2" />
        <circle cx="20" cy="20" r="4" fill="#a78bfa" />
      </svg>
    </section>
  )
}
