import GlucoseMeasurement from './glucoseMeasurement';

interface GlucoseMeasurementExtended extends GlucoseMeasurement {
    TrendArrow: number;
    TrendMessage: number;
}

export default GlucoseMeasurementExtended;