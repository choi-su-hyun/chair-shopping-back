const { sign, verify, refresh, refreshVerify } = require("./token");
const jwt = require("jsonwebtoken");
const db = require("../lib/db");

module.exports = async function tokenAuthCheck(req, res, next) {
  // //프론트에 안내 없이 서버 내에서 알아서 재발급 방식
  // if (req.headers.authorization && req.headers.refresh) {
  //   const accessToken = req.headers.authorization;
  //   const refreshToken = req.headers.refresh;

  //   const accessResult = verify(accessToken);
  //   const decoded = jwt.decode(accessToken);

  //   if (decoded == null) {
  //     return res.status(401).json({
  //       message: "NO_AUTHORIZED",
  //     });
  //   }
  //   console.log("decoded 값", decoded);
  //   const refreshResult = refreshVerify(refreshToken, decoded.idx);

  //   if (accessResult === "expired token" || accessResult === "invalid token") {
  //     if (refreshResult == "expired token") {
  //       return res.status(401).json({
  //         message: "Access, refresh token is expired",
  //       });
  //     } else if (refreshResult == "invalid token") {
  //       return res.status(401).json({
  //         message: "Access, refresh token is invalid",
  //       });
  //     } else if (refreshResult == "Refresh token is uncorrect") {
  //       return res.status(401).json({
  //         message: "Access token is invalid, Refresh token is uncorrect",
  //       });
  //     } else {
  //       const newAccessToken = sign(decoded);
  //       req.newAccessToken = newAccessToken;
  //       next();
  //     }
  //   } else {
  //     if (refreshResult == "expired token") {
  //       const newRefreshToken = refresh();
  //       req.newRefreshToken = newRefreshToken;
  //       db.query(
  //         `UPDATE SET refresh_token=? WHERE idx=?`,
  //         [newRefreshToken, decoded.idx],
  //         function (err, result) {
  //           if (err) {
  //             return res.status(500).json({
  //               message: "DB error",
  //               err,
  //             });
  //           }
  //           next();
  //         }
  //       );
  //     } else {
  //       const validAccessResult = verify(accessToken);
  //       req.accessToken = validAccessResult;
  //       next();
  //     }
  //   }
  // } else {
  //   return res.status(400).json({
  //     message: "Token is not include",
  //   });
  // }
  // //----여기까지

  const accessTokenData = req.headers.authorization;
  console.log("tokenData", accessTokenData);

  const accessTokenResult = verify(accessTokenData);
  console.log("accessTokenResult 값", accessTokenResult);
  if (accessTokenResult.authState) {
    db.query(
      `SELECT * FROM user WHERE idx=?`,
      [accessTokenResult.data.idx],
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
  } else {
    res.status(401).json({
      message: accessTokenResult.message,
      authState: accessTokenResult.authState,
    });
  }
};
