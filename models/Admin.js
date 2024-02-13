import mongoose from "mongoose";
const Schema = mongoose.Schema;
const adminSchema = new Schema({
  
    name: {
        type: String,
        required: true
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
   
}, {
    collection: 'admins'
})
 export default mongoose.model('Admins',adminSchema)