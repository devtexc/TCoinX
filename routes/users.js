var express = require("express");
var router = express.Router();
require("dotenv").config({ path: __dirname + "/.env" });

/* GET users listing. */
router.get("/", function (req, res, next) {
  const { ALCHEMY_API_KEY, GOERLI_PRIVATE_KEY } = process.env;
  res.json({ ALCHEMY_API_KEY, GOERLI_PRIVATE_KEY });
});

module.exports = router;
