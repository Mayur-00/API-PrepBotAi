const { connectDb } = require("./db/dbConfig.js");
const { app } = require("./app.js");
const dotenv = require('dotenv');
dotenv.config();

connectDb()
.then(
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`server is running on : ${process.env.PORT}`);
        
    })
)
.catch((err)=>{
    console.log("DB Connection Faild !!", err);
     
})


 