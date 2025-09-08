const {ApiError} = require("../utils/apiError.js");
const mongoose = require("mongoose");
const logger = require("../logger/winson.logger.js");


const handleError = (err, req, res, next ) => {
    console.log("handle error")
    let error = err;

    const IsInDevelopmet = process.env.NODE_ENV === "development"


    if(!(error instanceof ApiError)){

        const statusCode = error.statusCode || error instanceof mongoose.Error ? 400 : 500;

        const message = error.message || "Something Went Wrong";

        error =  new ApiError(statusCode, message, error.errors || [],  err.stack)
    }

  

    const response = {
        success:false,
        message:error.message,
        errors:error.errors || [],
      
    };

    if (IsInDevelopmet) response.stack = error.stack;
    logger.error(`${error.message}`);
   

    res.status(error.statusCode).json(response)

};

module.exports = handleError;