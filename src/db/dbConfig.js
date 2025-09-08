// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import { DB_NAME } from "../constants.js";

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const {DB_NAME} = require("../constants.js");
const logger = require("../logger/winson.logger.js");
dotenv.config();


const connectDb = async () => {
    try {
        await mongoose.connect(`${process.env.DB_URI}/${DB_NAME}`);
        console.log("database connected ! ");
    } catch (error) {
       logger.error("database connection error :", error)
        process.exit(1);
    }
};

module.exports = { connectDb };
