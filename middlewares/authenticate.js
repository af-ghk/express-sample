import server from "../auth/service.js"
import {Request, Response} from "oauth2-server"
const authenticate = (req, res, next) => {
    const request = new Request(req);
    const response = new Response(res);
    return server.server
      .authenticate(request, response)
      .then((data) => {
        req.auth = {userId: data?.user?.id, sessionType: "oauth2"};
        next();
      })
      .catch((err) => {
        console.log("err", err);
        res.status(err.code || 500).json(err instanceof Error ? {error: err.message} : err);
      });
  };

  export default authenticate