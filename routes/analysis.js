var express = require("express");
var router = express.Router();
var axios = require("axios");

router.get("/", function (req, res, next) {
  // http://localhost:8000/api/analysis?from_date=2022-02-01&to_date=2022-05-01
  const apiUrl =
    process.env.STOCKIST_API || "http://localhost:8000/api/analysis";
  axios
    .get(apiUrl, {
      params: {
        ...req.query,
      },
    })
    .then((result) => {
      res.json(result.data);
    }).catch( err => {
        res.status(400)
        res.json({message:"Failed"})
    });
});

module.exports = router;
