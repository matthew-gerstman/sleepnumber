import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from "homebridge";
import { SleepNumberAPI } from "./api";
interface SleepNumberConfig extends PlatformConfig {
    email: string;
    password: string;
    sendDelay: number;
}
/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export declare class SleepNumberHomebridgePlatform implements DynamicPlatformPlugin {
    readonly log: Logger;
    readonly config: SleepNumberConfig;
    readonly api: API;
    readonly Service: typeof Service;
    readonly Characteristic: typeof Characteristic;
    readonly accessories: PlatformAccessory[];
    readonly sleepNumberApi: SleepNumberAPI;
    constructor(log: Logger, config: SleepNumberConfig, api: API);
    didFinishLaunching: () => Promise<void>;
    authenticate: () => Promise<void>;
    /**
     * This function is invoked when homebridge restores cached accessories from disk at startup.
     * It should be used to setup event handlers for characteristics and update respective values.
     */
    configureAccessory(accessory: PlatformAccessory): void;
    /**
     * This is an example method showing how to register discovered accessories.
     * Accessories must only be registered once, previously created accessories
     * must not be registered again to prevent "duplicate UUID" errors.
     */
    discoverDevices(): void;
}
export {};
//# sourceMappingURL=platform.d.ts.map