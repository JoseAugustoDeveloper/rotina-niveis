// import jwt from "jsonwebtoken"
// import bcrypt from "bcryptjs"
// import User from "../models/userModel"

// const generateToken = (userId: string) => {
//   return jwt.sign({ id: userId }, process.env.JWT_SCRET!, {expiresIn: "15m"});
// };

// const generateRefresToken = (userId: string) => {
//   return jwt.sign({ id: userId }, process.env.REFRESH_SECRET!, { expiresIn: "7d"});
// };

// const hashePassword = async (password: string) => {
//   return await bcrypt.hash(password, 10);
// };

// const comparePassword = async (password: string, hash: string) => {
//   return await bcrypt.compare(password, hash);
// };

// export { generateToken, generateRefresToken, hashePassword, comparePassword}
