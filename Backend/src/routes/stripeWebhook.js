const express = require("express");
const router = express.Router();
const { webhookHandler } = require("../controllers/webhookController");

router.post("/",
    express.raw({ type: "application/json" }),
    webhookHandler
);

module.exports = router;
