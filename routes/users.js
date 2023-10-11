var express = require("express");
var router = express.Router();
var db = require("../lib/db");
var bcrypt = require("bcrypt");
var newToken = require("../util/token");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

//회원가입 서버 api
router.post("/signup-process", async function (req, res) {
  const post = req.body;
  try {
    await bcrypt.hash(post.user_password, 10, (err, encryptedPW) => {
      //콜백함수의 encryptedPW 위치의 인자를 통해 암호화된 값을 전달 받음.
      db.query(
        `INSERT INTO user(user_id, user_password, user_name, user_email, user_phone) VALUES(?,?,?,?,?)`,
        [
          post.user_id,
          encryptedPW,
          post.user_name,
          post.user_email,
          post.user_phone,
        ],
        function (err2, result) {
          if (err2) {
            console.log(err2);
            res.status(500).json({ message: "FAILED_MYSQL_INSERT", err2 });
          }
          console.log(post);
          res.status(200).json({ message: "SUCCESS_SIGNUP" });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ message: "FAILED_ENCRYPT", error });
  }
});

//로그인 서버 api
router.post("/login-process", function (req, res) {
  const post = req.body;
  try {
    db.query(
      `SELECT * FROM user WHERE user_id=?`,
      [post.user_id],
      async function (err, rows) {
        if (err) {
          console.log(err);
          res.status(500).json({ message: "FAILED_MYSQL_SELECT", err });
        }
        if (rows[0] === undefined) {
          return res.status(404).json({
            message: "ID_NOTHING",
          });
        }
        await bcrypt.compare(
          post.user_password,
          rows[0].user_password,
          function (err2, match) {
            if (err2) {
              res.status(500).json({
                message: "DECRYPTION_ERROR",
                err2,
              });
            }
            if (match) {
              const userData = {
                userIdx: rows[0].idx,
                nickName: rows[0].user_name,
              };
              console.log("사용자 값 확인", userData);
              const token = newToken.sign(userData).token;
              console.log("토큰 확인", token);
              res.status(200).json({
                message: "THIS_USER_CERTIFICATED",
                nickName: rows[0].user_name,
                token: token,
              });
            } else {
              res.status(401).json({
                message: "PASSWORD_NOT_MATCHED",
              });
            }
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({
      message: "SOMETHING_ERROR",
      error,
    });
  }
});

module.exports = router;
