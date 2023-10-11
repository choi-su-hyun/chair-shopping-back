const tokenTool = require("./token");
const db = require("../lib/db");

module.exports = async function tokenAuthCheck(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(404).json({
      message: "TOKEN_IS_NOT_INCLUDED",
    });
  }
  const tokenData = req.headers.authorization;
  console.log("tokenData", tokenData);

  try {
    const payload = tokenTool.verify(tokenData);
    console.log("payload 값", payload);
    db.query(
      `SELECT * FROM user WHERE idx=?`,
      [payload.idx],
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
  } catch (error) {}
};
