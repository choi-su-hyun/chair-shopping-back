var express = require("express");
var router = express.Router();
var db = require("../lib/db");
var { sign, refresh } = require("../util/token");
var bcrypt = require("bcrypt");
var upload = require("../util/multer");
var fs = require("fs");
let adminData = require("../config/adminPrivateData");

//admin 로그인
router.post("/admin-login-process", function (req, res) {
  const post = req.body;
  try {
    console.log("try에는 진입함.");
    console.log("adminData", adminData);
    const { id, pw } = adminData;
    console.log("id값", id, pw);
    if (id !== post.admin_id) {
      return res.status(404).json({
        message: "ID_NOTHING",
      });
    } else if (pw !== post.admin_password) {
      return res.status(404).json({
        message: "Password not matched",
      });
    }
    const adminDataWrap = {
      adminId: post.admin_id,
    };
    const token = sign(adminDataWrap);
    const refreshToken = refresh();

    db.query(
      `UPDATE admin SET admin_refresh_token=? WHERE idx=1`,
      [refreshToken],
      function (err, result) {
        if (err) {
          return res.status(500).json({
            message: "DB error",
            err,
          });
        }
      }
    );

    return res.status(200).json({
      message: "THIS_USER_CERTIFICATED",
      token: token,
      refreshToken: refreshToken,
    });
  } catch (error) {
    return res.status(500).json({
      message: "SOMETHING_ERROR",
      error,
    });
  }
});

//category 리스트 전달
router.get("/category-data", function (req, res) {
  db.query(`SELECT * FROM product_category`, function (err, rows) {
    if (err) {
      res.status(500).json({
        message: "DB_ERROR",
      });
    }
    console.log(rows);
    res.status(200).json({
      message: "HERE_YOU_ARE",
      content: rows,
    });
  });
});

module.exports = router;
