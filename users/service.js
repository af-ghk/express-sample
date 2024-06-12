/* import UserModel from '../models/user'

export default {
    register: async function (username, password, callback) {
        //TODO: make a hash of password
       const user = await UserModel.create({username, password})
       callback(user)
    },
    getUser:  async function(username, password, callback) {
        //TODO: make a hash of password
        const user = await UserModel.findOne({username, password},function(err, doc) {
            //Do your action here..
          })
    },
    isValidUser: function(username,callback) {
        UserModel.findOne({username},function(err, doc) {
            //Do your action here..
          })
    },
    saveAccessToken: function(accessToken, userId, callback){
        UserModel.updateOne({_id: userId}, {accessToken})
    },
    getUserIDFromBearerToken: async function(bearerToken,callback) {
        //TODO: convert bearerToken to reach to userId 
        callback(userId)
    }
}*/