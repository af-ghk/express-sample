import authenticate from "../middlewares/authenticate.js";
import service  from "./service.js";
import express from "express";



// it's based on https://merlino.agency/blog/step-by-step-how-to-implement-oauth2-server-in-expressjs#implementation article
//const finalRouter = (app) => {
//    const router = express.Router()
//
//    router.post("/token", function(req,res){
//        console.log('authorize function called')
//	var request = new Request(req);
//	var response = new Response(res);
//
//	return app.oauth.token(request, response)
//		.then(function(token) {
//			res.json(token);
//		}).catch(function(err) {
//			res.status(err.code || 500).json(err);
//		});
//    })
//    return router
//}

// it's based on https://blog.logrocket.com/implement-oauth-2-0-node-js/#about-oauth-2 article
//const finalRouter = (app) => {
//    router.post("/register", controllers.authenticator.registerUser);
//    // renamed functions https://oauth2-server.readthedocs.io/en/latest/misc/migrating-v2-to-v3.html
//    router.post("/login", app.oauth.token(), controllers.authenticator.login);
//
//    return router;
//}

const router = express.Router();

router.get("/authorize", service.authorize);
router.post("/token", service.token);
router.get("/authenticate", authenticate, service.test);

export default router;
