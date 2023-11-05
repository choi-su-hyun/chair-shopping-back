var express = require("express");
var router = express.Router();
var db = require("../lib/db");
var upload = require("../util/multer");

//category DB 생성
router.post("/category-create-process", function (req, res) {
  const post = req.body;
  db.query(
    `INSERT INTO product_category(category_name) VALUES(?)`,
    [post],
    function (err, result) {
      if (err) {
        return res.status(500).json({
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
          //이미지를 db에 저장
          `INSERT INTO image(product_idx, image_thumnail_path, image_detail_path) VALUES(?, ?, ?)`,
          [
            productIdx,
            req.files.product_image[0]?.filename,
            req.files.product_detail_image[0]?.filename,
          ],
          function (err, result) {
            if (err) {
              return res.status(500).json({
                message: "DB_ERROR_IMAGE",
                content: err,
              });
            }

            for (let i of post.product_option) {
              //옵션을 db에 저장
              if (i.optionName === "" || i.inventory === "") {
                console.log("값이 비어있어 반복문을 넘어감");
                continue;
              }
              console.log("i 값 확인", i);
              db.query(
                `INSERT INTO product_option(option_name, product_id, inventory) VALUES(?, ?, ?)`,
                [i.optionName, productIdx, i.inventory],
                function (err, result) {
                  if (err) {
                    return res.status(500).json({
                      message: "DB_ERROR_IMAGE",
                      content: err,
                    });
                  }
                }
              );
            }
            return res.status(200).json({
              message: "SUCCESS_PRODUCT_INSERT",
              content: "result",
            });
          }
        );
      }
    );
  }
);

module.exports = router;
