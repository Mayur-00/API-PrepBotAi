const mongoose= require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");



const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "username is required"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: [true, "email is required"],
               unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        password: {
            type: String,
            required: [true, "password is required"],
      
        },
        refreshToken : {
            type:String
        }
        
    }, {
    timestamps: true
}
);


userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 10);

    next();
});

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken =  function(){
    return jwt.sign(
        {
            _id : this._id,
            email : this.email,
            userName: this.userName
        },
        process.env.ACCESS_KEY,
        {
            expiresIn: process.env.ACCESS_KEY_EXPIRY 
        }
    )
};


userSchema.methods.generateRefreshToken =  function(){
    return jwt.sign(
        {
            _id : this._id,
         
        },
        process.env.REFRESH_TOKEN_KEY,
        {
            expiresIn:process.env.REFRESH_TOKEN_KEY_EXPIRY
        }
    )
};


 const User = mongoose.model("User", userSchema);

 module.exports = User