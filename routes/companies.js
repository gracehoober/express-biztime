const express = require("express");
//const app = require("./app");
const router = new express.Router();
const db = require("../db");

router.get("/", async function(req, res){
   let result = await db.query("SELECT name, code FROM companies");
   const companies = result.rows;
   return res.json({ companies });
})

module.exports = router;

