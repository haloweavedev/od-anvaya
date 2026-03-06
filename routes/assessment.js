const express = require('express');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// Helper: get or create assessment for user
async function getOrCreateAssessment(userId, orgName) {
  let result = await pool.query('SELECT * FROM assessments WHERE user_id = $1 ORDER BY id DESC LIMIT 1', [userId]);
  if (result.rows.length > 0) return result.rows[0];
  result = await pool.query(
    'INSERT INTO assessments (user_id, org_name) VALUES ($1, $2) RETURNING *',
    [userId, orgName]
  );
  return result.rows[0];
}

// Helper: load all capabilities with subs and level descriptions
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

// Helper: load scores for an assessment
async function loadScores(assessmentId) {
  const result = await pool.query('SELECT * FROM scores WHERE assessment_id = $1', [assessmentId]);
  const scores = {};
  for (const row of result.rows) {
    scores[row.sub_capability_id] = row;
  }
  return scores;
}

// Helper: load milestones for an assessment
async function loadMilestones(assessmentId) {
  const result = await pool.query(
    `SELECT m.* FROM milestones m
     JOIN scores s ON m.score_id = s.id
     WHERE s.assessment_id = $1
     ORDER BY m.sort_order`,
    [assessmentId]
  );
  const milestones = {};
  for (const row of result.rows) {
    if (!milestones[row.score_id]) milestones[row.score_id] = [];
    milestones[row.score_id].push(row);
  }
  return milestones;
}

// Landing — redirect to setup (or assess if already set up)
router.get('/', requireAuth, async (req, res) => {
  const assessment = await getOrCreateAssessment(req.session.user.id, req.session.user.org_name);
  if (assessment.assessor) return res.redirect('/assess');
  res.redirect('/setup');
});

// Setup page
router.get('/setup', requireAuth, async (req, res) => {
  const assessment = await getOrCreateAssessment(req.session.user.id, req.session.user.org_name);
  res.render('setup', { assessment });
});

router.post('/setup', requireAuth, async (req, res) => {
  const { orgName, assessor, assessmentDate, contextNotes } = req.body;
  let assessment = await getOrCreateAssessment(req.session.user.id, req.session.user.org_name);
  await pool.query(
    `UPDATE assessments SET org_name=$1, assessor=$2, assessment_date=$3, context_notes=$4, updated_at=NOW()
     WHERE id=$5`,
    [orgName, assessor, assessmentDate || null, contextNotes, assessment.id]
  );
  res.redirect('/assess');
});

// Assess page
router.get('/assess', requireAuth, async (req, res) => {
  const assessment = await getOrCreateAssessment(req.session.user.id, req.session.user.org_name);
  const capabilities = await loadCapabilities();
  const scores = await loadScores(assessment.id);
  const activeCap = parseInt(req.query.cap) || 0;
  res.render('assess', { assessment, capabilities, scores, activeCap });
});

// Plan page
router.get('/plan', requireAuth, async (req, res) => {
  const assessment = await getOrCreateAssessment(req.session.user.id, req.session.user.org_name);
  const capabilities = await loadCapabilities();
  const scores = await loadScores(assessment.id);
  const milestones = await loadMilestones(assessment.id);
  const activeCap = parseInt(req.query.cap) || 0;
  res.render('plan', { assessment, capabilities, scores, milestones, activeCap });
});

// ── API Endpoints (AJAX) ──

// Save/update a score
router.post('/api/scores', requireAuth, async (req, res) => {
  try {
    const assessment = await getOrCreateAssessment(req.session.user.id, req.session.user.org_name);
    const { subId, currentLevel, targetLevel, priority, fieldNotes, resources, timelineStart, timelineEnd, timelineOwner } = req.body;

    const result = await pool.query(
      `INSERT INTO scores (assessment_id, sub_capability_id, current_level, target_level, priority, field_notes, resources, timeline_start, timeline_end, timeline_owner)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (assessment_id, sub_capability_id) DO UPDATE SET
         current_level = COALESCE($3, scores.current_level),
         target_level = COALESCE($4, scores.target_level),
         priority = COALESCE($5, scores.priority),
         field_notes = COALESCE($6, scores.field_notes),
         resources = COALESCE($7, scores.resources),
         timeline_start = COALESCE($8, scores.timeline_start),
         timeline_end = COALESCE($9, scores.timeline_end),
         timeline_owner = COALESCE($10, scores.timeline_owner)
       RETURNING *`,
      [assessment.id, subId, currentLevel || null, targetLevel || null, priority || null, fieldNotes, resources, timelineStart || null, timelineEnd || null, timelineOwner]
    );
    res.json({ ok: true, score: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Clear a specific field on a score
router.post('/api/scores/clear', requireAuth, async (req, res) => {
  try {
    const assessment = await getOrCreateAssessment(req.session.user.id, req.session.user.org_name);
    const { subId, field } = req.body;
    const allowed = ['current_level', 'target_level', 'priority'];
    if (!allowed.includes(field)) return res.status(400).json({ ok: false });
    await pool.query(
      `UPDATE scores SET ${field} = NULL WHERE assessment_id = $1 AND sub_capability_id = $2`,
      [assessment.id, subId]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Add milestone
router.post('/api/milestones', requireAuth, async (req, res) => {
  try {
    const assessment = await getOrCreateAssessment(req.session.user.id, req.session.user.org_name);
    const { subId } = req.body;

    // Get or create score row
    let scoreResult = await pool.query(
      'SELECT id FROM scores WHERE assessment_id = $1 AND sub_capability_id = $2',
      [assessment.id, subId]
    );
    let scoreId;
    if (scoreResult.rows.length === 0) {
      scoreResult = await pool.query(
        'INSERT INTO scores (assessment_id, sub_capability_id) VALUES ($1, $2) RETURNING id',
        [assessment.id, subId]
      );
    }
    scoreId = scoreResult.rows[0].id;

    const countResult = await pool.query('SELECT COUNT(*) FROM milestones WHERE score_id = $1', [scoreId]);
    const sortOrder = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      'INSERT INTO milestones (score_id, sort_order) VALUES ($1, $2) RETURNING *',
      [scoreId, sortOrder]
    );
    res.json({ ok: true, milestone: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Update milestone
router.put('/api/milestones/:id', requireAuth, async (req, res) => {
  try {
    const { activity, owner, targetDate, status } = req.body;
    const result = await pool.query(
      `UPDATE milestones SET activity=$1, owner=$2, target_date=$3, status=$4 WHERE id=$5 RETURNING *`,
      [activity, owner, targetDate || null, status, req.params.id]
    );
    res.json({ ok: true, milestone: result.rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Delete milestone
router.delete('/api/milestones/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM milestones WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
