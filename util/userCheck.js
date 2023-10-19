const { sign, verify, refresh, refreshVerify } = require("./token");
const db = require("../lib/db");

module.exports = function (req, res, next) {
  try {
    // let token = req.accessToken ? req.accessToken : req.newAccessToken;
    // console.log("req.accessToken 값", req.accessToken);
    // console.log("req.newAccessToken 값", req.newAccessToken);

    let tokenDecoded;
    if (req.accessToken) {
      tokenDecoded = verify(req.accessToken);
    } else if (req.newAccessToken) {
      tokenDecoded = verify(req.newAccessToken);
    }

    db.query(
      `SELECT * FROM user WHERE idx=?`,
      [tokenDecoded.idx],
      function (err, rows) {
        if (err) {
          res.status(500).json({
            message: "DB_ERROR",
            err,
          });
        }
        if (rows[0] === undefined) {
          res.status(404).json({
            message: "USER_IS_NOT_FOUND",
          });
        }
        req.user = rows[0];
        next();
      }
    );
  } catch (error) {
    console.log(error);
  }
};
