/**
 * DUNK-O-METER 9000 - Experiment Chamber & Visual Physics Simulation
 * Controls the robotic arm, liquid ripples, live biscuit degradation,
 * fracture cracks, crumb physics, and emergency abort protocol.
 */

class ExperimentChamber {
  constructor() {
    this.container = null;
    this.clawArm = null;
    this.biscuitEl = null;
    this.liquidEl = null;
    this.liquidSurface = null;
    this.timerEl = null;
    this.statusEl = null;
    this.emergencyBtn = null;
    this.steamContainer = null;
    this.bubblesContainer = null;
    this.crumbsContainer = null;

    this.isSimulating = false;
    this.isEmergencyAborted = false;
    this.timerInterval = null;
    this.animationFrame = null;
    this.currentBiscuit = null;
    this.currentBeverage = null;
    this.currentSettings = null;
    this.simResult = null;
    this.onCompleteCallback = null;
    this.onEmergencyCallback = null;
  }

  init(elements) {
    this.container = elements.container;
    this.clawArm = elements.clawArm;
    this.biscuitEl = elements.biscuitEl;
    this.liquidEl = elements.liquidEl;
    this.liquidSurface = elements.liquidSurface;
    this.timerEl = elements.timerEl;
    this.statusEl = elements.statusEl;
    this.emergencyBtn = elements.emergencyBtn;
    this.steamContainer = elements.steamContainer;
    this.bubblesContainer = elements.bubblesContainer;
    this.crumbsContainer = elements.crumbsContainer;

    if (this.emergencyBtn) {
      this.emergencyBtn.addEventListener('click', () => this.triggerEmergencyAbort());
    }

    this.startAmbientBubbles();
  }

