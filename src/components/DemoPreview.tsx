'use client';

import { useEffect, useState, useCallback } from 'react';

// ── Constants ──────────────────────────────────────────────────────────

const TYPING_SPEED = 30; // ms per character
const STEP_STAGGER = 800; // ms between pipeline steps
const INITIAL_DELAY = 500; // ms before animations begin
const RESULT_HOLD = 3000; // ms to show results before looping
const PROGRESS_DURATION = 600; // ms for each progress bar fill

const COMMAND_TEXT =
  'Create a Stripe invoice for $500, email it via SendGrid, and log it in the CRM';

const PIPELINE_STEPS = [
  { service: 'Stripe', action: 'Create Invoice', color: '#635bff' },
  { service: 'SendGrid', action: 'Email Invoice', color: '#1a82e2' },
  { service: 'CRM', action: 'Log Activity', color: '#ff6b35' },
];

const RESULT_LINES = [
  'Invoice #INV-2847 created',
  'Email sent to client@example.com',
  'CRM activity logged',
];

// ── Types ──────────────────────────────────────────────────────────────

type Phase =
  | 'idle'
  | 'typing'
  | 'typed'
  | 'response'
  | 'pipeline'
  | 'result';

interface StepState {
  started: boolean;
  progress: number; // 0-100
  done: boolean;
}

// ── Component ──────────────────────────────────────────────────────────

