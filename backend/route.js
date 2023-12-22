const express = require('express')
const { processCallback, fetchData,clearData} = require("./controller"); 
const router = express.Router()

router.route("/processCallback").post(processCallback)
router.route("/fetchData").get(fetchData)
router.route('/clearData').get(clearData);

module.exports = router;