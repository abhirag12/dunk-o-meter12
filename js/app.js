/**
 * DUNK-O-METER 9000 - Main Application Coordinator
 * Handles user interactions, biscuit/drink database UI rendering,
 * settings management, sound effects, and lifecycle orchestration.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Web Audio on first user interaction
  document.addEventListener("click", () => {
    window.labAudio.ensureContext();
  }, { once: true });

  const state = {
    selectedBiscuit: BISCUIT_DATABASE[0], // Parle-G default
    selectedBeverage: BEVERAGE_DATABASE[0], // Hot Chai default
    duration: 6.0,
    temperature: "hot",
    style: "normal",
    size: "medium",
    customBiscuit: {
      name: "Super-Biscuit 9000",
      structuralStrength: 65,
      absorptionRate: 0.90,
      crispiness: 80,
      thickness: 6.0
    },
    customDrinkName: "Liquid Xenon Chai",
    latestResult: null
  };

  // DOM Cache
  const biscuitGrid = document.getElementById("biscuit-grid");
  const biscuitSearch = document.getElementById("biscuit-search");
  const beverageGrid = document.getElementById("beverage-grid");
  const customBiscuitPanel = document.getElementById("custom-biscuit-panel");
  const customDrinkPanel = document.getElementById("custom-drink-panel");

  // Biscuit preview card elements
  const previewBiscuitName = document.getElementById("preview-biscuit-name");
  const previewBiscuitClass = document.getElementById("preview-biscuit-class");
  const previewBiscuitLore = document.getElementById("preview-biscuit-lore");
  const previewBiscuitStrength = document.getElementById("preview-biscuit-strength");
  const previewBiscuitAbsorption = document.getElementById("preview-biscuit-absorption");
  const previewBiscuitCrunch = document.getElementById("preview-biscuit-crunch");
  const previewBiscuitSvg = document.getElementById("preview-biscuit-svg");

  // Settings elements
  const durationSlider = document.getElementById("duration-slider");
  const durationDisplay = document.getElementById("duration-display");
  const durationWarning = document.getElementById("duration-warning");

  // Primary action button
  const startExperimentBtn = document.getElementById("start-experiment-btn");
  const heroStartBtn = document.getElementById("hero-start-btn");

  // Header buttons
  const audioToggleBtn = document.getElementById("audio-toggle-btn");
  const crtToggleBtn = document.getElementById("crt-toggle-btn");
  const blackboxBtn = document.getElementById("blackbox-btn");

  // Certificate & Modal controls
  const viewCertBtn = document.getElementById("view-cert-btn");
  const closeCertBtn = document.getElementById("close-cert-btn");
  const printCertBtn = document.getElementById("print-cert-btn");
  const closeEmergencyBtn = document.getElementById("close-emergency-btn");
  const closeBlackboxBtn = document.getElementById("close-blackbox-btn");
  const repeatExperimentBtn = document.getElementById("repeat-experiment-btn");

  // Initialize Chamber
  window.experimentChamber.init({
    container: document.getElementById("chamber-container"),
    clawArm: document.getElementById("claw-arm"),
    biscuitEl: document.getElementById("claw-biscuit"),
    liquidEl: document.getElementById("chamber-liquid"),
    liquidSurface: document.getElementById("liquid-surface"),
    timerEl: document.getElementById("chamber-timer"),
    statusEl: document.getElementById("chamber-status"),
    emergencyBtn: document.getElementById("emergency-eject-btn"),
    steamContainer: document.getElementById("steam-container"),
    bubblesContainer: document.getElementById("bubbles-container"),
    crumbsContainer: document.getElementById("crumbs-container")
  });

  // Initialize Results Dashboard
  window.resultsDashboard.init({
    analysisOverlay: document.getElementById("analysis-overlay"),
    analysisText: document.getElementById("analysis-text"),
    analysisProgress: document.getElementById("analysis-progress-bar"),
    resultsSection: document.getElementById("results-section"),
    circularMeterCircle: document.getElementById("circular-gauge-circle"),
    circularMeterText: document.getElementById("circular-gauge-text"),
    rankBadge: document.getElementById("rank-badge"),
    rankTitle: document.getElementById("rank-title"),
    rankMessage: document.getElementById("rank-message"),
    conclusionText: document.getElementById("conclusion-text"),
    survivalVal: document.getElementById("metric-survival"),
    breakRiskVal: document.getElementById("metric-break-risk"),
    breakingTimeVal: document.getElementById("metric-breaking-time"),
    crispinessVal: document.getElementById("metric-crispiness"),
    crispinessBar: document.getElementById("bar-crispiness"),
    softnessVal: document.getElementById("metric-softness"),
    softnessBar: document.getElementById("bar-softness"),
    certificateModal: document.getElementById("certificate-modal"),
    emergencyModal: document.getElementById("emergency-modal"),
    blackboxModal: document.getElementById("blackbox-modal")
  });

  // Render Initial State
  renderBiscuits();
  renderBeverages();
  updateBiscuitPreview(state.selectedBiscuit);
  window.experimentChamber.mountBiscuit(state.selectedBiscuit);
  window.experimentChamber.updateBeverageVisuals(state.selectedBeverage);
  updateDurationUI();

  // Audio Toggle
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener("click", () => {
      const isMuted = window.labAudio.toggleMute();
      audioToggleBtn.innerHTML = isMuted ? "🔇 AUDIO: OFF" : "🔊 AUDIO: ON";
      audioToggleBtn.classList.toggle("text-slate-500", isMuted);
      audioToggleBtn.classList.toggle("text-cyan-400", !isMuted);
      if (!isMuted) window.labAudio.playBlip(600, 0.05);
    });
  }

  // CRT Scanlines Toggle
  if (crtToggleBtn) {
    crtToggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("scanlines-enabled");
      const active = document.body.classList.contains("scanlines-enabled");
      crtToggleBtn.classList.toggle("text-cyan-400", active);
      crtToggleBtn.classList.toggle("text-slate-500", !active);
      window.labAudio.playBlip(750, 0.05);
    });
  }

  // Blackbox Toggle
  if (blackboxBtn) {
    blackboxBtn.addEventListener("click", () => {
      window.resultsDashboard.toggleBlackbox();
      window.labAudio.playBlip(700, 0.05);
    });
  }
  if (closeBlackboxBtn) {
    closeBlackboxBtn.addEventListener("click", () => {
      window.resultsDashboard.toggleBlackbox();
    });
  }

  // Hero Scroll to Lab
  if (heroStartBtn) {
    heroStartBtn.addEventListener("click", () => {
      window.labAudio.playBlip(880, 0.1);
      const target = document.getElementById("laboratory-core");
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  // Biscuit Search Filtering
  if (biscuitSearch) {
    biscuitSearch.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();
      renderBiscuits(query);
    });
  }

  function renderBiscuits(query = "") {
    if (!biscuitGrid) return;
    const filtered = BISCUIT_DATABASE.filter(b => 
      b.name.toLowerCase().includes(query) || 
      b.classification.toLowerCase().includes(query) ||
      b.tagline.toLowerCase().includes(query)
    );

    biscuitGrid.innerHTML = filtered.map(b => {
      const isSelected = b.id === state.selectedBiscuit.id;
      return `
        <div class="biscuit-card group relative p-3.5 rounded-xl border transition-all duration-300 cursor-pointer ${
          isSelected 
            ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.35)] scale-[1.02]' 
            : 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/60'
        }" data-biscuit-id="${b.id}">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-slate-950/80 rounded-lg p-1 border border-slate-700/50 group-hover:border-cyan-400/50 transition-colors">
              ${window.experimentChamber.getBiscuitSVG(b, 0, 0)}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between">
                <h4 class="font-bold text-sm text-slate-100 truncate group-hover:text-cyan-300 transition-colors">${b.name}</h4>
                <span class="text-[10px] px-1.5 py-0.5 rounded font-mono uppercase bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">${b.classification}</span>
              </div>
              <p class="text-[11px] text-slate-400 truncate mt-0.5">${b.tagline}</p>
              <div class="flex items-center space-x-2 mt-2 text-[10px] font-mono text-slate-500">
                <span>STR: <b class="text-slate-300">${b.structuralStrength}</b></span>
                <span>ABS: <b class="text-amber-400">${b.absorptionRate}x</b></span>
                <span>CRUNCH: <b class="text-cyan-400">${b.crispiness}%</b></span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");

    // Attach click handlers
    biscuitGrid.querySelectorAll(".biscuit-card").forEach(card => {
      card.addEventListener("click", () => {
        const id = card.getAttribute("data-biscuit-id");
        const found = BISCUIT_DATABASE.find(b => b.id === id);
        if (found) {
          state.selectedBiscuit = found;
          renderBiscuits(biscuitSearch ? biscuitSearch.value.toLowerCase().trim() : "");
          updateBiscuitPreview(found);
          window.experimentChamber.mountBiscuit(found);
          window.labAudio.playBlip(750, 0.05);

          // Show custom biscuit inputs if custom selected
          if (customBiscuitPanel) {
            customBiscuitPanel.classList.toggle("hidden", id !== "custom");
          }
        }
      });
    });
  }

  function updateBiscuitPreview(b) {
    if (previewBiscuitName) previewBiscuitName.textContent = b.name.toUpperCase();
    if (previewBiscuitClass) previewBiscuitClass.textContent = `CLASSIFICATION: ${b.classification.toUpperCase()}`;
    if (previewBiscuitLore) previewBiscuitLore.textContent = b.lore;
    if (previewBiscuitStrength) previewBiscuitStrength.textContent = `${b.structuralStrength}/100`;
    if (previewBiscuitAbsorption) previewBiscuitAbsorption.textContent = `${b.absorptionRate}x`;
    if (previewBiscuitCrunch) previewBiscuitCrunch.textContent = `${b.crispiness}%`;
    if (previewBiscuitSvg) {
      previewBiscuitSvg.innerHTML = window.experimentChamber.getBiscuitSVG(b, 0, 0);
    }
  }

  // Custom Biscuit Inputs
  const customNameInput = document.getElementById("custom-biscuit-name");
  const customStrengthInput = document.getElementById("custom-biscuit-strength");
  const customAbsInput = document.getElementById("custom-biscuit-absorption");
  const customCrunchInput = document.getElementById("custom-biscuit-crunch");

  if (customNameInput) {
    customNameInput.addEventListener("input", (e) => {
      const val = e.target.value.trim() || "Unknown Specimen";
      const customSpec = BISCUIT_DATABASE.find(b => b.id === "custom");
      if (customSpec) {
        customSpec.name = val;
        updateBiscuitPreview(customSpec);
      }
    });
  }
  if (customStrengthInput) {
    customStrengthInput.addEventListener("input", (e) => {
      const val = parseInt(e.target.value);
      const customSpec = BISCUIT_DATABASE.find(b => b.id === "custom");
      if (customSpec) {
        customSpec.structuralStrength = val;
        updateBiscuitPreview(customSpec);
      }
    });
  }
  if (customAbsInput) {
    customAbsInput.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      const customSpec = BISCUIT_DATABASE.find(b => b.id === "custom");
      if (customSpec) {
        customSpec.absorptionRate = val;
        updateBiscuitPreview(customSpec);
      }
    });
  }
  if (customCrunchInput) {
    customCrunchInput.addEventListener("input", (e) => {
      const val = parseInt(e.target.value);
      const customSpec = BISCUIT_DATABASE.find(b => b.id === "custom");
      if (customSpec) {
        customSpec.crispiness = val;
        updateBiscuitPreview(customSpec);
      }
    });
  }

  // Render Beverages
  function renderBeverages() {
    if (!beverageGrid) return;
    beverageGrid.innerHTML = BEVERAGE_DATABASE.map(bev => {
      const isSelected = bev.id === state.selectedBeverage.id;
      return `
        <div class="drink-card p-3 rounded-xl border transition-all duration-300 cursor-pointer text-center ${
          isSelected
            ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-105'
            : 'bg-slate-900/60 border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/60'
        }" data-beverage-id="${bev.id}">
          <div class="text-3xl mb-1">${bev.icon}</div>
          <h4 class="font-bold text-xs text-slate-200 truncate">${bev.name}</h4>
          <span class="text-[10px] font-mono text-amber-400 mt-1 block">Abs: ${bev.absorptionMultiplier}x</span>
        </div>
      `;
    }).join("");

    beverageGrid.querySelectorAll(".drink-card").forEach(card => {
      card.addEventListener("click", () => {
        const id = card.getAttribute("data-beverage-id");
        const found = BEVERAGE_DATABASE.find(bev => bev.id === id);
        if (found) {
          state.selectedBeverage = found;
          renderBeverages();
          window.experimentChamber.updateBeverageVisuals(found);
          window.labAudio.playBlip(620, 0.05);

          if (customDrinkPanel) {
            customDrinkPanel.classList.toggle("hidden", id !== "custom-drink");
          }
        }
      });
    });
  }

  // Custom Drink Input
  const customDrinkInput = document.getElementById("custom-drink-name");
  if (customDrinkInput) {
    customDrinkInput.addEventListener("input", (e) => {
      const val = e.target.value.trim() || "Experimental Solution";
      const customBev = BEVERAGE_DATABASE.find(b => b.id === "custom-drink");
      if (customBev) {
        customBev.name = val;
      }
    });
  }

  // Dunk Duration Slider
  if (durationSlider) {
    durationSlider.addEventListener("input", (e) => {
      state.duration = parseFloat(e.target.value);
      updateDurationUI();
      window.labAudio.playBlip(400 + state.duration * 40, 0.03);
    });
  }

  function updateDurationUI() {
    if (!durationDisplay) return;
    durationDisplay.textContent = `${state.duration.toFixed(1)} SEC`;

    if (durationWarning) {
      if (state.duration <= 3.0) {
        durationWarning.textContent = "SAFETY ZONE: CASUAL DUNK";
        durationWarning.className = "text-xs font-mono text-green-400";
      } else if (state.duration <= 6.5) {
        durationWarning.textContent = "MODERATE DISSOLUTION RISK";
        durationWarning.className = "text-xs font-mono text-yellow-400";
      } else if (state.duration <= 10.5) {
        durationWarning.textContent = "HIGH HAZARD: STRUCTURAL COMPROMISE IMMINENT";
        durationWarning.className = "text-xs font-mono text-orange-400 animate-pulse";
      } else {
        durationWarning.textContent = "EXTREME DANGER: BISCUIT EXTINCTION LEVEL EVENT";
        durationWarning.className = "text-xs font-mono text-red-500 font-bold animate-pulse";
      }
    }
  }

  // Temperature Buttons
  document.querySelectorAll("[data-temp]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-temp]").forEach(b => b.classList.remove("active-setting"));
      btn.classList.add("active-setting");
      state.temperature = btn.getAttribute("data-temp");
      window.labAudio.playBlip(550, 0.05);
    });
  });

  // Dunk Style Buttons
  document.querySelectorAll("[data-style]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-style]").forEach(b => b.classList.remove("active-setting"));
      btn.classList.add("active-setting");
      state.style = btn.getAttribute("data-style");
      window.labAudio.playBlip(580, 0.05);
    });
  });

  // Biscuit Size Buttons
  document.querySelectorAll("[data-size]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-size]").forEach(b => b.classList.remove("active-setting"));
      btn.classList.add("active-setting");
      state.size = btn.getAttribute("data-size");
      window.labAudio.playBlip(600, 0.05);
    });
  });

  // Run Full Scientific Experiment
  if (startExperimentBtn) {
    startExperimentBtn.addEventListener("click", () => {
      if (window.experimentChamber.isSimulating) return;

      window.labAudio.playBlip(900, 0.1);

      // Disable button during simulation
      startExperimentBtn.disabled = true;
      startExperimentBtn.classList.add("opacity-50", "pointer-events-none");

      // 1. Calculate outcomes deterministically
      const result = window.dunkCalculator.calculate(
        state.selectedBiscuit,
        state.selectedBeverage,
        {
          duration: state.duration,
          temperature: state.temperature,
          style: state.style,
          size: state.size
        }
      );
      state.latestResult = result;

      // Scroll chamber into view smoothly
      const chamberSection = document.getElementById("chamber-section");
      if (chamberSection) {
        chamberSection.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      // 2. Dramatic scientific analysis overlay
      window.resultsDashboard.runAnalysisSequence(
        state.selectedBiscuit,
        state.selectedBeverage,
        () => {
          // 3. Start live chamber physical simulation
          window.experimentChamber.startSimulation(
            state.selectedBiscuit,
            state.selectedBeverage,
            {
              duration: state.duration,
              temperature: state.temperature,
              style: state.style,
              size: state.size
            },
            result,
            (completedResult) => {
              // On Dunk Complete: Show results dashboard
              window.resultsDashboard.displayResults(
                completedResult,
                state.selectedBiscuit,
                state.selectedBeverage,
                { duration: state.duration }
              );
              startExperimentBtn.disabled = false;
              startExperimentBtn.classList.remove("opacity-50", "pointer-events-none");
            },
            (emergencyData) => {
              // On Emergency Abort triggered: Show emergency salvage modal
              window.resultsDashboard.openEmergencyModal(emergencyData);
              startExperimentBtn.disabled = false;
              startExperimentBtn.classList.remove("opacity-50", "pointer-events-none");
            }
          );
        }
      );
    });
  }

  // Certificate Modal View & Close
  if (viewCertBtn) {
    viewCertBtn.addEventListener("click", () => {
      if (state.latestResult) {
        window.resultsDashboard.openCertificate(
          state.latestResult,
          state.selectedBiscuit,
          state.selectedBeverage,
          { duration: state.duration }
        );
      }
    });
  }
  if (closeCertBtn) {
    closeCertBtn.addEventListener("click", () => {
      window.resultsDashboard.closeCertificate();
    });
  }
  if (printCertBtn) {
    printCertBtn.addEventListener("click", () => {
      window.print();
    });
  }

  // Emergency Modal Close
  if (closeEmergencyBtn) {
    closeEmergencyBtn.addEventListener("click", () => {
      window.resultsDashboard.closeEmergencyModal();
    });
  }

  // Repeat Experiment Button
  if (repeatExperimentBtn) {
    repeatExperimentBtn.addEventListener("click", () => {
      window.labAudio.playBlip(700, 0.08);
      window.experimentChamber.resetChamberState();
      const consoleEl = document.getElementById("control-console");
      if (consoleEl) {
        consoleEl.scrollIntoView({ behavior: "smooth" });
      }
    });
  }
});
