export type DutyStatus = 'OFF_DUTY' | 'SLEEPER' | 'DRIVING' | 'ON_DUTY';

export interface LogInterval {
  start: string; // HH:MM (24-hour format)
  end: string;   // HH:MM (24-hour format)
  status: DutyStatus;
}

export interface RemarkEntry {
  id: string;
  time: string; // HH:MM (24-hour format)
  status: DutyStatus;
  location: string; // "City, State"
  text: string;     // Remarks detail (e.g. "Pre-Trip Inspection", "Fueling")
}

export interface RecapDay {
  date: string;       // YYYY-MM-DD
  hoursWorked: number; // On-Duty + Driving hours
  isToday?: boolean;
}

export interface DriverLogData {
  date: string;
  fromCity: string;
  toCity: string;
  carrierName: string;
  mainOfficeAddress: string;
  homeTerminalAddress: string;
  truckTractorNumber: string;
  trailerNumber: string;
  licensePlate: string;
  odometerStart: number;
  odometerEnd: number;
  totalMilesToday: number;
  shippingDocs: string;
  manifestNumber: string;
  shipper: string;
  commodity: string;
  driverSignatureName: string; // text signature
  driverSignatureDate: string;
  intervals: LogInterval[];
  remarks: RemarkEntry[];
  recapDays: RecapDay[]; // 8 days total
}
