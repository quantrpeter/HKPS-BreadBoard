// Returns the layout of a breadboard as SVG holes (22 columns x 12 rows)
export function breadboard({ x = 0, y = 0, cellSize = 30 } = {}) {
  const cols = 22;
  const rows = 12;
  const holes = [];
  // Typical breadboard: 2 power rails (top/bottom), 2 main blocks (split by a gap)
  // We'll render holes as small circles
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Power rails: rows 0,1 and 10,11
      // Main blocks: rows 2-4 and 7-9 (gap between 4 and 7)
      let isHole = false;
      if (row < 2 || row > 9) {
        isHole = true; // power rails
      } else if ((row >= 2 && row <= 4) || (row >= 7 && row <= 9)) {
        isHole = true; // main blocks
      }
      if (isHole) {
        holes.push(
          <circle
            key={`hole-${row}-${col}`}
            cx={x + col * cellSize + cellSize / 2}
            cy={y + row * cellSize + cellSize / 2}
            r={cellSize * 0.18}
            fill="#222"
          />
        );
      }
    }
  }
  // Optionally, add a rectangle outline for the breadboard body
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={cols * cellSize}
        height={rows * cellSize}
        rx={cellSize / 2}
        fill="#f5f5f5"
        stroke="#bbb"
        strokeWidth={2}
      />
      {holes}
    </g>
  );
}
