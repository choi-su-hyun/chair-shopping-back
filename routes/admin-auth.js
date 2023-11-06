var express = require("express");
var router = express.Router();
var db = require("../lib/db");
var upload = require("../util/multer");
var fs = require("fs");

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
        // console.log("update 결과 값", result);
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
            // console.log("rows 값", rows);
            let prevData = rows.map((item) => item.option_name);
            let newOneData = post.product_option.map((item) => item.optionName);

            let haveToUpdate = newOneData.filter((item) =>
              prevData.includes(item)
            );
            let haveToDelete = prevData.filter(
              (item) => !newOneData.includes(item)
            );
            let haveToInsert = newOneData.filter(
              (item) => !prevData.includes(item)
            );
            // console.log(
            //   "option 확인",
            //   prevData,
            //   newOneData,
            //   "정리된 값",
            //   haveToUpdate,
            //   haveToInsert,
            //   haveToDelete
            // );
            if (haveToUpdate) {
              for (let i = 0; i < post.product_option.length; i++) {
                for (let item of haveToUpdate) {
                  if (post.product_option[i].optionName == item) {
                    db.query(
                      `UPDATE product_option SET inventory=? WHERE option_name=? AND product_id=?`,
                      [post.product_option[i].inventory, item, productId],
                      function (err, result) {
                        if (err) {
                          return res.status(500).json({
                            message: "DB_ERROR_OPTION_UPDATE",
                            content: err,
                          });
                        }
                      }
                    );
                  }
                }
              }
            }
            if (haveToInsert) {
              for (let i = 0; i < post.product_option.length; i++) {
                for (let item of haveToInsert) {
                  if (post.product_option[i].optionName == item) {
                    db.query(
                      `INSERT INTO product_option(option_name, product_id, inventory) VALUES(?, ?, ?)`,
                      [item, productId, post.product_option[i].inventory],
                      function (err, result) {
                        if (err) {
                          return res.status(500).json({
                            message: "DB_ERROR_OPTION_INSERT",
                            content: err,
                          });
                        }
                      }
                    );
                  }
                }
              }
            }
            if (haveToDelete) {
              for (let item of haveToDelete) {
                db.query(
                  `DELETE FROM product_option WHERE option_name=? AND product_id=?`,
                  [item, productId],
                  function (err, result) {
                    if (err) {
                      return res.status(500).json({
                        message: "DB_ERROR_OPTION_INSERT",
                        content: err,
                      });
                    }
                  }
                );
              }
            }
          }
        );

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
              const prevImagePath = `./uploads/${row[0].image_thumnail_path}`;
              db.query(
                `UPDATE image SET image_thumnail_path=? WHERE product_idx=?`,
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
          // console.log("filename 확인", fileDataProduct_detail_image);
          db.query(
            `SELECT image_detail_path FROM image WHERE product_idx=?`,
            [productId],
            function (err, row) {
              if (err) {
                return res.status(500).json({
                  message: "DB_ERROR_IMAGE",
                  content: err,
                });
              }
              console.log("delete 할 파일", row[0]);
              const prevImagePath = `./uploads/${row[0].image_detail_path}`;
              db.query(
                `UPDATE image SET image_detail_path=? WHERE product_idx=?`,
                [fileDataProduct_detail_image, productId],
                function (err2, result) {
                  if (err2) {
                    return res.status(500).json({
                      message: "DB_ERROR_IMAGE",
                      content: err2,
                    });
                  }
                  // console.log("update 결과 값", result);
                  fs.unlink(prevImagePath, (err) => {
                    if (err) {
                      console.log("파일 삭제 실패", err);
                    }
                    console.log("파일 삭제 성공");
                  });
                }
              );
            }
          );
        }
        db.query(
          `SELECT a.idx, a.category_idx, b.category_name, a.product_name, a.product_description, a.product_discount, a.product_price, c.image_thumnail_path, c.image_detail_path FROM product AS a 
          INNER JOIN product_category AS b ON a.category_idx = b.idx 
          INNER JOIN image AS c ON a.idx = c.product_idx WHERE a.idx = ?`,
          [productId],
          function (err, row) {
            if (err) {
              console.log(err);
              return res.status(404).json({
                message: "DB_ERROR",
                err,
              });
            }
            console.log("row", row);
            db.query(
              `SELECT * FROM product_option WHERE product_id = ?`,
              [productId],
              function (err, row2) {
                if (err) {
                  console.log(err);
                  return res.status(404).json({
                    message: "DB_ERROR",
                    err,
                  });
                }
                return res.status(200).json({
                  message: "Product update is success",
                  contents: {
                    detailData: row,
                    option: row2,
                  },
                });
              }
            );
          }
        );
      }
    );
  }
);

//특정 상품 삭제
router.delete("/product-delete-process", function (req, res) {
  const post = req.query.productId;
  console.log("post값", post);
  db.query(
    `SELECT image_thumnail_path, image_detail_path FROM image WHERE product_idx=?`,
    [post.productId],
    function (err, row) {
      if (err) {
        return res.status(500).json({
          message: "DB errer",
          content: err,
        });
      }
      const prevThumnailPath = `./uploads/${row[0].image_thumnail_path}`;
      const prevDetailImagePath = `./uploads/${row[0].image_detail_path}`;

      db.query(
        `DELETE FROM product WHERE idx=?`,
        [post.productId],
        function (err, result) {
          if (err) {
            return res.status(500).json({
              message: "DB errer product delete",
              content: err,
            });
          }
          fs.unlink(prevThumnailPath, (err2) => {
            if (err2) {
              console.log("파일 삭제 실패", err2);
            }
            console.log("파일 삭제 성공");
          });
          fs.unlink(prevDetailImagePath, (err2) => {
            if (err2) {
              console.log("파일 삭제 실패", err2);
            }
            console.log("파일 삭제 성공");
          });
          db.query(
            `SELECT a.idx, a.product_name, a.product_description, a.product_price, a.product_discount, a.category_idx, b.category_name, c.image_detail_path, c.image_thumnail_path FROM product AS a 
          INNER JOIN product_category AS b ON a.category_idx = b.idx 
          INNER JOIN image AS c ON a.idx = c.product_idx`,
            function (err2, rows) {
              // console.log(result);
              if (err2) {
                return res.status(404).json({
                  message: "DB_ERROR",
                  err2,
                });
              }
              return res.status(200).json({
                message: "Product is deleted",
                contents: rows,
              });
            }
          );
        }
      );
    }
  );
});

module.exports = router;
