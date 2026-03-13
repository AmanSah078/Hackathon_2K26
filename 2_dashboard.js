// ── HELPERS ──────────────────────────────────
const APP_ORIGIN = window.location.protocol === 'file:' ? 'http://localhost:3000' : window.location.origin;

function buildApiUrl(url) {
  if (/^https?:\/\//i.test(url)) return url;
  return `${APP_ORIGIN}${url}`;
}

async function apiCall(url, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    };

    if (body !== null) {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(buildApiUrl(url), options);
    const raw = await res.text();
    let data = {};

    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch (err) {
        data = { message: raw };
      }
    }

    return { ok: res.ok, data, status: res.status };
  } catch (err) {
    const message = window.location.protocol === 'file:'
      ? 'Page file preview se open hai. App ko http://localhost:3000/dashboard se kholo.'
      : 'Network error. Server se connect nahi ho pa raha.';
    return { ok: false, data: { message } };
  }
}

function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function openCaptionModal(e) {
  if(e) e.preventDefault();
  openModal('captionModal');
  closeSidebar();
}

function openInsightsModal(e) {
  if(e) e.preventDefault();
  openModal('insightsModal');
  closeSidebar();
}

function openPostModal(e) {
  if(e) e.preventDefault();
  openModal('postModal');
  closeSidebar();
}

function openInboxModal(e) {
  if(e) e.preventDefault();
  openModal('inboxModal');
  closeSidebar();
}

function openAnalyticsModal(e) {
  if(e) e.preventDefault();
  openModal('analyticsModal');
  closeSidebar();
}

function openConnectionsModal(e) {
  if(e) e.preventDefault();
  openModal('connectionsModal');
  closeSidebar();
}

function openSettingsModal(e) {
  if(e) e.preventDefault();
  openModal('settingsModal');
  closeSidebar();
}

function openScheduleModal(e) {
  if(e) e.preventDefault();
  openModal('scheduleModal');
  renderCalendar();
  closeSidebar();
}

function openProfileModal(e) {
  if(e) e.preventDefault();
  openModal('profileModal');
  closeSidebar();
}

function openActivityModal(e) {
  if(e) e.preventDefault();
  openModal('activityModal');
  closeSidebar();
}

function openDashboard(e) {
  if(e) e.preventDefault();
  document.querySelector('.header-title').textContent = 'Dashboard';
  closeModal('inboxModal');
  closeModal('analyticsModal');
  closeModal('settingsModal');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  e.currentTarget.classList.add('active');
  closeSidebar();
}

function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('overlay').classList.add('open');
  document.getElementById('menuToggleBtn').classList.add('active');
  document.querySelector('.main').classList.add('sidebar-open');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('open');
  document.getElementById('menuToggleBtn').classList.remove('active');
  document.querySelector('.main').classList.remove('sidebar-open');
}

function toggleSidebar() {
  const s = document.getElementById('sidebar');
  s.classList.contains('open') ? closeSidebar() : openSidebar();
}

document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('open');
  });
});

function showToast(msg, isError = false) {
  const t = document.getElementById('toast');
  const m = document.getElementById('toastMsg');
  const i = t ? t.querySelector('i') : null;
  if (!t || !m) return;
  m.textContent = msg;
  if (i) {
    i.className = isError ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-circle-check';
    i.style.color = isError ? '#f97316' : '#22c55e';
  }
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ── SETTINGS FUNCTIONS ───────────────────────
function switchSettingsTab(element, sectionId) {
  document.querySelectorAll('.settings-sidebar .nav-item').forEach(item => {
    item.classList.remove('active');
  });
  element.classList.add('active');
  
  document.querySelectorAll('.settings-section').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById(sectionId + '-section').classList.add('active');
}

function toggleNotification(element, type) {
  element.classList.toggle('active');
  const isActive = element.classList.contains('active');
  showToast(`${type} notifications ${isActive ? 'enabled' : 'disabled'}`);
}

function toggleDarkMode(element) {
  element.classList.toggle('active');
  const isDark = element.classList.contains('active');
  
  if (isDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
    showToast('Dark mode enabled');
  } else {
    document.documentElement.removeAttribute('data-theme');
    showToast('Light mode enabled');
  }
}

function changeAccentColor(color) {
  document.documentElement.style.setProperty('--primary', color);
  document.documentElement.style.setProperty('--primary-dark', color + 'dd');
  document.documentElement.style.setProperty('--primary-light', color + '20');
  showToast('Accent color updated');
}

function changeFontSize(size) {
  document.documentElement.style.setProperty('--font-size-base', size);
  showToast(`Font size changed to ${size}`);
}

function copyLink(url) {
  navigator.clipboard.writeText(url).then(() => {
    showToast('Link copied to clipboard!');
  });
}

function addNewLink() {
  showToast('Add new link feature coming soon!');
}

function openHelpArticle(article) {
  closeModal('settingsModal');
  showToast(`Opening ${article.replace('-', ' ')} guide...`);
}

async function logoutUser() {
  closeModal('settingsModal');
  closeAllPanels();
  await apiCall('/api/auth/logout', 'POST');
  showToast('Logged out successfully!');
  setTimeout(() => {
    window.location.href = `${APP_ORIGIN}/login`;
  }, 1200);
}

// ── CONNECTIONS PLATFORM FUNCTION ─────────────────────
function connectPlatform(btn, platform) {
  if (btn.classList.contains('connected')) return;

  if (platform !== 'facebook') {
    showToast(`${platform.charAt(0).toUpperCase() + platform.slice(1)} integration abhi configured nahi hai.`);
    return;
  }

  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Connecting...';

  fetch(buildApiUrl('/api/integrations/facebook/connect'), { credentials: 'include' })
    .then(async (res) => {
      const raw = await res.text();
      let data = {};

      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch (e) {
          throw new Error('Server se invalid response aayi. App ko /dashboard route se open karo.');
        }
      }

      if (res.status === 405) {
        throw new Error('Method not allowed (405). Server restart karke /dashboard route se open karo.');
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || `Facebook connection failed (${res.status})`);
      }

      btn.classList.add('connected');
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Connected';

      const info = btn.closest('.connection-item')?.querySelector('.connection-info p');
      if (info && data.profile?.name) {
        info.textContent = `Connected as ${data.profile.name}`;
      }

      showToast('Facebook connected successfully!');
    })
    .catch(err => {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
      if (String(err.message || '').toLowerCase().includes('failed to fetch')) {
        showToast('Server connect nahi ho raha. npm run dev chalao aur page /dashboard se kholo.', true);
        return;
      }
      showToast(err.message || 'Facebook connect failed', true);
    });
}