export default function DemoPreview() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [typedLength, setTypedLength] = useState(0);
  const [steps, setSteps] = useState<StepState[]>(
    PIPELINE_STEPS.map(() => ({ started: false, progress: 0, done: false }))
  );
  const [resultVisible, setResultVisible] = useState(false);

  // Reset everything to initial state
  const reset = useCallback(() => {
    setPhase('idle');
    setTypedLength(0);
    setSteps(PIPELINE_STEPS.map(() => ({ started: false, progress: 0, done: false })));
    setResultVisible(false);
  }, []);

  // ── Master sequencer ─────────────────────────────────────────────────

  useEffect(() => {
    if (phase === 'idle') {
      const t = setTimeout(() => setPhase('typing'), INITIAL_DELAY);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Typing animation
  useEffect(() => {
    if (phase !== 'typing') return;

    if (typedLength < COMMAND_TEXT.length) {
      const t = setTimeout(() => setTypedLength((l) => l + 1), TYPING_SPEED);
      return () => clearTimeout(t);
    } else {
      // Typing complete, show blinking cursor briefly then response
      const t = setTimeout(() => setPhase('typed'), 400);
      return () => clearTimeout(t);
    }
  }, [phase, typedLength]);

  // After typed, show "Processing..." response
  useEffect(() => {
    if (phase !== 'typed') return;
    const t = setTimeout(() => setPhase('response'), 600);
    return () => clearTimeout(t);
  }, [phase]);

  // After response, start pipeline
  useEffect(() => {
    if (phase !== 'response') return;
    const t = setTimeout(() => setPhase('pipeline'), 800);
    return () => clearTimeout(t);
  }, [phase]);

  // Pipeline step execution with staggered delays
  useEffect(() => {
    if (phase !== 'pipeline') return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    PIPELINE_STEPS.forEach((_, i) => {
      // Start step
      const startDelay = i * STEP_STAGGER;
      timers.push(
        setTimeout(() => {
          setSteps((prev) => {
            const next = [...prev];
            next[i] = { ...next[i], started: true };
            return next;
          });
        }, startDelay)
      );

      // Animate progress in increments
      const progressSteps = 10;
      for (let p = 1; p <= progressSteps; p++) {
        timers.push(
          setTimeout(() => {
            setSteps((prev) => {
              const next = [...prev];
              next[i] = { ...next[i], progress: (p / progressSteps) * 100 };
              return next;
            });
          }, startDelay + (PROGRESS_DURATION / progressSteps) * p)
        );
      }

      // Mark done
      timers.push(
        setTimeout(() => {
          setSteps((prev) => {
            const next = [...prev];
            next[i] = { ...next[i], done: true };
            return next;
          });
        }, startDelay + PROGRESS_DURATION + 100)
      );
    });

    // After all steps, move to result
    const totalPipelineTime =
      (PIPELINE_STEPS.length - 1) * STEP_STAGGER + PROGRESS_DURATION + 300;
    timers.push(
      setTimeout(() => {
        setPhase('result');
      }, totalPipelineTime)
    );

    return () => timers.forEach(clearTimeout);
  }, [phase]);

  // Result phase: fade in, hold, then loop
  useEffect(() => {
    if (phase !== 'result') return;

    const t1 = setTimeout(() => setResultVisible(true), 200);
    const t2 = setTimeout(() => {
      reset();
    }, 200 + RESULT_HOLD);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase, reset]);

  // ── Styles ───────────────────────────────────────────────────────────

  const windowChrome = (title: string): React.CSSProperties => ({
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    overflow: 'hidden',
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
  });

  const titleBarStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-secondary)',
  };

  const dotStyle = (color: string): React.CSSProperties => ({
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: color,
    flexShrink: 0,
  });

  const titleTextStyle: React.CSSProperties = {
    fontSize: '11px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
    marginLeft: '8px',
    textTransform: 'uppercase',
  };

  const panelBodyStyle: React.CSSProperties = {
    padding: '20px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    minHeight: '220px',
  };

  // ── Render helpers ───────────────────────────────────────────────────

  const renderWindowChrome = (
    panelNumber: string,
    label: string,
    children: React.ReactNode
  ) => (
    <div className="demo-panel" style={windowChrome(label)}>
      <div style={titleBarStyle}>
        <div style={dotStyle('#ff5f57')} />
        <div style={dotStyle('#febc2e')} />
        <div style={dotStyle('#28c840')} />
        <span style={titleTextStyle}>
          {panelNumber} {label}
        </span>
      </div>
      <div style={panelBodyStyle}>{children}</div>
    </div>
  );

  // ── Panel 1: Describe ────────────────────────────────────────────────

  const renderDescribePanel = () => {
    const showCursor =
      phase === 'typing' || phase === 'typed';
    const showResponse =
      phase === 'response' || phase === 'pipeline' || phase === 'result';

    return renderWindowChrome('01', 'Describe', (
      <>
        {/* Prompt line */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <span
            style={{
              color: 'var(--accent)',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              fontWeight: 600,
              flexShrink: 0,
              lineHeight: '1.6',
            }}
          >
            &gt;
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'var(--text-primary)',
              lineHeight: '1.6',
              wordBreak: 'break-word',
            }}
          >
            {COMMAND_TEXT.slice(0, typedLength)}
            {showCursor && (
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '16px',
                  background: 'var(--accent)',
                  marginLeft: '2px',
                  verticalAlign: 'text-bottom',
                  animation: 'demoCursorBlink 1s step-end infinite',
                }}
              />
            )}
          </span>
        </div>

        {/* Response */}
        <div
          style={{
            marginTop: '8px',
            opacity: showResponse ? 1 : 0,
            transform: showResponse ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--accent-dim)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--accent)',
                animation: 'demoPulse 1.5s ease-in-out infinite',
              }}
            />
            Processing 3 services...
          </span>
        </div>

        {/* Inject keyframes via style tag */}
        <style>{`
          @keyframes demoCursorBlink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          @keyframes demoPulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }
        `}</style>
      </>
    ));
  };

  // ── Panel 2: Orchestrate ─────────────────────────────────────────────

  const renderOrchestratePanel = () => {
    return renderWindowChrome('02', 'Orchestrate', (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {PIPELINE_STEPS.map((step, i) => {
          const s = steps[i];
          return (
            <div
              key={step.service}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                opacity: s.started ? 1 : 0.25,
                transition: 'opacity 0.3s ease',
              }}
            >
              {/* Service dot */}
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: step.color,
                  flexShrink: 0,
                  boxShadow: s.started
                    ? `0 0 8px ${step.color}60`
                    : 'none',
                  transition: 'box-shadow 0.3s ease',
                }}
              />

              {/* Service + action labels */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  minWidth: '90px',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}
                >
                  {step.service}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                  }}
                >
                  {step.action}
                </span>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  flex: 1,
                  height: '4px',
                  background: 'var(--bg-primary)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  minWidth: '40px',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${s.progress}%`,
                    background: s.done
                      ? 'var(--accent)'
                      : step.color,
                    borderRadius: '2px',
                    transition: `width ${PROGRESS_DURATION / 10}ms linear`,
                  }}
                />
              </div>

              {/* Checkmark */}
              <span
                style={{
                  fontSize: '14px',
                  color: 'var(--accent)',
                  opacity: s.done ? 1 : 0,
                  transform: s.done ? 'scale(1)' : 'scale(0.5)',
                  transition: 'opacity 0.3s ease, transform 0.3s ease',
                  width: '18px',
                  textAlign: 'center',
                  flexShrink: 0,
                }}
              >
                &#10003;
              </span>
            </div>
          );
        })}
      </div>
    ));
  };

  // ── Panel 3: Done ────────────────────────────────────────────────────

  const renderDonePanel = () => {
    const allDone = steps.every((s) => s.done);
    const show = phase === 'result' && resultVisible;

    return renderWindowChrome('03', 'Done', (
      <div
        style={{
          opacity: show ? 1 : 0,
          transform: show ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--accent)',
            }}
          >
            3/3 Complete
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-muted)',
              background: 'var(--bg-primary)',
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
            }}
          >
            0.4s total
          </span>
        </div>

        {/* Divider */}
        <div
          style={{
            height: '1px',
            background: 'var(--border)',
          }}
        />

        {/* Result lines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {RESULT_LINES.map((line, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                opacity: show ? 1 : 0,
                transform: show ? 'translateX(0)' : 'translateX(-8px)',
                transition: `opacity 0.4s ease ${i * 100}ms, transform 0.4s ease ${i * 100}ms`,
              }}
            >
              <span
                style={{
                  color: 'var(--accent)',
                  fontSize: '12px',
                  flexShrink: 0,
                }}
              >
                &#10003;
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                }}
              >
                {line}
              </span>
            </div>
          ))}
        </div>
      </div>
    ));
  };

  // ── Main render ──────────────────────────────────────────────────────

  return (
    <div
      className="demo-preview"
      style={{
        display: 'flex',
        gap: '16px',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .demo-preview {
            flex-direction: column !important;
          }
        }
      `}</style>
      {renderDescribePanel()}
      {renderOrchestratePanel()}
      {renderDonePanel()}
    </div>
  );
}
