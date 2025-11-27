// import client from '../utils/mqtt';
// import DeviceData, {IDeviceData} from '../models/DeviceData';
// import User from '../models/User';



// client.on('message', async (topic, message) => {
//   try {
//     const payload = JSON.parse(message.toString());
//     console.log(payload);

//     // esp32-generic/iot1/data
//     const [type, deviceName, data] = topic.split('/');

//     const user = await User.findOne({ "devices.deviceName": deviceName });
    
//     if (!user) {
//       console.log("❌ No user owns this device");
//       return;
//     }
    
//     const userId = user._id;
    
//     const newData1 = new DeviceData({
//       userId: user._id,
//       deviceId: deviceName,
//       data
//     });

//     await newData1.save();
    
//     console.log(`💾 Saved readings for ${deviceName}`);
//   } catch (err) {
//     console.error('❌ Failed to store reading:', err);
//   }
// });