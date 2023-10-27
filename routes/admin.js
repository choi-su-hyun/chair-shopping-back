var express = require("express");
var router = express.Router();
var db = require("../lib/db");
var { sign } = require("../util/token");
var bcrypt = require("bcrypt");
var upload = require("../util/multer");
var fs = require("fs");

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
        } else if (rows[0].admin_password === post.admin_password) {
          const adminData = {
            adminIdx: rows[0].idx,
            nickName: rows[0].admin_id,
          };
          const token = sign(adminData);
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

//특정 상품 DB 수정
router.put(
  "/product-update-process",
  upload.fields([
    { name: "product_image" },
    { name: "product_detail_image" },
    { name: "data" },
  ]),
  function (req, res) {
    const post = JSON.parse(req.body.data);
    const productId = req.query.productId.productId;
    console.log("post 내용", post, req.files, productId);

    db.query(
      `UPDATE product SET product_name=?, product_price=?, product_description=?, category_idx=? ,product_discount=? WHERE idx=?`,
      [
        post.product_name,
        post.product_price,
        post.product_description,
        post.product_category,
        post.product_discount_rate,
        productId,
      ],
      function (err, result) {
        if (err) {
          return res.status(500).json({
            message: "DB_ERROR_IMAGE",
            content: err,
          });
        }
        //옵션 수정
        db.query(
          `SELECT option_name FROM product_option WHERE product_id=?`,
          [productId],
          function (err, rows) {
            if (err) {
              return res.status(500).json({
                message: "DB_ERROR_OPTION",
                content: err,
              });
            }
            console.log("rows 값", rows);

            let haveToUpdate = post.product_option.filter((item) =>
              rows.includes(item.optionName)
            );
            let haveToDelete = post.product_option.filter(
              (item) => !rows.includes(item.optionName)
            );
            let haveToInsert = rows.filter(
              (item) => !post.product_option.includes(item.option_name)
            );
            console.log(
              "option 확인",
              haveToUpdate,
              haveToDelete,
              haveToInsert
            );
          }
        );
        // for (let item of post.product_option) {
        //   //옵션을 db에 저장
        //   if (item.optionName === "" || item.inventory === "") {
        //     console.log("값이 비어있어 반복문을 넘어감");
        //     continue;
        //   }
        //   // if (item.optionName)
        //   console.log("i 값 확인", item);
        //   db.query(
        //     `INSERT INTO product_option(option_name, product_id, inventory) VALUES(?, ?, ?)`,
        //     [item.optionName, productId.productId, item.inventory],
        //     function (err, result) {
        //       if (err) {
        //         return res.status(500).json({
        //           message: "DB_ERROR_IMAGE",
        //           content: err,
        //         });
        //       }
        //     }
        //   );
        // }

        if (req.files.product_image) {
          const fileDataProduct_image = req.files.product_image[0].filename;
          db.query(
            `SELECT image_thumnail_path FROM image WHERE product_idx=?`,
            [productId],
            function (err, row) {
              if (err) {
                return res.status(500).json({
                  message: "DB_ERROR_IMAGE",
                  content: err,
                });
              }
              const prevImagePath = row[0];
              db.query(
                `UPDATE SET image_thumnail_path=? WHERE product_id=?`,
                [fileDataProduct_image, productId],
                function (err2, result) {
                  if (err2) {
                    return res.status(500).json({
                      message: "DB_ERROR_IMAGE",
                      content: err2,
                    });
                  }
                  fs.unlink(prevImagePath, (err3) => {
                    if (err3) {
                      console.log("파일 삭제 실패", err3);
                    }
                    console.log("파일 삭제 성공");
                  });
                }
              );
            }
          );
        } else if (req.files.product_detail_image) {
          const fileDataProduct_detail_image =
            req.files.product_detail_image[0].filename;
          db.query(
            `UPDATE SET image_detail_path=? WHERE product_id=?`,
            [fileDataProduct_detail_image, productId],
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
        res.status(200).json({
          message: "Product update is success",
        });
      }
    );
  }
);

module.exports = router;