  /**
   * Render authentic custom SVG artwork for any biscuit specimen
   */
  getBiscuitSVG(biscuit, fractureStage = 0, soakProgress = 0) {
    const color = biscuit.color || "#d49746";
    const type = biscuit.svgType || "parle-g";

    let crackPaths = "";
    if (fractureStage >= 2) {
      crackPaths += `<path d="M 45 65 Q 60 75 75 70 T 95 85" stroke="#261304" stroke-width="2.5" fill="none" stroke-linecap="round" />`;
    }
    if (fractureStage >= 3) {
      crackPaths += `<path d="M 30 40 Q 55 50 65 65 T 100 62" stroke="#1c0c02" stroke-width="3" fill="none" stroke-linecap="round" />
                     <path d="M 70 20 Q 80 40 75 60" stroke="#1c0c02" stroke-width="2" fill="none" stroke-linecap="round" />`;
    }

    // Soak overlay gradient
    const soakFilter = soakProgress > 0 ? `
      <linearGradient id="soakGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="${Math.max(0, 100 - soakProgress * 100)}%" stop-color="transparent" />
        <stop offset="100%" stop-color="rgba(30, 15, 5, 0.65)" />
      </linearGradient>
      <rect x="0" y="0" width="160" height="160" fill="url(#soakGrad)" style="mix-blend-mode: multiply;" />
    ` : "";

    let svgInner = "";

    switch (type) {
      case "parle-g":
        svgInner = `
          <rect x="20" y="25" width="120" height="95" rx="8" fill="${color}" stroke="#a86e26" stroke-width="3" />
          <rect x="26" y="31" width="108" height="83" rx="5" fill="none" stroke="#b87e32" stroke-dasharray="4,4" stroke-width="2" />
          <text x="80" y="66" font-family="'Impact', 'Arial Black', sans-serif" font-size="17" fill="#7a4608" text-anchor="middle" font-weight="bold" letter-spacing="1">PARLE-G</text>
          <text x="80" y="82" font-family="sans-serif" font-size="8.5" fill="#8c5310" text-anchor="middle" font-weight="bold">GLUCOSE</text>
          <!-- pinholes -->
          <circle cx="36" cy="42" r="2.2" fill="#7a4608"/><circle cx="124" cy="42" r="2.2" fill="#7a4608"/>
          <circle cx="36" cy="102" r="2.2" fill="#7a4608"/><circle cx="124" cy="102" r="2.2" fill="#7a4608"/>
          <circle cx="80" cy="98" r="2.2" fill="#7a4608"/><circle cx="80" cy="42" r="2.2" fill="#7a4608"/>
        `;
        break;

      case "bourbon":
        svgInner = `
          <rect x="18" y="32" width="124" height="82" rx="6" fill="${color}" stroke="#2a1208" stroke-width="3" />
          <!-- chocolate cream layer shadow -->
          <line x1="20" y1="73" x2="140" y2="73" stroke="#200d04" stroke-width="4.5" />
          <text x="80" y="65" font-family="'Courier New', monospace" font-size="14" fill="#d99f77" text-anchor="middle" font-weight="900" letter-spacing="3">BOURBON</text>
          <!-- sugar crystals -->
          <g fill="#fff" opacity="0.85">
            <polygon points="35,42 37,45 34,47" /><polygon points="65,40 68,43 64,44" />
            <polygon points="98,42 101,45 97,47" /><polygon points="120,44 123,47 119,48" />
            <polygon points="40,88 43,90 39,92" /><polygon points="80,90 83,92 79,93" />
            <polygon points="115,88 118,91 114,92" />
          </g>
          <!-- holes -->
          <circle cx="30" cy="55" r="2.5" fill="#200d04"/><circle cx="130" cy="55" r="2.5" fill="#200d04"/>
          <circle cx="30" cy="88" r="2.5" fill="#200d04"/><circle cx="130" cy="88" r="2.5" fill="#200d04"/>
        `;
        break;

      case "dark-fantasy":
        svgInner = `
          <circle cx="80" cy="75" r="54" fill="${color}" stroke="#1f0e08" stroke-width="3.5" />
          <circle cx="80" cy="75" r="46" fill="none" stroke="#4a2617" stroke-dasharray="3,5" stroke-width="2" />
          <circle cx="80" cy="75" r="30" fill="#241008" />
          <path d="M 68 70 Q 80 62 92 72 Q 86 84 74 80 Z" fill="#140804" />
          <text x="80" y="78" font-family="'Georgia', serif" font-size="8.5" fill="#a47552" text-anchor="middle" font-style="italic">Dark Fantasy</text>
        `;
        break;

      case "milk-bikis":
        svgInner = `
          <circle cx="80" cy="75" r="55" fill="${color}" stroke="#ba8032" stroke-width="3" />
          <circle cx="80" cy="75" r="48" fill="none" stroke="#d49748" stroke-width="2" />
          <!-- petals around border -->
          ${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `
            <ellipse cx="80" cy="35" rx="4" ry="7" fill="#c48a38" transform="rotate(${a} 80 75)" />
          `).join('')}
          <text x="80" y="74" font-family="sans-serif" font-size="11" fill="#7a4608" text-anchor="middle" font-weight="bold">MILK</text>
          <text x="80" y="88" font-family="sans-serif" font-size="10" fill="#7a4608" text-anchor="middle" font-weight="bold">BIKIS</text>
        `;
        break;

      case "good-day":
        svgInner = `
          <circle cx="80" cy="75" r="54" fill="${color}" stroke="#bd8638" stroke-width="3" />
          <!-- smile curved grooves -->
          <path d="M 45 60 Q 80 82 115 60" fill="none" stroke="#9e661c" stroke-width="3.5" stroke-linecap="round" />
          <path d="M 40 75 Q 80 102 120 75" fill="none" stroke="#9e661c" stroke-width="3.5" stroke-linecap="round" />
          <path d="M 50 92 Q 80 114 110 92" fill="none" stroke="#9e661c" stroke-width="3" stroke-linecap="round" />
          <!-- cashew specks -->
          <ellipse cx="60" cy="46" rx="4" ry="2.5" fill="#fde68a" transform="rotate(-20 60 46)" />
          <ellipse cx="102" cy="48" rx="4.5" ry="3" fill="#fde68a" transform="rotate(25 102 48)" />
          <ellipse cx="78" cy="42" rx="3.5" ry="2" fill="#fde68a" />
        `;
        break;

      case "marie-gold":
        svgInner = `
          <circle cx="80" cy="75" r="55" fill="${color}" stroke="#bf9247" stroke-width="2.5" />
          <circle cx="80" cy="75" r="49" fill="none" stroke="#a3762f" stroke-dasharray="2,3.5" stroke-width="1.8" />
          <circle cx="80" cy="75" r="38" fill="none" stroke="#cfa054" stroke-width="1.5" />
          <!-- tiny holes ring -->
          ${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => `
            <circle cx="80" cy="32" r="1.8" fill="#7a4d12" transform="rotate(${a} 80 75)" />
          `).join('')}
          <text x="80" y="74" font-family="'Times New Roman', serif" font-size="12" fill="#7a4d12" text-anchor="middle" font-weight="bold" letter-spacing="1">MARIE</text>
          <text x="80" y="86" font-family="'Times New Roman', serif" font-size="9" fill="#8f5d1b" text-anchor="middle" letter-spacing="2">GOLD</text>
        `;
        break;

      case "oreo":
        svgInner = `
          <circle cx="80" cy="75" r="54" fill="${color}" stroke="#0a0706" stroke-width="3.5" />
          <circle cx="80" cy="75" r="47" fill="none" stroke="#3b322e" stroke-dasharray="4,3" stroke-width="3" />
          <circle cx="80" cy="75" r="32" fill="none" stroke="#332a27" stroke-width="2" />
          <!-- vanilla cream peek -->
          <ellipse cx="80" cy="75" rx="26" ry="10" fill="#f8fafc" opacity="0.9" />
          <rect x="52" y="65" width="56" height="20" rx="3" fill="#181311" />
          <text x="80" y="80" font-family="'Arial Black', Impact, sans-serif" font-size="13" fill="#ffffff" text-anchor="middle" font-weight="900" letter-spacing="1.5">OREO</text>
        `;
        break;

      case "little-hearts":
        svgInner = `
          <path d="M 80 118 C 50 92 30 70 30 50 C 30 32 46 22 62 22 C 72 22 78 28 80 32 C 82 28 88 22 98 22 C 114 22 130 32 130 50 C 130 70 110 92 80 118 Z" 
                fill="${color}" stroke="#b37629" stroke-width="3" />
          <path d="M 80 106 C 56 84 40 66 40 50 C 40 38 50 30 62 30 C 70 30 76 35 80 38 C 84 35 90 30 98 30 C 110 30 120 38 120 50 C 120 66 104 84 80 106 Z" 
                fill="none" stroke="#dca152" stroke-width="2" stroke-dasharray="3,3" />
          <!-- sugar crystals -->
          <polygon points="62,45 65,47 62,49 59,47" fill="#fff" opacity="0.9"/>
          <polygon points="98,46 101,48 98,50 95,48" fill="#fff" opacity="0.9"/>
          <polygon points="80,70 83,72 80,74 77,72" fill="#fff" opacity="0.9"/>
          <polygon points="70,86 73,88 70,90 67,88" fill="#fff" opacity="0.9"/>
        `;
        break;

      case "jim-jam":
        svgInner = `
          <circle cx="80" cy="75" r="54" fill="${color}" stroke="#b87d32" stroke-width="3" />
          <circle cx="80" cy="75" r="46" fill="none" stroke="#fff" opacity="0.65" stroke-dasharray="4,4" stroke-width="3" />
          <circle cx="80" cy="75" r="28" fill="#fdfbf7" stroke="#e0aa62" stroke-width="2" />
          <!-- central jam nucleus -->
          <circle cx="80" cy="75" r="15" fill="#dc2626" stroke="#991b1b" stroke-width="2" />
          <circle cx="76" cy="71" r="4" fill="#f87171" opacity="0.8" />
          <!-- decorative sugar -->
          <circle cx="48" cy="50" r="1.5" fill="#fff"/><circle cx="112" cy="50" r="1.5" fill="#fff"/>
          <circle cx="48" cy="100" r="1.5" fill="#fff"/><circle cx="112" cy="100" r="1.5" fill="#fff"/>
        `;
        break;

      case "hide-seek":
        svgInner = `
          <rect x="22" y="30" width="116" height="85" rx="6" fill="${color}" stroke="#361a0a" stroke-width="3" />
          <text x="80" y="58" font-family="'Arial Black', sans-serif" font-size="10" fill="#c79267" text-anchor="middle" font-weight="900" letter-spacing="1">HIDE &amp; SEEK</text>
          <!-- chocolate chips -->
          <polygon points="38,42 45,38 48,46 40,48" fill="#241005" stroke="#120601" />
          <polygon points="105,40 114,42 110,50 102,46" fill="#241005" stroke="#120601" />
          <polygon points="50,75 58,72 60,82 52,84" fill="#241005" stroke="#120601" />
          <polygon points="85,74 94,76 90,85 80,82" fill="#241005" stroke="#120601" />
          <polygon points="112,80 120,82 116,90 108,88" fill="#241005" stroke="#120601" />
          <polygon points="34,88 42,90 38,98 30,95" fill="#241005" stroke="#120601" />
        `;
        break;

      case "custom":
        svgInner = `
          <polygon points="80,22 130,48 130,102 80,128 30,102 30,48" 
                   fill="#0a1828" stroke="#00f0ff" stroke-width="3.5" />
          <polygon points="80,32 120,53 120,97 80,118 40,97 40,53" 
                   fill="none" stroke="#00f0ff" stroke-opacity="0.5" stroke-dasharray="4,4" stroke-width="2" />
          <circle cx="80" cy="75" r="18" fill="#032035" stroke="#00ff88" stroke-width="2" />
          <text x="80" y="73" font-family="'Courier New', monospace" font-size="9" fill="#00f0ff" text-anchor="middle" font-weight="bold">SPECIMEN</text>
          <text x="80" y="85" font-family="'Courier New', monospace" font-size="11" fill="#00ff88" text-anchor="middle" font-weight="bold">9000</text>
          <line x1="80" y1="32" x2="80" y2="57" stroke="#00f0ff" stroke-width="1.5" />
          <line x1="80" y1="93" x2="80" y2="118" stroke="#00f0ff" stroke-width="1.5" />
        `;
        break;

      default:
        // Generic crisp golden biscuit with emboss
        svgInner = `
          <rect x="22" y="28" width="116" height="90" rx="10" fill="${color}" stroke="#a36e26" stroke-width="3" />
          <rect x="28" y="34" width="104" height="78" rx="6" fill="none" stroke="#c28c3e" stroke-dasharray="3,3" stroke-width="2" />
          <text x="80" y="76" font-family="'Rajdhani', sans-serif" font-size="12" fill="#754209" text-anchor="middle" font-weight="bold" letter-spacing="1.5">${biscuit.name.toUpperCase()}</text>
          <circle cx="40" cy="48" r="2.5" fill="#754209"/><circle cx="120" cy="48" r="2.5" fill="#754209"/>
          <circle cx="40" cy="98" r="2.5" fill="#754209"/><circle cx="120" cy="98" r="2.5" fill="#754209"/>
        `;
        break;
    }

    return `
      <svg viewBox="0 0 160 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="biscuit-svg-render">
        <g id="biscuit-body">
          ${svgInner}
          ${crackPaths}
          ${soakFilter}
        </g>
      </svg>
    `;
  }

