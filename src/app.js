
const express = require('express');
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const pdfRouter = require("./routes/pdf.route.js");
const authRouter = require("./routes/auth.routes.js");
const cors = require("cors")
const {rateLimit} = require("express-rate-limit");
 const {ApiResponse} = require("./utils/apiResponse.js")


dotenv.config();



 const app = express();

 const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, 
	limit: 100,
	 handler: (req, res, next, options) => {
        res.status(options.statusCode).json(
            new ApiResponse(options.statusCode, "Too many requests, please try again later.")
        );
    }
})

app.use(limiter);


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));



app.use(express.json({ limit: "5mb" }));

app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}));

app.use(cookieParser());


app.use('/api/v1/mcq', pdfRouter);
app.use('/api/v1/auth', authRouter);


module.exports = {app}