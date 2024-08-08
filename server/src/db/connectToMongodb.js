import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

console.log(process.env.MONGO_DB_URL)
const connectToMongodb = async () => {
  try {
    const connection = await mongoose.connect(
      `${process.env.MONGO_DB_URL}/${DB_NAME}`
    );
    console.log(
      `\n MongoDB connected !! DB HOST : ${connection.connection.host}`
    );
  } catch (error) {
    console.log("MONGODB Connection error", error);
    process.exit(1);
    //  given by node to terminate the node process due to node process failure
  }
};

export default connectToMongodb;
