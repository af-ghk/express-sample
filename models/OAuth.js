import mongoose from "mongoose";
import {v4 as uuid} from "uuid";

const {Schema} = mongoose

const OAuthAuthorizationCodes =
    new Schema({
      _id: {type: String, auto: true},
      authorizationCode: {type: String},
      expiresAt: {type: Date},
      redirectUri: {type: String},
      scope: {type: String},
      clientId: {type: String},
      userId: {type: String}
    },{collection:"OAuthAuthorizationCodes"})
  
const OAuthAccessTokens =
    new Schema({
      _id: {type: String},
      accessToken: {type: String},
      accessTokenExpiresAt: {type: Date},
      scope: {type: String}, // not sure if this is needed
      clientId: {type: String},
      userId: {type: String}
    },{collection: "OAuthAccessTokens"})
  
  const OAuthRefreshTokens =
    new Schema({
      _id: {type: String},
      refreshToken: {type: String},
      refreshTokenExpiresAt: {type: Date},
      scope: {type: String}, // not sure if this is needed
      clientId: {type: String},
      userId: {type: String}
    }, {collection: "OAuthRefreshTokens"})


const OAuthAuthorizationCodesModel = mongoose.model("OAuthAuthorizationCodes",OAuthAuthorizationCodes);
const OAuthAccessTokensModel = mongoose.model("OAuthAccessTokens",OAuthAccessTokens);
const OAuthRefreshTokensModel = mongoose.model("OAuthRefreshTokens",OAuthRefreshTokens);

async function saveAuthorizationCode(code, client, user) {
    const authorizationCode = {
      authorizationCode: code.authorizationCode,
      expiresAt: code.expiresAt,
      redirectUri: code.redirectUri,
      scope: code.scope,
      clientId: client.id,
      userId: user._id
    };
    await OAuthAuthorizationCodesModel.create({_id: uuid(), ...authorizationCode});
    return authorizationCode;
  }


  async function getAuthorizationCode(authorizationCode) {
    const code = await OAuthAuthorizationCodesModel.findOne({authorizationCode}).lean();
    if (!code) throw new Error("Authorization code not found");
  
    return {
      code: code.authorizationCode,
      expiresAt: code.expiresAt,
      redirectUri: code.redirectUri,
      scope: code.scope,
      client: {id: code.clientId},
      user: {id: code.userId}
    };
  }

  async function revokeAuthorizationCode({code}) {
    const res = await OAuthAuthorizationCodesModel.deleteOne({authorizationCode: code});
    return res.deletedCount === 1;
  }
  

  async function revokeToken({refreshToken}) {
    const res = await OAuthAccessTokensModel.deleteOne({refreshToken});
    return res.deletedCount === 1;
  }
  
  /**
   * Save token.
   */
  async function saveToken(token, client, user) {
    await OAuthAccessTokensModel.create({
      accessToken: token.accessToken,
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      scope: token.scope,
      _id: uuid(),
      clientId: client.id,
      userId: user.id
    });
  
    if (token.refreshToken) {
      await OAuthRefreshTokensModel.create({
        refreshToken: token.refreshToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        scope: token.scope,
        _id: uuid(),
        clientId: client.id,
        userId: user.id
      });
    }
    return {
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        refreshToken: token.refreshToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        scope: token.scope,
        client: {id: client.id},
        user: {id: user.id},
    
        // other formats, i.e. for Zapier
        access_token: token.accessToken,
        refresh_token: token.refreshToken
      };
    }

    async function getAccessToken(accessToken) {
        const token = await OAuthAccessTokensModel.findOne({accessToken}).lean();
        if (!token) throw new Error("Access token not found");
      
        return {
          accessToken: token.accessToken,
          accessTokenExpiresAt: token.accessTokenExpiresAt,
          scope: token.scope,
          client: {id: token.clientId},
          user: {id: token.userId}
        };
      }
      
      /**
       * Get refresh token.
       */
      async function getRefreshToken(refreshToken) {
        const token = await OAuthRefreshTokensModel.findOne({refreshToken}).lean();
        if (!token) throw new Error("Refresh token not found");
      
        return {
          refreshToken: token.refreshToken,
          // refreshTokenExpiresAt: token.refreshTokenExpiresAt, // never expires
          scope: token.scope,
          client: {id: token.clientId},
          user: {id: token.userId}
        };
      }


      export default {
        saveToken,
        saveAuthorizationCode,
        revokeAuthorizationCode,
        revokeToken,
        getAuthorizationCode,
        getAccessToken,
        getRefreshToken
      };