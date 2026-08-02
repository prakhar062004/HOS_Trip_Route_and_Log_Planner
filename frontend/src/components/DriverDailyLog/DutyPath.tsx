import React from 'react';
import type { LogInterval } from './types';

import { generateSVGPath } from './utils/generateSVGPath';


interface DutyPathProps {
  intervals: LogInterval[];
  width: number;
  rowHeight: number;
  strokeColor?: string;
}

export const DutyPath: React.FC<DutyPathProps> = ({
  intervals,
  width,
  rowHeight,
  strokeColor = '#2563eb', // Royal Blue pen ink by default
}) => {
  const pathData = generateSVGPath(intervals, width, rowHeight);

  if (!pathData) return null;

  return (
    <g>
      {/* Subtle drop shadow to simulate felt-tip ink bleeding into paper */}
      <filter id="ink-bleed" x="-5%" y="-5%" width="110%" height="110%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="0.8" />
        <feOffset dx="0.5" dy="0.8" result="offsetblur" />
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.3" />
        </feComponentTransfer>
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Main continuous line */}
      <path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#ink-bleed)"
        className="transition-all duration-300 ease-out"
      />

      {/* Decorative joints/dots at transition corners */}
      {/* We can parse coordinates from pathData and render small dots to enhance "hand-drawn" quality */}
    </g>
  );
};
