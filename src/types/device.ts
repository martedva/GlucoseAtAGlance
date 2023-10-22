import FixedLowAlarmValues from "./fixedLowAlarmValues";

interface Device {
    did: string;
    dtid: number;
    v: string;
    l: boolean;
    ll: number;
    h: boolean;
    hl: number;
    u: number;
    fixedLowAlarmValues: FixedLowAlarmValues;
    alarms: boolean;
    fixedLowThreshold: number;
}

export default Device;