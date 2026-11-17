// =========================================================================
// WUTHERING WAVES — ALDO FATURRACHMAN // SOLARIS-3 PORTFOLIO ENGINE
// =========================================================================

let ytPlayer = null;
let ytReady = false;
let isPlayingBgm = false;
let isMutedBgm = false;
let bgmVolume = 65;
let audioCtx = null;
let synthInterval = null;
let localAudioEl = null;

// Load YouTube IFrame Player API for Track 30iNYa6Wl1o
(function loadYouTubeAPI() {
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  const firstScript = document.getElementsByTagName('script')[0];
  firstScript.parentNode.insertBefore(tag, firstScript);
})();

window.onYouTubeIframeAPIReady = function () {
  ytPlayer = new YT.Player('yt-player', {
    videoId: '30iNYa6Wl1o',
    playerVars: {
      autoplay: 0,
      controls: 0,
      loop: 1,
      playlist: '30iNYa6Wl1o',
      rel: 0,
      modestbranding: 1,
      playsinline: 1
    },
    events: {
      onReady: () => {
        ytReady = true;
        ytPlayer.setVolume(bgmVolume);
      },
      onError: () => {
        startFallbackAmbientSynth();
      }
    }
  });
};

function startSoundtrack() {
  if (localAudioEl) {
    localAudioEl.volume = isMutedBgm ? 0 : bgmVolume / 100;
    localAudioEl.play().catch(() => {});
    isPlayingBgm = true;
    updateAudioUI();
    return;
  }

  if (ytReady && ytPlayer && typeof ytPlayer.playVideo === 'function') {
    try {
      ytPlayer.unMute();
      ytPlayer.setVolume(isMutedBgm ? 0 : bgmVolume);
      ytPlayer.playVideo();
      isPlayingBgm = true;
      updateAudioUI();
      setTimeout(() => {
        if (ytPlayer.getPlayerState && ytPlayer.getPlayerState() !== 1 && isPlayingBgm) {
          startFallbackAmbientSynth();
        }
      }, 2500);
      return;
    } catch (e) {
      startFallbackAmbientSynth();
    }
  } else {
    startFallbackAmbientSynth();
  }
}

function toggleSoundtrack() {
  if (isPlayingBgm) {
    isPlayingBgm = false;
    if (ytReady && ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo();
    if (localAudioEl) localAudioEl.pause();
    stopFallbackAmbientSynth();
  } else {
    startSoundtrack();
  }
  updateAudioUI();
}

function setMasterVolume(val) {
  bgmVolume = Number(val);
  document.getElementById('bgm-volume').value = bgmVolume;
  document.getElementById('modal-vol').value = bgmVolume;
  if (ytReady && ytPlayer && ytPlayer.setVolume) {
    ytPlayer.setVolume(isMutedBgm ? 0 : bgmVolume);
  }
  if (localAudioEl) {
    localAudioEl.volume = isMutedBgm ? 0 : bgmVolume / 100;
  }
}

function updateAudioUI() {
  const toggleBtn = document.getElementById('bgm-toggle');
  const modalBtn = document.getElementById('modal-bgm-btn');
  const eq = document.getElementById('eq-bars');
  const muteBtn = document.getElementById('bgm-mute');

  toggleBtn.textContent = isPlayingBgm ? '❚❚' : '▶';
  modalBtn.textContent = isPlayingBgm ? 'Playing' : 'Paused';
  eq.classList.toggle('paused', !isPlayingBgm);
  muteBtn.textContent = isMutedBgm || bgmVolume === 0 ? '🔇' : '🔊';
}

function startFallbackAmbientSynth() {
  if (synthInterval) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const notes = [261.63, 329.63, 392.0, 493.88, 587.33, 493.88, 392.0, 329.63];
    let idx = 0;
    isPlayingBgm = true;
    updateAudioUI();
    synthInterval = setInterval(() => {
      if (!isPlayingBgm || isMutedBgm || bgmVolume === 0) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = notes[idx % notes.length];
      idx++;
      const vol = (bgmVolume / 100) * 0.06;
      gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(vol, audioCtx.currentTime + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.85);
    }, 1100);
  } catch (e) {}
}