let likesPieChart, commentsPieChart;

function initAnalyticsCharts() {
  const likesCtx = document.getElementById('likesPieChart').getContext('2d');
  likesPieChart = new Chart(likesCtx, {
    type: 'doughnut',
    data: {
      labels: ['Instagram', 'YouTube', 'Twitter', 'Facebook'],
      datasets: [{
        data: [58200, 42100, 28100, 12400],
        backgroundColor: ['#e1306c', '#ff0000', '#1da1f2', '#1877f2'],
        borderWidth: 3,
        borderColor: '#fff',
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#fff',
          titleColor: '#111827',
          bodyColor: '#4b5563',
          borderColor: '#e5e7eb',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: (ctx) => `  ${ctx.label}: ${(ctx.parsed / 1000).toFixed(1)}K`
          }
        }
      }
    }
  });

  const commentsCtx = document.getElementById('commentsPieChart').getContext('2d');
  commentsPieChart = new Chart(commentsCtx, {
    type: 'doughnut',
    data: {
      labels: ['Instagram', 'YouTube', 'Twitter', 'Facebook'],
      datasets: [{
        data: [14200, 11800, 6800, 3200],
        backgroundColor: ['#e1306c', '#ff0000', '#1da1f2', '#1877f2'],
        borderWidth: 3,
        borderColor: '#fff',
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#fff',
          titleColor: '#111827',
          bodyColor: '#4b5563',
          borderColor: '#e5e7eb',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: (ctx) => `  ${ctx.label}: ${(ctx.parsed / 1000).toFixed(1)}K`
          }
        }
      }
    }
  });
}

function updateAnalytics() {
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  
  showToast(`Analytics updated for ${startDate} to ${endDate}`);
  
  if (likesPieChart) {
    likesPieChart.data.datasets[0].data = [
      Math.floor(50000 + Math.random() * 20000),
      Math.floor(35000 + Math.random() * 15000),
      Math.floor(20000 + Math.random() * 10000),
      Math.floor(10000 + Math.random() * 5000)
    ];
    likesPieChart.update();
  }
  
  if (commentsPieChart) {
    commentsPieChart.data.datasets[0].data = [
      Math.floor(12000 + Math.random() * 5000),
      Math.floor(9000 + Math.random() * 4000),
      Math.floor(5000 + Math.random() * 3000),
      Math.floor(2000 + Math.random() * 2000)
    ];
    commentsPieChart.update();
  }
}

function switchAnalyticsTab(tab, type) {
  document.querySelectorAll('.analytics-tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  showToast(`Switched to ${type} view`);
}

// ── PLATFORM PILLS ────────────────────────────
function togglePill(el) {
  const p = el.dataset.p.toLowerCase();
  const cls = 's' + (p === 'instagram' ? 'ig' : p === 'youtube' ? 'yt' : p === 'twitter' ? 'tw' : 'fb');
  el.classList.toggle(cls);
}

function getSelectedPlatforms(containerId = 'platPills') {
  const pills = document.querySelectorAll('#' + containerId + ' .ppill');
  const sel = [];
  pills.forEach(p => {
    if (/\bs(ig|yt|tw|fb)\b/.test(p.className)) sel.push(p.dataset.p);
  });
  return sel.length ? sel : ['Instagram'];
}

// ── FILE UPLOAD ────────────────────────────────
let uploadedFiles = [];

function handleDragOver(e) {
  e.preventDefault();
  document.getElementById('uploadBox').classList.add('drag-over');
}

function handleDragLeave(e) {
  document.getElementById('uploadBox').classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  document.getElementById('uploadBox').classList.remove('drag-over');
  const files = Array.from(e.dataTransfer.files);
  processFiles(files);
}

function handleFileSelect(e) {
  const files = Array.from(e.target.files);
  processFiles(files);
}

function processFiles(files) {
  files.forEach(file => {
    if (uploadedFiles.length >= 10) return;
    uploadedFiles.push(file);
    addPreviewItem(file);
  });
  if (files.length) showToast(`${files.length} file(s) added ✓`);
}

function addPreviewItem(file) {
  const preview = document.getElementById('uploadPreview');
  preview.classList.add('show');
  const item = document.createElement('div');
  item.className = 'preview-item';
  item.dataset.name = file.name;
  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = e => {
      item.innerHTML = `<img src="${e.target.result}" alt=""/><button class="preview-remove" onclick="removePreview(this,'${file.name}')"><i class="fa-solid fa-xmark"></i></button>`;
    };
    reader.readAsDataURL(file);
  } else if (file.type.startsWith('video/')) {
    const reader = new FileReader();
    reader.onload = e => {
      item.innerHTML = `<video src="${e.target.result}"></video><button class="preview-remove" onclick="removePreview(this,'${file.name}')"><i class="fa-solid fa-xmark"></i></button>`;
    };
    reader.readAsDataURL(file);
  } else {
    item.innerHTML = `<div class="file-icon"><i class="fa-solid fa-file"></i><span class="file-name">${file.name}</span></div><button class="preview-remove" onclick="removePreview(this,'${file.name}')"><i class="fa-solid fa-xmark"></i></button>`;
  }
  preview.appendChild(item);
}

