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
    resetPasswordPin : {
        type : String ,
        default : null
    },
    resetPasswordPinExpires : {
        type : Date ,
        default : null
    },
    resetPasswordAttempts : {
        type : Number ,
        default : 0
    },
    createdAt : {
        type : Date ,
        default : Date.now
    },
    // Opt-in shopping profile the assistant can use ("in my size").
    preferences : {
        sizes : {
            top : { type : String , default : "" },
            bottom : { type : String , default : "" },
            shoe : { type : String , default : "" },
            kids : { type : String , default : "" }
        },
        colors : { type : [String] , default : [] },
        departments : { type : [String] , default : [] },
        budget : { type : Number , default : null , min : 0 }
    }
},
{ strict: false }
)

module.exports = mongoose.model('User' , userSchema);