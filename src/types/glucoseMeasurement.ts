interface GlucoseMeasurement {
    FactoryTimestamp: Date;
    GlucoseUnits: number;
    MeasurementColor: number; // 1=green, 2=yellow, 3=orange, 4=red
    Timestamp: Date;
    Value: number;
    ValueInMgPerDl: number;
    IsHigh: boolean;
    IsLow: boolean;
    Type: number;
}

export default GlucoseMeasurement;