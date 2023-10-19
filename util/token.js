const jwt = require("jsonwebtoken");
const jwtPrivateData = require("../config/jwtPrivateData");
var db = require("../lib/db");

module.exports = {
  sign: function (user) {
    const payload = {
      idx: user.idx,
      nickName: user.nickName,
    };
    console.log("payload", payload);
    return jwt.sign(payload, jwtPrivateData.secretKey, jwtPrivateData.option);
  },
  verify: function (token) {
    let decoded;
    try {
      // verify를 통해 값 decode!
      decoded = jwt.verify(token, jwtPrivateData.secretKey);
      console.log("decoded", decoded);
    } catch (err) {
      if (err.message === "jwt expired") {
        console.log("expired token");
        return "expired token";
      } else if (err.message === "invalid token") {
        console.log("invalid token");
        return "invalid token";
      } else {
        console.log("token is not included", err);
        return "token is not included";
      }
      // console.log(err);
    }
    return decoded;
  },
  refresh: function () {
    return jwt.sign({}, jwtPrivateData.secretKey, jwtPrivateData.refreshOption);
  },
  refreshVerify: function (token, userId) {
    try {
      let userTokenData;
      db.query(
        `SELECT refresh_token FROM user WHERE idx=?`,
        [userId],
        function (err, row) {
          if (err) {
            console.log(err);
            return {
              status: "ERROR",
              data: err,
            };
          }
          console.log(row[0]);
          userTokenData = row[0];
          if (token === userTokenData) {
            userTokenData;
            return userTokenData;
          } else {
            return "Refresh token is uncorrect";
          }
        }
      );
    } catch (error) {
      if (err.message === "jwt expired") {
        console.log("expired token");
        return "expired token";
      } else if (err.message === "invalid token") {
        console.log("invalid token");
        return "invalid token";
      } else {
        console.log("token is not included", err);
        return "token is not included";
      }
    }
  },
};