function removePreview(btn, name) {
  const item = btn.closest('.preview-item');
  item.remove();
  uploadedFiles = uploadedFiles.filter(f => f.name !== name);
  if (!uploadedFiles.length) document.getElementById('uploadPreview').classList.remove('show');
}

function addMediaFromUrl() {
  const url = document.getElementById('mediaUrlInput').value.trim();
  if (!url) {
    showToast('Please enter a valid URL');
    return;
  }
  const preview = document.getElementById('uploadPreview');
  preview.classList.add('show');
  const item = document.createElement('div');
  item.className = 'preview-item';
  const ext = url.split('.').pop().toLowerCase();
  const isVideo = ['mp4', 'mov', 'webm', 'avi'].includes(ext);
  if (isVideo) {
    item.innerHTML = `<video src="${url}"></video><button class="preview-remove" onclick="this.closest('.preview-item').remove()"><i class="fa-solid fa-xmark"></i></button>`;
  } else {
    item.innerHTML = `<img src="${url}" onerror="this.parentElement.querySelector('.file-icon') && null" alt=""/><button class="preview-remove" onclick="this.closest('.preview-item').remove()"><i class="fa-solid fa-xmark"></i></button>`;
  }
  preview.appendChild(item);
  document.getElementById('mediaUrlInput').value = '';
  showToast('Media URL added ✓');
}

// ============================================
// 🔥 COHERE AI INTEGRATION - VIRAL CAPTION GENERATOR
// ============================================
const COHERE_API_KEY = 'dkrFJ6phRiiF6wDAaxEpOhhz2m8EQTia1TV2Z1';

