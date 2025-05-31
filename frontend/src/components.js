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

// Returns a simple SVG representation of a Waveshare ESP32-C6 Zero board with pins on top and bottom, LCD in the middle, and PCB style
export function esp32({ x = 0, y = 0, cellSize = 30, width = 10, height = 5 } = {}) {
	// width: 10 columns, height: 5 rows (arbitrary, fits breadboard scale)
	const w = width * cellSize;
	const h = height * cellSize;
	const pinCount = 20; // 10 top, 10 bottom
	const pinLength = cellSize * 0.4;
	const pinRadius = cellSize * 0.13;
	const pinSpacing = w / (pinCount / 2);
	const pins = [];
	// Top pins
	for (let i = 1; i <= pinCount / 2; i++) {
		pins.push(
			<rect
				key={`pin-t-${i}`}
				x={x + i * pinSpacing - pinRadius - 15}
				y={y - pinLength}
				width={pinRadius * 2}
				height={pinLength}
				rx={pinRadius * 0.5}
				fill="#888"
				stroke="#444"
				strokeWidth={0.5}
			/>
		);
	}
	// Bottom pins
	for (let i = 1; i <= pinCount / 2; i++) {
		pins.push(
			<rect
				key={`pin-b-${i}`}
				x={x + i * pinSpacing - pinRadius - 15}
				y={y + h}
				width={pinRadius * 2}
				height={pinLength}
				rx={pinRadius * 0.5}
				fill="#888"
				stroke="#444"
				strokeWidth={0.5}
			/>
		);
	}
	// LCD in the middle
	const lcdW = w * 0.8;
	const lcdH = h * 0.62;
	const lcdX = x + w * 0.1;
	const lcdY = y + h * 0.24;
	// PCB style: green with gold pads
	return (
		<g>
			{/* PCB body */}
			<rect
				x={x}
				y={y+5}
				width={w}
				height={h-10}
				rx={cellSize * 0.3}
				fill="#0077b6"
				stroke="#145214"
				strokeWidth={2}
			/>
			{/* LCD */}
			<rect
				x={lcdX}
				y={lcdY}
				width={lcdW}
				height={lcdH}
				rx={cellSize * 0.08}
				fill="#222"
				stroke="#0ff"
				strokeWidth={2}
			/>
			{/* LCD highlight */}
			<rect
				x={lcdX + lcdW * 0.1}
				y={lcdY + lcdH * 0.15}
				width={lcdW * 0.8}
				height={lcdH * 0.2}
				rx={cellSize * 0.03}
				fill="#0ff"
				opacity="0.18"
			/>
			{/* Gold pads (simulate SMD pads on left/right) */}
			{[...Array(4)].map((_, i) => (
				<rect
					key={`pad-l-${i}`}
					x={x - cellSize * 0.18}
					y={y + h * 0.18 + i * h * 0.18}
					width={cellSize * 0.13}
					height={cellSize * 0.32}
					rx={cellSize * 0.03}
					fill="#FFD700"
					stroke="#B8860B"
					strokeWidth={0.5}
				/>
			))}
			{[...Array(4)].map((_, i) => (
				<rect
					key={`pad-r-${i}`}
					x={x + w + cellSize * 0.05}
					y={y + h * 0.18 + i * h * 0.18}
					width={cellSize * 0.13}
					height={cellSize * 0.32}
					rx={cellSize * 0.03}
					fill="#FFD700"
					stroke="#B8860B"
					strokeWidth={0.5}
				/>
			))}
			{/* Label */}
			<text
				x={x + w / 2}
				y={y + h * 0.18}
				textAnchor="middle"
				fontSize={cellSize * 0.7}
				fill="#fff"
				fontFamily="monospace"
				fontWeight="bold"
			>
				SemiBlock ESP32
			</text>
			{/* Pins */}
			{pins}
		</g>
	);
}
