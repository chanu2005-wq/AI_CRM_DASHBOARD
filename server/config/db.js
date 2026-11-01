import mongoose from "mongoose";

export const connectDB = async () => {
  const url = process.env.MONGODB_URL;

  if (!url) {
    throw new Error("MONGODB_URL is not defined in environment variables");
  }

  mongoose.set("strictQuery", true);

  const conn = await mongoose.connect(url, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log(
    `MongoDB connected: ${conn.connection.host}/${conn.connection.name}`,
  );

  return conn;
};