function stopFallbackAmbientSynth() {
  if (synthInterval) {
    clearInterval(synthInterval);
    synthInterval = null;
  }
}

// =========================================================================
// STAGE 1: TITLE CANVAS (SOLARIS-3 HORIZON + ROVER SILHOUETTES)
// =========================================================================
const titleCanvas = document.getElementById('title-canvas');
const tCtx = titleCanvas.getContext('2d');
let mouseX = 0, mouseY = 0;
let zoomFactor = 1;
let isLanding = false;
let particleMultiplier = 1;

const stars = Array.from({ length: 110 }, () => ({
  x: Math.random(),
  y: Math.random() * 0.72,
  r: Math.random() * 1.8 + 0.4,
  s: Math.random() * 0.0008 + 0.0002,
  p: Math.random() * Math.PI * 2
}));

function resizeCanvases() {
  [titleCanvas, document.getElementById('loading-canvas'), document.getElementById('world-bg-canvas')].forEach(c => {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
  });
}
window.addEventListener('resize', resizeCanvases);
resizeCanvases();

window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 22;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 14;
});

function drawTitleScene(time) {
  const w = titleCanvas.width;
  const h = titleCanvas.height;
  tCtx.save();

  if (isLanding) {
    zoomFactor = Math.min(1.38, zoomFactor + 0.0045);
    tCtx.translate(w * 0.65, h * 0.55);
    tCtx.scale(zoomFactor, zoomFactor);
    tCtx.translate(-w * 0.65, -h * 0.55);
  }

  const sky = tCtx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#04060b');
  sky.addColorStop(0.55, '#0b1324');
  sky.addColorStop(1, '#121a2e');
  tCtx.fillStyle = sky;
  tCtx.fillRect(0, 0, w, h);

  const pillarX = w * 0.5 + mouseX * 0.4;
  const pillarGrad = tCtx.createLinearGradient(pillarX - 90, 0, pillarX + 90, 0);
  pillarGrad.addColorStop(0, 'transparent');
  pillarGrad.addColorStop(0.5, 'rgba(125, 211, 252, 0.22)');
  pillarGrad.addColorStop(1, 'transparent');
  tCtx.fillStyle = pillarGrad;
  tCtx.fillRect(pillarX - 90, 0, 180, h * 0.72);

  const count = Math.floor(stars.length * particleMultiplier);
  for (let i = 0; i < count; i++) {
    const st = stars[i];
    st.y -= st.s;
    if (st.y < 0) st.y = 0.72;
    const alpha = 0.35 + 0.55 * Math.sin(time * 0.002 + st.p);
    tCtx.fillStyle = i % 5 === 0 ? `rgba(243, 198, 95, ${alpha})` : `rgba(186, 230, 253, ${alpha})`;
    tCtx.beginPath();
    tCtx.arc(st.x * w + mouseX * 0.6, st.y * h + mouseY * 0.4, st.r, 0, Math.PI * 2);
    tCtx.fill();
  }

  tCtx.fillStyle = '#070a10';
  tCtx.beginPath();
  tCtx.moveTo(0, h);
  tCtx.lineTo(0, h * 0.74 + mouseY * 0.5);
  tCtx.lineTo(w * 0.36, h * 0.69 + mouseY * 0.5);
  tCtx.lineTo(w * 0.52, h * 0.73 + mouseY * 0.5);
  tCtx.lineTo(w * 0.78, h * 0.67 + mouseY * 0.5);
  tCtx.lineTo(w, h * 0.72 + mouseY * 0.5);
  tCtx.lineTo(w, h);
  tCtx.closePath();
  tCtx.fill();

  const rx = w * 0.68 + mouseX * 0.8;
  const ry = h * 0.67 + mouseY * 0.5;
  tCtx.fillStyle = '#0c1018';
  tCtx.beginPath();
  tCtx.arc(rx, ry - 38, 11, 0, Math.PI * 2);
  tCtx.fill();
  tCtx.beginPath();
  tCtx.moveTo(rx - 18, ry);
  tCtx.lineTo(rx - 8, ry - 27);
  tCtx.lineTo(rx + 12, ry - 26);
  tCtx.lineTo(rx + 22, ry + 6);
  tCtx.closePath();
  tCtx.fill();

  const glowRadius = isLanding ? 26 + Math.sin(time * 0.02) * 8 : 8;
  const tacetGlow = tCtx.createRadialGradient(rx - 22, ry - 16, 1, rx - 22, ry - 16, glowRadius);
  tacetGlow.addColorStop(0, '#ffffff');
  tacetGlow.addColorStop(0.4, 'rgba(243, 198, 95, 0.85)');
  tacetGlow.addColorStop(1, 'transparent');
  tCtx.fillStyle = tacetGlow;
  tCtx.beginPath();
  tCtx.arc(rx - 22, ry - 16, glowRadius, 0, Math.PI * 2);
  tCtx.fill();

  tCtx.restore();
  requestAnimationFrame(drawTitleScene);
}
requestAnimationFrame(drawTitleScene);

