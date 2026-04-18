const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// GET /api/sections
router.get('/sections', async (req, res) => {
  try {
    const sections = await Question.aggregate([
      {
        $group: {
          _id: { sectionIdx: '$sectionIdx', sectionName: '$sectionName', sectionTag: '$sectionTag' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.sectionIdx': 1 } },
    ]);
    res.json(sections.map(s => ({
      idx: s._id.sectionIdx,
      name: s._id.sectionName,
      tag: s._id.sectionTag,
      count: s.count,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/questions?section=all&shuffle=false
router.get('/questions', async (req, res) => {
  try {
    const { section } = req.query;
    const filter = section && section !== 'all' ? { sectionIdx: Number(section) } : {};
    const questions = await Question.find(filter, '-__v').lean();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
