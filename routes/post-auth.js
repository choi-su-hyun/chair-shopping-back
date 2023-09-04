var express = require("express");
var router = express.Router();
var db = require("../lib/db");

router.post("/insert-to-cart-process", function (req, res) {
  const post = req.body;
  // const userData = req.user;
  // console.log("post 내용", post, "user 내용", userData);
  // db.query(`INSERT INTO cart(product_idx, user_idx, cart_qty, option_idx)`, [
  //   post.productIdx,
  // ]);
  res.status(200).json({
    message: "연결 완료",
  });
});

module.exports = router;
