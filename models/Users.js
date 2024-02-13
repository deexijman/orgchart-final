import mongoose from "mongoose";
const Schema = mongoose.Schema;
const userSchema = new Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    
    name: {
        type: String
    },email:{
        type:String,
        lowercase: true,
        unique: true,
        required: true
    },
    password:{
        type:String,
        required: true
    },
    role:{
        type:String,
        required: true
    },
    department:{
        type:String,
        required: true
    },
    reportsTo:{
        type:String,
        required:true
    }
}, {
    collection: 'Users',
    timestamps:true
})
export default mongoose.model('Users', userSchema)
