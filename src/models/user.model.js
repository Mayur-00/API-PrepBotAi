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
            index: true,
            match: [/.+@.+\..+/, "Please fill a valid email address"]
        },
        password: {
            type: String,
            required: [true, "password is required"],
      
        },
        refreshToken : {
            type:String
        },

        currentSubscription : {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Subscription"
        },

        SubscriptionHistory : [
            {
                type : mongoose.Schema.Types.ObjectId,
                ref:"Subscription"
            }
        ],
          preferences: {
            emailNotifications: {
                type: Boolean,
                default: true
            },
            subscriptionReminders: {
                type: Boolean,
                default: true
            },
            usageAlerts: {
                type: Boolean,
                default: true
            }
        },
        // Account status
        isActive: {
            type: Boolean,
            default: true
        },
        lastLoginAt: {
            type: Date
        },
        
   
        
    }, {
    timestamps: true
}
);


userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);

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
            username: this.username
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

// New subscription-related methods
userSchema.methods.hasActiveSubscription = async function() {
    if (!this.currentSubscription) return false;
    
    const Subscription = mongoose.model("Subscription");
    const subscription = await Subscription.findById(this.currentSubscription);
    
    return subscription && subscription.isActive();
};

userSchema.methods.getCurrentSubscription = async function() {
    if (!this.currentSubscription) return null;
    
    const Subscription = mongoose.model("Subscription");
    return await Subscription.findById(this.currentSubscription).populate('plan').lean();
};

userSchema.methods.canPerformAction = async function(action, ) {
    // Check if user has active subscription
    const subscription = await this.getCurrentSubscription();
    
    if (!subscription || !subscription.isActive()) {
        // Check if user is in trial
       
        return { allowed: false, reason: "no_active_subscription" };
    }
    
    // Check specific limits based on action
    switch (action) {
        case 'generate_mcq':
            if (!subscription.canGenerateMcq()) {
                return { allowed: false, reason: "mcq_limit_exceeded" };
            }
            break;
        case 'export_pdf':
            if (!subscription.canExportPdf()) {
                return { allowed: false, reason: "export_limit_exceeded" };
            }
            break;
    }
    
    return { allowed: true, subscription };
};

userSchema.index({ currentSubscription: 1 });
userSchema.index({ email: 1, isActive: 1 });


 const User = mongoose.model("User", userSchema);

 module.exports = User;