  /**
   * Update visual theme of the beaker and liquid according to selected beverage
   */
  updateBeverageVisuals(beverage) {
    this.currentBeverage = beverage;
    if (!this.liquidEl || !beverage) return;

    this.liquidEl.style.backgroundColor = beverage.liquidColor;
    this.liquidEl.style.boxShadow = `inset 0 10px 20px rgba(0,0,0,0.5), 0 0 25px ${beverage.liquidGlow}`;
    if (this.liquidSurface) {
      this.liquidSurface.style.background = `radial-gradient(ellipse at center, ${beverage.surfaceColor} 0%, ${beverage.liquidColor} 80%)`;
      this.liquidSurface.style.boxShadow = `0 0 15px ${beverage.liquidGlow}`;
    }

    // Toggle steam
    if (this.steamContainer) {
      if (beverage.steam) {
        this.steamContainer.classList.remove('hidden');
      } else {
        this.steamContainer.classList.add('hidden');
      }
    }
  }

  /**
   * Update the biscuit currently mounted in the claw
   */
  mountBiscuit(biscuit) {
    this.currentBiscuit = biscuit;
    if (!this.biscuitEl) return;
    this.biscuitEl.innerHTML = this.getBiscuitSVG(biscuit, 0, 0);
    this.resetChamberState();
  }

