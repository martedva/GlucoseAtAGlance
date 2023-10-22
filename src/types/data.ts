import Connection from "./connection";
import GlucoseMeasurement from "./glucoseMeasurement";
import Sensor from "./sensor";

interface Data {
    connection: Connection;
    activeSensors: Sensor[];
    graphData: GlucoseMeasurement[];
}

export default Data;