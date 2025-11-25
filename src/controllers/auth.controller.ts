import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../modules/User";
import { subscribeToDevices } from "../utils/mqtt.subscribes";

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({email}).populate('devices');
  
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user.userId, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
  //get devices of the user and subscribe to them
  const devices = user.devices
  subscribeToDevices(devices);

  res.json({ token });
};