  resetChamberState() {
    this.isSimulating = false;
    this.isEmergencyAborted = false;
    clearInterval(this.timerInterval);
    if (this.clawArm) {
      this.clawArm.style.transform = "translateY(0px)";
      this.clawArm.classList.remove("submerged", "vibrating", "emergency-yank");
    }
    if (this.biscuitEl) {
      this.biscuitEl.style.transform = "none";
      this.biscuitEl.classList.remove("fissuring", "broken-sink", "soaked");
      if (this.currentBiscuit) {
        this.biscuitEl.innerHTML = this.getBiscuitSVG(this.currentBiscuit, 0, 0);
      }
    }
    if (this.timerEl) {
      this.timerEl.textContent = "00.00 SEC";
      this.timerEl.classList.remove("text-red-500", "text-amber-400", "text-cyan-400");
    }
    if (this.statusEl) {
      this.statusEl.textContent = "SPECIMEN LOADED // READY FOR IMMERSION";
      this.statusEl.className = "chamber-telemetry text-cyan-400";
    }
    if (this.emergencyBtn) {
      this.emergencyBtn.disabled = true;
      this.emergencyBtn.classList.add("opacity-50", "pointer-events-none");
    }
    if (this.crumbsContainer) {
      this.crumbsContainer.innerHTML = "";
    }
  }

