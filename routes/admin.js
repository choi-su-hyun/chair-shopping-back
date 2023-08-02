var express = require("express");
var router = express.Router();
var db = require("../lib/db");
var newToken = require("../util/token");
var bcrypt = require("bcrypt");
var upload = require("../util/multer");

//admin 로그인
router.post("/admin-login-process", function (req, res) {
  const post = req.body;
  try {
    db.query(
      `SELECT * FROM admin WHERE admin_id=?`,
      [post.admin_id],
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
          post.admin_password,
          rows[0].admin_password,
          function (err2, match) {
            if (err2) {
              res.status(500).json({
                message: "DECRYPTION_ERROR",
                err2,
              });
            }
            if (match) {
              const adminData = {
                adminIdx: rows[0].idx,
                nickName: rows[0].admin_id,
              };
              const token = newToken.sign(adminData).token;
              console.log("토큰 확인", token);
              res.status(200).json({
                message: "THIS_USER_CERTIFICATED",
                adminId: rows[0].admin_id,
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

//category DB 생성
router.post("/category-create-process", function (req, res) {
  const post = req.body;
  db.query(
    `INSERT INTO product_category(category_name) VALUES(?)`,
    [post],
    function (err, result) {
      if (err) {
        res.status(500).json({
          message: "DB_ERROR",
        });
      }
      console.log(result);
      res.status(200).json({
        message: "SUCCESS_INSERT",
        content: result,
      });
    }
  );
});

//상품 DB 생성
router.post(
  "/product-create-process",
  upload.fields([
    { name: "product_image" },
    { name: "product_detail_image" },
    { name: "data" },
  ]),
  (req, res) => {
    const post = JSON.parse(req.body.data);
    console.log("파일 이름", req.files, "텍스트 내용", req.body.data);
    let productIdx;
    db.query(
      `INSERT INTO product(product_name, product_price, product_description, category_idx, product_discount) VALUES(?, ?, ?, ?, ?)`,
      [
        post.product_name,
        post.product_price,
        post.product_description,
        post.product_category,
        post.product_discount_rate,
      ],
      function (err, result) {
        if (err) {
          console.log("값", post);
          console.log(err);
          return res.status(500).json({
            message: "DB_ERROR_PRODUCT_INFO",
            content: err,
          });
        }
        console.log("결과 값", result);
        productIdx = result.insertId;

        db.query(
          `INSERT INTO image(product_idx, image_thumnail_path, image_detail_path) VALUE(?, ?, ?)`,
          [
            productIdx,
            req.files.product_image[0].filename,
            req.files.product_detail_image[0].filename,
          ],
          function (err, result) {
            if (err) {
              return res.status(500).json({
                message: "DB_ERROR_IMAGE",
                content: err,
              });
            }
            res.status(200).json({
              message: "SUCCESS_PRODUCT_INSERT",
              content: result,
            });
          }
        );
      }
    );
  }
);
module.exports = router;
