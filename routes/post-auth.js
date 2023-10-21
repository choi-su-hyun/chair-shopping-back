var express = require("express");
var router = express.Router();
var db = require("../lib/db");
var upload = require("../util/multer");

//카트 DB에 상품 추가
router.post("/insert-to-cart-process", function (req, res) {
  const post = req.body;
  const userData = req.user;
  // console.log("post 내용", post, "user 내용", userData);
  db.query(
    `INSERT INTO cart(product_idx, user_idx, cart_qty, option_idx) VALUES(?,?,?,?)`,
    [post.productIdx, userData.idx, post.quantity, post.productOption],
    function (err, result) {
      if (err) {
        console.log(err);
        res.status(500).json({
          message: "DB_ERROR",
          err,
        });
      }
      return res.status(200).json({
        message: "SUCCESS_ADD_TO_CART",
        content: result,
      });
    }
  );
});

//카트 리스트 정리 후 전달
router.get("/get-cart-list-process", function (req, res) {
  const userData = req.user;
  // console.log("user 내용", userData);
  db.query(
    `SELECT * FROM cart where user_idx=?`,
    [userData.idx],
    function (err, rows) {
      if (err) {
        console.log(err);
        return res.status(404).json({
          message: "DB_ERROR",
          err,
        });
      }
      // console.log("rows 값", rows);

      db.query(
        `SELECT cart.idx, product.idx as productId, product.product_name, product.product_discount, product.product_price, product_category.category_name, image.image_thumnail_path, product_option.idx as optionId, product_option.option_name, cart.cart_qty FROM cart 
        JOIN product ON cart.product_idx=product.idx 
        JOIN image ON image.product_idx=product.idx 
        JOIN product_option ON cart.option_idx=product_option.idx
        JOIN product_category ON product.category_idx=product_category.idx WHERE cart.user_idx=?`,
        [userData.idx],
        function (err, rows2) {
          if (err) {
            console.log(err);
            return res.status(404).json({
              message: "DB_ERROR",
              err,
            });
          }
          // console.log("rows2 값", rows2[0]);

          res.status(200).json({
            message: "연결 완료",
            content: rows2,
          });
        }
      );
    }
  );
});

//카트의 상품 수량 1 추가
router.post("/increase-cart-inventory", function (req, res) {
  const post = req.body;
  const userData = req.user;
  // console.log("post 값", post);
  db.query(
    `UPDATE cart SET cart_qty=cart_qty + 1 WHERE user_idx=? AND product_idx=?`,
    [userData.idx, post.idx],
    function (err, result) {
      if (err) {
        console.log(err);
        return res.status(404).json({
          message: "DB_ERROR",
          err,
        });
      }
      res.status(200).json({
        message: "연결 완료",
        content: result,
      });
    }
  );
});

//개인용 카트 DB 삭제
router.delete("/delete-cart", function (req, res) {
  const userData = req.user;
  db.query(
    `DELETE FROM cart WHERE user_idx=?`,
    [userData.idx],
    function (err, result) {
      if (err) {
        console.log(err);
        return res.status(404).json({
          message: "DB_ERROR",
          err,
        });
      }
      res.status(200).json({
        message: "DELETE_SUCCESS",
        content: result,
      });
    }
  );
});

//개인용 카트 DB 내용중 선택한 컬럼만 삭제
router.delete("/delete-selected-cart", function (req, res) {
  const userData = req.user;
  const post = req.body;
  // console.log("userData, post", userData, post);
  for (let i of post.selectedData) {
    db.query(
      `DELETE FROM cart WHERE user_idx=? AND idx=?`,
      [userData.idx, i],
      function (err, result) {
        if (err) {
          console.log(err);
          return res.status(404).json({
            message: "DB_ERROR",
            err,
          });
        }
      }
    );
  }
  res.status(200).json({
    message: "DELETE_SUCCESS",
  });
});

//사용자별 리뷰 DB에 작성
router.post(
  "/create-review-process",
  upload.fields([{ name: "reviewImage" }, { name: "reviewTextData" }]),
  function (req, res) {
    const userData = req.user;
    const files = req.files;
    const post = JSON.parse(req.body.reviewTextData);

    // console.log("userData, files", userData, files, post);
    // console.log(
    //   "내용물 확인중",
    //   userData.idx,
    //   post.productId.id,
    //   post.reviewTitle,
    //   post.reviewParagraph,
    //   post.reviewStarRate,
    //   files.reviewImage[0].filename
    // );
    db.query(
      `INSERT INTO review(user_idx, product_idx, title, paragraph, evaluation_star, review_image_path) VALUES(?, ?, ?, ?, ?, ?)`,
      [
        userData.idx,
        post.productId.id,
        post.reviewTitle,
        post.reviewParagraph,
        post.reviewStarRate,
        files.reviewImage[0].filename,
      ],
      function (err, result) {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: "DB_ERROR",
            err,
          });
        }
        // res.status(200).json({
        //   message: "SUCCESS",
        //   // result: result,
        // });
      }
    );
    // res.status(200).json({
    //   message: "SUCCESS",
    // });
  }
);

module.exports = router;
