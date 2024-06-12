authorizationMiddleware = {
    authorized: function(req,res,next) {
        if (isValid(req)) {
         next(); // calls the next middleware
        }else {
         return res.sendStatus(401); // sends HTTP 401 back
        }
    }
}

export default authorizationMiddleware