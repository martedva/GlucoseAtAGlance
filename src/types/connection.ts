import AlarmRules from "./alarmRules";
import Device from "./device";
import GlucoseMeasurementExtended from "./glucoseMeasurementExtended";
import SensorData from "./sensorData";

interface Connection {
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

export default Connection;