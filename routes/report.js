const express = require('express');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

async function loadCapabilities() {
  const caps = await pool.query('SELECT * FROM capabilities ORDER BY sort_order');
  const subs = await pool.query('SELECT * FROM sub_capabilities ORDER BY capability_id, sort_order');
  const levels = await pool.query('SELECT * FROM level_descriptions ORDER BY sub_capability_id, level');
  const levelMap = {};
  for (const ld of levels.rows) {
    if (!levelMap[ld.sub_capability_id]) levelMap[ld.sub_capability_id] = {};
    levelMap[ld.sub_capability_id][ld.level] = ld.description;
  }
  return caps.rows.map(cap => ({
    ...cap,
    subcapabilities: subs.rows
      .filter(s => s.capability_id === cap.id)
      .map(s => ({ ...s, levels: levelMap[s.id] || {} }))
  }));
}

router.get('/report', requireAuth, async (req, res) => {
  const assessResult = await pool.query(
    'SELECT * FROM assessments WHERE user_id = $1 ORDER BY id DESC LIMIT 1',
    [req.session.user.id]
  );
  if (assessResult.rows.length === 0) return res.redirect('/setup');
  const assessment = assessResult.rows[0];

  const capabilities = await loadCapabilities();

  const scoresResult = await pool.query('SELECT * FROM scores WHERE assessment_id = $1', [assessment.id]);
  const scores = {};
  for (const row of scoresResult.rows) {
    scores[row.sub_capability_id] = row;
  }

  // Load milestones per score
  const milestoneResult = await pool.query(
    `SELECT m.* FROM milestones m JOIN scores s ON m.score_id = s.id WHERE s.assessment_id = $1 ORDER BY m.sort_order`,
    [assessment.id]
  );
  const milestones = {};
  for (const row of milestoneResult.rows) {
    if (!milestones[row.score_id]) milestones[row.score_id] = [];
    milestones[row.score_id].push(row);
  }

  res.render('report', { assessment, capabilities, scores, milestones });
});

// Admin view of a specific org's report
router.get('/report/:userId', requireAuth, async (req, res) => {
  if (!req.session.user.is_admin) return res.redirect('/');

  const assessResult = await pool.query(
    'SELECT * FROM assessments WHERE user_id = $1 ORDER BY id DESC LIMIT 1',
    [req.params.userId]
  );
  if (assessResult.rows.length === 0) return res.redirect('/admin');
  const assessment = assessResult.rows[0];

  const capabilities = await loadCapabilities();

  const scoresResult = await pool.query('SELECT * FROM scores WHERE assessment_id = $1', [assessment.id]);
  const scores = {};
  for (const row of scoresResult.rows) scores[row.sub_capability_id] = row;

  const milestoneResult = await pool.query(
    `SELECT m.* FROM milestones m JOIN scores s ON m.score_id = s.id WHERE s.assessment_id = $1 ORDER BY m.sort_order`,
    [assessment.id]
  );
  const milestones = {};
  for (const row of milestoneResult.rows) {
    if (!milestones[row.score_id]) milestones[row.score_id] = [];
    milestones[row.score_id].push(row);
  }

  res.render('report', { assessment, capabilities, scores, milestones, isAdminView: true });
});

module.exports = router;
