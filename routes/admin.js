var express = require("express");
var router = express.Router();
var db = require("../lib/db");

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

module.exports = router;
