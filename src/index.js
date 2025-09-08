const { connectDb } = require("./db/dbConfig.js");
const { app } = require("./app.js");
const dotenv = require('dotenv');
const logger = require("./logger/winson.logger.js")
dotenv.config();

connectDb()
.then(
    app.listen(process.env.PORT || 8000, ()=>{
         logger.info("⚙️  Server is running on port: " + process.env.PORT);
        
    })
)
.catch((err)=>{
    logger.error("Mongo db connect error: ", err)
    
})

