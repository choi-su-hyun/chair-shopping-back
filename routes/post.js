var express = require("express");
var router = express.Router();
var db = require("../lib/db");

//상품 list 전달하기 서버 api
router.get("/product-list", function (req, res) {
  db.query(
    `SELECT * FROM product INNER JOIN product_category ON product.category_idx = product_category.idx`,
    function (err, result) {
      console.log(result);
      if (err) {
        res.status(404).json({
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

module.exports = router;