  /**
   * Run the full live experiment simulation in the chamber
   */
  startSimulation(biscuit, beverage, settings, result, onComplete, onEmergency) {
    if (this.isSimulating) return;

    this.isSimulating = true;
    this.isEmergencyAborted = false;
    this.currentBiscuit = biscuit;
    this.currentBeverage = beverage;
    this.currentSettings = settings;
    this.simResult = result;
    this.onCompleteCallback = onComplete;
    this.onEmergencyCallback = onEmergency;

    const totalDuration = parseFloat(settings.duration) || 5.0;
    const breakTime = result.estimatedBreakingTime;
    const willBreak = totalDuration >= breakTime;
    const actualBreakMoment = willBreak ? Math.min(totalDuration, breakTime) : null;

    // Phase 1: Pre-immersion arm lowering sequence
    if (this.statusEl) {
      this.statusEl.textContent = "INITIALIZING HYDRAULIC SERVO ARMS...";
      this.statusEl.className = "chamber-telemetry text-amber-400 font-mono";
    }
    window.labAudio.playScanBeep();

    setTimeout(() => {
      if (!this.isSimulating || this.isEmergencyAborted) return;
      if (this.statusEl) {
        this.statusEl.textContent = "CALIBRATING TEA CONTAMINATION SENSORS...";
      }
      window.labAudio.playScanBeep();

      setTimeout(() => {
        if (!this.isSimulating || this.isEmergencyAborted) return;
        this.executeImmersion(totalDuration, actualBreakMoment);
      }, 700);
    }, 700);
  }

