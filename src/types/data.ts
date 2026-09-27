import Connection from "./connection";
import GlucoseMeasurement from "./glucoseMeasurement";
import SensorData from "./sensorData";

interface Data {
    connection: Connection;
    activeSensors: SensorData[];
    graphData: GlucoseMeasurement[];
}

export default Data;