import React, { useRef, useState } from 'react';
import type { DutyStatus, LogInterval } from './types';
import { DutyPath } from './DutyPath';
import { intervalsToSlots, slotsToIntervals } from './utils/slots';
import { calculateHours } from './utils/calculateHours';

interface LogGridProps {
  intervals: LogInterval[];
  onChange: (newIntervals: LogInterval[]) => void;
  activeStatus: DutyStatus;
  setActiveStatus: (status: DutyStatus) => void;
}

const GRID_LEFT = 140;
const GRID_WIDTH = 720;
const GRID_TOP = 35;
const ROW_HEIGHT = 36; // 4 rows = 144px height
const GRID_BOTTOM = GRID_TOP + ROW_HEIGHT * 4;
const TOTAL_WIDTH = 920;
const TOTAL_HEIGHT = 210;

export const LogGrid: React.FC<LogGridProps> = ({
  intervals,
  onChange,
  activeStatus,
  setActiveStatus,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStartSlot, setDrawStartSlot] = useState<number | null>(null);
  const [drawCurrentSlot, setDrawCurrentSlot] = useState<number | null>(null);
  const [drawStatus, setDrawStatus] = useState<DutyStatus>('OFF_DUTY');
  
  // Keep track of hover slot to show visual feedback
  const [hoverSlot, setHoverSlot] = useState<number | null>(null);

  // Convert current intervals to 96 slots for easy editing
  const slots = intervalsToSlots(intervals);

  // Compute row totals
  const totals = calculateHours(intervals);

  // Convert screen coordinates to slot index and row index
  const getCoordsFromEvent = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    
    // Support mouse or touch events
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * TOTAL_WIDTH;
    const y = ((clientY - rect.top) / rect.height) * TOTAL_HEIGHT;

    // Calculate which slot (0 to 95) was touched
    const xInGrid = x - GRID_LEFT;
    const slot = Math.max(0, Math.min(95, Math.floor((xInGrid / GRID_WIDTH) * 96)));
    
    // Calculate which row (0 to 3) was touched
    const yInGrid = y - GRID_TOP;
    const row = Math.max(0, Math.min(3, Math.floor(yInGrid / ROW_HEIGHT)));

    return { slot, row };
  };

  // Start Drawing / Editing
  const handleStartDraw = (slot: number, row: number) => {
    setIsDrawing(true);
    setDrawStartSlot(slot);
    setDrawCurrentSlot(slot);
    
    // Set status based on the row clicked (intuitive painting!)
    const statusMap: DutyStatus[] = ['OFF_DUTY', 'SLEEPER', 'DRIVING', 'ON_DUTY'];
    const selectedStatus = statusMap[row];
    setDrawStatus(selectedStatus);
    setActiveStatus(selectedStatus);
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return; // Only left click
    const coords = getCoordsFromEvent(e);
    if (!coords) return;
    handleStartDraw(coords.slot, coords.row);
  };

  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    // Prevent scrolling when drawing on the grid
    if (e.cancelable) e.preventDefault();
    const coords = getCoordsFromEvent(e);
    if (!coords) return;
    handleStartDraw(coords.slot, coords.row);
  };

  // Handle Dragging
  const handleMoveDraw = (slot: number, _row: number) => {
    setHoverSlot(slot);
    if (isDrawing) {
      setDrawCurrentSlot(slot);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const coords = getCoordsFromEvent(e);
    if (!coords) return;
    handleMoveDraw(coords.slot, coords.row);
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.cancelable) e.preventDefault();
    const coords = getCoordsFromEvent(e);
    if (!coords) return;
    handleMoveDraw(coords.slot, coords.row);
  };

  // Finish Drawing
  const handleEndDraw = () => {
    if (!isDrawing || drawStartSlot === null || drawCurrentSlot === null) return;
    
    setIsDrawing(false);
    
    const start = Math.min(drawStartSlot, drawCurrentSlot);
    const end = Math.max(drawStartSlot, drawCurrentSlot);
    
    // Create new slots by copying old ones and painting the drawn status
    const newSlots = [...slots];
    for (let i = start; i <= end; i++) {
      newSlots[i] = drawStatus;
    }

    const newIntervals = slotsToIntervals(newSlots);
    onChange(newIntervals);
    
    setDrawStartSlot(null);
    setDrawCurrentSlot(null);
  };

  const handleMouseUp = () => {
    handleEndDraw();
  };

  const handleTouchEnd = () => {
    handleEndDraw();
  };

  // Reset drawing if mouse leaves grid
  const handleMouseLeave = () => {
    setHoverSlot(null);
    if (isDrawing) {
      handleEndDraw();
    }
  };

  // Status mapping to row indices
  const statusRowMap: Record<DutyStatus, number> = {
    OFF_DUTY: 0,
    SLEEPER: 1,
    DRIVING: 2,
    ON_DUTY: 3,
  };

  return (
    <div className="flex flex-col items-center w-full select-none bg-white border-x-2 border-b-2 border-slate-900 p-4">
      {/* Interactive Tool Description */}
      <div className="no-print w-full flex flex-wrap items-center justify-between text-xs text-slate-500 mb-3 gap-2">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
          <span><strong>Interactive drawing enabled:</strong> Click and drag on any row in the grid to paint your duty logs.</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-4 h-3 bg-slate-100 border border-slate-300 rounded"></div>
            <span>Off Duty</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-3 bg-orange-50 border border-orange-200 rounded"></div>
            <span>Sleeper</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-3 bg-red-50 border border-red-200 rounded"></div>
            <span>Driving</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-3 bg-green-50 border border-green-200 rounded"></div>
            <span>On Duty</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-x-auto overflow-y-hidden scrollbar-none flex justify-center py-2 bg-slate-50 rounded-lg p-2 border border-slate-200">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${TOTAL_WIDTH} ${TOTAL_HEIGHT}`}
          className="w-[920px] min-w-[920px] h-[210px] bg-white font-sans overflow-visible"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Grids / Shapes Backgrounds */}
          <g opacity="0.35">
            {/* Off Duty row (Row 0) background */}
            <rect x={GRID_LEFT} y={GRID_TOP + ROW_HEIGHT * 0} width={GRID_WIDTH} height={ROW_HEIGHT} fill="#f1f5f9" />
            {/* Sleeper row (Row 1) background */}
            <rect x={GRID_LEFT} y={GRID_TOP + ROW_HEIGHT * 1} width={GRID_WIDTH} height={ROW_HEIGHT} fill="#fff7ed" />
            {/* Driving row (Row 2) background */}
            <rect x={GRID_LEFT} y={GRID_TOP + ROW_HEIGHT * 2} width={GRID_WIDTH} height={ROW_HEIGHT} fill="#fef2f2" />
            {/* On Duty row (Row 3) background */}
            <rect x={GRID_LEFT} y={GRID_TOP + ROW_HEIGHT * 3} width={GRID_WIDTH} height={ROW_HEIGHT} fill="#f0fdf4" />
          </g>

          {/* Row Guidelines (horizontal middle line of each row) */}
          {Array.from({ length: 4 }).map((_, i) => (
            <line
              key={`guide-${i}`}
              x1={GRID_LEFT}
              y1={GRID_TOP + i * ROW_HEIGHT + ROW_HEIGHT / 2}
              x2={GRID_LEFT + GRID_WIDTH}
              y2={GRID_TOP + i * ROW_HEIGHT + ROW_HEIGHT / 2}
              stroke="#e2e8f0"
              strokeDasharray="2,2"
              strokeWidth="1"
            />
          ))}

          {/* Drag Selection Overlay */}
          {isDrawing && drawStartSlot !== null && drawCurrentSlot !== null && (
            <rect
              x={GRID_LEFT + (Math.min(drawStartSlot, drawCurrentSlot) / 96) * GRID_WIDTH}
              y={GRID_TOP + statusRowMap[drawStatus] * ROW_HEIGHT}
              width={(Math.abs(drawStartSlot - drawCurrentSlot) + 1) * (GRID_WIDTH / 96)}
              height={ROW_HEIGHT}
              fill={
                drawStatus === 'DRIVING'
                  ? 'rgba(239, 68, 68, 0.25)'
                  : drawStatus === 'ON_DUTY'
                  ? 'rgba(34, 197, 94, 0.25)'
                  : drawStatus === 'SLEEPER'
                  ? 'rgba(249, 115, 22, 0.25)'
                  : 'rgba(71, 85, 105, 0.2)'
              }
              stroke={
                drawStatus === 'DRIVING'
                  ? '#ef4444'
                  : drawStatus === 'ON_DUTY'
                  ? '#22c55e'
                  : drawStatus === 'SLEEPER'
                  ? '#f97316'
                  : '#64748b'
              }
              strokeWidth="1.5"
              strokeDasharray="3,3"
            />
          )}

          {/* Grid Labels (Left Side) */}
          <g className="text-[10px] font-bold text-slate-800" textAnchor="start">
            <text x="5" y={GRID_TOP + ROW_HEIGHT * 0 + 22}>1. OFF DUTY</text>
            <text x="5" y={GRID_TOP + ROW_HEIGHT * 1 + 22}>2. SLEEPER BERTH</text>
            <text x="5" y={GRID_TOP + ROW_HEIGHT * 2 + 22}>3. DRIVING</text>
            <text x="5" y={GRID_TOP + ROW_HEIGHT * 3 + 22}>4. ON DUTY (Not Driving)</text>
          </g>

          {/* Vertical Grid Lines and Hour Markers */}
          {Array.from({ length: 25 }).map((_, h) => {
            const x = GRID_LEFT + h * (GRID_WIDTH / 24);
            const isBold = h === 0 || h === 12 || h === 24;
            const hourLabel =
              h === 0 || h === 24 ? 'MID-NIGHT' : h === 12 ? 'NOON' : h > 12 ? (h - 12).toString() : h.toString();

            return (
              <g key={`hour-${h}`}>
                {/* Main vertical grid line */}
                <line
                  x1={x}
                  y1={GRID_TOP}
                  x2={x}
                  y2={GRID_BOTTOM}
                  stroke={isBold ? '#0f172a' : '#94a3b8'}
                  strokeWidth={isBold ? '1.8' : '0.8'}
                />

                {/* Half hour intermediate lines (faint) */}
                {h < 24 && (
                  <line
                    x1={x + GRID_WIDTH / 48}
                    y1={GRID_TOP}
                    x2={x + GRID_WIDTH / 48}
                    y2={GRID_BOTTOM}
                    stroke="#cbd5e1"
                    strokeWidth="0.5"
                    strokeDasharray="2,3"
                  />
                )}

                {/* Quarter hour tick marks along the borders */}
                {h < 24 &&
                  Array.from({ length: 4 }).map((_, r) => {
                    const rowTopY = GRID_TOP + r * ROW_HEIGHT;
                    const rowBotY = rowTopY + ROW_HEIGHT;
                    const x15 = x + GRID_WIDTH / 96;
                    const x45 = x + (GRID_WIDTH / 96) * 3;

                    return (
                      <g key={`ticks-row-${r}-${h}`}>
                        {/* 15 min ticks */}
                        <line x1={x15} y1={rowTopY} x2={x15} y2={rowTopY + 5} stroke="#64748b" strokeWidth="0.6" />
                        <line x1={x15} y1={rowBotY} x2={x15} y2={rowBotY - 5} stroke="#64748b" strokeWidth="0.6" />
                        
                        {/* 45 min ticks */}
                        <line x1={x45} y1={rowTopY} x2={x45} y2={rowTopY + 5} stroke="#64748b" strokeWidth="0.6" />
                        <line x1={x45} y1={rowBotY} x2={x45} y2={rowBotY - 5} stroke="#64748b" strokeWidth="0.6" />
                      </g>
                    );
                  })}

                {/* Top labels */}
                <text
                  x={x}
                  y={GRID_TOP - 16}
                  textAnchor="middle"
                  className={`font-mono-grid text-[9px] font-bold ${isBold ? 'fill-slate-950 font-black' : 'fill-slate-600'}`}
                >
                  {hourLabel}
                </text>
                
                {/* Duplicate bottom labels for perfect paperwork visual */}
                <text
                  x={x}
                  y={GRID_BOTTOM + 14}
                  textAnchor="middle"
                  className={`font-mono-grid text-[9px] font-bold ${isBold ? 'fill-slate-950 font-black' : 'fill-slate-600'}`}
                >
                  {hourLabel}
                </text>
              </g>
            );
          })}

          {/* AM / PM Header Indicators */}
          <text x={GRID_LEFT + GRID_WIDTH * 0.25} y={GRID_TOP - 4} textAnchor="middle" className="text-[10px] font-bold fill-slate-700 italic">A.M.</text>
          <text x={GRID_LEFT + GRID_WIDTH * 0.75} y={GRID_TOP - 4} textAnchor="middle" className="text-[10px] font-bold fill-slate-700 italic">P.M.</text>

          {/* Horizontal Row Divider Lines */}
          {Array.from({ length: 5 }).map((_, i) => (
            <line
              key={`h-divider-${i}`}
              x1={GRID_LEFT}
              y1={GRID_TOP + i * ROW_HEIGHT}
              x2={GRID_LEFT + GRID_WIDTH}
              y2={GRID_TOP + i * ROW_HEIGHT}
              stroke="#0f172a"
              strokeWidth={i === 0 || i === 4 ? '2' : '1.2'}
            />
          ))}

          {/* SVG Rendered Duty Path */}
          <DutyPath intervals={intervals} width={GRID_WIDTH} rowHeight={ROW_HEIGHT} />

          {/* Totals Section (Right Column) */}
          <g transform={`translate(${GRID_LEFT + GRID_WIDTH}, 0)`}>
            {/* Top Column Header */}
            <text x="30" y={GRID_TOP - 14} textAnchor="middle" className="text-[9px] font-bold fill-slate-800">TOTAL</text>
            <text x="30" y={GRID_TOP - 4} textAnchor="middle" className="text-[9px] font-bold fill-slate-800">HOURS</text>
            
            {/* Box backgrounds & borders for the hours */}
            {Array.from({ length: 4 }).map((_, i) => {
              const y = GRID_TOP + i * ROW_HEIGHT;
              const keys: DutyStatus[] = ['OFF_DUTY', 'SLEEPER', 'DRIVING', 'ON_DUTY'];
              const status = keys[i];
              const value = totals[status];

              return (
                <g key={`total-box-${i}`}>
                  {/* Outer Box */}
                  <rect
                    x="10"
                    y={y + 4}
                    width="40"
                    height={ROW_HEIGHT - 8}
                    fill="#f8fafc"
                    stroke="#0f172a"
                    strokeWidth="1.2"
                  />
                  {/* Value */}
                  <text
                    x="30"
                    y={y + ROW_HEIGHT / 2 + 4}
                    textAnchor="middle"
                    className="font-mono-grid text-[11px] font-bold fill-slate-900"
                  >
                    {value.toFixed(2)}
                  </text>
                </g>
              );
            })}

            {/* Total 24 Hour check box */}
            <g transform={`translate(0, ${GRID_BOTTOM})`}>
              <rect
                x="10"
                y="6"
                width="40"
                height="16"
                fill="#f1f5f9"
                stroke="#0f172a"
                strokeWidth="1.5"
              />
              <text
                x="30"
                y="18"
                textAnchor="middle"
                className="font-mono-grid text-[11px] font-black fill-slate-950"
              >
                {Object.values(totals).reduce((sum, val) => sum + val, 0).toFixed(1)}
              </text>
            </g>
          </g>

          {/* Live Drag Cursor Overlay (faint line showing time under cursor) */}
          {hoverSlot !== null && !isDrawing && (
            <line
              x1={GRID_LEFT + (hoverSlot / 96) * GRID_WIDTH}
              y1={GRID_TOP}
              x2={GRID_LEFT + (hoverSlot / 96) * GRID_WIDTH}
              y2={GRID_BOTTOM}
              stroke="#60a5fa"
              strokeWidth="1.2"
              strokeDasharray="4,2"
              opacity="0.7"
            />
          )}
        </svg>
      </div>

      {/* Manual log override and status list */}
      <div className="no-print w-full flex items-center justify-between border-t border-slate-200 mt-4 pt-3 flex-wrap gap-2 text-xs">
        <div className="flex gap-2">
          {(['OFF_DUTY', 'SLEEPER', 'DRIVING', 'ON_DUTY'] as DutyStatus[]).map((status) => {
            const labelMap: Record<DutyStatus, string> = {
              OFF_DUTY: 'Off Duty',
              SLEEPER: 'Sleeper Berth',
              DRIVING: 'Driving',
              ON_DUTY: 'On Duty (Not Driving)',
            };
            const btnColorMap: Record<DutyStatus, string> = {
              OFF_DUTY: 'bg-slate-600 text-white',
              SLEEPER: 'bg-orange-500 text-white',
              DRIVING: 'bg-red-600 text-white',
              ON_DUTY: 'bg-green-600 text-white',
            };
            const isSelected = activeStatus === status;

            return (
              <button
                key={status}
                onClick={() => setActiveStatus(status)}
                className={`px-3 py-1.5 rounded font-bold shadow-sm transition-all text-xs cursor-pointer ${
                  isSelected ? `${btnColorMap[status]} ring-2 ring-offset-1 ring-slate-800` : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {labelMap[status]}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to reset the grid to Off Duty for the whole day?')) {
              onChange([{ start: '00:00', end: '24:00', status: 'OFF_DUTY' }]);
            }
          }}
          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded font-bold shadow-sm transition-all cursor-pointer"
        >
          Reset Grid
        </button>
      </div>
    </div>
  );
};