  /**
   * Submerge biscuit into liquid and start dynamic real-time degradation
   */
  executeImmersion(totalDuration, actualBreakMoment) {
    if (this.statusEl) {
      this.statusEl.textContent = "SUBMERSION IN PROGRESS // IMMERSION ACTIVE";
      this.statusEl.className = "chamber-telemetry text-cyan-400 animate-pulse";
    }

    // Enable Emergency Abort button
    if (this.emergencyBtn) {
      this.emergencyBtn.disabled = false;
      this.emergencyBtn.classList.remove("opacity-50", "pointer-events-none");
    }

    // Lower claw
    const submergeY = 125; // CSS translation in px
    this.clawArm.style.transition = "transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)";
    this.clawArm.style.transform = `translateY(${submergeY}px)`;

    setTimeout(() => {
      if (!this.isSimulating || this.isEmergencyAborted) return;
      // Splash!
      window.labAudio.playSplash();
      this.createSplashRipple();
      this.clawArm.classList.add("submerged");

      // Start live stopwatch
      const startTime = performance.now();
      let lastSecondSound = 0;

      this.timerInterval = setInterval(() => {
        if (!this.isSimulating || this.isEmergencyAborted) {
          clearInterval(this.timerInterval);
          return;
        }

        const elapsedSec = (performance.now() - startTime) / 1000;
        const formatted = elapsedSec < 10 ? `0${elapsedSec.toFixed(2)}` : elapsedSec.toFixed(2);
        this.timerEl.textContent = `${formatted} SEC`;

        // Soak & Degradation ratio
        const soakProgress = Math.min(1.0, elapsedSec / totalDuration);
        const ratioToBreak = actualBreakMoment ? (elapsedSec / actualBreakMoment) : (elapsedSec / (totalDuration * 1.5));

        // Fracture visual updates
        let currentStage = 0;
        if (ratioToBreak > 0.4) currentStage = 1;
        if (ratioToBreak > 0.7) currentStage = 2;
        if (ratioToBreak > 0.88) currentStage = 3;

        this.biscuitEl.innerHTML = this.getBiscuitSVG(this.currentBiscuit, currentStage, soakProgress);

        // Sound ticker and alarm
        const currentSecFloor = Math.floor(elapsedSec);
        if (currentSecFloor > lastSecondSound) {
          lastSecondSound = currentSecFloor;
          window.labAudio.playBlip(600 + currentSecFloor * 40, 0.05);
        }

        // Danger vibration as biscuit nears breaking threshold
        if (ratioToBreak > 0.82) {
          this.clawArm.classList.add("vibrating");
          if (this.statusEl) {
            this.statusEl.textContent = "CRITICAL WARNING: CELLULOSE WEAKENING RAPIDLY!";
            this.statusEl.className = "chamber-telemetry text-red-500 animate-pulse font-bold";
          }
          if (Math.random() < 0.3) window.labAudio.playAlarm();
        }

        // Spawn crumbs during immersion
        if (currentStage >= 2 && Math.random() < 0.4) {
          this.spawnCrumb();
        }

        // Check for catastrophic snap
        if (actualBreakMoment && elapsedSec >= actualBreakMoment) {
          clearInterval(this.timerInterval);
          this.executeCatastrophicBreak(elapsedSec);
          return;
        }

        // Complete regular immersion duration
        if (elapsedSec >= totalDuration) {
          clearInterval(this.timerInterval);
          this.executeSuccessfulDunk(elapsedSec);
        }
      }, 50);

    }, 750);
  }

  /**
   * Catastrophic break: biscuit collapses into liquid with crumb sink animation
   */
  executeCatastrophicBreak(breakTimeSec) {
    window.labAudio.playSnap();
    window.labAudio.playFail();

    this.clawArm.classList.remove("vibrating");
    this.biscuitEl.classList.add("broken-sink");

    if (this.statusEl) {
      this.statusEl.textContent = `CATASTROPHIC BREAK AT ${breakTimeSec.toFixed(2)} SEC! SOUP CREATED.`;
      this.statusEl.className = "chamber-telemetry text-red-600 font-extrabold animate-bounce";
    }

    if (this.emergencyBtn) {
      this.emergencyBtn.disabled = true;
      this.emergencyBtn.classList.add("opacity-50", "pointer-events-none");
    }

    // Spawn massive crumbs
    for (let i = 0; i < 15; i++) {
      setTimeout(() => this.spawnCrumb(true), i * 30);
    }

    // Retract broken empty claw after 1.5s
    setTimeout(() => {
      this.clawArm.style.transition = "transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)";
      this.clawArm.style.transform = "translateY(0px)";

      setTimeout(() => {
        this.isSimulating = false;
        if (this.onCompleteCallback) this.onCompleteCallback(this.simResult);
      }, 1200);
    }, 1400);
  }

  /**
   * Successful dunk: arm lifts soggy or champion biscuit safely out of the tea
   */
  executeSuccessfulDunk(elapsedSec) {
    this.clawArm.classList.remove("vibrating");

    if (this.statusEl) {
      this.statusEl.textContent = `RETRACTING SPECIMEN... DUNK TIME REACHED: ${elapsedSec.toFixed(2)} SEC`;
      this.statusEl.className = "chamber-telemetry text-green-400 font-bold";
    }

    if (this.emergencyBtn) {
      this.emergencyBtn.disabled = true;
      this.emergencyBtn.classList.add("opacity-50", "pointer-events-none");
    }

    // Retract claw
    this.clawArm.style.transition = "transform 1.4s cubic-bezier(0.2, 0.9, 0.3, 1)";
    this.clawArm.style.transform = "translateY(0px)";

    // Droplets dripping from biscuit back into cup
    this.spawnDrips();

    setTimeout(() => {
      this.isSimulating = false;
      if (this.onCompleteCallback) this.onCompleteCallback(this.simResult);
    }, 1500);
  }

