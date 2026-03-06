#!/usr/bin/env node
/**
 * OD Anvaya — Data Analysis Script
 * Queries the database and produces a comprehensive analysis of all assessments.
 * Usage: node scripts/analyse-data.js
 */
require('dotenv').config();
const pool = require('../db/pool');

const LEVEL_NAMES = { 1: 'Nascent', 2: 'Emerging', 3: 'Developing', 4: 'Advanced' };
const PRIORITY_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };

function bar(val, max = 4, width = 20) {
  const filled = Math.round((val / max) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

async function analyse() {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║        OD ANVAYA — DATA ANALYSIS REPORT         ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  // ── 1. Overview ──
  const users = await pool.query("SELECT COUNT(*) as count FROM users WHERE is_admin = false");
  const assessments = await pool.query("SELECT COUNT(*) as count FROM assessments");
  const totalScores = await pool.query("SELECT COUNT(*) as count FROM scores WHERE current_level IS NOT NULL");
  const totalMilestones = await pool.query("SELECT COUNT(*) as count FROM milestones");

  console.log('1. PLATFORM OVERVIEW');
  console.log(`   NGO Users:     ${users.rows[0].count}`);
  console.log(`   Assessments:   ${assessments.rows[0].count}`);
  console.log(`   Scores Saved:  ${totalScores.rows[0].count}`);
  console.log(`   Milestones:    ${totalMilestones.rows[0].count}`);

  // ── 2. Per-Assessment Analysis ──
  const allAssessments = await pool.query(`
    SELECT a.*, u.email, u.name as user_name
    FROM assessments a
    JOIN users u ON a.user_id = u.id
    ORDER BY a.updated_at DESC
  `);

  if (allAssessments.rows.length === 0) {
    console.log('\n   No assessments found.\n');
    await pool.end();
    return;
  }

  const capabilities = await pool.query('SELECT * FROM capabilities ORDER BY sort_order');
  const subCaps = await pool.query('SELECT * FROM sub_capabilities ORDER BY capability_id, sort_order');

  for (const assessment of allAssessments.rows) {
    console.log(`\n${'─'.repeat(54)}`);
    console.log(`2. ASSESSMENT: ${assessment.org_name || 'Unnamed'}`);
    console.log(`   Assessor: ${assessment.assessor || '—'}`);
    console.log(`   Date: ${assessment.assessment_date ? new Date(assessment.assessment_date).toLocaleDateString('en-IN') : '—'}`);
    console.log(`   Context: ${assessment.context_notes || '—'}`);
    console.log(`   User: ${assessment.user_name} (${assessment.email})`);

    const scores = await pool.query('SELECT * FROM scores WHERE assessment_id = $1', [assessment.id]);
    const scoreMap = {};
    for (const s of scores.rows) scoreMap[s.sub_capability_id] = s;

    const ratedCount = scores.rows.filter(s => s.current_level).length;
    const totalSubs = subCaps.rows.length;
    console.log(`   Completion: ${ratedCount}/${totalSubs} (${Math.round(ratedCount/totalSubs*100)}%)`);

    // ── Capability breakdown ──
    console.log('\n   CAPABILITY SCORES:');
    console.log(`   ${'Capability'.padEnd(38)} Avg   Bar`);
    console.log(`   ${'─'.repeat(38)} ────  ${'─'.repeat(20)}`);

    const capAverages = [];
    for (const cap of capabilities.rows) {
      const subs = subCaps.rows.filter(s => s.capability_id === cap.id);
      const vals = subs.map(s => scoreMap[s.id]?.current_level).filter(Boolean);
      const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
      capAverages.push({ ...cap, avg, rated: vals.length, total: subs.length });

      const avgStr = avg ? avg.toFixed(1) : ' — ';
      const barStr = avg ? bar(avg) : '░'.repeat(20);
      console.log(`   ${cap.icon} ${cap.name.padEnd(35)} ${avgStr}  ${barStr}`);
    }

    // Overall average
    const allVals = scores.rows.map(s => s.current_level).filter(Boolean);
    const overallAvg = allVals.length ? allVals.reduce((a, b) => a + b, 0) / allVals.length : null;
    if (overallAvg) {
      console.log(`   ${'─'.repeat(38)} ────  ${'─'.repeat(20)}`);
      console.log(`   ${'OVERALL AVERAGE'.padEnd(38)} ${overallAvg.toFixed(1)}  ${bar(overallAvg)}`);
    }

    // ── Strengths (Level 3-4) ──
    const strengths = subCaps.rows
      .filter(s => scoreMap[s.id]?.current_level >= 3)
      .sort((a, b) => (scoreMap[b.id]?.current_level || 0) - (scoreMap[a.id]?.current_level || 0));

    if (strengths.length > 0) {
      console.log(`\n   STRENGTHS (${strengths.length} sub-capabilities at Level 3-4):`);
      for (const s of strengths.slice(0, 10)) {
        const lvl = scoreMap[s.id].current_level;
        const cap = capabilities.rows.find(c => c.id === s.capability_id);
        console.log(`   ${cap.icon} L${lvl} ${LEVEL_NAMES[lvl].padEnd(11)} ${s.name}${s.is_dei ? ' [DEI]' : ''}`);
      }
    }

    // ── Gaps (Level 1-2) ──
    const gaps = subCaps.rows
      .filter(s => scoreMap[s.id]?.current_level && scoreMap[s.id].current_level <= 2)
      .sort((a, b) => (scoreMap[a.id]?.current_level || 5) - (scoreMap[b.id]?.current_level || 5));

    if (gaps.length > 0) {
      console.log(`\n   GAPS (${gaps.length} sub-capabilities at Level 1-2):`);
      for (const s of gaps.slice(0, 10)) {
        const lvl = scoreMap[s.id].current_level;
        const cap = capabilities.rows.find(c => c.id === s.capability_id);
        console.log(`   ${cap.icon} L${lvl} ${LEVEL_NAMES[lvl].padEnd(11)} ${s.name}${s.is_dei ? ' [DEI]' : ''}`);
      }
    }

    // ── DEI Analysis ──
    const deiSubs = subCaps.rows.filter(s => s.is_dei);
    const deiScored = deiSubs.filter(s => scoreMap[s.id]?.current_level);
    const deiVals = deiScored.map(s => scoreMap[s.id].current_level);
    const deiAvg = deiVals.length ? deiVals.reduce((a, b) => a + b, 0) / deiVals.length : null;

    console.log(`\n   DEI INDICATOR ANALYSIS:`);
    console.log(`   DEI sub-capabilities: ${deiSubs.length}`);
    console.log(`   DEI scored: ${deiScored.length}/${deiSubs.length}`);
    if (deiAvg) {
      console.log(`   DEI average: ${deiAvg.toFixed(1)} ${bar(deiAvg)}`);
      const nonDeiVals = allVals.filter((_, i) => {
        const subId = scores.rows[i]?.sub_capability_id;
        return subId && !deiSubs.find(d => d.id === subId);
      });
      const nonDeiAvg = nonDeiVals.length ? nonDeiVals.reduce((a, b) => a + b, 0) / nonDeiVals.length : null;
      if (nonDeiAvg) {
        const gap = deiAvg - nonDeiAvg;
        console.log(`   Non-DEI avg: ${nonDeiAvg.toFixed(1)} ${bar(nonDeiAvg)}`);
        console.log(`   DEI gap: ${gap > 0 ? '+' : ''}${gap.toFixed(1)} (${gap < 0 ? 'DEI lagging' : 'DEI ahead'})`);
      }
    }

    // ── Priority breakdown ──
    const prioritized = scores.rows.filter(s => s.priority);
    if (prioritized.length > 0) {
      console.log(`\n   PRIORITY BREAKDOWN:`);
      for (const p of ['Critical', 'High', 'Medium', 'Low']) {
        const count = prioritized.filter(s => s.priority === p).length;
        if (count > 0) {
          const icon = { Critical: '🔴', High: '🟠', Medium: '🔵', Low: '⚪' }[p];
          console.log(`   ${icon} ${p}: ${count}`);
        }
      }
    }

    // ── Action plan coverage ──
    const withTimeline = scores.rows.filter(s => s.timeline_start && s.timeline_end);
    const withResources = scores.rows.filter(s => s.resources);
    const milestoneResult = await pool.query(
      `SELECT COUNT(*) as count FROM milestones m JOIN scores s ON m.score_id = s.id WHERE s.assessment_id = $1`,
      [assessment.id]
    );

    console.log(`\n   ACTION PLAN COVERAGE:`);
    console.log(`   Items with timeline: ${withTimeline.length}`);
    console.log(`   Items with resources: ${withResources.length}`);
    console.log(`   Total milestones: ${milestoneResult.rows[0].count}`);

    // ── Level distribution ──
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const s of scores.rows) {
      if (s.current_level) dist[s.current_level]++;
    }
    console.log(`\n   LEVEL DISTRIBUTION:`);
    for (let l = 1; l <= 4; l++) {
      const pct = ratedCount > 0 ? Math.round(dist[l] / ratedCount * 100) : 0;
      console.log(`   L${l} ${LEVEL_NAMES[l].padEnd(11)} ${String(dist[l]).padStart(3)} (${String(pct).padStart(3)}%) ${'█'.repeat(Math.round(pct / 3))}`);
    }
  }

  // ── 3. Cross-Org Comparison (if multiple) ──
  if (allAssessments.rows.length > 1) {
    console.log(`\n${'═'.repeat(54)}`);
    console.log('3. CROSS-ORGANISATION COMPARISON');
    console.log(`   ${'Organisation'.padEnd(30)} Overall  Completion`);
    console.log(`   ${'─'.repeat(30)} ───────  ──────────`);

    for (const a of allAssessments.rows) {
      const scores = await pool.query('SELECT current_level FROM scores WHERE assessment_id = $1 AND current_level IS NOT NULL', [a.id]);
      const vals = scores.rows.map(r => r.current_level);
      const avg = vals.length ? (vals.reduce((x, y) => x + y, 0) / vals.length).toFixed(1) : ' — ';
      const comp = `${vals.length}/${subCaps.rows.length}`;
      console.log(`   ${(a.org_name || 'Unnamed').padEnd(30)} ${String(avg).padStart(5)}    ${comp}`);
    }
  }

  console.log(`\n${'═'.repeat(54)}\n`);
  await pool.end();
}

analyse().catch(e => {
  console.error('Analysis failed:', e);
  pool.end();
  process.exit(1);
});
