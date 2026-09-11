/**
 * DUNK-O-METER 9000 - Scientific Results & Certificate Engine
 * Controls analysis overlay, circular survival gauge, telemetry cards,
 * dynamic conclusions, experiment logging, and official certificate generator.
 */

class ResultsDashboard {
  constructor() {
    this.analysisOverlay = null;
    this.analysisText = null;
    this.analysisProgress = null;
    this.resultsSection = null;
    this.circularMeterCircle = null;
    this.circularMeterText = null;
    this.rankBadge = null;
    this.rankTitle = null;
    this.rankMessage = null;
    this.conclusionText = null;

    // Telemetry metric fields
    this.survivalVal = null;
    this.breakRiskVal = null;
    this.breakingTimeVal = null;
    this.crispinessVal = null;
    this.crispinessBar = null;
    this.softnessVal = null;
    this.softnessBar = null;

    // Modals
    this.certificateModal = null;
    this.emergencyModal = null;
    this.blackboxModal = null;

    this.experimentHistory = [];
  }

  init(elements) {
    this.analysisOverlay = elements.analysisOverlay;
    this.analysisText = elements.analysisText;
    this.analysisProgress = elements.analysisProgress;
    this.resultsSection = elements.resultsSection;
    this.circularMeterCircle = elements.circularMeterCircle;
    this.circularMeterText = elements.circularMeterText;
    this.rankBadge = elements.rankBadge;
    this.rankTitle = elements.rankTitle;
    this.rankMessage = elements.rankMessage;
    this.conclusionText = elements.conclusionText;

    this.survivalVal = elements.survivalVal;
    this.breakRiskVal = elements.breakRiskVal;
    this.breakingTimeVal = elements.breakingTimeVal;
    this.crispinessVal = elements.crispinessVal;
    this.crispinessBar = elements.crispinessBar;
    this.softnessVal = elements.softnessVal;
    this.softnessBar = elements.softnessBar;

    this.certificateModal = elements.certificateModal;
    this.emergencyModal = elements.emergencyModal;
    this.blackboxModal = elements.blackboxModal;
  }

  /**
   * Run dramatic fake scientific analysis sequence before chamber dunk
   */
  runAnalysisSequence(biscuit, beverage, onComplete) {
    if (!this.analysisOverlay) {
      if (onComplete) onComplete();
      return;
    }

    this.analysisOverlay.classList.remove("hidden");
    let progress = 0;
    let messageIndex = 0;
    const shuffledMessages = [...ANALYSIS_MESSAGES].sort(() => 0.5 - Math.random());

    const updateStep = () => {
      progress += Math.floor(Math.random() * 18 + 12);
      if (progress > 100) progress = 100;

      if (this.analysisProgress) {
        this.analysisProgress.style.width = `${progress}%`;
      }
      if (this.analysisText && messageIndex < shuffledMessages.length) {
        this.analysisText.textContent = shuffledMessages[messageIndex];
        messageIndex++;
      }

      window.labAudio.playScanBeep();

      if (progress < 100) {
        setTimeout(updateStep, 220 + Math.random() * 120);
      } else {
        setTimeout(() => {
          this.analysisOverlay.classList.add("hidden");
          if (onComplete) onComplete();
        }, 400);
      }
    };

    updateStep();
  }

