"use strict";

const express = require("express");
//const app = require("./app");
const router = new express.Router();
const db = require("../db");
const { BadRequestError } = require("../expressError");

/**
 * GET /companies: queries db for all companies, returns array holding each
 * of company and its code, name.
 */
router.get("/", async function (req, res) {
   let result = await db.query("SELECT name, code FROM companies");
   const companies = result.rows;
   return res.json({ companies });
});

router.get("/:code", async function (req, res) {
   let code = req.params.code;
   console.log(code);
   let result = await db.query(
      `SELECT code, name, description
         FROM companies
         WHERE code = $1`, [code]
   );
   console.log(result);
   const company = result.rows[0];
   return res.json({ company });
});

router.post("/", async function (req, res) {
   if (!req.body) throw new BadRequestError();

   const { code, name, description } = req.body;
   const result = await db.query(
      `INSERT INTO companies (code, name, description)
         VALUES ($1, $2, $3)
         RETURNING code, name, description`,
      [code, name, description]
   );
   const company = result.rows[0];
   return res.status(201).json({ company });
});


module.exports = router;

