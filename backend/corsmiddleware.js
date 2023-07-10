const cors = require("cors");
const allowlist = ["http://localhost:3000", "http://localhost:3001"];
const corsOptionsDelegate = (req, callback) => {
  const corsOptions = {
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
  };
  if (allowlist.indexOf(req.header("Origin")) !== -1) {
    corsOptions.origin = true;
  } else {
    corsOptions.origin = false;
  }
  callback(null, corsOptions);
};
const corsExec = () => cors(corsOptionsDelegate);
module.exports = corsExec;