// =========================================================================
// STAGE 2: LOADING CANVAS ("Lilies in a Dying Dream")
// =========================================================================
const loadCanvas = document.getElementById('loading-canvas');
const lCtx = loadCanvas.getContext('2d');
function drawLoadingScene(time) {
  const w = loadCanvas.width;
  const h = loadCanvas.height;
  const grad = lCtx.createRadialGradient(w * 0.55, h * 0.42, 40, w * 0.5, h * 0.5, w * 0.75);
  grad.addColorStop(0, '#1e1b4b');
  grad.addColorStop(0.5, '#0f172a');
  grad.addColorStop(1, '#05070d');
  lCtx.fillStyle = grad;
  lCtx.fillRect(0, 0, w, h);

  for (let i = 0; i < 28; i++) {
    const px = ((i * 97 + time * 0.03) % w);
    const py = h - ((i * 53 + time * 0.04) % h);
    lCtx.fillStyle = i % 2 === 0 ? 'rgba(167, 139, 250, 0.5)' : 'rgba(56, 189, 248, 0.55)';
    lCtx.beginPath();
    lCtx.ellipse(px, py, 6, 2.5, Math.sin(time * 0.004 + i), 0, Math.PI * 2);
    lCtx.fill();
  }
  requestAnimationFrame(drawLoadingScene);
}
requestAnimationFrame(drawLoadingScene);

// =========================================================================
// STAGE 3: MAIN WORLD AMBIENT CANVAS
// =========================================================================
const worldCanvas = document.getElementById('world-bg-canvas');
const wCtx = worldCanvas.getContext('2d');
function drawWorldBg(time) {
  const w = worldCanvas.width;
  const h = worldCanvas.height;
  wCtx.fillStyle = '#07090d';
  wCtx.fillRect(0, 0, w, h);

  for (let i = 0; i < 45; i++) {
    const x = (i * 137.5) % w;
    const y = (h - ((time * 0.02 + i * 41) % h));
    wCtx.fillStyle = i % 3 === 0 ? 'rgba(243,198,95,0.28)' : 'rgba(56,189,248,0.22)';
    wCtx.fillRect(x, y, 2, 2);
  }
  requestAnimationFrame(drawWorldBg);
}
requestAnimationFrame(drawWorldBg);

// =========================================================================
// CUTSCENE SEQUENCE: TITLE -> ZOOM -> FLASH -> LORE LOADING -> MAIN HUD
// =========================================================================
function triggerLandingSequence() {
  if (isLanding) return;
  isLanding = true;
  startSoundtrack();

  const statusText = document.getElementById('login-status-text');
  statusText.textContent = 'Login Status: 6';

  setTimeout(() => {
    statusText.textContent = 'Login Status: 16';
    document.getElementById('tacet-flash').classList.add('active');
  }, 1100);

  setTimeout(() => {
    document.getElementById('title-screen').classList.remove('active');
    document.getElementById('tacet-flash').classList.remove('active');
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.classList.add('active');
    runStagedLoader();
  }, 1850);
}

