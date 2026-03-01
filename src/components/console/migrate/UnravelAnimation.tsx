'use client'

export default function UnravelAnimation() {
  // Pentagon positions for 5 nodes (centered in 200x200 viewbox)
  const nodes = [
    { cx: 100, cy: 25 },  // top
    { cx: 172, cy: 80 },  // top-right
    { cx: 145, cy: 165 }, // bottom-right
    { cx: 55, cy: 165 },  // bottom-left
    { cx: 28, cy: 80 },   // top-left
  ]

  // Lines connecting adjacent + some cross-connections
  const lines = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 0],
    [0, 2], [1, 3],
  ]

  // Final column positions (vertical stack)
  const finalNodes = [
    { cx: 100, cy: 20 },
    { cx: 100, cy: 55 },
    { cx: 100, cy: 90 },
    { cx: 100, cy: 125 },
    { cx: 100, cy: 160 },
  ]

  return (
    <div
      style={{
        width: 200,
        height: 200,
        margin: '0 auto',
        position: 'relative',
      }}
    >
      <style>{`
        @keyframes unravel-shake {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-2px, 1px); }
          20% { transform: translate(2px, -1px); }
          30% { transform: translate(-1px, -2px); }
          40% { transform: translate(1px, 2px); }
          50% { transform: translate(-2px, -1px); }
          60% { transform: translate(2px, 1px); }
          70% { transform: translate(-1px, 2px); }
          80% { transform: translate(1px, -2px); }
          90% { transform: translate(-2px, 0px); }
        }

        @keyframes unravel-line-fade {
          0%, 37% { opacity: 0.6; }
          38%, 74% { opacity: 0; }
          75%, 100% { opacity: 0; }
        }

        @keyframes unravel-new-line {
          0%, 74% { opacity: 0; }
          75% { opacity: 0; }
          85%, 100% { opacity: 0.5; }
        }

        @keyframes unravel-node-0 {
          0%, 37% { cx: ${nodes[0].cx}px; cy: ${nodes[0].cy}px; }
          38%, 50% { cx: ${nodes[0].cx + 15}px; cy: ${nodes[0].cy - 20}px; }
          75%, 100% { cx: ${finalNodes[0].cx}px; cy: ${finalNodes[0].cy}px; }
        }
        @keyframes unravel-node-1 {
          0%, 37% { cx: ${nodes[1].cx}px; cy: ${nodes[1].cy}px; }
          38%, 50% { cx: ${nodes[1].cx + 25}px; cy: ${nodes[1].cy + 10}px; }
          75%, 100% { cx: ${finalNodes[1].cx}px; cy: ${finalNodes[1].cy}px; }
        }
        @keyframes unravel-node-2 {
          0%, 37% { cx: ${nodes[2].cx}px; cy: ${nodes[2].cy}px; }
          38%, 50% { cx: ${nodes[2].cx + 20}px; cy: ${nodes[2].cy + 20}px; }
          75%, 100% { cx: ${finalNodes[2].cx}px; cy: ${finalNodes[2].cy}px; }
        }
        @keyframes unravel-node-3 {
          0%, 37% { cx: ${nodes[3].cx}px; cy: ${nodes[3].cy}px; }
          38%, 50% { cx: ${nodes[3].cx - 25}px; cy: ${nodes[3].cy + 15}px; }
          75%, 100% { cx: ${finalNodes[3].cx}px; cy: ${finalNodes[3].cy}px; }
        }
        @keyframes unravel-node-4 {
          0%, 37% { cx: ${nodes[4].cx}px; cy: ${nodes[4].cy}px; }
          38%, 50% { cx: ${nodes[4].cx - 20}px; cy: ${nodes[4].cy - 15}px; }
          75%, 100% { cx: ${finalNodes[4].cx}px; cy: ${finalNodes[4].cy}px; }
        }

        .unravel-group {
          animation: unravel-shake 0.5s ease-in-out infinite;
          animation-duration: 0.4s;
        }

        .unravel-node {
          fill: var(--accent, #7ed957);
          filter: drop-shadow(0 0 6px var(--accent-glow, rgba(126,217,87,0.3)));
        }

        .unravel-node-0 { animation: unravel-node-0 4s ease-in-out infinite; }
        .unravel-node-1 { animation: unravel-node-1 4s ease-in-out infinite; }
        .unravel-node-2 { animation: unravel-node-2 4s ease-in-out infinite; }
        .unravel-node-3 { animation: unravel-node-3 4s ease-in-out infinite; }
        .unravel-node-4 { animation: unravel-node-4 4s ease-in-out infinite; }

        .unravel-old-line {
          stroke: var(--text-muted, #55556a);
          stroke-width: 1.5;
          fill: none;
          animation: unravel-line-fade 4s ease-in-out infinite;
        }

        .unravel-new-line {
          stroke: var(--accent, #7ed957);
          stroke-width: 1.5;
          fill: none;
          stroke-dasharray: 4 3;
          animation: unravel-new-line 4s ease-in-out infinite;
        }
      `}</style>

      <svg
        viewBox="0 0 200 200"
        width={200}
        height={200}
        style={{ overflow: 'visible' }}
      >
        {/* Phase 1-2: Original connection lines that fade */}
        <g className="unravel-group">
          {lines.map(([from, to], i) => (
            <line
              key={`old-${i}`}
              className="unravel-old-line"
              x1={nodes[from].cx}
              y1={nodes[from].cy}
              x2={nodes[to].cx}
              y2={nodes[to].cy}
              style={{ animationDelay: `${i * 0.05}s` }}
            />
          ))}
        </g>

        {/* Phase 3: New vertical connection lines */}
        {[0, 1, 2, 3].map((i) => (
          <line
            key={`new-${i}`}
            className="unravel-new-line"
            x1={finalNodes[i].cx}
            y1={finalNodes[i].cy + 8}
            x2={finalNodes[i + 1].cx}
            y2={finalNodes[i + 1].cy - 8}
          />
        ))}

        {/* Animated nodes */}
        {nodes.map((_, i) => (
          <circle
            key={`node-${i}`}
            className={`unravel-node unravel-node-${i}`}
            r={8}
            cx={nodes[i].cx}
            cy={nodes[i].cy}
          />
        ))}
      </svg>
    </div>
  )
}
