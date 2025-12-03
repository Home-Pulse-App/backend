import { IDevice } from "../models/Device";
import Device from "../models/Device";

// Map to store timers for each device by their ID
const deviceTimers = new Map<string, NodeJS.Timeout>();

/**
 * Dead Man Switch: Monitors device activity and sets state to OFFLINE
 * if no activity is detected within 15 seconds.
 * 
 * @param device - The device to monitor
 */
export function deadManSwitch(device: IDevice) {
    const deviceId = device._id.toString();

    // Clear any existing timer for this device
    if (deviceTimers.has(deviceId)) {
        clearTimeout(deviceTimers.get(deviceId)!);
        console.log(`⏱️  Timer reset for device: ${device.deviceName}`);
    }

    // Set a new timer for 15 seconds
    const timer = setTimeout(async () => {
        try {
            const currentDevice = await Device.findById(deviceId);

            if (currentDevice && currentDevice.state !== 'OFFLINE') {
                const updatedDevice = await Device.findByIdAndUpdate(
                    device._id,
                    { state: 'OFFLINE' },
                    { new: true, runValidators: false }
                );
                console.log(`📴 Device ${device.deviceName} set to OFFLINE (no activity for 15s)`);
            }
            deviceTimers.delete(deviceId);
        } catch (error) {
            console.error(`❌ Error setting device ${device.deviceName} to OFFLINE:`, error);
        }
    }, 15000);
    deviceTimers.set(deviceId, timer);
}

/**
 * Clears the timer for a specific device (useful for cleanup)
 * @param deviceId - The device ID to clear the timer for
 */
export function clearDeviceTimer(deviceId: string) {
    if (deviceTimers.has(deviceId)) {
        clearTimeout(deviceTimers.get(deviceId)!);
        deviceTimers.delete(deviceId);
        console.log(`🧹 Timer cleared for device ID: ${deviceId}`);
    }
}

/**
 * Clears all device timers (useful for shutdown)
 */
export function clearAllTimers() {
    deviceTimers.forEach((timer) => clearTimeout(timer));
    deviceTimers.clear();
    console.log('🧹 All device timers cleared');
}