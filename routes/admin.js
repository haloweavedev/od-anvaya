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

module.exports = router;
