import React, { useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { breadboard as BreadboardSVG } from './components';
import Cookies from 'js-cookie';


function App() {
	const [zoom, setZoom] = useState(1);
	const [selectedComponent, setSelectedComponent] = useState(null);
	const [placedComponents, setPlacedComponents] = useState(() => {
		const saved = Cookies.get('placedComponents');
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				if (Array.isArray(parsed)) return parsed;
			} catch (e) {
				console.error('Failed to parse placed components from cookie:', e);
			}
		}
		return [];
	});
	const [previewPos, setPreviewPos] = useState(null);
	const [selectedPlacedIndex, setSelectedPlacedIndex] = useState(null);
	const [draggingIndex, setDraggingIndex] = useState(null);
	const [dragOffset, setDragOffset] = useState(null);

	const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, 4));
	const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.2));
	const handleZoomReset = () => setZoom(1);

	const componentList = [
		{ key: 'breadboard', label: 'Breadboard', icon: '/icons/breadboard.svg' },
		{ key: 'resistor', label: 'Resistor', icon: '/icons/resistor.svg' },
		{ key: 'led', label: 'LED', icon: '/icons/led.svg' },
		{ key: 'pushbutton', label: 'Pushbutton', icon: '/icons/pushbutton.svg' },
		{ key: 'capacitor', label: 'Capacitor', icon: '/icons/capacitor.svg' },
		{ key: 'diode', label: 'Diode', icon: '/icons/diode.svg' },
		{ key: 'inductor', label: 'Inductor', icon: '/icons/inductor.svg' },
		{ key: 'voltage', label: 'Voltage Source', icon: '/icons/voltage.svg' },
		{ key: 'ground', label: 'Ground', icon: '/icons/ground.svg' },
		{ key: 'oscilloscope', label: 'Oscilloscope', icon: '/icons/oscilloscope.svg' },
		{ key: 'voltmeter', label: 'Voltmeter', icon: '/icons/voltmeter.svg' },
		{ key: 'ammeter', label: 'Ammeter', icon: '/icons/ammeter.svg' },
		{ key: 'transformer', label: 'Transformer', icon: '/icons/transformer.svg' },
	];

	const handleComponentClick = (comp) => {
		setSelectedComponent(comp);
		setPreviewPos(null);
	};

	const handleSVGClick = (e) => {
		if (!selectedComponent) return;
		const svg = e.target.ownerSVGElement || e.target;
		const pt = svg.createSVGPoint();
		pt.x = e.clientX;
		pt.y = e.clientY;
		const cursorpt = pt.matrixTransform(svg.getScreenCTM().inverse());
		const cellSize = 30;
		let snappedX = Math.round(cursorpt.x / cellSize) * cellSize;
		let snappedY = Math.round(cursorpt.y / cellSize) * cellSize;

		if (selectedComponent.key === 'breadboard') {
			snappedX = snappedX - Math.floor((22 * cellSize) / 2) + cellSize / 2;
			snappedY = snappedY - Math.floor((12 * cellSize) / 2) + cellSize / 2;
		}

		setPlacedComponents(prev => [
			...prev,
			{
				...selectedComponent,
				x: snappedX,
				y: snappedY
			}
		]);
		setSelectedComponent(null);
		setPreviewPos(null);
	};

	const handlePlacedComponentClick = (e, idx) => {
		e.stopPropagation(); // Prevent triggering SVG click
		setSelectedPlacedIndex(idx);
	};

	const handlePlacedComponentMouseDown = (e, idx) => {
		e.stopPropagation();
		const svg = e.target.ownerSVGElement || e.target;
		const pt = svg.createSVGPoint();
		pt.x = e.clientX;
		pt.y = e.clientY;
		const cursorpt = pt.matrixTransform(svg.getScreenCTM().inverse());
		const comp = placedComponents[idx];
		console.log('x/y', cursorpt.x, cursorpt.y, comp.x, comp.y);
		// let offsetX, offsetY;
		// if (comp.key === 'breadboard') {
		// offsetX = cursorpt.x - comp.x;
		// offsetY = cursorpt.y - comp.y;
		// } else {
		// 	// For other components, comp.x/y is the center
		// 	offsetX = cursorpt.x - comp.x;
		// 	offsetY = cursorpt.y - comp.y;
		// }
		setDraggingIndex(idx);
		setDragOffset({ x: cursorpt.x, y: cursorpt.y, oriCompX: comp.x, oriCompY: comp.y });
	};

	const handleSVGMouseMove = (e) => {
		if (draggingIndex !== null) {
			const svg = e.target.ownerSVGElement || e.target;
			const pt = svg.createSVGPoint();
			pt.x = e.clientX;
			pt.y = e.clientY;
			const cursorpt = pt.matrixTransform(svg.getScreenCTM().inverse());
			const cellSize = 30;
			let snappedX, snappedY;
			const comp = placedComponents[draggingIndex];
			if (comp.key === 'breadboard') {
				console.log('cursorpt.x', cursorpt.x, 'dragOffset.oriCompX', dragOffset.oriCompX, 'dragOffset.oriCompX', dragOffset.oriCompX);
				snappedX = Math.round((cursorpt.x - dragOffset.x + dragOffset.oriCompX) / cellSize) * cellSize;
				snappedY = Math.round((cursorpt.y - dragOffset.y + dragOffset.oriCompY) / cellSize) * cellSize;
				snappedX += cellSize /2 - cellSize;
				snappedY += cellSize / 2 - cellSize;
			} else {
				snappedX = Math.round((cursorpt.x - dragOffset.x - dragOffset.oriCompX) / cellSize) * cellSize;
				snappedY = Math.round((cursorpt.y - dragOffset.y - dragOffset.oriCompY) / cellSize) * cellSize;
			}
			setPlacedComponents(prev => prev.map((c, i) => i === draggingIndex ? { ...c, x: snappedX, y: snappedY } : c));
			return;
		}
		if (!selectedComponent) return;
		const svg = e.target.ownerSVGElement || e.target;
		const pt = svg.createSVGPoint();
		pt.x = e.clientX;
		pt.y = e.clientY;
		const cursorpt = pt.matrixTransform(svg.getScreenCTM().inverse());
		const cellSize = 30;
		let snappedX = Math.round(cursorpt.x / cellSize) * cellSize;
		let snappedY = Math.round(cursorpt.y / cellSize) * cellSize;

		if (selectedComponent.key === 'breadboard') {
			snappedX = snappedX - Math.floor((22 * cellSize) / 2) + cellSize / 2;
			snappedY = snappedY - Math.floor((12 * cellSize) / 2) + cellSize / 2;
		}
		setPreviewPos({ x: snappedX, y: snappedY });
	};

	const handleSVGMouseUp = () => {
		setDraggingIndex(null);
		setDragOffset(null);
	};

	React.useEffect(() => {
		// Save placed components to cookie whenever they change
		// console.log('Saving placed components to cookie:', placedComponents);
		Cookies.set('placedComponents', JSON.stringify(placedComponents), { expires: 30 });
	}, [placedComponents]);

	const handleKeyDown = (e) => {
		if (e.key === 'Escape') {
			setSelectedComponent(null);
			setPreviewPos(null);
			setSelectedPlacedIndex(null);
		}
	};
	React.useEffect(() => {
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, []);

	const grid = (size = 200) => {
		const cellSize = 30;
		const rows = size;
		const cols = size;
		// Use a single SVG <g> with <line> elements for better performance
		const lines = [];
		// Vertical lines
		for (let x = 0; x <= cols; x++) {
			lines.push(
				<line
					key={`v-${x}`}
					x1={x * cellSize}
					y1={0}
					x2={x * cellSize}
					y2={rows * cellSize}
					stroke="#bbb"
					strokeWidth={1}
				/>
			);
		}
		// Horizontal lines
		for (let y = 0; y <= rows; y++) {
			lines.push(
				<line
					key={`h-${y}`}
					x1={0}
					y1={y * cellSize}
					x2={cols * cellSize}
					y2={y * cellSize}
					stroke="#bbb"
					strokeWidth={1}
				/>
			);
		}
		return <g>{lines}</g>;
	};

	return (
		<div className="breadboard-app">
			<div className="toolbar d-flex align-items-center justify-content-between">
				<div className="d-flex align-items-center">
					<button className="btn btn-light btn-sm me-3" onClick={() => setPlacedComponents([])} title="New Project">New Project</button>
				</div>
				<span>HKPS BreadBoard</span>
				<div>
					<button className="btn btn-light btn-sm me-2" onClick={handleZoomIn} title="Zoom In">＋</button>
					<button className="btn btn-light btn-sm me-2" onClick={handleZoomOut} title="Zoom Out">－</button>
					<button className="btn btn-light btn-sm" onClick={handleZoomReset} title="Reset Zoom">100%</button>
				</div>
			</div>
			<div className="main-content">
				<div className="components">
					<div className="components-title">Components</div>
					<select className="form-select components-dropdown">
						<option>Basic</option>
					</select>
					<div className="components-search">
						<input type="search" placeholder="Search" className="form-control components-search-input" />
					</div>
					<div className="container components-list">
						<div className="row">
							{componentList.map(comp => (
								<div key={comp.key} className="col-4 p-0 component-tile">
									<div
										className={`componentButton${selectedComponent && selectedComponent.key === comp.key ? ' selected' : ''}`}
										onClick={() => handleComponentClick(comp)}
										style={selectedComponent && selectedComponent.key === comp.key ? { outline: '2px solid #007bff', outlineOffset: '2px', boxShadow: '0 0 0 2px #b3d7ff' } : {}}
									>
										<img src={comp.icon} alt={comp.label} />
										<div>{comp.label}</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
				<div className="canvas-area">
					<svg id="mainSVG" style={{ transform: `scale(${zoom})`, transformOrigin: '0 0' }} onClick={handleSVGClick} onMouseMove={handleSVGMouseMove} onMouseUp={handleSVGMouseUp}>
						{grid()}
						{placedComponents.map((comp, i) => (
							comp.key === 'breadboard' ? (
								<g key={i} onClick={e => handlePlacedComponentClick(e, i)} onMouseDown={e => handlePlacedComponentMouseDown(e, i)} style={selectedPlacedIndex === i ? { filter: 'drop-shadow(0 0 0 3px #007bff)' } : { cursor: 'pointer' }}>
									<BreadboardSVG x={comp.x} y={comp.y} cellSize={30} />
									{selectedPlacedIndex === i && (
										<rect
											x={comp.x}
											y={comp.y}
											width={22 * 30}
											height={12 * 30}
											fill="none"
											stroke="#007bff"
											strokeWidth={3}
											pointerEvents="none"
										/>
									)}
								</g>
							) : (
								<g key={i} onClick={e => handlePlacedComponentClick(e, i)} onMouseDown={e => handlePlacedComponentMouseDown(e, i)} style={selectedPlacedIndex === i ? { filter: 'drop-shadow(0 0 0 3px #007bff)' } : { cursor: 'pointer' }}>
									<image
										href={comp.icon}
										x={comp.x - 20}
										y={comp.y - 20}
										width={40}
										height={40}
										style={{ pointerEvents: 'none' }}
									/>
									{selectedPlacedIndex === i && (
										<rect
											x={comp.x - 20}
											y={comp.y - 20}
											width={40}
											height={40}
											fill="none"
											stroke="#007bff"
											strokeWidth={3}
											pointerEvents="none"
										/>
									)}
								</g>
							)
						))}
						{selectedComponent && previewPos && (
							selectedComponent.key === 'breadboard' ? (
								<BreadboardSVG x={previewPos.x} y={previewPos.y} cellSize={30} opacity={0.5} />
							) : (
								<image
									href={selectedComponent.icon}
									x={previewPos.x - 20}
									y={previewPos.y - 20}
									width={40}
									height={40}
									opacity={0.5}
									style={{ pointerEvents: 'none' }}
								/>
							)
						)}
					</svg>
				</div>
			</div>
		</div>
	);
}

export default App;
