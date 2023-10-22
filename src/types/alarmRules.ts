interface AlarmRules {
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
    std: {};
}

export default AlarmRules;