  /**
   * Display and animate results dashboard
   */
  displayResults(result, biscuit, beverage, settings) {
    // Record to experiment history
    this.logExperiment(result, biscuit, beverage, settings);

    if (this.resultsSection) {
      this.resultsSection.classList.remove("hidden");
      this.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Play appropriate sound fanfare or trombone
    if (result.survivalProbability >= 60) {
      window.labAudio.playSuccess();
    } else {
      window.labAudio.playFail();
    }

    // Animate circular gauge
    this.animateCircularGauge(result.survivalProbability);

    // Update Rank
    if (this.rankBadge) this.rankBadge.textContent = result.rank.badge;
    if (this.rankTitle) {
      this.rankTitle.textContent = result.rank.title;
      this.rankTitle.style.color = result.rank.color;
      this.rankTitle.style.textShadow = `0 0 15px ${result.rank.color}`;
    }
    if (this.rankMessage) this.rankMessage.textContent = result.rank.message;

    // Animate numbers and progress bars
    this.animateCounter(this.survivalVal, 0, result.survivalProbability, "%");
    this.animateCounter(this.breakRiskVal, 0, result.breakRisk, "%");
    if (this.breakingTimeVal) {
      this.breakingTimeVal.textContent = `${result.estimatedBreakingTime}s`;
    }

    this.animateCounter(this.crispinessVal, 0, result.crispinessRemaining, "%");
    if (this.crispinessBar) {
      this.crispinessBar.style.width = "0%";
      setTimeout(() => {
        this.crispinessBar.style.width = `${result.crispinessRemaining}%`;
      }, 100);
    }

    this.animateCounter(this.softnessVal, 0, result.softnessLevel, "%");
    if (this.softnessBar) {
      this.softnessBar.style.width = "0%";
      setTimeout(() => {
        this.softnessBar.style.width = `${result.softnessLevel}%`;
      }, 100);
    }

    // Update funny conclusion
    if (this.conclusionText) {
      this.conclusionText.textContent = `“${result.conclusion}”`;
    }
  }

  /**
   * Animate the SVG circular survival meter
   */
  animateCircularGauge(percentage) {
    if (!this.circularMeterCircle || !this.circularMeterText) return;

    // Circle radius is 88, circumference is ~553
    const radius = 88;
    const circumference = 2 * Math.PI * radius;
    this.circularMeterCircle.style.strokeDasharray = `${circumference}`;

    // Color based on percentage
    let strokeColor = "#00ff88"; // Green
    if (percentage < 20) {
      strokeColor = "#ef4444"; // Red
    } else if (percentage < 40) {
      strokeColor = "#f97316"; // Orange
    } else if (percentage < 60) {
      strokeColor = "#eab308"; // Yellow
    } else if (percentage < 80) {
      strokeColor = "#a3e635"; // Yellow-green
    }

    this.circularMeterCircle.style.stroke = strokeColor;
    this.circularMeterCircle.style.filter = `drop-shadow(0 0 12px ${strokeColor})`;

    // Pulse animation if critical
    const gaugeWrapper = document.getElementById("circular-gauge-wrapper");
    if (gaugeWrapper) {
      if (percentage < 25) {
        gaugeWrapper.classList.add("animate-pulse");
      } else {
        gaugeWrapper.classList.remove("animate-pulse");
      }
    }

    // Number count up
    let current = 0;
    const duration = 1200;
    const stepTime = 20;
    const stepIncrement = percentage / (duration / stepTime);

    const timer = setInterval(() => {
      current += stepIncrement;
      if (current >= percentage) {
        current = percentage;
        clearInterval(timer);
      }
      this.circularMeterText.textContent = `${Math.round(current)}%`;

      const offset = circumference - (current / 100) * circumference;
      this.circularMeterCircle.style.strokeDashoffset = `${offset}`;
    }, stepTime);
  }

  animateCounter(el, start, end, suffix = "") {
    if (!el) return;
    let current = start;
    const duration = 1000;
    const stepTime = 25;
    const increment = (end - start) / (duration / stepTime);

    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= end) || (increment <= 0 && current <= end)) {
        current = end;
        clearInterval(timer);
      }
      el.textContent = `${Math.round(current)}${suffix}`;
    }, stepTime);
  }

  logExperiment(result, biscuit, beverage, settings) {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      biscuit: biscuit.name,
      beverage: beverage.name,
      duration: `${settings.duration}s`,
      survival: `${result.survivalProbability}%`,
      rank: result.rank.title,
      rankBadge: result.rank.badge
    };
    this.experimentHistory.unshift(entry);
    this.renderBlackbox();
  }

  renderBlackbox() {
    const logList = document.getElementById("blackbox-log-list");
    if (!logList) return;

    if (this.experimentHistory.length === 0) {
      logList.innerHTML = `<div class="p-6 text-center text-slate-500 font-mono text-sm">NO PREVIOUS EXPERIMENTAL TELEMETRY RECORDED.</div>`;
      return;
    }

    logList.innerHTML = this.experimentHistory.map(item => `
      <div class="p-3 bg-slate-900/60 rounded border border-cyan-500/20 mb-2 flex items-center justify-between font-mono text-xs">
        <div>
          <span class="text-cyan-400 font-bold">${item.timestamp}</span>
          <span class="text-slate-300 ml-2">${item.biscuit}</span>
          <span class="text-slate-500">in</span>
          <span class="text-amber-400">${item.beverage}</span>
          <span class="text-slate-500">(${item.duration})</span>
        </div>
        <div>
          <span class="font-bold text-sm ${item.survival.replace('%','') > 50 ? 'text-green-400' : 'text-red-400'}">${item.survival}</span>
          <span class="ml-1">${item.rankBadge}</span>
        </div>
      </div>
    `).join('');
  }

  /**
   * Generate official lab certificate
   */
  openCertificate(result, biscuit, beverage, settings) {
    if (!this.certificateModal) return;

    const certDate = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    const certSerial = `BISCUIT-LAB-${Math.floor(100000 + Math.random() * 900000)}`;

    document.getElementById("cert-serial").textContent = certSerial;
    document.getElementById("cert-date").textContent = certDate;
    document.getElementById("cert-specimen").textContent = biscuit.name.toUpperCase();
    document.getElementById("cert-drink").textContent = beverage.name.toUpperCase();
    document.getElementById("cert-duration").textContent = `${settings.duration} SECONDS`;
    document.getElementById("cert-survival").textContent = `${result.survivalProbability}%`;
    document.getElementById("cert-rank").textContent = `${result.rank.badge} ${result.rank.title}`;
    document.getElementById("cert-conclusion").textContent = `“${result.conclusion}”`;

    // Render specimen thumbnail
    const thumb = document.getElementById("cert-biscuit-thumb");
    if (thumb) {
      thumb.innerHTML = window.experimentChamber.getBiscuitSVG(biscuit, 0, 0);
    }

    this.certificateModal.classList.remove("hidden");
    window.labAudio.playBlip(780, 0.1);
  }

  closeCertificate() {
    if (this.certificateModal) {
      this.certificateModal.classList.add("hidden");
    }
  }

  openEmergencyModal(data) {
    if (!this.emergencyModal) return;

    document.getElementById("emergency-specimen").textContent = data.biscuit.name;
    document.getElementById("emergency-drink").textContent = data.beverage.name;
    document.getElementById("emergency-time").textContent = data.abortedAt;

    this.emergencyModal.classList.remove("hidden");
  }

  closeEmergencyModal() {
    if (this.emergencyModal) {
      this.emergencyModal.classList.add("hidden");
    }
  }

  toggleBlackbox() {
    if (!this.blackboxModal) return;
    this.blackboxModal.classList.toggle("hidden");
  }
}

window.resultsDashboard = new ResultsDashboard();