  /**
   * Section 14: Emergency Salvage Protocol (🚨 EMERGENCY ABORT)
   */
  triggerEmergencyAbort() {
    if (!this.isSimulating || this.isEmergencyAborted) return;

    this.isEmergencyAborted = true;
    clearInterval(this.timerInterval);

    window.labAudio.playEmergencyKlaxon();

    if (this.statusEl) {
      this.statusEl.textContent = "🚨 EMERGENCY SALVAGE ACTIVATED! YANKING SPECIMEN NOW!";
      this.statusEl.className = "chamber-telemetry text-red-500 font-black animate-pulse";
    }

    if (this.emergencyBtn) {
      this.emergencyBtn.disabled = true;
      this.emergencyBtn.classList.add("opacity-50", "pointer-events-none");
    }

    // High-speed yank
    this.clawArm.classList.remove("vibrating");
    this.clawArm.style.transition = "transform 0.35s cubic-bezier(0.1, 1.2, 0.1, 1)";
    this.clawArm.style.transform = "translateY(-20px)";

    setTimeout(() => {
      this.clawArm.style.transform = "translateY(0px)";
      this.isSimulating = false;

      if (this.onEmergencyCallback) {
        this.onEmergencyCallback({
          abortedAt: this.timerEl ? this.timerEl.textContent : "03.00 SEC",
          biscuit: this.currentBiscuit,
          beverage: this.currentBeverage
        });
      }
    }, 500);
  }

  createSplashRipple() {
    if (!this.liquidSurface) return;
    this.liquidSurface.classList.remove("liquid-splash-anim");
    void this.liquidSurface.offsetWidth; // trigger reflow
    this.liquidSurface.classList.add("liquid-splash-anim");
  }

  spawnCrumb(isSinkingMassive = false) {
    if (!this.crumbsContainer) return;
    const crumb = document.createElement("div");
    crumb.className = "biscuit-crumb";
    const size = isSinkingMassive ? Math.random() * 8 + 4 : Math.random() * 4 + 2;
    crumb.style.width = `${size}px`;
    crumb.style.height = `${size}px`;
    crumb.style.backgroundColor = this.currentBiscuit ? this.currentBiscuit.color : "#b47a32";
    crumb.style.left = `${Math.random() * 80 + 10}%`;
    crumb.style.top = isSinkingMassive ? "35%" : "55%";
    this.crumbsContainer.appendChild(crumb);

    setTimeout(() => {
      if (crumb.parentNode) crumb.parentNode.removeChild(crumb);
    }, 4000);
  }

  spawnDrips() {
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        if (!this.crumbsContainer) return;
        const drip = document.createElement("div");
        drip.className = "liquid-drip";
        drip.style.backgroundColor = this.currentBeverage ? this.currentBeverage.surfaceColor : "#b45309";
        drip.style.left = `${45 + (Math.random() * 10 - 5)}%`;
        drip.style.top = "20%";
        this.crumbsContainer.appendChild(drip);
        setTimeout(() => {
          if (drip.parentNode) drip.parentNode.removeChild(drip);
        }, 800);
      }, i * 250);
    }
  }

  startAmbientBubbles() {
    if (!this.bubblesContainer) return;
    setInterval(() => {
      if (!this.bubblesContainer || document.hidden) return;
      const bubble = document.createElement("div");
      bubble.className = "chamber-bubble";
      const size = Math.random() * 7 + 3;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${Math.random() * 84 + 8}%`;
      bubble.style.bottom = "8px";
      bubble.style.animationDuration = `${Math.random() * 1.5 + 1.2}s`;
      this.bubblesContainer.appendChild(bubble);

      setTimeout(() => {
        if (bubble.parentNode) bubble.parentNode.removeChild(bubble);
      }, 3000);
    }, 400);
  }
}

window.experimentChamber = new ExperimentChamber();
