/*
* ============================================================
* CUSTOM CURSOR
* Tracks mouse position with a lag on the outer ring
* ============================================================
*/
    const cursor     = document.getElementById('cursor');
    const cursorRing = document.getElementById('cursor-ring');

    let mouseX = 0, mouseY = 0;
    let ringX  = 0, ringY  = 0;

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = mouseX + 'px';
      cursor.style.top  = mouseY + 'px';
    });

    /* Animate the ring with lerp for smooth trailing effect */
    (function animateRing() {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top  = ringY + 'px';
      requestAnimationFrame(animateRing);
    })();

    /* Cursor grow on hoverable elements */
    document.querySelectorAll('a, button, .project-card, .badge, .filter-tab').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.width     = '18px';
        cursor.style.height    = '18px';
        cursorRing.style.width  = '52px';
        cursorRing.style.height = '52px';
        cursorRing.style.opacity = '0.25';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.width     = '12px';
        cursor.style.height    = '12px';
        cursorRing.style.width  = '36px';
        cursorRing.style.height = '36px';
        cursorRing.style.opacity = '0.5';
      });
    });

    /*
     * ============================================================
     * NAVIGATION — active link on scroll + hamburger menu
     * ============================================================
     */
    const sections   = document.querySelectorAll('.page-section');
    const navLinks   = document.querySelectorAll('.nav-link');
    const hamburger  = document.getElementById('hamburger');
    const navLinksEl = document.getElementById('nav-links');

    /* Update active nav link based on scroll position */
    function updateActiveNav() {
      let currentId = '';
      sections.forEach(section => {
        const top = section.getBoundingClientRect().top;
        if (top <= 90) currentId = section.id;
      });
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
      });
    }
    window.addEventListener('scroll', updateActiveNav, { passive: true });

    /* Smooth close on nav link click */
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navLinksEl.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    /* Mobile hamburger toggle */
    hamburger.addEventListener('click', () => {
      const isOpen = navLinksEl.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    /*
     * ============================================================
     * SCROLL REVEAL — IntersectionObserver for .reveal & .stagger
     * ============================================================
     */
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          /* Animate skill bars when About section appears */
          if (entry.target.id === 'skills-grid') animateSkillBars();
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal, .stagger').forEach(el => revealObserver.observe(el));

    /*
     * ============================================================
     * SKILL BARS — animate width on reveal
     * ============================================================
     */
    function animateSkillBars() {
      document.querySelectorAll('.skill-fill').forEach(bar => {
        const pct = bar.getAttribute('data-pct');
        bar.style.width = pct + '%';
      });
    }

    /*
     * ============================================================
     * PROJECT FILTER TABS
     * ============================================================
     */
    const filterTabs  = document.querySelectorAll('.filter-tab');
    const projectCards = document.querySelectorAll('.project-card');

    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        /* Update active state */
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.getAttribute('data-filter');

        projectCards.forEach(card => {
          const cat = card.getAttribute('data-category');
          const show = filter === 'all' || cat === filter;

          /* Fade out/in with CSS transitions */
          if (show) {
            card.style.display    = 'flex';
            card.style.opacity    = '0';
            card.style.transform  = 'translateY(12px)';
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                card.style.opacity    = '1';
                card.style.transform  = 'translateY(0)';
              });
            });
          } else {
            card.style.transition = 'opacity 0.25s ease';
            card.style.opacity    = '0';
            card.style.transform  = 'translateY(8px)';
            setTimeout(() => { card.style.display = 'none'; }, 260);
          }
        });
      });
    });

    /*
     * ============================================================
     * CONTACT FORM — terminal-style feedback simulation
     * ============================================================
     */
    const sendBtn  = document.getElementById('send-btn');
    const terminal = document.getElementById('terminal-output');

    sendBtn.addEventListener('click', () => {
      const name    = document.getElementById('cf-name').value.trim();
      const email   = document.getElementById('cf-email').value.trim();
      const subject = document.getElementById('cf-subject').value.trim();
      const message = document.getElementById('cf-message').value.trim();

      /* Basic validation */
      if (!name || !email || !message) {
        typeTerminal('> ERROR: Missing required fields — name, email, message.', '#ff3355');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        typeTerminal('> ERROR: Invalid email format.', '#ff3355');
        return;
      }

      /* Simulate send sequence */
      sendBtn.disabled = true;
      sendBtn.querySelector('span').textContent = 'Sending...';

      const lines = [
        `> INIT transmission...`,
        `> SENDER   : ${name} <${email}>`,
        `> SUBJECT  : ${subject || '(none)'}`,
        `> PAYLOAD  : ${message.substring(0, 40)}${message.length > 40 ? '...' : ''}`,
        `> ENCRYPTING...`,
        `> TRANSMITTING...`
      ];

      typeTerminalLines(lines, '#00ff88', () => {

        /* ACTUAL SEND */
        fetch("https://formspree.io/f/mjgplzja", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: name,
            email: email,
            _subject: subject,
            message: message
          })
        })
        .then(response => {
          if (response.ok) {

            typeTerminalLines([
              `> STATUS   : 200 OK — Message delivered successfully.`,
              `> Awaiting response from mission control.`
            ], '#00ff88', () => {

              sendBtn.querySelector('span').textContent = 'Sent ✓';

              /* Clear fields */
              ['cf-name','cf-email','cf-subject','cf-message'].forEach(id => {
                document.getElementById(id).value = '';
              });

            });

          } else {
            typeTerminal('> ERROR: Failed to send message.', '#ff3355');
            sendBtn.disabled = false;
            sendBtn.querySelector('span').textContent = 'Send Message';
          }
        })
        .catch(() => {
          typeTerminal('> ERROR: Network issue.', '#ff3355');
          sendBtn.disabled = false;
          sendBtn.querySelector('span').textContent = 'Send Message';
        });

      });
    });

    /**
     * Types lines into the terminal box one by one with a delay.
     * @param {string[]} lines
     * @param {string}   color
     * @param {Function} onComplete
     */
    function typeTerminalLines(lines, color, onComplete) {
      terminal.style.color = color;
      terminal.classList.add('visible');
      terminal.textContent = '';

      let i = 0;
      function nextLine() {
        if (i >= lines.length) {
          if (onComplete) onComplete();
          return;
        }
        terminal.textContent += (i > 0 ? '\n' : '') + lines[i];
        i++;
        setTimeout(nextLine, 180);
      }
      nextLine();
    }

    /**
     * Shows a single-line message in the terminal box.
     * @param {string} msg
     * @param {string} color
     */
    function typeTerminal(msg, color) {
      terminal.style.color = color || 'var(--accent)';
      terminal.classList.add('visible');
      terminal.textContent = msg;
    }

    /*
     * ============================================================
     * TYPEWRITER — hero eyebrow text cycle (optional flair)
     * Cycles through developer descriptors after initial load
     * ============================================================
     */
    const phrases = [
      '// FRESHER',
      '// GAME DEVELOPER',
      '// AR DEVELOPER',
      '// GAME TESTER',
    ];
    const eyebrow = document.querySelector('.hero-eyebrow');
    let phraseIdx = 0;
    let charIdx   = 0;
    let deleting  = false;
    let typingTimeout;

    function typePhrase() {
      const current = phrases[phraseIdx];

      if (!deleting) {
        /* Typing */
        charIdx++;
        eyebrow.textContent = current.substring(0, charIdx);
        if (charIdx === current.length) {
          /* Pause then start deleting */
          deleting = true;
          typingTimeout = setTimeout(typePhrase, 2200);
          return;
        }
      } else {
        /* Deleting */
        charIdx--;
        eyebrow.textContent = current.substring(0, charIdx);
        if (charIdx === 0) {
          deleting   = false;
          phraseIdx  = (phraseIdx + 1) % phrases.length;
          typingTimeout = setTimeout(typePhrase, 300);
          return;
        }
      }

      /* Speed: typing slower, deleting faster */
      const speed = deleting ? 35 : 70;
      typingTimeout = setTimeout(typePhrase, speed);
    }

    /* Start typewriter after hero animation completes */
    setTimeout(() => {
      charIdx  = phrases[0].length; /* Already shown by CSS */
      deleting = true;
      setTimeout(typePhrase, 2500);
    }, 1800);

    /*
 * ============================================================
 * LIQUID CURSOR EFFECT — HOME ONLY
 * ============================================================
 */

    const liquidCanvas = document.getElementById('liquid-canvas');
    const liquidCtx = liquidCanvas.getContext('2d');

    let lastX = 0, lastY = 0;

    let liquidParticles = [];

    function resizeLiquidCanvas() {
    liquidCanvas.width = window.innerWidth;
    liquidCanvas.height = window.innerHeight;
    }
    resizeLiquidCanvas();
    window.addEventListener('resize', resizeLiquidCanvas);

    let isHomeActive = true;

    window.addEventListener('scroll', () => {
    const home = document.querySelector('#home');
    const rect = home.getBoundingClientRect();

    const threshold = window.innerHeight * 0.9;

    if (rect.bottom < threshold) {
        isHomeActive = false;
        liquidParticles = []; // clear instantly
    } else {
        isHomeActive = true;
    }
    });

    document.addEventListener('mousemove', (e) => {
    const home = document.querySelector('#home');
    const rect = home.getBoundingClientRect();

    if (e.clientY >= rect.top && e.clientY <= rect.bottom) {

        const speed = Math.hypot(e.clientX - lastX, e.clientY - lastY);
        lastX = e.clientX;
        lastY = e.clientY;

        const intensity = Math.min(speed / 8, 6);

        liquidParticles.push({
        x: e.clientX,
        y: e.clientY,
        size: 10 + intensity * 6,
        alpha: 1,
        growth: 0.8 + intensity * 0.3,
        lineWidth: 1 + intensity * 0.5
        });
    }
    });

    function animateLiquid() {
    liquidCtx.clearRect(0, 0, liquidCanvas.width, liquidCanvas.height);

    for (let i = 0; i < liquidParticles.length; i++) {
    let p = liquidParticles[i];

    // color shift between green and cyan
    const mix = Math.sin(p.size * 0.05) * 0.5 + 0.5;
    const r = 0;
    const g = Math.floor(255 * (1 - mix));
    const b = Math.floor(255 * mix);

    liquidCtx.beginPath();
    liquidCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    liquidCtx.strokeStyle = `rgba(${r},${g},${b},${p.alpha})`;
    liquidCtx.lineWidth = p.lineWidth;
    liquidCtx.stroke();

    // ripple expansion
    p.size += p.growth;
    p.alpha -= 0.02;

    if (p.alpha <= 0) {
        liquidParticles.splice(i, 1);
        i--;
    }
    }

    requestAnimationFrame(animateLiquid);
    }

    animateLiquid();