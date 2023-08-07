var express = require("express");
var router = express.Router();
var db = require("../lib/db");

//상품 list 전달하기 서버 api
router.get("/product-list", function (req, res) {
  db.query(
    `SELECT * FROM product INNER JOIN product_category ON product.category_idx = product_category.idx INNER JOIN image ON product.idx = image.product_idx`,
    function (err, result) {
      console.log(result);
      if (err) {
        return res.status(404).json({
          message: "DB_ERROR",
        });
      }
      res.status(200).json({
        message: "SUCCESS",
        contents: result,
      });
    }
  );
});

router.get("/product-category-tab", function (req, res) {
  db.query(`SELECT * FROM product_category`, function (err, result) {
    console.log(result);
    if (err) {
      return res.status(404).json({
        message: "DB_ERROR",
      });
    }
    res.status(200).json({
      message: "SUCCESS",
      contents: result,
    });
  });
});

router.post("/product-category-data", function (req, res) {
  const post = req.body;
  console.log(post);
  db.query(
    `SELECT * FROM product INNER JOIN product_category ON product.category_idx = product_category.idx INNER JOIN image ON product.idx = image.product_idx WHERE category_idx=?`,
    [post.category_idx],
    function (err, result) {
      if (err) {
        console.log(err);
        return res.status(404).json({
          message: "DB_ERROR",
        });
      } else if (result[0] === undefined) {
        return res.status(200).json({
          message: "DATA_IS_NOT_EXIST",
          contents: result,
        });
      }
      console.log(result[0]);
      res.status(200).json({
        message: "SUCCESS",
        contents: result,
      });
    }
  );
});

module.exports = router;
