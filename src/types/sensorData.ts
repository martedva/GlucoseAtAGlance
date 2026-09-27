interface SensorData {
    deviceId: string;
    sn: string;
    a?: number; // Activation timestamp (Unix seconds) - optional
    w?: number;
    pt?: number;
    s?: boolean;
    lj?: boolean;
    // Additional possible fields from API
    activationTime?: number;
    startTime?: number;
}

export default SensorData;