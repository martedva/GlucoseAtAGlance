/**
 * LibreLinkUp API Response Types
 * Note: Timestamps from API are strings in format "/Date(timestamp)/" or ISO strings
 */

// Glucose Measurement
export interface GlucoseMeasurement {
  FactoryTimestamp: string;
  GlucoseUnits: number;
  MeasurementColor: number; // 1=green, 2=yellow, 3=orange, 4=red
  Timestamp: string;
  Value: number;
  ValueInMgPerDl: number;
  IsHigh: boolean;
  IsLow: boolean;
  Type: number;
}

// Extended glucose measurement with trend data
export interface GlucoseMeasurementExtended extends GlucoseMeasurement {
  TrendArrow: number; // 1=down, 2=right-down, 3=right, 4=right-up, 5=up
  TrendMessage: number;
}

// Sensor Data
export interface SensorData {
  deviceId: string;
  sn: string;
  a?: number; // Activation timestamp (Unix seconds)
  e?: number; // Expiry timestamp (Unix seconds)
  w?: number;
  pt?: number;
  s?: boolean;
  lj?: boolean;
  activationTime?: number;
  startTime?: number;
}

// Device Information
export interface Device {
  did: string;
  dtid: number;
  v: string;
  l: boolean;
  ll: number;
  h: boolean;
  hl: number;
  u: number;
  fixedLowAlarmValues: {
    low: number;
    high: number;
  };
  alarms: boolean;
  fixedLowThreshold: number;
}

// Alarm Rules
export interface AlarmRules {
  c: boolean;
  h: {
    on: boolean;
    th: number;
    thmm: number;
    d: number;
    f: number;
  };
  f: {
    th: number;
    thmm: number;
    d: number;
    tl: number;
    tlmm: number;
  };
  l: {
    on: boolean;
    th: number;
    thmm: number;
    d: number;
    tl: number;
    tlmm: number;
  };
  nd: {
    i: number;
    r: number;
    l: number;
  };
  p: number;
  r: number;
  std: Record<string, unknown>;
}

// Connection (Patient) Data
export interface Connection {
  id: string;
  patientId: string;
  country: string;
  status: number;
  firstName: string;
  lastName: string;
  targetLow: number;
  targetHigh: number;
  uom: number;
  sensor: SensorData;
  alarmRules: AlarmRules;
  glucoseMeasurement: GlucoseMeasurementExtended;
  glucoseItem: GlucoseMeasurementExtended;
  glucoseAlarm: string;
  patientDevice: Device;
  created: number;
}

// Graph Data Point
export interface GraphDataPoint {
  FactoryTimestamp: string;
  GlucoseUnits: number;
  MeasurementColor: number;
  Timestamp: string;
  Value: number;
  ValueInMgPerDl: number;
  IsHigh: boolean;
  IsLow: boolean;
  Type: number;
  TrendArrow: number;
}

// Ticket (Session)
export interface Ticket {
  token: string;
  expires: number;
  duration: number;
}

// Login Response
export interface LoginResponse {
  status: number;
  data: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      country: string;
      uiLanguage: string;
      communicationLanguage: string;
      accountType: string;
      uom: number;
      dateFormat: string;
      timeFormat: string;
      emailDay: number | null;
      system: {
        messages: {
          appReviewBanner: number;
          firstUsePhoenix: number;
          firstUsePhoenixReportsDataMerged: number;
          lluGettingStartedBanner: number;
          lluNewFeatureModal: number;
          streamingTourMandatory: number;
        };
      };
      twoFactor: {
        primaryMethod: string;
        primaryValue: string;
        secondaryMethod: string;
        secondaryValue: string;
      };
      created: number;
      lastLogin: number;
      programs: Record<string, unknown>;
      devices: Record<string, unknown>;
      consents: {
        realWorldEvidence: {
          policyAccept: number;
          touAccept: number;
          history: Array<{
            policyAccept: number;
          }>;
        };
      };
    };
    messages: {
      unread: number;
    };
    notifications: {
      unresolved: number;
    };
    authTicket: Ticket;
    invitations: unknown;
    trustedDeviceToken: string;
  };
}

// LibreView API Response
export interface LibreViewResponse {
  status: number;
  data: {
    connection: Connection;
    activeSensors: SensorData[];
    graphData: GraphDataPoint[];
  };
  ticket: Ticket;
}

// Logbook Response
export interface LogbookResponse {
  status: number;
  data: GraphDataPoint[];
  ticket: Ticket;
}

/**
 * Helper function to parse LibreLinkUp timestamp string to Date
 * API returns timestamps in format "/Date(1234567890)/" or similar
 */
export function parseLibreTimestamp(timestamp: string): Date {
  // Handle /Date(timestamp)/ format
  const match = timestamp.match(/\/Date\((-?\d+)\)\//);
  if (match) {
    return new Date(parseInt(match[1], 10));
  }
  // Fallback to standard Date parsing
  return new Date(timestamp);
}

/**
 * Helper function to parse graph data with proper date conversion
 */
export function parseGraphData(graphData: GraphDataPoint[]): Array<{
  time: Date;
  value: number;
  trendArrow: number;
  measurementColor: number;
}> {
  return graphData.map((item) => ({
    time: parseLibreTimestamp(item.Timestamp),
    value: item.Value,
    trendArrow: item.TrendArrow,
    measurementColor: item.MeasurementColor,
  }));
}
