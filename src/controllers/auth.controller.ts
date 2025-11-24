import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config({path: '../.env'});

export const login = async (req, res) => {
  const { email, password } = req.body;

  // Example user from DB
  //TODO import user from DB
  const user = { id: 7, email: "test@mail.com", passwordHash: "$2a$12$4/Tzobmd94MzLK.qO8icOOkIjT6v1FQhOPwOSHnn0H85Icf2DaCpq" };

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.json({ token });
};