function runStagedLoader() {
  const milestones = [
    { pct: 10, msg: 'Menghubungkan ke Solaris-3 Resonance Beacon...' },
    { pct: 25, msg: 'Memuat Biodata Aldo Faturrachman...' },
    { pct: 31, msg: 'Mengkalibrasi Node Forte Circuit TKJ...' },
    { pct: 44, msg: 'Menyinkronkan Riwayat Pendidikan Blitar...' },
    { pct: 69, msg: 'Memuat Proyek Cisco & MikroTik...' },
    { pct: 75, msg: 'Memverifikasi Sertifikat Kompetensi KKNI...' },
    { pct: 80, msg: 'Menyelaraskan Frekuensi Audio...' },
    { pct: 100, msg: 'Landing Selesai — Selamat Datang di Solaris-3.' }
  ];

  const fill = document.getElementById('loading-fill');
  const pctEl = document.getElementById('loading-percent');
  const phaseEl = document.getElementById('loading-phase-text');

  milestones.forEach((step, index) => {
    setTimeout(() => {
      fill.style.width = step.pct + '%';
      pctEl.textContent = step.pct + '%';
      phaseEl.textContent = step.msg;

      if (step.pct === 100) {
        setTimeout(() => {
          document.getElementById('loading-screen').classList.remove('active');
          document.getElementById('main-world').classList.add('active');
        }, 550);
      }
    }, index * 420);
  });
}

document.getElementById('tap-to-land').addEventListener('click', triggerLandingSequence);
titleCanvas.addEventListener('click', triggerLandingSequence);

document.getElementById('btn-replay-intro').addEventListener('click', () => {
  isLanding = false;
  zoomFactor = 1;
  document.getElementById('login-status-text').textContent = 'Login Status: 5';
  document.getElementById('main-world').classList.remove('active');
  document.getElementById('title-screen').classList.add('active');
});

const servers = [
  { name: 'SEA // BLITAR', ping: '24ms' },
  { name: 'ASIA // JINZHOU', ping: '38ms' },
  { name: 'GLOBAL // BLACK SHORES', ping: '62ms' }
];
let serverIdx = 0;
document.getElementById('server-selector').addEventListener('click', (e) => {
  e.stopPropagation();
  serverIdx = (serverIdx + 1) % servers.length;
  document.getElementById('server-name').textContent = servers[serverIdx].name;
  document.querySelector('.server-ping').textContent = servers[serverIdx].ping;
});

document.getElementById('btn-exit').addEventListener('click', (e) => {
  e.stopPropagation();
  location.reload();
});
document.getElementById('btn-bulletin').addEventListener('click', (e) => {
  e.stopPropagation();
  openInfoModal('SOLARIS-3 NOTICE', '<p>Portofolio Digital <strong>Aldo Faturrachman</strong> (Kelas 11 TKJ — SMKN 1 Blitar). Klik <em>Tap to land in Solaris-3</em> untuk memulai pembukaan dan musik latar.</p>');
});
document.getElementById('btn-tools').addEventListener('click', (e) => {
  e.stopPropagation();
  particleMultiplier = particleMultiplier === 1 ? 1.8 : 1;
  openInfoModal('GRAPHICS CALIBRATION', `<p>Kepadatan Partikel diatur ke <strong>${particleMultiplier === 1 ? 'STANDARD (1.0x)' : 'ULTRA (1.8x)'}</strong>.</p>`);
});
document.getElementById('btn-account').addEventListener('click', (e) => {
  e.stopPropagation();
  openInfoModal('RESONATOR PASS', '<p><strong>Nama:</strong> Aldo Faturrachman<br><strong>NISN:</strong> 0098099657<br><strong>Sekolah:</strong> SMKN 1 Blitar (Kelas 11 TKJ)</p>');
});
document.getElementById('btn-settings-open').addEventListener('click', (e) => {
  e.stopPropagation();
  openModal('settings-modal');
});
document.getElementById('btn-hud-settings').addEventListener('click', () => openModal('settings-modal'));

