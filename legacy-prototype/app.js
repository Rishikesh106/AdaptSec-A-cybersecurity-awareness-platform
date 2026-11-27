/* app.js - AdaptSec upgraded: ordered content, attractive games, dark theme */
/* External libs: zxcvbn (for password strength), jspdf (for PDF export) */

window.addEventListener('load', () => {
  /* ---------- State ---------- */
  let progressPoints = 0;
  let quizScore = { correct: 0, total: 0 };

  /* ---------- Utils ---------- */
  function updateProgress(points = 0) {
    progressPoints = Math.min(progressPoints + points, 100);
    const bar = document.getElementById('progress-bar');
    bar.style.width = progressPoints + '%';
    bar.textContent = progressPoints + '%';
  }

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('active');

    // initialize page-specific logic
    if (id === 'survey') renderSurvey();
    if (id === 'phishsort') startPhishGame();
    if (id === 'passforge') startPassForge();
    if (id === 'netshield') startNetShield();
    if (id === 'quiz-screen') renderQuizPage(currentPage);
  }

  window.showScreen = showScreen;

  /* ---------- PDF Export ---------- */
  function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('AdaptSec Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleString()}`, 20, 40);
    doc.text(`Progress: ${document.getElementById('progress-bar').textContent}`, 20, 50);
    doc.text(`Last Quiz Score: ${quizScore.correct} / ${quizScore.total}`, 20, 60);
    doc.save('adaptsec-report.pdf');
  }
  window.downloadPDF = downloadPDF;

  /* ---------- Navigation hooks ---------- */
  document.getElementById('btn-home').onclick = () => showScreen('home');
  document.getElementById('btn-survey').onclick = () => showScreen('survey');
  document.getElementById('btn-games').onclick = () => showScreen('games');
  document.getElementById('btn-quiz').onclick = () => showScreen('quiz-screen');
  document.getElementById('btn-export').onclick = () => showScreen('export-screen');

  document.getElementById('start-survey').onclick = () => showScreen('survey');
  document.getElementById('start-games').onclick = () => showScreen('games');
  document.getElementById('start-quiz').onclick = () => showScreen('quiz-screen');
  document.getElementById('start-export').onclick = () => showScreen('export-screen');

  document.getElementById('play-phish').onclick = () => showScreen('phishsort');
  document.getElementById('play-pass').onclick = () => showScreen('passforge');
  document.getElementById('play-net').onclick = () => showScreen('netshield');

  /* ---------- SURVEY (ORDERED) ---------- */
  const surveyBank = [
    { q: "Do you reuse passwords across websites?", yesPts: 2, noPts: 5 },
    { q: "Do you use two-factor authentication (2FA)?", yesPts: 5, noPts: 2 },
    { q: "Do you update your OS regularly?", yesPts: 5, noPts: 2 },
    { q: "Do you use a password manager?", yesPts: 5, noPts: 2 },
    { q: "Do you back up your data regularly?", yesPts: 5, noPts: 2 }
  ];

  function renderSurvey() {
    const form = document.getElementById('survey-form');
    form.innerHTML = '';
    surveyBank.forEach((item, idx) => {
      const div = document.createElement('div');
      div.innerHTML = `
        <p>${idx + 1}. ${item.q}</p>
        <label><input type="radio" name="q${idx}" value="yes"> Yes</label>
        <label><input type="radio" name="q${idx}" value="no"> No</label>
      `;
      form.appendChild(div);
    });
    const actions = document.createElement('div');
    actions.className = 'form-actions';
    actions.innerHTML = `<button class="btn" type="submit">Submit Survey</button>
                         <button type="button" class="btn" onclick="showScreen('home')">Back</button>`;
    form.appendChild(actions);

    form.onsubmit = (e) => {
      e.preventDefault();
      let pts = 0;
      surveyBank.forEach((it, i) => {
        const a = form.querySelector(`input[name=q${i}]:checked`);
        if (a) pts += (a.value === 'yes' ? it.yesPts : it.noPts);
      });
      updateProgress(pts);
      alert('Survey submitted! +' + pts + ' points');
      showScreen('home');
    };
  }

  /* ---------- PHISH SHOOTER (enhanced, ordered email bank) ---------- */
  const phishEmails = [
    { text: "Meeting at 3 PM today.", type: 'safe' },
    { text: "Your bank needs you to confirm your account.", type: 'phish' },
    { text: "Happy Birthday! 🎂 Enjoy your day.", type: 'safe' },
    { text: "Update password via this link to avoid lockout.", type: 'phish' },
    { text: "Invoice for your purchase attached.", type: 'phish' },
    { text: "Team lunch - RSVP", type: 'safe' }
  ];

  // Game vars
  let phishCanvas, phishCtx, phishParticles = [], phishInterval, phishTimerInterval;
  let phishScore = 0, phishTime = 30, phishRunning = false;

  function startPhishGame() {
    // reset
    phishScore = 0; phishTime = 30; phishParticles = [];
    document.getElementById('phish-score').textContent = phishScore;
    document.getElementById('phish-timer').textContent = phishTime;

    const area = document.getElementById('phish-area');
    area.innerHTML = ''; // clear
    phishCanvas = document.createElement('canvas');
    phishCanvas.width = area.clientWidth;
    phishCanvas.height = area.clientHeight;
    phishCanvas.style.width = '100%';
    phishCanvas.style.height = '100%';
    phishCanvas.style.display = 'block';
    area.appendChild(phishCanvas);
    phishCtx = phishCanvas.getContext('2d');

    // create initial falling emails in ordered sequence (no shuffle)
    for (let i = 0; i < phishEmails.length; i++) {
      const e = phishEmails[i];
      phishParticles.push({
        text: e.text,
        type: e.type,
        x: 30 + i * 120,
        y: -Math.random() * 200 - (i * 60),
        vy: 0.6 + Math.random() * 1.2,
        r: 24
      });
    }

    phishRunning = true;
    clearInterval(phishInterval);
    phishInterval = setInterval(phishStep, 16);
    clearInterval(phishTimerInterval);
    phishTimerInterval = setInterval(() => {
      phishTime--;
      if (phishTime <= 0) {
        phishTime = 0;
        endPhishGame();
      }
      document.getElementById('phish-timer').textContent = phishTime;
    }, 1000);

    // click handler - detect which particle clicked
    phishCanvas.onclick = (ev) => {
      const rect = phishCanvas.getBoundingClientRect();
      const mx = (ev.clientX - rect.left) * (phishCanvas.width / rect.width);
      const my = (ev.clientY - rect.top) * (phishCanvas.height / rect.height);
      for (let i = phishParticles.length - 1; i >= 0; i--) {
        const p = phishParticles[i];
        const dx = mx - p.x;
        const dy = my - p.y;
        if (dx * dx + dy * dy < p.r * p.r) {
          // clicked
          if (p.type === 'phish') {
            phishScore += 10; // good
            updateProgress(2);
            // remove particle
            phishParticles.splice(i, 1);
          } else {
            phishScore = Math.max(0, phishScore - 5); // penalty
            updateProgress(-1);
          }
          document.getElementById('phish-score').textContent = phishScore;
          break;
        }
      }
    };

    // restart button
    document.getElementById('phish-restart').onclick = () => {
      clearInterval(phishInterval);
      clearInterval(phishTimerInterval);
      startPhishGame();
    };
  }

  function phishStep() {
    if (!phishCtx) return;
    // size adjust
    const cw = phishCanvas.width = phishCanvas.clientWidth;
    const ch = phishCanvas.height = phishCanvas.clientHeight;
    phishCtx.clearRect(0, 0, cw, ch);
    // draw particles (emails)
    phishParticles.forEach(p => {
      p.y += p.vy;
      // draw envelope like circle with text
      phishCtx.fillStyle = p.type === 'phish' ? 'rgba(255,90,90,0.95)' : 'rgba(80,180,255,0.95)';
      phishCtx.beginPath();
      phishCtx.ellipse(p.x, p.y, p.r * 1.6, p.r, 0, 0, Math.PI * 2);
      phishCtx.fill();

      phishCtx.fillStyle = '#001218';
      phishCtx.font = '12px Inter, sans-serif';
      phishCtx.textAlign = 'center';
      phishCtx.fillText(p.text.length > 26 ? p.text.substring(0, 24) + '...' : p.text, p.x, p.y + 4);

      // if below screen, respawn at top (ordered: cycle to start)
      if (p.y - p.r > ch) {
        // move to top but keep order by preserving index (append to top with same type)
        p.y = -40;
        p.vy = 0.6 + Math.random() * 1.2;
      }
    });
    // draw subtle HUD
    phishCtx.fillStyle = 'rgba(255,255,255,0.02)';
    phishCtx.fillRect(0, ch - 6, cw, 6);
  }

  function endPhishGame() {
    phishRunning = false;
    clearInterval(phishInterval);
    clearInterval(phishTimerInterval);
    alert('Time over! Your Phish Shooter score: ' + phishScore);
    showScreen('games');
  }

  /* ---------- PASSFORGE (ordered tileBank & typing + bubble collection) ---------- */
  const passTiles = ['Abc', '123', '@2025', 'Secure', '99#', 'Vault', 'Key', 'XyZ', '!Qw', 'Mypass'];
  let pwCanvas, pwCtx, pwBubbles = [], pwLoopId;
  const pwWidth = 800, pwHeight = 320;

  function startPassForge() {
    const container = document.getElementById('pw-canvas');
    container.innerHTML = '';
    pwCanvas = document.createElement('canvas');
    pwCanvas.width = container.clientWidth;
    pwCanvas.height = 320;
    pwCanvas.style.width = '100%';
    container.appendChild(pwCanvas);
    pwCtx = pwCanvas.getContext('2d');

    // create bubbles in ordered manner (no shuffle)
    pwBubbles = [];
    const spacing = Math.max(40, Math.floor(pwCanvas.width / passTiles.length));
    for (let i = 0; i < passTiles.length; i++) {
      pwBubbles.push({
        text: passTiles[i],
        x: 40 + i * spacing,
        y: 40 + Math.random() * 180,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.3,
        r: 28
      });
    }

    // input handlers
    const input = document.getElementById('pw-input');
    input.value = '';
    input.oninput = () => updatePwStrength();

    document.getElementById('pw-clear').onclick = () => { input.value = ''; updatePwStrength(); };
    document.getElementById('pw-copy').onclick = () => {
      navigator.clipboard?.writeText(input.value).then(()=> alert('Password copied'));
    };

    pwCanvas.onclick = (ev) => {
      const rect = pwCanvas.getBoundingClientRect();
      const mx = (ev.clientX - rect.left) * (pwCanvas.width / rect.width);
      const my = (ev.clientY - rect.top) * (pwCanvas.height / rect.height);
      for (let i = pwBubbles.length - 1; i >= 0; i--) {
        const b = pwBubbles[i];
        const dx = mx - b.x; const dy = my - b.y;
        if (dx * dx + dy * dy < b.r * b.r) {
          // clicked bubble: append its text to input
          input.value += b.text;
          // small visual pop — move bubble off to bottom and respawn top (ordered)
          b.y = pwCanvas.height + 40;
          b.vy = 1 + Math.random();
          updatePwStrength();
          break;
        }
      }
    };

    // animation loop
    cancelAnimationFrame(pwLoopId);
    function step() {
      pwCanvas.width = pwCanvas.clientWidth; // handles responsive width
      const cw = pwCanvas.width, ch = pwCanvas.height;
      pwCtx.clearRect(0, 0, cw, ch);
      // bubbles
      pwBubbles.forEach(b => {
        b.x += b.vx; b.y += b.vy;
        // bounce edges
        if (b.x < b.r) b.x = b.r;
        if (b.x > cw - b.r) b.x = cw - b.r;
        if (b.y > ch + 40) {
          b.y = -40; b.x = 40 + Math.random() * (cw - 80); b.vy = (Math.random() - 0.5) * 0.4;
        }
        // draw
        pwCtx.fillStyle = 'rgba(20,120,255,0.12)';
        pwCtx.beginPath(); pwCtx.arc(b.x, b.y, b.r, 0, Math.PI * 2); pwCtx.fill();
        pwCtx.fillStyle = '#dffeff'; pwCtx.font = '13px Inter, sans-serif';
        pwCtx.textAlign = 'center'; pwCtx.fillText(b.text, b.x, b.y + 4);
      });
      pwLoopId = requestAnimationFrame(step);
    }
    step();
    updatePwStrength();
  }

  function updatePwStrength() {
    const input = document.getElementById('pw-input');
    const strengthLabel = document.getElementById('pw-strength');
    const score = (typeof zxcvbn === 'function') ? zxcvbn(input.value).score : Math.min(4, Math.floor(input.value.length / 4));
    const levels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    strengthLabel.textContent = levels[score];
    // award a small progress amount for improving password
    // but do not allow negative; small incremental points
    updateProgress(0); // keep unchanged here, avoid flooding progress on typing
  }

  /* ---------- NETSHIELD (ordered nodes & safeguards) ---------- */
  const nodeBank = ['Laptop', 'Router', 'Server'];
  const safeguardBank = ['Firewall', 'VPN', 'Antivirus'];

  let netScore = 0;
  let netThreats = [], netLoopId, netRunning = false;

  function startNetShield() {
    netScore = 0; netThreats = [];
    document.getElementById('net-score').textContent = netScore;
    document.getElementById('risk-score').textContent = 100;

    const nodesWrap = document.getElementById('net-nodes');
    nodesWrap.innerHTML = '';
    nodeBank.forEach((n, idx) => {
      const d = document.createElement('div');
      d.className = 'node';
      d.dataset.name = n;
      d.dataset.protected = 'false';
      d.innerHTML = `<strong>${n}</strong><div class="node-hint">No safeguard</div>`;
      d.onclick = () => {
        // if a safeguard is selected from pool, place it here
        const sel = document.querySelector('.sg.selected');
        if (sel) {
          d.dataset.protected = sel.textContent;
          d.querySelector('.node-hint').textContent = 'Protected: ' + sel.textContent;
          sel.classList.remove('selected');
        }
      };
      nodesWrap.appendChild(d);
    });

    // safeguard pool
    const pool = document.getElementById('sg-pool');
    pool.innerHTML = '';
    safeguardBank.forEach(s => {
      const b = document.createElement('div');
      b.className = 'sg';
      b.textContent = s;
      b.onclick = () => {
        // toggle selection
        document.querySelectorAll('.sg').forEach(x => x.classList.remove('selected'));
        b.classList.toggle('selected');
      };
      pool.appendChild(b);
    });

    // start threat spawn loop
    netRunning = true;
    cancelAnimationFrame(netLoopId);
    netThreats = [];
    spawnThreat();
    netLoopId = requestAnimationFrame(netStep);

    document.getElementById('net-restart').onclick = () => {
      netRunning = false;
      cancelAnimationFrame(netLoopId);
      startNetShield();
    };
  }

  function spawnThreat() {
    // add threat targeting first node in order (ordered behavior)
    const targetIdx = netThreats.length % nodeBank.length;
    netThreats.push({
      x: 0, y: 20 + targetIdx * 90,
      vx: 0.7 + Math.random() * 0.6,
      target: nodeBank[targetIdx],
      alive: true
    });
    // schedule next spawn
    if (netRunning) setTimeout(spawnThreat, 1500 + Math.random() * 1500);
  }

  function netStep() {
    // update threats and check collisions with nodes
    const nodes = Array.from(document.querySelectorAll('#net-nodes .node'));
    netThreats.forEach(t => {
      if (!t.alive) return;
      t.x += t.vx;
      // find target node dom
      const nodeEl = nodes.find(n => n.dataset.name === t.target);
      if (!nodeEl) return;
      const rect = nodeEl.getBoundingClientRect();
      // We approximate collision by comparing x vs container width
      const wrapRect = document.getElementById('net-nodes').getBoundingClientRect();
      const progressX = t.x;
      if (progressX > wrapRect.width - 40) {
        // reached node
        t.alive = false;
        // if node protected
        if (nodeEl.dataset.protected && nodeEl.dataset.protected !== 'false') {
          netScore += 10;
          updateProgress(3);
          document.getElementById('net-score').textContent = netScore;
          nodeEl.style.boxShadow = '0 8px 24px rgba(0,255,200,0.12)';
        } else {
          // node unprotected: increase risk
          const riskEl = document.getElementById('risk-score');
          let curr = parseInt(riskEl.textContent || '100', 10);
          curr = Math.min(100, curr + 12);
          riskEl.textContent = curr;
          // penalize
          updateProgress(-3);
        }
      }
    });

    // cleanup dead threats periodically
    netThreats = netThreats.filter(t => t.alive);
    // continue loop
    if (netRunning) netLoopId = requestAnimationFrame(netStep);
  }

  /* ---------- QUIZ (ordered) ---------- */
  const questionBank = [
    { q: "What is phishing?", options: ["Legitimate email", "Fake email"], correctIndex: 1 },
    { q: "What does 2FA stand for?", options: ["Two Factor Authentication", "Two Fast Access"], correctIndex: 0 },
    { q: "Which is stronger?", options: ["123456", "H@ckM3_2025!"], correctIndex: 1 },
    { q: "What does HTTPS indicate?", options: ["Encrypted connection", "Insecure connection"], correctIndex: 0 },
    { q: "What is malware?", options: ["Malicious software", "Helpful software"], correctIndex: 0 },
    { q: "What is a firewall?", options: ["Network protection", "Wooden wall"], correctIndex: 0 },
    { q: "What is ransomware?", options: ["Encrypts files for ransom", "Deletes files safely"], correctIndex: 0 },
    { q: "What is a VPN used for?", options: ["Secure browsing", "Faster downloads"], correctIndex: 0 },
    { q: "What is encryption?", options: ["Unreadable data form", "Deleting data"], correctIndex: 0 },
    { q: "What should you do with suspicious links?", options: ["Click immediately", "Verify sender and avoid"], correctIndex: 1 },
    { q: "Multi-factor auth uses:", options: ["Password only", "Password + another factor"], correctIndex: 1 },
    { q: "What is a strong password?", options: ["password", "Long mix of chars"], correctIndex: 1 }
  ];

  const PAGE_SIZE = 4;
  let currentPage = 1;
  const totalPages = Math.ceil(questionBank.length / PAGE_SIZE);
  const userAnswers = new Array(questionBank.length).fill(null);

  function renderQuizPage(page) {
    currentPage = Math.max(1, Math.min(page, totalPages));
    const container = document.getElementById('quiz-container');
    container.innerHTML = '';
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = Math.min(start + PAGE_SIZE, questionBank.length);
    for (let i = start; i < end; i++) {
      const q = questionBank[i];
      const qBox = document.createElement('div');
      qBox.className = 'quiz-q';
      qBox.innerHTML = `<p><strong>${i + 1}. ${q.q}</strong></p>`;
      q.options.forEach((opt, idx) => {
        const id = `q_${i}_opt_${idx}`;
        const label = document.createElement('label');
        label.className = 'quiz-opt';
        const input = document.createElement('input');
        input.type = 'radio'; input.name = `q_${i}`; input.value = idx; input.id = id;
        if (userAnswers[i] === idx) input.checked = true;
        input.onchange = () => userAnswers[i] = idx;
        label.appendChild(input);
        label.appendChild(document.createTextNode(' ' + opt));
        qBox.appendChild(label);
        qBox.appendChild(document.createElement('br'));
      });
      container.appendChild(qBox);
    }
    document.getElementById('quiz-page-info').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('quiz-prev').disabled = currentPage === 1;
    document.getElementById('quiz-next').disabled = currentPage === totalPages;
  }

  document.getElementById('quiz-prev').onclick = () => renderQuizPage(currentPage - 1);
  document.getElementById('quiz-next').onclick = () => renderQuizPage(currentPage + 1);
  document.getElementById('quiz-submit').onclick = () => {
    let correct = 0;
    for (let i = 0; i < questionBank.length; i++) {
      if (userAnswers[i] === questionBank[i].correctIndex) correct++;
    }
    quizScore = { correct, total: questionBank.length };
    // scale: 2 points per correct, but don't overflow
    const pts = Math.min(correct * 2, 100 - progressPoints);
    updateProgress(pts);
    alert(`Quiz complete — ${correct} / ${questionBank.length}. Progress +${pts}`);
    showScreen('home');
  };

  /* ---------- Background Particle + Grid Animation ---------- */
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W = window.innerWidth, H = window.innerHeight;
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize(); window.addEventListener('resize', resize);

  const particles = [];
  const N = 80;
  for (let i = 0; i < N; i++) particles.push({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4
  });

  function bgLoop() {
    ctx.clearRect(0, 0, W, H);
    // grid scan lines
    ctx.strokeStyle = 'rgba(0,255,200,0.02)';
    ctx.lineWidth = 1;
    const spacing = 120;
    for (let x = 0; x < W; x += spacing) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += spacing) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    // particles & connections
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.fillStyle = 'rgba(0,255,200,0.9)';
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2); ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.strokeStyle = 'rgba(0,255,200,' + (0.12 * (1 - d / 120)).toFixed(2) + ')';
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
    }
    requestAnimationFrame(bgLoop);
  }
  bgLoop();

  /* ---------- Start on home ---------- */
  showScreen('home');

  /* ---------- start helper functions for games that may be called externally ---------- */
  // Expose some small functions in window for debug
  window._adaptsec = {
    startPhishGame,
    startPassForge: startPassForge,
    startNetShield,
    renderSurvey,
  };
});
