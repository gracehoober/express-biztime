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
  const invoiceResults = await db.query(
    `SELECT id, amt, paid, add_date, paid_date
      FROM invoices
      WHERE id=$1`, [id]
  );
  const invoice = invoiceResults.rows[0];
  if (!invoice) throw new NotFoundError("Invoice not found");

});

module.exports = router;