const mongoose = require ('mongoose');

const userSchema = new mongoose.Schema(
{
    name : {
        required : true ,
        type : String ,
        trim : true
    },
    email : {
        unique : true ,
        type : String,
        required : true , 
        lowercase : true ,
        trim : true
    },
    password : {
        required : true ,
        type : String ,
        trim : true
    },
    userType : {
        type : String ,
        enum : ['storeOwner' , 'customer'] ,
        default : 'customer'
    },
    createdAt : {
        type : Date ,
        default : Date.now
    }
}
)

module.exports = mongoose.model('User' , userSchema);