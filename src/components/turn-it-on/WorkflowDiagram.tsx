'use client'

import ServiceLogo from '@/components/ServiceLogo'

interface WorkflowDiagramProps {
  triggerLogo: string | null
  triggerName: string
  actionLogo: string | null
  actionName: string
  triggerIcon?: string
  actionIcon?: string
}

export default function WorkflowDiagram({
  triggerLogo,
  triggerName,
  actionLogo,
  actionName,
  triggerIcon,
  actionIcon,
}: WorkflowDiagramProps) {
  return (
    <section className="py-16">
      <div className="section-container">
        <h2
          className="text-2xl md:text-3xl font-bold text-center mb-12"
          style={{ color: 'var(--text-primary)' }}
        >
          How Data Flows
        </h2>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
          {/* Trigger Service */}
          <div
            className="glow-box flex flex-col items-center justify-center w-48 h-48 text-center"
            style={{ flexShrink: 0 }}
          >
            <span className="mb-3">
              <ServiceLogo src={triggerLogo} alt={triggerName} size={48} icon={triggerIcon} />
            </span>
            <span
              className="text-sm font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              {triggerName}
            </span>
            <span
              className="text-xs mt-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Trigger
            </span>
          </div>

          {/* Arrow 1 */}
          <div className="flex items-center justify-center w-20 md:w-28 py-4 md:py-0">
            <div className="workflow-arrow">
              <svg
                className="hidden md:block"
                width="100"
                height="24"
                viewBox="0 0 100 24"
                fill="none"
              >
                <path
                  d="M0 12H90M90 12L80 4M90 12L80 20"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-flow-right"
                />
              </svg>
              <svg
                className="block md:hidden"
                width="24"
                height="40"
                viewBox="0 0 24 40"
                fill="none"
              >
                <path
                  d="M12 0V32M12 32L4 24M12 32L20 24"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-flow-down"
                />
              </svg>
            </div>
          </div>

          {/* 0nMCP Hub */}
          <div
            className="flex flex-col items-center justify-center w-48 h-48 text-center rounded-xl animate-pulse-glow"
            style={{
              flexShrink: 0,
              backgroundColor: 'var(--bg-card)',
              border: '2px solid var(--accent)',
              boxShadow: '0 0 30px rgba(126, 217, 87, 0.15)',
            }}
          >
            <span
              className="text-2xl font-bold mb-2"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent)',
              }}
            >
              0nMCP
            </span>
            <span
              className="text-xs"
              style={{ color: 'var(--text-secondary)' }}
            >
              Orchestrator
            </span>
          </div>

          {/* Arrow 2 */}
          <div className="flex items-center justify-center w-20 md:w-28 py-4 md:py-0">
            <div className="workflow-arrow">
              <svg
                className="hidden md:block"
                width="100"
                height="24"
                viewBox="0 0 100 24"
                fill="none"
              >
                <path
                  d="M0 12H90M90 12L80 4M90 12L80 20"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-flow-right"
                />
              </svg>
              <svg
                className="block md:hidden"
                width="24"
                height="40"
                viewBox="0 0 24 40"
                fill="none"
              >
                <path
                  d="M12 0V32M12 32L4 24M12 32L20 24"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-flow-down"
                />
              </svg>
            </div>
          </div>

          {/* Action Service */}
          <div
            className="glow-box flex flex-col items-center justify-center w-48 h-48 text-center"
            style={{ flexShrink: 0 }}
          >
            <span className="mb-3">
              <ServiceLogo src={actionLogo} alt={actionName} size={48} icon={actionIcon} />
            </span>
            <span
              className="text-sm font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              {actionName}
            </span>
            <span
              className="text-xs mt-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Action
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes flowRight {
          0% {
            stroke-dashoffset: 100;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes flowDown {
          0% {
            stroke-dashoffset: 60;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        .animate-flow-right {
          stroke-dasharray: 8 6;
          animation: flowRight 1.5s linear infinite;
        }
        .animate-flow-down {
          stroke-dasharray: 8 6;
          animation: flowDown 1.5s linear infinite;
        }
      `}</style>
    </section>
  )
}