async function generateCaption() {
  const topicInput = document.getElementById('topicInput');
  const topic = topicInput.value.trim();
  const tone = document.getElementById('toneSelect').value;
  const len = document.getElementById('lengthSelect').value;
  const btn = document.getElementById('genBtn');
  const loadingEl = document.getElementById('capLoading');
  const resultEl = document.getElementById('capResult');
  const capText = document.getElementById('capText');
  
  // Selected platforms
  const selectedPlatforms = getSelectedPlatforms('platPills');
  
  if (!topic) {
    showToast('Bhai pehle topic to daal! 😅', 'error');
    return;
  }
  
  // Loading state
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> AI Soch rha hai...';
  loadingEl.classList.add('show');
  resultEl.classList.remove('show');
  
  // Platform ke hisaab se style
  const platformContext = selectedPlatforms.length > 0 
    ? `for ${selectedPlatforms.join(', ')}` 
    : 'for social media';
  
  // Length mapping
  const lenMap = {
    short: '1-2 lines, viral tweet style, no hashtags',
    medium: '3-4 lines, Instagram aesthetic, 5-7 trending hashtags',
    long: '5-6 lines with 10-15 hashtags, story time vibe'
  };
  
  // Tone ke hisaab se style
  const toneMap = {
    engaging: 'Make it SUPER engaging with questions, "double tap if you agree" style, use emojis like 🔥✨💯',
    professional: 'Professional but trendy, like LinkedIn influencer, use 💼📊🚀',
    motivational: 'EXTREME MOTIVATION! Use 🔥💪🚀, "main character energy" vibe',
    humorous: 'Funny AF! Meme-style, relatable jokes, use 😂🤣💀, "nobody:" setup',
    educational: 'Educational but fun, "saving this for later" type, value bombs'
  };
  
  // Trending elements
  const trendingElements = [
    'Use "POV:" style opening',
    'Include "nobody:" setup',
    'Add "main character energy"',
    'Use "that girl / that boy" aesthetic',
    'Add "core memory" reference',
    'Use "era" reference (villain era, glow up era)',
    'Add "locked in" mentality',
    'Use "very demure, very mindful"',
    'Include "let them" philosophy',
    'Add "unbothered" vibe'
  ];
  
  const selectedTrends = trendingElements
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)
    .join('. ');
  
  try {
    // Cohere API Call
    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${COHERE_API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        model: 'command',
        prompt: `You are India's BEST social media caption writer. Create a VIRAL caption about "${topic}" ${platformContext}.

TONE: ${toneMap[tone] || toneMap.engaging}
LENGTH: ${lenMap[len]}
TRENDING STYLE: ${selectedTrends}

Make it:
- Relatable AF 😭
- Shareable (log share karein)
- Comment-bait (log comment karein)
- Saveable (log save karein)

Use:
- Emojis appropriately
- Hashtags at the end (trending ones)
- Line breaks for readability
- Hook in first line
- Question in middle
- Call-to-action at end

Return ONLY the caption with hashtags. No explanations.`,
        max_tokens: 400,
        temperature: 0.9,
        k: 0,
        stop_sequences: [],
        return_likelihoods: 'NONE'
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cohere API Error:', errorText);
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Cohere Response:', data);
    
    let caption = data.generations?.[0]?.text?.trim() || '';
    
    if (!caption) {
      throw new Error('Empty response');
    }
    
    caption = caption.replace(/^["'\s]+|["'\s]+$/g, '');
    
    capText.textContent = caption;
    document.getElementById('postCaption').value = caption;
    resultEl.classList.add('show');
    showToast('🔥 Viral caption ready!');
    
  } catch (error) {
    console.error('Generation Error:', error);
    
    // Premium fallback captions
    const fallbackCaptions = getPremiumCaptions(topic, tone, len);
    const randomCaption = fallbackCaptions[Math.floor(Math.random() * fallbackCaptions.length)];
    
    capText.textContent = randomCaption;
    document.getElementById('postCaption').value = randomCaption;
    resultEl.classList.add('show');
    
    if (error.message.includes('Failed to fetch')) {
      showToast('⚠️ API connect nahi ho paaya, fallback captions use kar rahe hain', 'warning');
    } else {
      showToast('⚠️ API error, fallback captions use kar rahe hain', 'warning');
    }
  } finally {
    loadingEl.classList.remove('show');
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Viral Caption';
  }
}

function getPremiumCaptions(topic, tone, length) {
  const topicClean = topic.replace(/\s+/g, '');
  
  const captions = {
    engaging: [
      `✨ ${topic.toUpperCase()} ERA STARTS NOW ✨\n\nDrop a 🔥 if you agree:\n\n"Your ${topic} journey doesn't have to be perfect, it just has to be YOURS."\n\nTag someone who needs this motivation! 👇\n\n#${topicClean} #viral #trending #explore #fyp #motivation #thatgirl`,
      
      `POV: You finally stopped waiting for the "perfect time" to start your ${topic} journey.\n\nSpoiler: The perfect time was always NOW. 💫\n\nWho else can relate? 👇\n\n#${topicClean} #maincharacterenergy #lockedin #fypシ #trendingreels`,
      
      `Nobody:\nAbsolutely nobody:\nNot a single soul:\n\nMe: *obsessed with ${topic}*\n\nThis is my personality now, deal with it. 😭💯\n\n#${topicClean} #relatable #memes #fyp #contentcreator`
    ],
    motivational: [
      `🚀 YOUR ${topic.toUpperCase()} GLOW UP STARTS TODAY 🚀\n\nRemember: Every expert was once a beginner who refused to give up.\n\nYou're closer than you think. Keep going. 🌟\n\nSave this for when you need motivation! 📌\n\n#${topicClean} #motivation #success #hustle #grind #goals #fyp`,
      
      `Main character energy: Activated. ✨\n\nYour ${topic} era is NOT a dress rehearsal. It's the main event.\n\nShow up. Lock in. Level up. 🎯\n\nTag your accountability partner! 👯‍♀️\n\n#${topicClean} #maincharacterenergy #lockedin #motivation #foryou`
    ],
    humorous: [
      `Me: I should be consistent with ${topic}\n\nAlso me: *watches 47 reels, orders food, reorganizes closet, learns random facts about penguins*\n\nWhy are we like this? 🤡💀\n\n#${topicClean} #relatable #procrastination #adhdlife #fyp`,
      
      `Current situation: Trying to master ${topic}\n\nReality: 3 days in, already on a "mental health break"\n\nBreak length: undefined\n\nSend help (and snacks) 📦😭\n\n#${topicClean} #messylife #relatablecontent #fypシ`
    ],
    professional: [
      `3 things I wish I knew before starting my ${topic} journey:\n\n1️⃣ Consistency > Perfection\n2️⃣ Your audience wants YOU, not a filtered version\n3️⃣ Value ALWAYS wins over trends\n\nWhich one hits different? Comment below 👇\n\n#${topicClean} #business #growthmindset #professional #tips`,
      
      `${topic.toUpperCase()} 101: The unfiltered edition 📝\n\nIt's not about going viral.\nIt's about building something that lasts.\n\nValue > Views\nConnection > Clout\nCommunity > Followers\n\nAgree? 💯\n\n#${topicClean} #education #growth #linkedin #creator`
    ],
    educational: [
      `Save this for later! 📌\n\n5 things I learned about ${topic} after 3 years:\n\n1️⃣ Start before you're ready\n2️⃣ Consistency beats intensity\n3️⃣ Your voice matters more than trends\n4️⃣ Community > Followers\n5️⃣ Enjoy the process\n\nWhich one do you struggle with? 👇\n\n#${topicClean} #tips #growth #learning #fyp`,
      
      `${topic.toUpperCase()} MASTERCLASS 🎓\n\nThe secret nobody tells you:\n\nIt's not about being the best.\nIt's about being YOU, consistently.\n\nThat's it. That's the secret. 🤯\n\nShare with someone who needs this! 🔄\n\n#${topicClean} #education #wisdom #foryoupage`
    ]
  };
  
  const toneKey = captions[tone] ? tone : 'engaging';
  const toneCaptions = captions[toneKey];
  
  return toneCaptions;
}

function useCaption() {
  const caption = document.getElementById('capText').textContent;
  document.getElementById('postCaption').value = caption;
  showToast('Caption added to your post!');
}

function schedulePost() {
  closeModal('captionModal');
  showToast('Post scheduled successfully! ✨');
}

function submitCaptionPost() {
  closeModal('captionModal');
  showToast('Post published successfully! 🎉');
}

function submitPost() {
  closeModal('postModal');
  uploadedFiles = [];
  showToast('Post published successfully! 🎉');
}

function schedulePostNow() {
  closeModal('postModal');
  uploadedFiles = [];
  showToast('Post scheduled successfully! 📅');
}

// ── AI ANALYTICS INSIGHTS ─────────────────
async function generateInsights() {
  const q = document.getElementById('insightQ').value.trim() || 'Analyze my performance';
  const period = document.getElementById('insightPeriod').value;
  document.getElementById('insLoading').classList.add('show');
  document.getElementById('insResult').style.display = 'none';
  
  try {
    const stats = `Instagram: 124.3K followers (+8.5%), YouTube: 89.7K subscribers (+12%), Twitter: 47.1K (+5.2%), Avg engagement: 9.7%. Period: ${period}.`;
    
    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${COHERE_API_KEY}`
      },
      body: JSON.stringify({
        model: 'command',
        prompt: `Analyze this creator's stats: ${stats}\nQuestion: ${q}\nGive 3-4 actionable bullet-point insights with emojis. Be specific and data-driven. Max 200 words.`,
        max_tokens: 300,
        temperature: 0.8
      })
    });
    
    if (!response.ok) throw new Error('API Error');
    
    const data = await response.json();
    const text = data.generations?.[0]?.text?.trim() || 'Unable to generate insights.';
    
    document.getElementById('insText').innerHTML = text.replace(/\n/g, '<br>');
    document.getElementById('insResult').style.display = 'block';
  } catch (e) {
    document.getElementById('insText').textContent = 'Error. Please try again.';
    document.getElementById('insResult').style.display = 'block';
  }
  document.getElementById('insLoading').classList.remove('show');
}

