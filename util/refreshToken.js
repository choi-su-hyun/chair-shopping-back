const { sign, verify, refreshVerify } = require("./token");
const jwt = require("jsonwebtoken");

const refresh = async (req, res) => {
  if (req.headers.authorization && req.headers.refresh) {
    const accessToken = req.headers.authorization;
    const refreshToken = req.headers.refresh;

    const accessResult = verify(accessToken);
    const decoded = jwt.decode(accessToken);

    if (decoded == null) {
      res.status(401).json({
        message: "NO_AUTHORIZED",
      });
    }
    // console.log("refreshToken 값", refreshToken);

    const refreshResult = await refreshVerify(refreshToken, decoded.idx);
    if (!accessResult.authState) {
      // console.log("refreshResult 값", refreshResult);
      // console.log("accessResult 값", accessResult);
      if (!refreshResult.authState) {
        res.status(401).json({
          message: "Expired/invalid all token",
        });
      } else {
        const newAccessToken = sign(decoded);

        res.status(200).json({
          message: "New access and refresh token",
          contents: {
            accessToken: newAccessToken,
            refreshToken,
          },
        });
      }
    } else {
      res.status(401).json({
        message: "Access token is valid",
      });
    }
  } else {
    res.status(401).json({
      message: "All token is not include",
    });
  }
};

module.exports = refresh;
