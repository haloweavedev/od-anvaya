// Radar Chart — rendered client-side from embedded data
function initRadar() {
  const container = document.getElementById('radar-chart');
  if (!container || typeof CAPABILITIES === 'undefined' || typeof SCORES === 'undefined') return;

  const size = 240;
  const cx = size / 2, cy = size / 2, r = size * 0.35;
  const n = CAPABILITIES.length;

  function getPoint(i, val, maxVal) {
    maxVal = maxVal || 4;
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    const d = (val / maxVal) * r;
    return [cx + d * Math.cos(a), cy + d * Math.sin(a)];
  }

  function avg(nums) {
    const f = nums.filter(Boolean);
    return f.length ? f.reduce(function(a,b){return a+b},0) / f.length : 0;
  }

  const avgs = CAPABILITIES.map(function(cap) {
    return avg(cap.subcapabilities.map(function(s) { return SCORES[s.id] ? SCORES[s.id].current_level : 0; }));
  });

  let svg = '<svg width="'+size+'" height="'+size+'">';

  // Grid
  for (let l = 1; l <= 4; l++) {
    let pts = CAPABILITIES.map(function(_, i) { return getPoint(i, l).join(','); }).join(' ');
    svg += '<polygon points="'+pts+'" fill="none" stroke="'+(l === 4 ? '#1e3a5f' : '#111827')+'" stroke-width="'+(l === 4 ? 1 : 0.5)+'"/>';
  }

  // Spokes
  CAPABILITIES.forEach(function(_, i) {
    const p = getPoint(i, 4);
    svg += '<line x1="'+cx+'" y1="'+cy+'" x2="'+p[0]+'" y2="'+p[1]+'" stroke="#111827" stroke-width="0.5"/>';
  });

  // Data polygon
  const poly = avgs.map(function(v, i) { return getPoint(i, v).join(','); }).join(' ');
  svg += '<polygon points="'+poly+'" fill="rgba(99,202,183,0.15)" stroke="#63cab7" stroke-width="2"/>';

  // Data points
  avgs.forEach(function(v, i) {
    if (v > 0) {
      const p = getPoint(i, v);
      svg += '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="3" fill="#63cab7"/>';
    }
  });

  // Labels
  CAPABILITIES.forEach(function(cap, i) {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    const d = r + 20;
    const x = cx + d * Math.cos(a);
    const y = cy + d * Math.sin(a);
    svg += '<text x="'+x+'" y="'+y+'" text-anchor="middle" dominant-baseline="middle" font-size="9" fill="#4b5563" font-family="monospace">'+cap.id+'</text>';
  });

  svg += '</svg>';
  container.innerHTML = svg;
}

// Run on initial load and Turbo navigations
initRadar();
document.addEventListener('turbo:load', initRadar);
