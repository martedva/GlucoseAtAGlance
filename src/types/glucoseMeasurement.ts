interface GlucoseMeasurement {
    FactoryTimestamp: Date;
    GlucoseUnits: number;
    MeasurementColor: 1;
    Timestamp: Date;
    Value: number;
    ValueInMgPerDl: number;
    IsHigh: boolean;
    IsLow: boolean;
    Type: number;
}

export default GlucoseMeasurement;