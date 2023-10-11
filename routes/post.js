var express = require("express");
var router = express.Router();
var db = require("../lib/db");

//상품 list 전송
router.get("/product-list", function (req, res) {
  db.query(
    `SELECT * FROM product INNER JOIN product_category ON product.category_idx = product_category.idx INNER JOIN image ON product.idx = image.product_idx`,
    function (err, result) {
      // console.log(result);
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

//상품 카테고리 탭 데이터 전송
router.get("/product-category-tab", function (req, res) {
  db.query(`SELECT * FROM product_category`, function (err, result) {
    // console.log(result);
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

//특정 카테고리를 조건으로 상품 리스트 전송
router.post("/product-category-data", function (req, res) {
  const post = req.body;
  // console.log(post);
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
      // console.log(result[0]);
      res.status(200).json({
        message: "SUCCESS",
        contents: result,
      });
    }
  );
});

//상세페이지 내용 전송
router.post("/product-detail-data-process", function (req, res) {
  const post = req.body;
  db.query(
    `SELECT a.idx, a.category_idx, b.category_name, a.product_name, a.product_description, a.product_discount, a.product_price, c.image_thumnail_path, c.image_detail_path  FROM product AS a 
    INNER JOIN product_category AS b ON a.category_idx = b.idx 
    INNER JOIN image AS c ON a.idx = c.product_idx WHERE a.idx = ?`,
    [post.idx],
    function (err, result) {
      if (err) {
        console.log(err);
        return res.status(404).json({
          message: "DB_ERROR",
        });
      }
      // console.log(result[0]);
      // console.log(post);
      res.status(200).json({
        message: "SUCCESS",
        contents: result,
      });
    }
  );
});

//해당 상품의 옵션 리스트 전달 api
router.post("/product-option-list", function (req, res) {
  const post = req.body;
  db.query(
    `SELECT * FROM product_option WHERE product_id = ?`,
    [post.idx],
    function (err, rows) {
      if (err) {
        console.log(err);
        return res.status(404).json({
          message: "DB_ERROR",
        });
      }

      res.status(200).json({
        message: "SUCCESS",
        contents: rows,
      });
    }
  );
  // console.log(post);
});

//카트DB에 저장 api
router.post("/insert-to-cart-process", function (req, res) {
  const post = req.body;
  const userData = req.user;
  console.log("post 내용", post, "user 내용", userData);
  // db.query(`INSERT INTO cart(product_idx, user_idx, cart_qty, option_idx)`, [
  //   post.productIdx,
  // ]);
  res.status(200).json({
    message: "연결 완료",
  });
});

module.exports = router;
