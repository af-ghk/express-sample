import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()
const {Schema} = mongoose;


const OAuthClients =  new Schema({
      _id: {type: String, auto: true},
      userId: {type: String},
      clientId: {type: String},
      clientSecret: {type: String},
      callbackUrl: {type: String},
      grants: {type: [String], required: true, enum: ["authorization_code", "refresh_token"]}
    }, {collection: "OAuthClients"})


  const OAuthClientsModel = mongoose.model("OAuthClients", OAuthClients);

  var loadExampleData =async function() {

	var client1 = new OAuthClientsModel({
        _id:"1",
        userId: '',
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackUrl: `${process.env.DOMAIN}/oauth/callback`,
        grants: "authorization_code"
	});
    try {
        
        await client1.save();
    } catch (error) {
        console.log(error)
    }



};

//loadExampleData()


  async function getClient(clientId, clientSecret) {
    const client = await OAuthClientsModel.findOne({clientId, ...(clientSecret && {clientSecret})}).lean();
    if (!client) throw new Error("Client not found");
  
    return {
      id: client.clientId,
      grants: client.grants,
      redirectUris: [client.callbackUrl]
    };
  }
  
  export default {        
    getClient,
    OAuthClientsModel
  }