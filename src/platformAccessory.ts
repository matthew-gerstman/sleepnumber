import {
  Service,
  PlatformAccessory,
  CharacteristicValue,
  CharacteristicSetCallback,
  CharacteristicGetCallback,
} from "homebridge";

import { SleepNumberHomebridgePlatform } from "./platform";
import { SleepNumberAPI } from "./api";
import debounce from "lodash.debounce";

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class ExamplePlatformAccessory {
  private service: Service;

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private exampleStates = {
    On: false,
    Brightness: 100,
  };

  constructor(
    private readonly platform: SleepNumberHomebridgePlatform,
    private readonly accessory: PlatformAccessory
  ) {
    // set accessory information
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(
        this.platform.Characteristic.Manufacturer,
        "Default-Manufacturer"
      )
      .setCharacteristic(this.platform.Characteristic.Model, "Default-Model")
      .setCharacteristic(
        this.platform.Characteristic.SerialNumber,
        "Default-Serial"
      );

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.service =
      this.accessory.getService(this.platform.Service.Lightbulb) ||
      this.accessory.addService(this.platform.Service.Lightbulb);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(
      this.platform.Characteristic.Name,
      accessory.context.device.exampleDisplayName
    );

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb

    // register handlers for the On/Off Characteristic
    this.service
      .getCharacteristic(this.platform.Characteristic.On)
      .on("set", this.setOn.bind(this)) // SET - bind to the `setOn` method below
      .on("get", this.getOn.bind(this)); // GET - bind to the `getOn` method below

    // register handlers for the Brightness Characteristic
    this.service
      .getCharacteristic(this.platform.Characteristic.Brightness)
      .on("set", this.setBrightness.bind(this)); // SET - bind to the 'setBrightness` method below

    /**
     * Creating multiple services of the same type.
     *
     * To avoid "Cannot add a Service with the same UUID another Service without also defining a unique 'subtype' property." error,
     * when creating multiple services of the same type, you need to use the following syntax to specify a name and subtype id:
     * this.accessory.getService('NAME') || this.accessory.addService(this.platform.Service.Lightbulb, 'NAME', 'USER_DEFINED_SUBTYPE_ID');
     *
     * The USER_DEFINED_SUBTYPE must be unique to the platform accessory (if you platform exposes multiple accessories, each accessory
     * can use the same sub type id.)
     */

    // Example: add two "motion sensor" services to the accessory
    const motionSensorOneService =
      this.accessory.getService("Motion Sensor One Name") ||
      this.accessory.addService(
        this.platform.Service.MotionSensor,
        "Motion Sensor One Name",
        "YourUniqueIdentifier-1"
      );

    const motionSensorTwoService =
      this.accessory.getService("Motion Sensor Two Name") ||
      this.accessory.addService(
        this.platform.Service.MotionSensor,
        "Motion Sensor Two Name",
        "YourUniqueIdentifier-2"
      );

    /**
     * Updating characteristics values asynchronously.
     *
     * Example showing how to update the state of a Characteristic asynchronously instead
     * of using the `on('get')` handlers.
     * Here we change update the motion sensor trigger states on and off every 10 seconds
     * the `updateCharacteristic` method.
     *
     */
    let motionDetected = false;
    setInterval(() => {
      // EXAMPLE - inverse the trigger
      motionDetected = !motionDetected;

      // push the new value to HomeKit
      motionSensorOneService.updateCharacteristic(
        this.platform.Characteristic.MotionDetected,
        motionDetected
      );
      motionSensorTwoService.updateCharacteristic(
        this.platform.Characteristic.MotionDetected,
        !motionDetected
      );

      this.platform.log.debug(
        "Triggering motionSensorOneService:",
        motionDetected
      );
      this.platform.log.debug(
        "Triggering motionSensorTwoService:",
        !motionDetected
      );
    }, 10000);
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  setOn(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    // implement your own code to turn your device on/off
    this.exampleStates.On = value as boolean;

    this.platform.log.debug("Set Characteristic On ->", value);

    // you must call the callback function
    callback(null);
  }

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
   * 
   * GET requests should return as fast as possbile. A long delay here will result in
   * HomeKit being unresponsive and a bad user experience in general.
   * 
   * If your device takes time to respond you should update the status of your device
   * asynchronously instead using the `updateCharacteristic` method instead.

   * @example
   * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
   */
  getOn(callback: CharacteristicGetCallback) {
    // implement your own code to check if the device is on
    const isOn = this.exampleStates.On;

    this.platform.log.debug("Get Characteristic On ->", isOn);

    // you must call the callback function
    // the first argument should be null if there were no errors
    // the second argument should be the value to return
    callback(null, isOn);
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, changing the Brightness
   */
  setBrightness(
    value: CharacteristicValue,
    callback: CharacteristicSetCallback
  ) {
    // implement your own code to set the brightness
    this.exampleStates.Brightness = value as number;

    this.platform.log.debug("Set Characteristic Brightness -> ", value);

    // you must call the callback function
    callback(null);
  }
}

export class SleepNumberFlexFrame {
  accessory: PlatformAccessory;
  sleepNumberApi: SleepNumberAPI;
  platform: SleepNumberHomebridgePlatform;
  headPosition: number;
  footPosition: number;
  foundationIsMoving: boolean;

  currentState: boolean = false;

  constructor(
    platform: SleepNumberHomebridgePlatform,
    accessory: PlatformAccessory,
    sleepNumberAPI: SleepNumberAPI
  ) {
    this.accessory = accessory;
    this.sleepNumberApi = sleepNumberAPI;
    this.platform = platform;
    this.headPosition = 0;
    this.footPosition = 0;
    this.foundationIsMoving = false;

    this.getServices();
  }

  __delay__(timer: number) {
    return new Promise((resolve) => {
      timer = timer || 2000;
      setTimeout(function () {
        resolve(undefined);
      }, timer);
    });
  }

  get log() {
    return this.platform.log;
  }

  waitForBedToStopMoving = async () => {
    while (this.foundationIsMoving) {
      try {
        await this.sleepNumberApi.foundationStatus((data, err = null) => {
          if (err) {
            this.log.debug(data, err);
            return;
          }

          this.log.debug("foundationStatus result:", data);
          let foundationStatus = JSON.parse(data);
          const error = foundationStatus.Error;

          if (!error) {
            this.foundationIsMoving = foundationStatus.fsIsMoving;
            return;
          }

          error.Code === 404
            ? this.log.warn("No foundation detected")
            : this.log.error(
                "Unknown error occurred when checking the foundation status. See previous output for more details. If it persists, please report this incident at https://github.com/DeeeeLAN/homebridge-sleepiq/issues/new"
              );
        });
      } catch (err) {
        if (typeof err === "string" || err instanceof String)
          err = JSON.parse(err as string);

        if (!(err.statusCode === 404)) {
          this.log.warn(
            "Failed to retrieve foundation status:",
            JSON.stringify(err)
          );
        }
      }

      if (!this.foundationIsMoving) {
        return;
      }
      await this.__delay__(500); // wait 0.5s before trying again
    }
  };

  // Send a new foundation position to the bed
  setFoundation = debounce(async (value) => {
    // await this.waitForBedToStopMoving(); // wait for bed to stop moving

    this.log.debug("Setting foundation position " + value);

    if (value == null) {
      return;
    }

    this.currentState = value;

    const preset = value ? 1 : 4;
    this.sleepNumberApi.preset("L", preset, (data, err) => {
      console.log({ data, err });
    });
  }, 5000);

  getFoundation = (callback) => {
    return callback(null, this.currentState);
  };

  fetchFoundation = async () => {
    this.log.debug("Fetch foundation position");

    let flexData;
    try {
      await this.sleepNumberApi.foundationStatus((data, err = null) => {
        if (err) {
          this.log.debug(data, err);
        } else {
          this.log.debug("Foundation Status GET results:", data);
          flexData = JSON.parse(data);
        }
      });
    } catch (err) {
      this.log.error("Failed to fetch foundation status:", err.error);
    }

    if (!flexData) {
      return;
    }

    this.log.debug(
      "SleepIQ Flex Data: {" +
        "Head: " +
        flexData.fsLeftHeadPosition +
        ", Foot:" +
        flexData.fsLeftFootPosition +
        "}"
    );

    const headPosition = parseInt(flexData.fsLeftHeadPosition, 10);
    const footPosition = parseInt(flexData.fsLeftFootPosition, 10);

    this.currentState = headPosition > 0 || footPosition > 0;
  };

  getServices = () => {
    const { Service, Characteristic } = this.platform;

    let informationService = this.accessory.getService(
      Service.AccessoryInformation
    );

    informationService &&
      informationService
        .setCharacteristic(Characteristic.Manufacturer, "Sleep Number")
        .setCharacteristic(Characteristic.Model, "SleepIQ")
        .setCharacteristic(Characteristic.SerialNumber, "360");

    const foundationService =
      this.accessory.getService("FlexFrame") ||
      this.accessory.addService(
        this.platform.Service.Lightbulb,
        "FlexFrame",
        "FlexFrame"
      );

    foundationService
      .getCharacteristic(Characteristic.On)
      .on("change", (oldValue, newValue, callback) => {
        this.log.debug("Foundation" + newValue);
        this.setFoundation(newValue);
      })
      .on("set", (newValue, callback) => {
        this.log.debug("Foundation" + newValue);
        this.setFoundation(newValue);
      })
      .on("get", (callback) => this.getFoundation(callback));

    setInterval(async () => {
      // push the new value to HomeKit

      this.log.debug("Update flex data");

      await this.fetchFoundation();
      foundationService.updateCharacteristic(
        this.platform.Characteristic.On,
        this.currentState
      );
    }, 10000);

    const returnArr = [informationService, foundationService];

    return returnArr;
  };
}
