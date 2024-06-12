
import mongoose from "mongoose"

const ClientSchema = mongoose.Schema({
    id: {type:String, required:true},
    clientId: {type:String, required:true},
    clientSecret: {type:String, required:true},
    grants:{type:[String], required:true},
    redirectUris:{type:[String], required: true} 
})

export default mongoose.model('ClientSchema', ClientSchema)
