const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secretKey = process.env.KEY;


const userSchema = new mongoose.Schema({
    fname:{
        type:String,
        require: true,
        trim: true
    },
    email:{
        type:String,
        require: true,
        unique: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error ("invalid email address")
            }
        }
    },
    mobile:{
        type:String,
        require: true,
        unique: true,
        maxlength: 10
    },
    password:{
        type:String,
        require: true,
        minlength: 6
    },
    cpassword:{
        type:String,
        require: true,
        minlength: 6
    },
    tokens: [
        {
            token:{
                type:String,
                require: true,
            }
        }
    ],
    carts: Array
});


userSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 12);
        this.cpassword = await bcrypt.hash(this.cpassword, 12);
    }

    next();
});


// token generate process
userSchema.methods.generateAuthtokenn = async function(){
    try{
        let token = jwt.sign({_id:this._id}, secretKey);
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        return token;
    }
    catch(error){
        console.log(error);
    }
}


// add to cart data
userSchema.methods.addcartdata = async function(cart){
    try{
        this.carts = this.carts.concat(cart);
        await this.save();
        return this.carts
    }
    catch(error){
        console.log(error);
    }
}

const USER = new mongoose.model("USER", userSchema);

module.exports = USER;
