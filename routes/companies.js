"use strict";

const express = require("express");
//const app = require("./app");
const router = new express.Router();
const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");

/**
 * GET /companies: queries db for all companies, returns array holding each
 * company and its code, name.
 */
router.get("/", async function (req, res) {
   const result = await db.query(`SELECT name, code FROM companies`);
   const companies = result.rows;

   return res.json({ companies });
})

/**
 * GET /companies/code: queries db for a single company, returns array holding
 * company and its code, name, and description.
 */
router.get("/:code", async function (req, res) {
   const code = req.params.code;

   const result = await db.query(
      `SELECT code, name, description
         FROM companies
         WHERE code = $1`, [code]
   );

   const company = result.rows[0];
   if(!company) throw new NotFoundError("Company not found");

   return res.json({ company });
})

/**
 * POST /companies: adding a company to the db, returns array holding
 * company and its code, name, and description.
 */
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
})

/**
 * PUT /companies/code: queries db for a single company based on URL parameter,
 * returns array holding updated company with code, name, and description.
 */
router.put("/:code", async function(req, res){
  if (!req.body) throw new BadRequestError();

  const code = req.params.code;
  const { name, description } = req.body;

  const result = await db.query(
    `UPDATE companies
     SET name = $1, description = $2
     WHERE code = $3
     RETURNING code, name, description`,
    [name, description, code]);

  const company = result.rows[0];
  if(!company) throw new NotFoundError("Company not found");

  return res.json({ company });
})

/**
 * DELETE /companies/code: queries db for a single company based on URL parameter,
 * returns { status: "deleted"} if company is successfully deleted.
 */
router.delete("/:code", async function(req, res){
  const code = req.params.code;

  const result = await db.query(
    `DELETE FROM companies WHERE code = $1 RETURNING code`, [code]);

  const company = result.rows[0];
  if(!company) throw new NotFoundError("Company not found");

  return res.json({ status: "deleted"});
})

module.exports = router;

