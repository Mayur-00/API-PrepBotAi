class ApiError extends Error {
    constructor(
        statusCode,
        message="Something Went wrong",
        error=[],
        stack = ''
    ){
        super(message);
        this.statusCode = statusCode;
        this.message = message,
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = error;

        if(stack){
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.costructor)
        }

    }
};


module.exports = {ApiError};