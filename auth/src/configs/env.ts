import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || "default" as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '900'
};