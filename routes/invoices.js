"use strict";

const express = require("express");
const router = new express.Router();

const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db");

/**
 * GET /invoices: queries the db for all invoices, returns their ids and company
 * codes in array
 */

router.get("/", async function (req, res) {
  const results = await db.query(
    `SELECT id, comp_code
      FROM invoices`
  );

  const invoices = results.rows;

  return res.json({ invoices });
});

/**
 * GET invoices/id: queries the db for one invoice by its id, returns all info
 * about the invoice, including information about the associated company
 */

router.get("/:id", async function (req, res) {
  const id = req.params.id;

  const invoiceResults = await db.query(
    `SELECT id, amt, paid, add_date, paid_date, comp_code
      FROM invoices
      WHERE id=$1`, [id]
  );

  const invoice = invoiceResults.rows[0];
  if (!invoice) throw new NotFoundError("Invoice not found");

  const companyResults = await db.query(
    `SELECT code, name, description
      FROM companies
      WHERE code=$1`, [invoice.comp_code]
  );

  const company = companyResults.rows[0];
  invoice.company = company;
  delete invoice.comp_code;

  return res.json({ invoice });
});

/**
 * POST invoices/id: adds a new invoice to the db, returns the added invoice
 * with id, comp_code, amt, paid, add_date, paid_date.
 */
router.post("/", async function (req, res) {
  if (!req.body) throw new BadRequestError();

  const { comp_code, amt } = req.body;

  const result = await db.query(
    `INSERT INTO invoices (comp_code, amt)
        VALUES ($1, $2)
        RETURNING comp_code, amt`,
    [comp_code, amt]
  );

  const invoice = result.rows[0];

  return res.status(201).json({ invoice });
});

/** PUT invoices/id: updates and existing invoices and resturns the updated
 * invoice object. */

router.put("/:id", async function (req, res) {
  if (!req.body) throw new BadRequestError();

  const id = req.params.id;
  const { amt } = req.body;

  const result = await db.query(
    `UPDATE invoices
      SET amt = $1
      WHERE id = $2
      RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [amt, id]
  );

  const invoice = result.rows[0];
  if (!invoice) throw new NotFoundError("Invoice not found");

  return res.json({ invoice });
});

/** DELETE invoices/id: gets invoice by id, tries to delete and returns
 * {status: "deleted"} if succesful
 * */

router.delete("/:id", async function (req, res) {
  const id = req.params.id;

  const result = await db.query(
    `DELETE FROM invoices WHERE id = $1 RETURNING id`, [id]);

  const invoice = result.rows[0];
  if (!invoice) throw new NotFoundError("Invoice not found");

  return res.json({ status: "deleted" });
});

/**
 * GET /companies/code: Queries the db for a company by its code, returns info
 * about the company, as well as a list of invoice ids for that company
 */

router.get("/companies/:code", async function (req, res) {
  const code = req.params.code;

  const companyResult = await db.query(
    `SELECT code, name, description
      FROM companies
      WHERE code = $1`, [code]
  );

  const company = companyResult.rows[0];
  if (!company) throw new NotFoundError("Company not found");

  const invoiceResult = await db.query(
    `SELECT id
      FROM invoices
      WHERE comp_code = $1`, [code]
  );
  company.invoices = invoiceResult.rows.map(invoice => invoice.id);

  return res.json({ company });
});

module.exports = router;