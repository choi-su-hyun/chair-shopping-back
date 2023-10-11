const jwt = require("jsonwebtoken");
const jwtPrivateData = require("../config/jwtPrivateData");

module.exports = {
  sign: function (user) {
    const payload = {
      idx: user.userIdx,
      nickName: user.nickName,
    };
    console.log("payload", payload);
    const result = {
      //sign메소드를 통해 access token 발급!
      token: jwt.sign(payload, jwtPrivateData.secretKey, jwtPrivateData.option),
      // refreshToken: randToken.uid(256)
    };
    return result;
  },
  verify: function (token) {
    let decoded;
    try {
      // verify를 통해 값 decode!
      decoded = jwt.verify(token, jwtPrivateData.secretKey);
    } catch (err) {
      // if (err.message === 'jwt expired') {
      //     console.log('expired token');
      //     return TOKEN_EXPIRED;
      // } else if (err.message === 'invalid token') {
      //     console.log('invalid token');
      //     console.log(TOKEN_INVALID);
      //     return TOKEN_INVALID;
      // } else {
      //     console.log("invalid token");
      //     return TOKEN_INVALID;
      // }
      console.log(err);
    }
    return decoded;
  },
};
