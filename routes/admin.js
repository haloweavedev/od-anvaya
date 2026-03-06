const express = require('express');
const pool = require('../db/pool');
const { requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', requireAdmin, async (req, res) => {
  const result = await pool.query(
    `SELECT u.id, u.email, u.name, u.org_name, u.created_at,
            COUNT(DISTINCT s.sub_capability_id) FILTER (WHERE s.current_level IS NOT NULL) as rated_count,
            AVG(s.current_level) FILTER (WHERE s.current_level IS NOT NULL) as avg_score,
            a.id as assessment_id, a.updated_at as last_activity
     FROM users u
     LEFT JOIN assessments a ON a.user_id = u.id
     LEFT JOIN scores s ON s.assessment_id = a.id
     WHERE u.is_admin = false
     GROUP BY u.id, a.id
     ORDER BY u.created_at DESC`
  );
  res.render('admin/dashboard', { orgs: result.rows });
});

// Submissions page — comprehensive view of all assessments
router.get('/submissions', requireAdmin, async (req, res) => {
  try {
    // Load capabilities structure
    const caps = await pool.query('SELECT * FROM capabilities ORDER BY sort_order');
    const subs = await pool.query('SELECT * FROM sub_capabilities ORDER BY capability_id, sort_order');
    const capabilities = caps.rows.map(cap => ({
      ...cap,
      subcapabilities: subs.rows.filter(s => s.capability_id === cap.id)
    }));

    // Load all NGO submissions with stats
    const orgs = await pool.query(`
      SELECT
        u.id as user_id, u.email, u.name as user_name, u.org_name, u.created_at as registered_at,
        a.id as assessment_id, a.assessor, a.assessment_date, a.context_notes,
        a.created_at as assessment_created, a.updated_at as last_activity,
        COUNT(DISTINCT s.sub_capability_id) FILTER (WHERE s.current_level IS NOT NULL) as rated_count,
        COUNT(DISTINCT s.sub_capability_id) FILTER (WHERE s.target_level IS NOT NULL) as target_count,
        COUNT(DISTINCT s.sub_capability_id) FILTER (WHERE s.priority IS NOT NULL) as priority_count,
        AVG(s.current_level) FILTER (WHERE s.current_level IS NOT NULL) as avg_score,
        MIN(s.current_level) FILTER (WHERE s.current_level IS NOT NULL) as min_score,
        MAX(s.current_level) FILTER (WHERE s.current_level IS NOT NULL) as max_score,
        COUNT(DISTINCT s.sub_capability_id) FILTER (WHERE s.priority = 'Critical') as critical_count,
        COUNT(DISTINCT s.sub_capability_id) FILTER (WHERE s.timeline_start IS NOT NULL) as timeline_count
      FROM users u
      LEFT JOIN assessments a ON a.user_id = u.id
      LEFT JOIN scores s ON s.assessment_id = a.id
      WHERE u.is_admin = false
      GROUP BY u.id, a.id
      ORDER BY a.updated_at DESC NULLS LAST
    `);

    // For each org, load per-capability averages
    for (const org of orgs.rows) {
      if (!org.assessment_id) { org.capScores = []; org.milestoneCount = 0; continue; }

      const capScores = await pool.query(`
        SELECT c.id, c.name, c.icon, c.color,
               AVG(s.current_level) FILTER (WHERE s.current_level IS NOT NULL) as avg,
               COUNT(*) FILTER (WHERE s.current_level IS NOT NULL) as rated,
               COUNT(*) as total
        FROM capabilities c
        JOIN sub_capabilities sc ON sc.capability_id = c.id
        LEFT JOIN scores s ON s.sub_capability_id = sc.id AND s.assessment_id = $1
        GROUP BY c.id, c.name, c.icon, c.color, c.sort_order
        ORDER BY c.sort_order
      `, [org.assessment_id]);
      org.capScores = capScores.rows;

      const mCount = await pool.query(
        `SELECT COUNT(*) FROM milestones m JOIN scores s ON m.score_id = s.id WHERE s.assessment_id = $1`,
        [org.assessment_id]
      );
      org.milestoneCount = parseInt(mCount.rows[0].count);
    }

    // Platform-wide stats
    const totalNGOs = orgs.rows.length;
    const completedAssessments = orgs.rows.filter(o => parseInt(o.rated_count) >= subs.rows.length).length;
    const inProgress = orgs.rows.filter(o => parseInt(o.rated_count) > 0 && parseInt(o.rated_count) < subs.rows.length).length;
    const notStarted = orgs.rows.filter(o => !o.rated_count || parseInt(o.rated_count) === 0).length;

    const allScores = await pool.query('SELECT current_level FROM scores WHERE current_level IS NOT NULL');
    const platformAvg = allScores.rows.length
      ? allScores.rows.reduce((s, r) => s + r.current_level, 0) / allScores.rows.length
      : null;

    res.render('admin/submissions', {
      orgs: orgs.rows,
      capabilities,
      totalSubs: subs.rows.length,
      stats: { totalNGOs, completedAssessments, inProgress, notStarted, platformAvg }
    });
  } catch (err) {
    console.error('Submissions page error:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
