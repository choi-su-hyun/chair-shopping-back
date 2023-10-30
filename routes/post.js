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
router.get("/product-detail-data-process", function (req, res) {
  const post = req.query;
  db.query(
    `SELECT a.idx, a.category_idx, b.category_name, a.product_name, a.product_description, a.product_discount, a.product_price, c.image_thumnail_path, c.image_detail_path  FROM product AS a 
    INNER JOIN product_category AS b ON a.category_idx = b.idx 
    INNER JOIN image AS c ON a.idx = c.product_idx WHERE a.idx = ?`,
    [post.productId],
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
router.get("/product-option-list", function (req, res) {
  const post = req.query;
  db.query(
    `SELECT * FROM product_option WHERE product_id = ?`,
    [post.productId],
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

//리뷰 DB에서 특정 상품 리뷰 리스트로 전달하기
router.get("/get-review-list-process", function (req, res) {
  const post = req.query;
  // console.log("post", post);
  db.query(
    `SELECT a.product_idx, a.title, a.paragraph, a.evaluation_star, a.review_image_path, a.created_date ,b.user_name, b.idx as user_idx FROM review AS a JOIN user AS b ON a.user_idx=b.idx WHERE a.product_idx=?`,
    [post.productId],
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
});

//리뷰 DB 값의 평균 값 전달하기
router.get("/get-review-average-process", function (req, res) {
  const post = req.query;
  console.log("post 값", post);
  db.query(
    `SELECT AVG(evaluation_star) AS review_average, COUNT(idx) AS review_count FROM review WHERE product_idx=?`,
    [post.productId],
    function (err, row) {
      if (err) {
        console.log(err);
        return res.status(404).json({
          message: "DB_ERROR_REVIEW_AVERAGE",
        });
      }
      res.status(200).json({
        message: "Success",
        contents: row[0],
      });
    }
  );
});

module.exports = router;
