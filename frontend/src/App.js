import React, { useState } from 'react';
import './App.css';

const COMPONENTS = [
	{ type: 'resistor', label: 'Resistor' },
	{ type: 'capacitor', label: 'Capacitor' },
];

const ROWS = 5; // A-E
const COLS = 10;
const Y_OFFSET = 30;
const HOLE_SIZE = 18;
const HOLE_SPACING_X = 30;
const HOLE_SPACING_Y = 30;
const BOARD_PADDING = 40;
const POWER_RAIL_OFFSET = 10;
const POWER_RAIL_LABEL_OFFSET = 15;
const BOARD_WIDTH = BOARD_PADDING * 2 + (COLS - 1) * HOLE_SPACING_X;
const BOARD_HEIGHT = BOARD_PADDING * 2 + ROWS * HOLE_SPACING_Y + POWER_RAIL_OFFSET;

function App() {
	const [draggedComponent, setDraggedComponent] = useState(null);
	const [placedComponents, setPlacedComponents] = useState([]);
	const [wireStart, setWireStart] = useState(null); // {row, col, section}

	// Helper to get SVG coordinates for a hole
	const getHoleCoords = (row, col, section) => {
		let x = BOARD_PADDING + col * HOLE_SPACING_X;
		let y = BOARD_PADDING + row * HOLE_SPACING_Y;
		if (section === 'vcc') y = Y_OFFSET;
		if (section === 'gnd') y = Y_OFFSET + HOLE_SPACING_Y;
		if (section === 'main') y = Y_OFFSET + HOLE_SPACING_Y * (row + 2);
		if (section === 'gnd-bottom') y = Y_OFFSET + HOLE_SPACING_Y * (ROWS + 2);
		if (section === 'vcc-bottom') y = Y_OFFSET + HOLE_SPACING_Y * (ROWS + 3);
		return { x, y };
	};

	// Start or complete wire placement on click
	const handleHoleClick = (row, col, section) => {
		if (!wireStart) {
			setWireStart({ row, col, section });
		} else if (wireStart.row !== row || wireStart.col !== col || wireStart.section !== section) {
			setPlacedComponents([
				...placedComponents,
				{
					type: 'wire',
					row1: wireStart.row,
					col1: wireStart.col,
					section1: wireStart.section,
					row2: row,
					col2: col,
					section2: section,
					id: Date.now() + Math.random(),
				},
			]);
			setWireStart(null);
		} else {
			setWireStart(null);
		}
	};

	// Drag and drop for resistors/capacitors
	const handleDragStart = (component) => {
		setDraggedComponent(component);
	};
	const handleDrop = (row, col, section) => {
		if (draggedComponent) {
			setPlacedComponents([
				...placedComponents,
				{ ...draggedComponent, row, col, section, id: Date.now() + Math.random() },
			]);
			setDraggedComponent(null);
		}
	};
	const handleDragOver = (e) => { e.preventDefault(); };

	// Render all wires as SVG lines
	const renderWires = () => {
		const wires = placedComponents.filter((c) => c.type === 'wire');
		const lines = wires.map((wire) => {
			const p1 = getHoleCoords(wire.row1, wire.col1, wire.section1);
			const p2 = getHoleCoords(wire.row2, wire.col2, wire.section2);
			return (
				<line
					key={wire.id}
					x1={p1.x}
					y1={p1.y}
					x2={p2.x}
					y2={p2.y}
					stroke="green"
					strokeWidth={4}
					strokeLinecap="round"
				/>
			);
		});
		return lines;
	};

	// Render all holes as SVG circles
	const renderHoles = (section) => {
		let holes = [];
		for (let col = 0; col < COLS; col++) {
			for (let row = 0; row < ROWS; row++) {
				const { x, y } = getHoleCoords(row, col, section);
				const placed = placedComponents.find(
					(c) => c.section === section && c.row === row && c.col === col && c.type !== 'wire'
				);
				holes.push(
					<circle
						key={`${section}-${row}-${col}`}
						cx={x}
						cy={y}
						r={HOLE_SIZE / 2}
						fill="#fff"
						stroke="#bbb"
						strokeWidth={2}
						style={{ cursor: 'pointer' }}
						onClick={() => handleHoleClick(row, col, section)}
					/>
				);
				if (placed) {
					holes.push(
						<text
							key={`comp-${section}-${row}-${col}`}
							x={x}
							y={y + 5}
							textAnchor="middle"
							fontSize="18"
							pointerEvents="none"
						>
							{placed.type === 'resistor' ? '⏦' : placed.type === 'capacitor' ? '‖' : ''}
						</text>
					);
				}
			}
		}
		return holes;
	};

	// Render power rail holes
	const renderPowerRailHoles = (section, label, color, yLabel) => {
		let holes = [];
		for (let col = 0; col < COLS; col++) {
			const { x, y } = getHoleCoords(0, col, section);
			holes.push(
				<circle
					key={`${section}-0-${col}-${yLabel}`}
					cx={x}
					cy={y}
					r={HOLE_SIZE / 2}
					fill="#fff"
					stroke={color}
					strokeWidth={2}
					style={{ cursor: 'pointer' }}
					onClick={() => handleHoleClick(0, col, section + (yLabel ? '-' + yLabel : ''))}
				/>
			);
		}
		// Label
		holes.push(
			<text
				key={`label-${section}-${yLabel}`}
				x={POWER_RAIL_LABEL_OFFSET}
				y={yLabel}
				fill={color}
				fontWeight="bold"
				fontSize="18"
				textAnchor="middle"
			>
				{label}
			</text>
		);
		return holes;
	};

	return (
		<div className="breadboard-app" style={{ display: 'flex', height: '100vh', background: '#eaeaea' }}>
			{/* Sidebar */}
			<div className="sidebar" style={{ width: 150, background: '#f4f4f4', padding: 16 }}>
				<h3>Components</h3>
				{COMPONENTS.map((comp) => (
					<div
						key={comp.type}
						draggable
						onDragStart={() => handleDragStart(comp)}
						style={{
							border: '1px solid #ccc',
							borderRadius: 4,
							padding: 8,
							marginBottom: 8,
							background: '#fff',
							cursor: 'grab',
							textAlign: 'center',
						}}
					>
						{comp.label}
					</div>
				))}
				<div style={{ marginTop: 24, color: '#888', fontSize: 13 }}>
					<b>Wire:</b> Click and drag between holes
				</div>
			</div>
			{/* SVG Breadboard */}
			<div style={{ margin: 'auto', position: 'relative' }}>
				<svg
					width={BOARD_WIDTH}
					height={BOARD_HEIGHT + 2 * HOLE_SPACING_Y}
					style={{ display: 'block', position: 'relative', zIndex: 1 }}
				>
					{/* Board background */}
					<rect x={0} y={0} width={BOARD_WIDTH} height={BOARD_HEIGHT + 2 * HOLE_SPACING_Y} rx={0} fill="#f9f9f9" stroke="#bbb" strokeWidth={3} />
					{/* Holes */}
					{renderHoles('main')}
					{/* Power rail holes: top */}
					{renderPowerRailHoles('vcc', '+', 'red', 35)}
					{renderPowerRailHoles('gnd', '-', 'blue', 65)}
					{/* Power rail holes: bottom (new rows) */}
					{renderPowerRailHoles('gnd-bottom', '-', 'blue', 245)}
					{renderPowerRailHoles('vcc-bottom', '+', 'red', 275)}
					{/* Wires (drawn last, so they appear below holes) */}
					{renderWires()}
				</svg>
			</div>
		</div>
	);
}

export default App;