// ── AI REPLY SUGGESTIONS ──────────────────
let replyCtx = {};

async function openReplyModal(name, comment, platform) {
  replyCtx = { name, comment, platform };
  
  document.getElementById('commenterName').textContent = `${name} on ${platform}`;
  document.getElementById('commentText').textContent = comment;
  document.getElementById('replyList').innerHTML = '';
  document.getElementById('replyArea').style.display = 'none';
  document.getElementById('replyLoading').classList.add('show');
  openModal('replyModal');
  
  try {
    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${COHERE_API_KEY}`
      },
      body: JSON.stringify({
        model: 'command-light',
        prompt: `Generate 3 friendly reply options for this ${platform} comment from ${name}: "${comment}"

Make each reply:
- Natural and conversational
- Show appreciation
- Under 20 words
- Use emojis appropriately

Format as:
1. [Reply text]
2. [Reply text]
3. [Reply text]`,
        max_tokens: 200,
        temperature: 0.8
      })
    });
    
    if (!response.ok) throw new Error('API Error');
    
    const data = await response.json();
    const replyText = data.generations?.[0]?.text || '';
    
    const replies = replyText
      .split('\n')
      .filter(line => line.match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(r => r.length > 0);
    
    if (replies.length > 0) {
      document.getElementById('replyList').innerHTML = replies.map((reply, i) => {
        const tones = ['Warm & Friendly', 'Casual & Cool', 'Professional'];
        return `<div class="reply-opt" onclick="selectReply(this,'${reply.replace(/'/g, "\\'")}')">
          <div class="reply-tone">${tones[i] || 'Friendly'}</div>
          ${reply}
        </div>`;
      }).join('');
    } else {
      throw new Error('No replies generated');
    }
    
  } catch (error) {
    const fallbackReplies = [
      `Thanks so much ${name}! Really appreciate your support! 🙏✨`,
      `Love your feedback! What else would you like to see? 💭`,
      `So glad you enjoyed it! Means a lot coming from you! 💫`
    ];
    
    document.getElementById('replyList').innerHTML = fallbackReplies.map((reply, i) => {
      const tones = ['Warm & Friendly', 'Casual & Cool', 'Professional'];
      return `<div class="reply-opt" onclick="selectReply(this,'${reply.replace(/'/g, "\\'")}')">
        <div class="reply-tone">${tones[i]}</div>
        ${reply}
      </div>`;
    }).join('');
  }
  
  document.getElementById('replyLoading').classList.remove('show');
}

function selectReply(el, text) {
  document.querySelectorAll('.reply-opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('replyText').value = text;
  document.getElementById('replyArea').style.display = 'block';
}

function sendReply() {
  closeModal('replyModal');
  showToast(`Reply sent to ${replyCtx.name}! 🎉`);
}

// ── INBOX FUNCTIONS ────────────────────────────
function switchInboxTab(tab, type) {
  document.querySelectorAll('.inbox-tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  filterInboxByType(type);
}

function filterInbox(element, platform) {
  document.querySelectorAll('.platform-filter').forEach(f => f.classList.remove('active'));
  element.classList.add('active');
  
  const items = document.querySelectorAll('.inbox-item');
  items.forEach(item => {
    if (platform === 'all' || item.dataset.platform === platform) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
}

function filterInboxByType(type) {
  const items = document.querySelectorAll('.inbox-item');
  items.forEach(item => {
    if (type === 'all' || 
        (type === 'unread' && item.classList.contains('unread')) ||
        (type === 'mentions' && item.dataset.type === 'mention')) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
}

function searchInbox() {
  const searchTerm = document.getElementById('inboxSearch').value.toLowerCase();
  const items = document.querySelectorAll('.inbox-item');
  
  items.forEach(item => {
    const message = item.querySelector('.inbox-item-message').textContent.toLowerCase();
    const name = item.querySelector('.inbox-item-name').textContent.toLowerCase();
    
    if (message.includes(searchTerm) || name.includes(searchTerm)) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
}

function markAsRead(element) {
  const item = element.closest('.inbox-item');
  item.classList.remove('unread');
  showToast('Marked as read');
}

function markAllAsRead() {
  document.querySelectorAll('.inbox-item.unread').forEach(item => {
    item.classList.remove('unread');
  });
  showToast('All messages marked as read');
}

function archiveMessage(element) {
  const item = element.closest('.inbox-item');
  item.remove();
  showToast('Message archived');
}

function likeComment(element) {
  const icon = element.querySelector('i');
  icon.classList.toggle('fa-regular');
  icon.classList.toggle('fa-solid');
  showToast('Comment liked');
}

function retweetMessage(element) {
  showToast('Retweeted!');
}

function openMessage(element) {
  element.classList.remove('unread');
}

function openReplyModalFromInbox(element) {
  const item = element.closest('.inbox-item');
  const name = item.querySelector('.inbox-item-name').textContent.trim();
  const message = item.querySelector('.inbox-item-message').textContent.trim();
  const platform = item.dataset.platform;
  
  openReplyModal(name, message, platform);
}

function exportInbox() {
  showToast('Inbox exported successfully!');
}

// ── CHARTS ───────────────────────────────────
document.querySelectorAll('.ptab').forEach(tab => {
  tab.addEventListener('click', function() {
    this.closest('.period-tabs').querySelectorAll('.ptab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    updateEngagement(this.textContent.trim());
  });
});

const labels7 = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const labels14 = ['Apr 1', 'Apr 2', 'Apr 3', 'Apr 4', 'Apr 5', 'Apr 6', 'Apr 7', 'Apr 8', 'Apr 9', 'Apr 10', 'Apr 11', 'Apr 12', 'Apr 13', 'Apr 14', 'Apr 15'];
const labels30 = Array.from({ length: 30 }, (_, i) => `Mar ${i + 15}`);

const engData = {
  '7D': {
    ig: [2400, 3100, 2800, 4100, 3700, 5200, 4800],
    yt: [1800, 2200, 1900, 3000, 2600, 3800, 3400],
    fb: [900, 1200, 1000, 1500, 1300, 1800, 1600],
    tw: [600, 800, 700, 1100, 950, 1400, 1200]
  },
  '14D': {
    ig: [1800, 2200, 2600, 3000, 2400, 3500, 4200, 3800, 4800, 4200, 5600, 5000, 6200, 5800, 7000],
    yt: [1200, 1500, 1800, 2100, 1700, 2600, 3200, 2900, 3700, 3300, 4400, 3900, 5000, 4600, 5600],
    fb: [600, 800, 900, 1100, 900, 1300, 1700, 1500, 1900, 1700, 2300, 2000, 2600, 2400, 3000],
    tw: [400, 500, 600, 750, 600, 900, 1200, 1000, 1400, 1200, 1700, 1500, 1900, 1700, 2200]
  },
  '30D': {
    ig: Array.from({ length: 30 }, (_, i) => 1200 + i * 120 + Math.random() * 400),
    yt: Array.from({ length: 30 }, (_, i) => 800 + i * 90 + Math.random() * 300),
    fb: Array.from({ length: 30 }, (_, i) => 400 + i * 50 + Math.random() * 200),
    tw: Array.from({ length: 30 }, (_, i) => 250 + i * 35 + Math.random() * 150)
  }
};

const ec = document.getElementById('engagementChart').getContext('2d');

function mg(ctx, col) {
  const g = ctx.createLinearGradient(0, 0, 0, 220);
  g.addColorStop(0, col + '40');
  g.addColorStop(1, col + '00');
  return g;
}

let engChart = new Chart(ec, {
  type: 'line',
  data: {
    labels: labels14,
    datasets: [{
      label: 'Instagram',
      data: engData['14D'].ig,
      borderColor: '#e1306c',
      backgroundColor: mg(ec, '#e1306c'),
      fill: true,
      tension: .45,
      borderWidth: 2.5,
      pointRadius: 0,
      pointHoverRadius: 5
    }, {
      label: 'YouTube',
      data: engData['14D'].yt,
      borderColor: '#ff0000',
      backgroundColor: mg(ec, '#ff0000'),
      fill: true,
      tension: .45,
      borderWidth: 2.5,
      pointRadius: 0,
      pointHoverRadius: 5
    }, {
      label: 'Facebook',
      data: engData['14D'].fb,
      borderColor: '#1877f2',
      backgroundColor: 'transparent',
      fill: false,
      tension: .45,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 5,
      borderDash: [4, 4]
    }, {
      label: 'Twitter',
      data: engData['14D'].tw,
      borderColor: '#1da1f2',
      backgroundColor: 'transparent',
      fill: false,
      tension: .45,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 5
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#111827',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 10,
        boxPadding: 5,
        callbacks: {
          label: ctx => `  ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          font: { family: 'DM Sans', size: 11 },
          color: '#9ca3af',
          maxRotation: 0
        }
      },
      y: {
        grid: { color: '#f3f4f8', drawBorder: false },
        border: { display: false, dash: [4, 4] },
        ticks: {
          font: { family: 'DM Sans', size: 11 },
          color: '#9ca3af',
          callback: v => v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v,
          maxTicksLimit: 5
        }
      }
    }
  }
});

