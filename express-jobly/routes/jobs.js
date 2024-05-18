const express = require("express");
const jsonschema = require("jsonschema");
const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");
const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobSearchSchema = require("../schemas/jobSearch.json");

const router = new express.Router();

router.post("/", ensureAdmin, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.create(req.body);
    res.status(201).json({ job });
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  const query = req.query;
  if (query.minSalary !== undefined) query.minSalary = +query.minSalary;
  query.hasEquity = query.hasEquity === "true";

  try {
    const validator = jsonschema.validate(query, jobSearchSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const jobs = await Job.findAll(query);
    res.json({ jobs });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const job = await Job.get(req.params.id);
    res.json({ job });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", ensureAdmin, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, jobUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.update(req.params.id, req.body);
    res.json({ job });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", ensureAdmin, async (req, res, next) => {
  try {
    await Job.remove(req.params.id);
    res.json({ deleted: +req.params.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;