document.getElementById('bgm-toggle').addEventListener('click', toggleSoundtrack);
document.getElementById('modal-bgm-btn').addEventListener('click', toggleSoundtrack);
document.getElementById('bgm-mute').addEventListener('click', () => {
  isMutedBgm = !isMutedBgm;
  setMasterVolume(bgmVolume);
  updateAudioUI();
});
document.getElementById('bgm-volume').addEventListener('input', (e) => setMasterVolume(e.target.value));
document.getElementById('modal-vol').addEventListener('input', (e) => setMasterVolume(e.target.value));

document.getElementById('local-audio-input').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (ytReady && ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo();
  stopFallbackAmbientSynth();
  localAudioEl = new Audio(URL.createObjectURL(file));
  localAudioEl.loop = true;
  startSoundtrack();
});

document.querySelectorAll('[data-attr]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-attr]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('attr-badge').textContent = btn.dataset.attr;
  });
});

document.getElementById('btn-customize-profile').addEventListener('click', () => openModal('customize-modal'));
document.getElementById('customize-form').addEventListener('submit', (e) => {
  e.preventDefault();
  document.getElementById('prof-name').textContent = document.getElementById('edit-name').value;
  document.getElementById('prof-class').textContent = document.getElementById('edit-class').value;
  document.getElementById('prof-location').textContent = document.getElementById('edit-location').value;
  document.getElementById('prof-hobby').textContent = document.getElementById('edit-hobby').value;
  closeAllModals();
});

const i18n = {
  id: {
    nav_profile: 'Profil', nav_about: 'Tentang', nav_edu: 'Pendidikan', nav_skills: 'Keahlian',
    nav_projects: 'Proyek', nav_achievements: 'Sertifikat', nav_contact: 'Kontak',
    sec_about_title: 'Tentang Saya', sec_edu_title: 'Riwayat Pendidikan',
    sec_skills_title: 'Keahlian (Skills)', sec_projects_title: 'Proyek (Projects)',
    sec_achievements_title: 'Sertifikasi & Penghargaan', sec_contact_title: 'Kontak & Media Sosial'
  },
  en: {
    nav_profile: 'Profile', nav_about: 'About', nav_edu: 'Education', nav_skills: 'Skills',
    nav_projects: 'Projects', nav_achievements: 'Certificates', nav_contact: 'Contact',
    sec_about_title: 'About Me', sec_edu_title: 'Education History',
    sec_skills_title: 'Technical Skills', sec_projects_title: 'Featured Projects',
    sec_achievements_title: 'Certifications & Awards', sec_contact_title: 'Contact & Social Media'
  }
};
document.getElementById('lang-select').addEventListener('change', (e) => {
  const dict = i18n[e.target.value] || i18n.id;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key]) el.textContent = dict[key];
  });
});

document.getElementById('waveline-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('sender-name').value;
  document.getElementById('transmit-feedback').textContent = `✦ Sinyal terkirim dari ${name} ke Terminal Aldo Faturrachman.`;
  e.target.reset();
});

function openModal(id) {
  document.querySelectorAll('.modal-box').forEach(m => m.hidden = true);
  document.getElementById(id).hidden = false;
  document.getElementById('modal-backdrop').classList.add('open');
}
function openInfoModal(title, html) {
  document.getElementById('info-modal-title').textContent = title;
  document.getElementById('info-modal-body').innerHTML = html;
  openModal('info-modal');
}
function closeAllModals() {
  document.getElementById('modal-backdrop').classList.remove('open');
}
document.querySelectorAll('[data-close-modal]').forEach(btn => btn.addEventListener('click', closeAllModals));
document.getElementById('modal-backdrop').addEventListener('click', (e) => {
  if (e.target.id === 'modal-backdrop') closeAllModals();
});