function updateEngagement(p) {
  const d = engData[p];
  const l = p === '7D' ? labels7 : p === '14D' ? labels14 : labels30;
  engChart.data.labels = l;
  engChart.data.datasets[0].data = d.ig;
  engChart.data.datasets[1].data = d.yt;
  engChart.data.datasets[2].data = d.fb;
  engChart.data.datasets[3].data = d.tw;
  engChart.update();
}

new Chart(document.getElementById('followerDonut').getContext('2d'), {
  type: 'doughnut',
  data: {
    labels: ['Instagram', 'YouTube', 'Twitter'],
    datasets: [{
      data: [124300, 89700, 47100],
      backgroundColor: ['#e1306c', '#ff0000', '#1da1f2'],
      borderWidth: 3,
      borderColor: '#fff',
      hoverOffset: 6
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#111827',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: ctx => `  ${ctx.label}: ${ctx.parsed.toLocaleString()}`
        }
      }
    }
  }
});

// Initialize analytics charts when modal opens
document.getElementById('analyticsModal').addEventListener('click', function(e) {
  if (e.target === this) return;
  if (!likesPieChart) {
    setTimeout(initAnalyticsCharts, 100);
  }
});

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', function(e) {
    if (!this.onclick) e.preventDefault();
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    this.classList.add('active');
  });
});

