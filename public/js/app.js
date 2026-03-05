// OD Anvaya — Client-side interactivity

// Toast
function showToast(msg, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

// Save score (current level)
async function setScore(subId, level, isToggle) {
  try {
    if (isToggle) {
      await fetch('/api/scores/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subId, field: 'current_level' })
      });
    } else {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subId, currentLevel: level })
      });
    }
    location.reload();
  } catch (err) {
    showToast('Failed to save score', 'warn');
  }
}

// Save target level
async function setTarget(subId, level, isToggle) {
  try {
    if (isToggle) {
      await fetch('/api/scores/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subId, field: 'target_level' })
      });
    } else {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subId, targetLevel: level })
      });
    }
    location.reload();
  } catch (err) {
    showToast('Failed to save target', 'warn');
  }
}

// Save priority
async function setPriority(subId, priority, isToggle) {
  try {
    if (isToggle) {
      await fetch('/api/scores/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subId, field: 'priority' })
      });
    } else {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subId, priority })
      });
    }
    location.reload();
  } catch (err) {
    showToast('Failed to save priority', 'warn');
  }
}

// Save notes (debounced)
let noteTimers = {};
function saveNotes(subId, value) {
  clearTimeout(noteTimers[subId]);
  noteTimers[subId] = setTimeout(async () => {
    try {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subId, fieldNotes: value })
      });
      showToast('Notes saved');
    } catch (err) {
      showToast('Failed to save notes', 'warn');
    }
  }, 800);
}

// Save resources (debounced)
let resTimers = {};
function saveResources(subId, value) {
  clearTimeout(resTimers[subId]);
  resTimers[subId] = setTimeout(async () => {
    try {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subId, resources: value })
      });
      showToast('Resources saved');
    } catch (err) {
      showToast('Failed to save resources', 'warn');
    }
  }, 800);
}

// Save timeline fields (debounced)
let tlTimers = {};
function saveTimeline(subId, field, value) {
  clearTimeout(tlTimers[subId + field]);
  tlTimers[subId + field] = setTimeout(async () => {
    try {
      const body = { subId };
      body[field] = value;
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      showToast('Timeline saved');
    } catch (err) {
      showToast('Failed to save timeline', 'warn');
    }
  }, 800);
}

// Milestones
async function addMilestone(subId) {
  try {
    await fetch('/api/milestones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subId })
    });
    location.reload();
  } catch (err) {
    showToast('Failed to add milestone', 'warn');
  }
}

let milestoneTimers = {};
function updateMilestone(id, field, value) {
  clearTimeout(milestoneTimers[id + field]);
  milestoneTimers[id + field] = setTimeout(async () => {
    try {
      const body = {};
      body[field] = value;
      // Need all fields for PUT — get from DOM
      const row = document.querySelector(`[data-milestone-id="${id}"]`);
      if (!row) return;
      const inputs = row.querySelectorAll('textarea, input, select');
      const data = {
        activity: inputs[0]?.value || '',
        owner: inputs[1]?.value || '',
        targetDate: inputs[2]?.value || '',
        status: inputs[3]?.value || 'Pending',
      };
      data[field] = value;
      await fetch(`/api/milestones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      showToast('Milestone updated');
    } catch (err) {
      showToast('Failed to update milestone', 'warn');
    }
  }, 500);
}

async function deleteMilestone(id) {
  try {
    await fetch(`/api/milestones/${id}`, { method: 'DELETE' });
    location.reload();
  } catch (err) {
    showToast('Failed to delete milestone', 'warn');
  }
}

// Level Guide Modal
function showLevelGuide(subId) {
  if (typeof CAPABILITIES === 'undefined') return;
  let sub = null;
  for (const cap of CAPABILITIES) {
    sub = cap.subcapabilities.find(s => s.id === subId);
    if (sub) break;
  }
  if (!sub) return;

  const modal = document.getElementById('level-guide-modal');
  document.getElementById('modal-sub-name').textContent = sub.name;
  document.getElementById('modal-dei-tag').innerHTML = sub.is_dei
    ? '<span class="tag tag-dei" style="margin-top:6px;display:inline-block">DEI INDICATOR</span>'
    : '';

  const currentLevel = SCORES[subId]?.current_level;
  let html = '';
  for (let lvl = 1; lvl <= 4; lvl++) {
    const isSelected = currentLevel === lvl;
    const color = LEVEL_COLORS[lvl];
    const bg = LEVEL_BG[lvl];
    html += `
      <div style="margin-bottom:16px;padding:16px 20px;border-radius:12px;border:1.5px solid ${isSelected ? color : color+'33'};background:${isSelected ? bg : 'var(--bg-input)'};cursor:pointer;transition:all 0.15s"
           onclick="setScore('${subId}', ${lvl}, ${isSelected ? 'true' : 'false'})">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
          <div style="width:32px;height:32px;border-radius:8px;background:${color}22;border:2px solid ${color};display:flex;align-items:center;justify-content:center;color:${color};font-weight:800;font-size:0.87rem;font-family:var(--font-mono);flex-shrink:0">L${lvl}</div>
          <div>
            <div style="font-weight:700;color:${color};font-size:0.93rem">${LEVEL_NAMES[lvl]}</div>
            ${isSelected ? '<div style="font-size:0.67rem;color:var(--level-4);font-family:var(--font-mono)">✓ CURRENTLY SELECTED</div>' : ''}
          </div>
        </div>
        <div style="font-size:0.87rem;color:var(--text-secondary);line-height:1.7;padding-left:44px">${sub.levels[lvl] || ''}</div>
      </div>
    `;
  }
  document.getElementById('modal-levels').innerHTML = html;
  modal.style.display = 'flex';
}

function closeLevelGuide() {
  document.getElementById('level-guide-modal').style.display = 'none';
}

// Close modal on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLevelGuide();
});
