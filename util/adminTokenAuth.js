const { sign, verify, refresh, refreshVerify } = require("./token");
const jwt = require("jsonwebtoken");
const adminData = require("../config/adminPrivateData");

module.exports = async function tokenAuthCheck(req, res, next) {
  const accessTokenData = req.headers.authorization;
  console.log("tokenData", accessTokenData);

  const accessTokenResult = verify(accessTokenData);
  console.log("accessTokenResult 값", accessTokenResult);
  // console.log(
  //   "accessTokenResult 비교 결과",
  //   accessTokenResult.data.adminId === adminData.id,
  //   accessTokenResult.data.adminId,
  //   adminData.id
  // );
  if (accessTokenResult.authState) {
    if (accessTokenResult.data.adminId === adminData.id) {
      req.administrator = accessTokenResult.data.adminId;
      next();
    } else if (accessTokenResult.data.adminId !== adminData.id) {
      res.status(404).json({
        message: "Admin id is not matched",
      });
    }
  } else {
    res.status(401).json({
      message: accessTokenResult.message,
      authState: accessTokenResult.authState,
    });
  }
};