// ── HEADER PANELS ────────────────────────────
let activePanel = null;

function closeAllPanels() {
  ['searchPanel', 'notifPanel', 'profileDropdown'].forEach(id => {
    document.getElementById(id).classList.remove('open');
  });
  document.getElementById('panelBackdrop').classList.remove('open');
  activePanel = null;
}

function openPanel(id, e) {
  if (e) e.stopPropagation();
  if (activePanel === id) {
    closeAllPanels();
    return;
  }
  closeAllPanels();
  document.getElementById(id).classList.add('open');
  document.getElementById('panelBackdrop').classList.add('open');
  activePanel = id;
}

function openSearchPanel(e) {
  openPanel('searchPanel', e);
  setTimeout(() => {
    const inp = document.getElementById('searchPanelInput');
    if (inp) inp.focus();
  }, 150);
}

function toggleNotifPanel(e) {
  openPanel('notifPanel', e);
}

function toggleProfileDropdown(e) {
  openPanel('profileDropdown', e);
}

// ── SEARCH FUNCTIONS ──────────────────────────
let searchTimeout;

function liveSearch(val) {
  document.getElementById('headerSearchInput').value = val;
  document.getElementById('searchPanelInput').value = val;
  
  clearTimeout(searchTimeout);
  if (!val.trim()) {
    document.getElementById('searchDefault').style.display = 'block';
    document.getElementById('searchLiveResults').style.display = 'none';
    return;
  }
  document.getElementById('searchDefault').style.display = 'none';
  searchTimeout = setTimeout(() => {
    document.getElementById('searchLiveResults').style.display = 'block';
    document.querySelectorAll('#searchLiveResults .search-result-label').forEach(el => {
      const text = el.textContent;
      const re = new RegExp(`(${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      el.innerHTML = text.replace(re, '<mark style="background:#ede9ff;color:var(--primary);border-radius:3px;padding:0 2px;">$1</mark>');
    });
  }, 200);
}

function filterSearch(el, category) {
  document.querySelectorAll('.search-cat').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  showToast(`Filtering by: ${category}`);
}

function runSearch(term) {
  document.getElementById('searchPanelInput').value = term;
  liveSearch(term);
}

function clearSearch() {
  document.getElementById('searchPanelInput').value = '';
  document.getElementById('headerSearchInput').value = '';
  document.getElementById('searchDefault').style.display = 'block';
  document.getElementById('searchLiveResults').style.display = 'none';
}

function clearRecentSearches() {
  document.querySelectorAll('#searchDefault .search-result-item').forEach(el => el.remove());
  showToast('Recent searches cleared');
}

// ── NOTIFICATION FUNCTIONS ────────────────────
let unreadCount = 5;

function readNotif(el) {
  if (el.classList.contains('unread')) {
    el.classList.remove('unread');
    unreadCount = Math.max(0, unreadCount - 1);
    updateNotifBadge();
  }
}

function markAllNotifsRead() {
  document.querySelectorAll('.notif-item.unread').forEach(el => el.classList.remove('unread'));
  unreadCount = 0;
  updateNotifBadge();
  showToast('All notifications marked as read');
}

function updateNotifBadge() {
  const badge = document.getElementById('notifBadge');
  const countEl = document.getElementById('notifCount');
  if (unreadCount === 0) {
    badge.style.display = 'none';
    countEl.style.display = 'none';
  } else {
    badge.textContent = `${unreadCount} new`;
    countEl.textContent = unreadCount;
  }
}

function switchNotifTab(el, type) {
  document.querySelectorAll('.notif-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const items = document.querySelectorAll('.notif-item');
  items.forEach(item => {
    if (type === 'all' || item.dataset.type === type) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
}

let calYear = 2025, calMonth = 3;
const scheduledPosts = {
  '2025-4-16': [{ plat: 'tw', label: 'Thread' }],
  '2025-4-17': [{ plat: 'ig', label: 'Story' }],
  '2025-4-19': [{ plat: 'ig', label: 'Carousel' }, { plat: 'fb', label: 'Photo' }],
  '2025-4-21': [{ plat: 'yt', label: 'Short' }],
  '2025-4-24': [{ plat: 'ig', label: 'Reel' }, { plat: 'yt', label: 'Short' }],
  '2025-4-28': [{ plat: 'tw', label: 'Thread' }],
};

function renderCalendar() {
  const grid = document.getElementById('calGrid');
  if (!grid) return;
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  document.getElementById('calMonthTitle').textContent = `${monthNames[calMonth]} ${calYear}`;
  
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const daysInPrev = new Date(calYear, calMonth, 0).getDate();
  const today = new Date();
  
  grid.innerHTML = '';
  let cells = 0;
  
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = document.createElement('div');
    d.className = 'cal-day other-month';
    d.innerHTML = `<div class="cal-date">${daysInPrev - i}</div>`;
    grid.appendChild(d);
    cells++;
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const d = document.createElement('div');
    const key = `${calYear}-${calMonth + 1}-${day}`;
    const isToday = today.getFullYear() === calYear && today.getMonth() === calMonth && today.getDate() === day;
    const posts = scheduledPosts[key] || [];
    d.className = 'cal-day' + (isToday ? ' today' : '') + (posts.length ? ' has-post' : '');
    let dots = posts.map(p => `<div class="cal-post-dot ${p.plat}"><i class="fa-brands fa-${p.plat === 'tw' ? 'x-twitter' : p.plat === 'ig' ? 'instagram' : p.plat === 'yt' ? 'youtube' : 'facebook-f'}"></i> ${p.label}</div>`).join('');
    d.innerHTML = `<div class="cal-date">${day}</div>${dots}`;
    d.onclick = () => {
      showToast(posts.length ? `${posts.length} post(s) scheduled on ${monthNames[calMonth]} ${day}` : `Click "New Post" to schedule for ${monthNames[calMonth]} ${day}`);
    };
    grid.appendChild(d);
    cells++;
  }
  
  const remaining = 42 - cells;
  for (let i = 1; i <= remaining; i++) {
    const d = document.createElement('div');
    d.className = 'cal-day other-month';
    d.innerHTML = `<div class="cal-date">${i}</div>`;
    grid.appendChild(d);
  }
}

function changeMonth(dir) {
  calMonth += dir;
  if (calMonth > 11) {
    calMonth = 0;
    calYear++;
  }
  if (calMonth < 0) {
    calMonth = 11;
    calYear--;
  }
  renderCalendar();
}

let calListViewActive = false;

function toggleCalView() {
  calListViewActive = !calListViewActive;
  document.getElementById('calendarView').style.display = calListViewActive ? 'none' : 'block';
  document.getElementById('listView').style.display = calListViewActive ? 'block' : 'none';
  const btn = document.getElementById('calViewToggle');
  btn.innerHTML = calListViewActive ? '<i class="fa-regular fa-calendar"></i> Calendar View' : '<i class="fa-solid fa-list"></i> List View';
}

function editScheduledPost() {
  showToast('Opening post editor...');
  setTimeout(() => openPostModal(), 400);
}

function deleteScheduledPost(el) {
  el.closest('.sched-item').remove();
  showToast('Post removed from schedule');
}

function applyBestTimes() {
  showToast('AI auto-scheduling applied! ✨');
}

// ── PROFILE FUNCTIONS ────────────────────────────
function editProfile() {
  showToast('Profile editor coming soon!');
}

// ── ALL ACTIVITY MODAL FUNCTIONS ─────────────────
let currentActivityFilter = 'all';

function setActivityFilter(el, type) {
  currentActivityFilter = type;
  document.querySelectorAll('.activity-filter-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  const items = document.querySelectorAll('#activityFullList .act-full-item');
  items.forEach(item => {
    if (type === 'all' || item.dataset.type === type) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
}

function filterActivityList(val) {
  const items = document.querySelectorAll('#activityFullList .act-full-item');
  const v = val.toLowerCase();
  items.forEach(item => {
    const matchType = currentActivityFilter === 'all' || item.dataset.type === currentActivityFilter;
    const matchText = item.dataset.text.includes(v) || v === '';
    item.style.display = (matchType && matchText) ? 'flex' : 'none';
  });
}

function exportActivityLog() {
  showToast('Activity log exported successfully! 📥');
}

function loadMoreActivity() {
  showToast('Loading older activity...');
}

async function loadUserFromLogin() {
  const { ok, data } = await apiCall('/api/auth/me');
  if (!ok || !data.user) {
    window.location.replace(`${APP_ORIGIN}/login`);
    return;
  }

  const user = data.user;
  const name = user.displayName || user.username || 'User';
  const email = user.email || '';
  const username = user.username || name.trim().toLowerCase().replace(/\s+/g, '');
  const initials = name.trim().split(/\s+/).map(w => w[0]?.toUpperCase() || '').join('').slice(0, 2) || 'U';
  const handle = '@' + username;

  document.querySelectorAll('.user-name').forEach(el => {
    el.textContent = name;
  });
  document.querySelectorAll('.user-email').forEach(el => {
    el.textContent = email;
  });

  const hAvatar = document.getElementById('profileAvatarBtn');
  if (hAvatar && !hAvatar.querySelector('img')) hAvatar.textContent = initials;

  const sAvatar = document.querySelector('.sidebar-footer .avatar');
  if (sAvatar && !sAvatar.querySelector('img')) sAvatar.textContent = initials;

  const dropName = document.querySelector('.profile-drop-name');
  if (dropName) dropName.textContent = name;

  const dropRole = document.querySelector('.profile-drop-role');
  if (dropRole) dropRole.textContent = email || handle;

  const pName = document.querySelector('#profileModal .profile-name');
  if (pName) pName.textContent = name;

  const pHandle = document.querySelector('#profileModal .profile-handle');
  if (pHandle) pHandle.textContent = `${handle} · Creator`;

  const emailEls = document.querySelectorAll('#profileModal [data-field="email"]');
  emailEls.forEach(el => {
    el.textContent = email;
  });

  if (user.theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
}

document.addEventListener('DOMContentLoaded', loadUserFromLogin);