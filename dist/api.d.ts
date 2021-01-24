export declare type Actuator = "H" | "F";
export declare class SleepNumberAPI {
    username: string;
    password: string;
    userID: string;
    bedID: string;
    key: any;
    json: any;
    defaultBed: any;
    testing: any;
    constructor(username: string, password: string);
    login(callback?: (...args: any) => void): any;
    genURL(url: any): any;
    registration(): any;
    familyStatus: (callback?: (...args: any) => void) => any;
    sleeper(): any;
    bed(): any;
    bedStatus(): any;
    bedPauseMode(callback?: (...args: any) => void): any;
    setBedPauseMode(mode: any, callback?: (...args: any) => void): any;
    forceIdle(callback?: (...args: any) => void): any;
    pumpStatus(): any;
    preset(side: any, num: any, callback?: (...args: any) => void): any;
    adjust(side: any, actuator: Actuator, num: any, callback?: (...args: any) => void): any;
    foundationStatus(callback?: (...args: any) => void): any;
    outletStatus(num: any, callback?: (...args: any) => void): any;
    outlet(num: any, setting: any, callback?: (...args: any) => void): any;
    footWarmingStatus(callback?: (...args: any) => void): any;
    footWarming(side: any, temp: any, timer: any, callback?: (...args: any) => void): any;
    motion(side: any, head: any, massage: any, foot: any, callback?: (...args: any) => void): any;
    adjustment(side: any, head: any, waveMode: any, foot: any, callback?: (...args: any) => void): any;
    sleepNumber(side: any, num: any, callback?: (...args: any) => void): any;
    sleeperData(date: any, interval: any): any;
    sleepSliceData(date: any): any;
}
//# sourceMappingURL=api.d.ts.map