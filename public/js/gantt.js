// Gantt Chart — rendered client-side
function initGantt() {
  const container = document.getElementById('gantt-chart');
  if (!container || typeof GANTT_ITEMS === 'undefined' || GANTT_ITEMS.length === 0) return;
  if (!GANTT_MIN || !GANTT_MAX) return;

  const ganttMin = new Date(GANTT_MIN);
  const ganttMax = new Date(GANTT_MAX);
  const ganttSpan = ganttMax - ganttMin;
  if (ganttSpan <= 0) return;

  const PRIORITY_COLORS = {
    Critical: '#ef4444',
    High: '#f97316',
    Medium: '#3b82f6',
    Low: '#6b7280',
  };

  // Generate month headers
  const months = [];
  const cur = new Date(ganttMin);
  cur.setDate(1);
  while (cur <= ganttMax) {
    months.push(new Date(cur));
    cur.setMonth(cur.getMonth() + 1);
  }

  let html = '';

  // Month headers
  html += '<div style="display:flex;margin-bottom:8px;margin-left:200px">';
  months.forEach(function(m) {
    html += '<div style="flex:1;min-width:0;font-size:0.6rem;font-family:var(--font-mono);color:var(--text-dim);border-left:1px solid var(--border);padding-left:4px">';
    html += m.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    html += '</div>';
  });
  html += '</div>';

  // Bars
  GANTT_ITEMS.forEach(function(item) {
    const s = new Date(item.start);
    const e = new Date(item.end);
    const leftPct = ((s - ganttMin) / ganttSpan) * 100;
    const widthPct = Math.max(((e - s) / ganttSpan) * 100, 1.5);
    const barColor = item.priority && PRIORITY_COLORS[item.priority] ? PRIORITY_COLORS[item.priority] : item.color;
    const days = Math.round((e - s) / 86400000);
    const dur = days < 14 ? days + 'd' : days < 90 ? Math.round(days/7) + 'w' : Math.round(days/30) + 'mo';

    html += '<div style="display:flex;align-items:center;margin-bottom:8px;gap:0">';
    // Label
    html += '<div style="width:200px;flex-shrink:0;padding-right:12px;display:flex;align-items:center;gap:6px;overflow:hidden">';
    html += '<span style="font-size:0.8rem;flex-shrink:0">' + item.icon + '</span>';
    html += '<div style="overflow:hidden"><div style="font-size:0.73rem;color:var(--text-secondary);font-weight:600;white-space:nowrap;text-overflow:ellipsis;overflow:hidden">' + item.name + '</div>';
    if (item.owner) {
      html += '<div style="font-size:0.6rem;color:var(--text-dim);font-family:var(--font-mono);white-space:nowrap;text-overflow:ellipsis;overflow:hidden">person: ' + item.owner + '</div>';
    }
    html += '</div></div>';
    // Bar track
    html += '<div style="flex:1;position:relative;height:28px;background:var(--bg-input);border-radius:4px;overflow:hidden;border:1px solid #111827">';
    html += '<div class="gantt-bar" style="left:' + leftPct + '%;width:' + widthPct + '%;background:' + barColor + '33;border:1.5px solid ' + barColor + '88"><span style="color:' + barColor + '">' + dur + '</span></div>';
    // Month lines
    months.forEach(function(m) {
      const pos = ((m - ganttMin) / ganttSpan) * 100;
      html += '<div style="position:absolute;top:0;bottom:0;left:' + pos + '%;width:1px;background:rgba(30,45,69,0.5)"></div>';
    });
    html += '</div></div>';
  });

  // Legend
  html += '<div style="display:flex;gap:16px;margin-top:16px;margin-left:200px;flex-wrap:wrap">';
  Object.keys(PRIORITY_COLORS).forEach(function(p) {
    var c = PRIORITY_COLORS[p];
    html += '<div style="display:flex;align-items:center;gap:6px;font-size:0.67rem;font-family:var(--font-mono);color:var(--text-dim)">';
    html += '<div style="width:16px;height:8px;border-radius:2px;background:'+c+'33;border:1.5px solid '+c+'88"></div>';
    html += p + '</div>';
  });
  html += '</div>';

  container.innerHTML = html;
}

// Run on initial load and Turbo navigations
initGantt();
document.addEventListener('turbo:load', initGantt);
