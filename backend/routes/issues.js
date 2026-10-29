const express = require("express");
const mongoose = require("mongoose");
const Issue = require("../models/Issue");

const router = express.Router();

// GET /api/issues?search=&status=&category=
router.get("/", async (req, res, next) => {
  try {
    const { search, status, category } = req.query;
    const filter = {};
    if (status && status !== "All") filter.status = status;
    if (category && category !== "All") filter.category = category;
    if (search && search.trim()) {
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
        { location: { $regex: safeSearch, $options: "i" } }
      ];
    }
    const issues = await Issue.find(filter).sort({ createdAt: -1 });
    res.json(issues);
  } catch (error) { next(error); }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid issue ID." });
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found." });
    res.json(issue);
  } catch (error) { next(error); }
});

router.post("/", async (req, res, next) => {
  try {
    const { title, description, category, location, reporter } = req.body;
    if (!title?.trim() || !description?.trim() || !location?.trim()) {
      return res.status(400).json({ message: "Title, description, and location are required." });
    }
    const issue = await Issue.create({ title, description, category, location, reporter });
    res.status(201).json(issue);
  } catch (error) {
    if (error.name === "ValidationError") return res.status(400).json({ message: error.message });
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid issue ID." });
    const allowed = ["title", "description", "category", "location", "reporter", "status"];
    const updates = {};
    allowed.forEach((key) => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });
    const issue = await Issue.findByIdAndUpdate(req.params.id, updates, {
      new: true, runValidators: true
    });
    if (!issue) return res.status(404).json({ message: "Issue not found." });
    res.json(issue);
  } catch (error) {
    if (error.name === "ValidationError") return res.status(400).json({ message: error.message });
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid issue ID." });
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found." });
    res.json({ message: "Issue deleted successfully." });
  } catch (error) { next(error); }
});

module.exports = router;
