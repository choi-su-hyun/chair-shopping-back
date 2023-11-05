const jwt = require("jsonwebtoken");
const jwtPrivateData = require("../config/jwtPrivateData");
var db = require("../lib/db");
let adminData = require("../config/adminPrivateData");

module.exports = {
  sign: function (user) {
    const payload = {
      idx: user?.idx,
      nickName: user?.nickName,
      adminId: user?.adminId,
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
      return {
        authState: true,
        message: "token valide",
        data: decoded,
      };
    } catch (err) {
      if (err.message === "jwt expired") {
        console.log("expired token");
        return {
          authState: false,
          message: "expired token",
        };
      } else if (err.message === "invalid token") {
        console.log("invalid token");
        return {
          authState: false,
          message: "invalid token",
        };
      } else {
        console.log("token is not included", err);
        return {
          authState: false,
          message: "token is not included",
          data: err,
        };
      }
    }
  },
  refresh: function () {
    return jwt.sign({}, jwtPrivateData.secretKey, jwtPrivateData.refreshOption);
  },
  refreshVerify: async function (token, userId) {
    function dbQueryAsync(query, argument) {
      return new Promise((resolve, reject) => {
        db.query(query, argument, function (err, result) {
          if (err) {
            console.log(err);
            reject({
              authState: false,
              message: "ERROR",
              data: err,
            });
          }
          resolve(result);
        });
      });
    }
    try {
      if (userId === "administrator") {
        const adminTokenData = await dbQueryAsync(
          `SELECT admin_refresh_token FROM admin WHERE idx=1`
        );

        if (token == adminTokenData[0].admin_refresh_token) {
          console.log("if문 실행 -- admin");
          return {
            authState: true,
            message: "Token is correct",
            data: adminTokenData,
          };
        } else {
          console.log("else 문 실행");
          return {
            authState: false,
            message: "Refresh token is uncorrect",
          };
        }
      } else {
        const userTokenData = await dbQueryAsync(
          `SELECT refresh_token FROM user WHERE idx=?`,
          [userId]
        );
        console.log("userTokenData db함수 값", userTokenData[0].refresh_token);
        console.log("token 값", token);
        console.log(
          "userTokenData 과 token 값 비교",
          token == userTokenData[0].refresh_token
        );
        if (token == userTokenData[0].refresh_token) {
          console.log("if문 실행");
          return {
            authState: true,
            message: "Token is correct",
            data: userTokenData,
          };
        } else {
          console.log("else 문 실행");
          return {
            authState: false,
            message: "Refresh token is uncorrect",
          };
        }
      }
    } catch (err) {
      console.log("catch문 실행");
      if (err.message === "jwt expired") {
        console.log("refresh expired token");
        return {
          authState: false,
          message: "expired token",
        };
      } else if (err.message === "invalid token") {
        console.log("invalid token");
        return {
          authState: false,
          message: "invalid token",
        };
      } else {
        console.log("token is not included", err);
        return {
          authState: false,
          message: "token is not included",
          data: err,
        };
      }
    }
  },
};
