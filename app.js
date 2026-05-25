/* ==========================================================================
   16 REAL-WORLD APPLIANCE PRESETS WITH MOTORIZED TAGS
   ========================================================================== */
const APPLIANCE_PRESETS = [
  // Kitchen & Cooking Presets
  {
    id: "microwave-rite-tek",
    voltage: 230,
    current: 4.78,
    pf: 1.0,
    phase: 1,
    motorized: false
  },
  {
    id: "refrigerator-haier",
    voltage: 230,
    current: 0.85,
    pf: 0.51, // Matches 100W input
    phase: 1,
    motorized: true // Has a compressor motor
  },
  {
    id: "chest-freezer-midea",
    voltage: 230,
    current: 1.05,
    pf: 0.60,
    phase: 1,
    motorized: true // Has a compressor motor
  },
  {
    id: "chest-freezer-haier",
    voltage: 230,
    current: 1.8,
    pf: 0.30, // Matches 125W input
    phase: 1,
    motorized: true // Has a compressor motor
  },
  {
    id: "beverage-cooler-bruhm",
    voltage: 230,
    current: 1.15,
    pf: 0.59, // Matches 155W input
    phase: 1,
    motorized: true // Has a compressor motor
  },
  {
    id: "water-heater-fithome",
    voltage: 230,
    current: 6.52,
    pf: 1.0,
    phase: 1,
    motorized: false // Purely resistive heating element
  },

  // Climate, HVAC & Motors Presets
  {
    id: "washing-machine-haier",
    voltage: 230,
    current: 1.74,
    pf: 1.0,
    phase: 1,
    motorized: true // Has a drive motor
  },
  {
    id: "room-ac-hisense",
    voltage: 230,
    current: 5.4,
    pf: 0.97, // Matches 1210W cooling
    phase: 1,
    motorized: true // Has a compressor and fan motors
  },
  {
    id: "split-ac-midea",
    voltage: 230,
    current: 5.8,
    pf: 0.93, // Matches 1235W input
    phase: 1,
    motorized: true // Has a compressor and fan motors
  },
  {
    id: "motor-controller-box",
    voltage: 230,
    current: 2.5,
    pf: 0.65,
    phase: 1,
    motorized: true // Drives electric motors
  },

  // Media & Office Electronics Presets
  {
    id: "tv-hisense-43a1q",
    voltage: 230,
    current: 0.33,
    pf: 1.0,
    phase: 1,
    motorized: false
  },
  {
    id: "tv-royal-rtv24dn6",
    voltage: 230,
    current: 0.17,
    pf: 1.0,
    phase: 1,
    motorized: false
  },
  {
    id: "tv-mewe-mw430sgh",
    voltage: 230,
    current: 0.39,
    pf: 1.0,
    phase: 1,
    motorized: false
  },
  {
    id: "led-backlight-hisense",
    voltage: 230,
    current: 0.33,
    pf: 1.0,
    phase: 1,
    motorized: false
  },
  {
    id: "monitor-hp-lcd",
    voltage: 100,
    current: 1.6,
    pf: 0.5,
    phase: 1,
    motorized: false
  },
  {
    id: "pc-psu-hp",
    voltage: 230,
    current: 1.3,
    pf: 0.85,
    phase: 1,
    motorized: false
  }
];

// Calculation factors
const CONSTANTS = {
  MAX_GAUGE_WATTAGE: 3000
};

// Global App State (Microwave Oven is the default template preset)
let appState = {
  applianceType: "microwave-rite-tek",
  voltage: 230,
  current: 4.78,
  pf: 1.00,
  phase: 1,
  showHp: false,
  theme: "dark",
  formulaDrawerOpen: false
};

/* ==========================================================================
   DOM ELEMENTS
   ========================================================================== */
const DOM = {
  // Theme & Network
  body: document.body,
  themeToggle: document.getElementById("theme-toggle"),
  networkBadge: document.getElementById("network-badge"),
  networkStatusText: document.getElementById("network-status-text"),
  topNotificationBar: document.getElementById("top-notification-bar"),
  notificationMessage: document.getElementById("notification-message"),
  closeNotification: document.getElementById("close-notification"),
  
  // Install Banner
  installBanner: document.getElementById("install-banner"),
  installButton: document.getElementById("install-button"),
  dismissInstall: document.getElementById("dismiss-install"),

  // Custom Dropdown elements
  applianceSelectContainer: document.getElementById("appliance-select-container"),
  applianceSelectTrigger: document.getElementById("appliance-select-trigger"),
  applianceSelectedText: document.getElementById("appliance-selected-text"),
  applianceOptionsDrawer: document.getElementById("appliance-options-drawer"),
  optionsSearch: document.getElementById("options-search"),
  applianceOptionsList: document.getElementById("appliance-options-list"),

  // Primary Inputs
  inputVoltage: document.getElementById("input-voltage"),
  inputCurrent: document.getElementById("input-current"),

  // Primary Gauge Results
  gaugeFill: document.getElementById("gauge-fill"),
  gaugeClass: document.getElementById("gauge-class"),
  resultWatts: document.getElementById("result-watts"),
  resultHp: document.getElementById("result-hp"),

  // Formulas Drawer UI
  formulaToggle: document.getElementById("formula-toggle"),
  formulaDrawer: document.getElementById("formula-drawer"),
  closeDrawer: document.getElementById("close-drawer"),
  drawerOverlay: document.getElementById("drawer-overlay"),
  formulaTextWatts: document.getElementById("formula-text-watts"),
  formulaMathWatts: document.getElementById("formula-math-watts"),
  formulaMathHp: document.getElementById("formula-math-hp"),
  hpFormulaCard: document.getElementById("hp-formula-card"),

  // Utility Actions
  resetButton: document.getElementById("reset-button"),
  clearCacheLink: document.getElementById("clear-cache-link")
};

/* ==========================================================================
   INITIALIZATION & STATE SYNC
   ========================================================================== */
function init() {
  loadAppState();
  registerServiceWorker();
  setupEventListeners();
  calculateMetrics();
}

// Load persistent state from localStorage
function loadAppState() {
  const savedState = localStorage.getItem("electrocalc_state");
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
      if (parsed.applianceType !== undefined && parsed.applianceType !== "custom") {
        appState.applianceType = parsed.applianceType;
      }
      if (parsed.voltage !== undefined) appState.voltage = parsed.voltage;
      if (parsed.current !== undefined) appState.current = parsed.current;
      if (parsed.pf !== undefined) appState.pf = parsed.pf;
      if (parsed.phase !== undefined) appState.phase = parsed.phase;
      if (parsed.showHp !== undefined) appState.showHp = parsed.showHp;
      if (parsed.theme !== undefined) appState.theme = parsed.theme;
      if (parsed.formulaDrawerOpen !== undefined) appState.formulaDrawerOpen = parsed.formulaDrawerOpen;
    } catch (e) {
      console.warn("Failed to parse saved state, resetting to defaults", e);
    }
  }

  // Update DOM inputs with loaded states
  DOM.inputVoltage.value = appState.voltage;
  DOM.inputCurrent.value = appState.current;

  // Sync custom dropdown active item and clone active icon into trigger
  syncDropdownTrigger(appState.applianceType);

  // Set Theme
  if (appState.theme === "light") {
    DOM.body.classList.remove("dark-theme");
    DOM.body.classList.add("light-theme");
  } else {
    DOM.body.classList.remove("light-theme");
    DOM.body.classList.add("dark-theme");
  }
  
  // Sync formula drawer status
  toggleDrawer(appState.formulaDrawerOpen);
}

// Persist active state back to localStorage
function saveAppState() {
  localStorage.setItem("electrocalc_state", JSON.stringify(appState));
}

// Helper to toggle formula drawer visibility
function toggleDrawer(shouldOpen) {
  appState.formulaDrawerOpen = shouldOpen;
  if (shouldOpen) {
    DOM.formulaDrawer.classList.remove("hidden");
  } else {
    DOM.formulaDrawer.classList.add("hidden");
  }
}

// Synchronize and render active icon inside customized dropdown trigger
function syncDropdownTrigger(value) {
  const activeOption = document.querySelector(`.option-item[data-value="${value}"]`);
  if (activeOption) {
    document.querySelectorAll(".option-item").forEach(item => item.classList.remove("active"));
    activeOption.classList.add("active");
    
    const triggerContent = DOM.applianceSelectTrigger.querySelector(".trigger-content-wrapper");
    if (triggerContent) {
      triggerContent.innerHTML = "";
      const clonedIcon = activeOption.querySelector(".opt-icon").cloneNode(true);
      const optTitle = activeOption.querySelector(".opt-title").textContent;
      
      const textSpan = document.createElement("span");
      textSpan.id = "appliance-selected-text";
      textSpan.textContent = optTitle;
      
      triggerContent.appendChild(clonedIcon);
      triggerContent.appendChild(textSpan);
    }
  }
}

/* ==========================================================================
   CALCULATION SYSTEM
   ========================================================================== */
function calculateMetrics() {
  // Phase logic: Single-phase factor = 1, Three-phase factor = sqrt(3)
  const factor = appState.phase === 3 ? Math.sqrt(3) : 1;
  const finalWatts = appState.voltage * appState.current * appState.pf * factor;
  const finalHp = finalWatts / 746;

  // Math derivations breakdowns
  const phaseMultiplierStr = appState.phase === 3 ? " × 1.732" : "";
  const pfStr = appState.pf === 1.0 ? "" : ` × ${appState.pf.toFixed(2)}`;

  DOM.formulaTextWatts.textContent = appState.phase === 3 
    ? "Watts = V × A × PF × √3" 
    : (appState.pf === 1.0 ? "Watts = V × A" : "Watts = V × A × PF");

  DOM.formulaMathWatts.textContent = `${appState.voltage}V × ${appState.current.toFixed(2)}A${pfStr}${phaseMultiplierStr} = ${finalWatts.toFixed(1)}W`;
  DOM.formulaMathHp.textContent = `${finalWatts.toFixed(1)}W ÷ 746 = ${finalHp.toFixed(2)} HP`;

  // Main readout elements
  DOM.resultWatts.textContent = `${finalWatts.toFixed(1)} W`;
  DOM.resultHp.textContent = `${finalHp.toFixed(2)} HP`;

  // Dynamically show or hide HP outputs based on active state preference
  if (appState.showHp) {
    DOM.resultHp.classList.remove("hidden");
    DOM.hpFormulaCard.classList.remove("hidden");
  } else {
    DOM.resultHp.classList.add("hidden");
    DOM.hpFormulaCard.classList.add("hidden");
  }

  // Update circular gauge meter
  updateVisualGauge(finalWatts);
  saveAppState();
}

// Update glowing gauge
function updateVisualGauge(watts) {
  const percentage = Math.min(watts / CONSTANTS.MAX_GAUGE_WATTAGE, 1);
  const dashOffset = 251.2 - (percentage * 251.2);
  DOM.gaugeFill.style.strokeDashoffset = dashOffset;

  let powerClass = "VAMPIRE LOAD";
  let classCSS = "class-vampire";
  let gaugeColor = "hsl(182, 100%, 45%)"; // Electric Cyan

  if (watts >= 1500) {
    powerClass = "HIGH POWER";
    classCSS = "class-high";
    gaugeColor = "hsl(0, 90%, 55%)"; // Neon Red
  } else if (watts >= 600) {
    powerClass = "MEDIUM POWER";
    classCSS = "class-medium";
    gaugeColor = "hsl(38, 95%, 50%)"; // Vibrant Gold
  } else if (watts >= 100) {
    powerClass = "LOW POWER";
    classCSS = "class-low";
    gaugeColor = "hsl(213, 100%, 55%)"; // Electric Blue
  }

  DOM.gaugeClass.className = `power-class-badge ${classCSS}`;
  DOM.gaugeClass.textContent = powerClass;

  DOM.gaugeFill.style.stroke = gaugeColor;
  DOM.gaugeFill.style.filter = `drop-shadow(0 0 6px ${gaugeColor})`;
}

/* ==========================================================================
   CUSTOM DROP-DOWN SELECT CONTROLLER
   ========================================================================== */
function openApplianceDropdown() {
  DOM.applianceSelectTrigger.setAttribute("aria-expanded", "true");
  DOM.applianceOptionsDrawer.classList.remove("hidden");
  
  // Autofocus search input box
  setTimeout(() => DOM.optionsSearch.focus(), 50);
}

function closeApplianceDropdown() {
  DOM.applianceSelectTrigger.setAttribute("aria-expanded", "false");
  DOM.applianceOptionsDrawer.classList.add("hidden");
  
  // Clear search query
  DOM.optionsSearch.value = "";
  filterDropdownOptions("");
}

function selectAppliancePreset(value) {
  appState.applianceType = value;
  
  // Sync selected trigger labels and active icon cloning
  syncDropdownTrigger(value);

  const preset = APPLIANCE_PRESETS.find((p) => p.id === value);
  if (preset) {
    appState.voltage = preset.voltage;
    appState.current = preset.current;
    appState.pf = preset.pf;
    appState.phase = preset.phase;
    appState.showHp = preset.motorized; // Automates HP visibility based on motorized preset type

    // Update manual form fields
    DOM.inputVoltage.value = preset.voltage;
    DOM.inputCurrent.value = preset.current;
  }
  calculateMetrics();
}

// Live search dropdown lists
function filterDropdownOptions(query) {
  const normQuery = query.toLowerCase().trim();
  
  document.querySelectorAll(".option-item").forEach(item => {
    const text = item.textContent.toLowerCase();
    if (text.includes(normQuery)) {
      item.classList.remove("hidden");
    } else {
      item.classList.add("hidden");
    }
  });

  // Hide empty optgroup labels dynamically
  document.querySelectorAll(".option-group-title").forEach(title => {
    let group = title;
    let next = group.nextElementSibling;
    let visibleCount = 0;
    while (next && !next.classList.contains("option-group-title")) {
      if (next.classList.contains("option-item") && !next.classList.contains("hidden")) {
        visibleCount++;
      }
      next = next.nextElementSibling;
    }
    if (visibleCount === 0 && normQuery !== "") {
      group.classList.add("hidden");
    } else {
      group.classList.remove("hidden");
    }
  });
}

/* ==========================================================================
   EVENT LISTENERS SETUP
   ========================================================================== */
function setupEventListeners() {
  
  // Theme Toggle click handler
  DOM.themeToggle.addEventListener("click", () => {
    if (DOM.body.classList.contains("dark-theme")) {
      DOM.body.classList.remove("dark-theme");
      DOM.body.classList.add("light-theme");
      appState.theme = "light";
    } else {
      DOM.body.classList.remove("light-theme");
      DOM.body.classList.add("dark-theme");
      appState.theme = "dark";
    }
    saveAppState();
  });

  // Customized Dropdown Trigger Click Toggle
  DOM.applianceSelectTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const isExpanded = DOM.applianceSelectTrigger.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      closeApplianceDropdown();
    } else {
      openApplianceDropdown();
    }
  });

  // Customized Dropdown Item Click Select Event
  DOM.applianceOptionsList.addEventListener("click", (e) => {
    const item = e.target.closest(".option-item");
    if (!item) return;
    
    selectAppliancePreset(item.dataset.value);
    closeApplianceDropdown();
  });

  // Customized Dropdown Searchbox Input listener
  DOM.optionsSearch.addEventListener("input", (e) => {
    filterDropdownOptions(e.target.value);
  });

  // Click outside custom select menu to close it
  document.addEventListener("click", (e) => {
    if (!DOM.applianceSelectContainer.contains(e.target)) {
      closeApplianceDropdown();
    }
  });

  // Formula Drawer slide triggers
  DOM.formulaToggle.addEventListener("click", () => toggleDrawer(true));
  DOM.closeDrawer.addEventListener("click", () => toggleDrawer(false));
  DOM.drawerOverlay.addEventListener("click", () => toggleDrawer(false));

  // Real-time calculation listeners on manual inputs (user edits active preset template values)
  DOM.inputVoltage.addEventListener("input", (e) => {
    appState.voltage = Math.max(0, parseFloat(e.target.value) || 0);
    calculateMetrics();
  });
  DOM.inputCurrent.addEventListener("input", (e) => {
    appState.current = Math.max(0, parseFloat(e.target.value) || 0);
    calculateMetrics();
  });

  // Form shortcuts loaders
  setupShortcuts("voltage-shortcuts", DOM.inputVoltage, "voltage");
  setupShortcuts("current-shortcuts", DOM.inputCurrent, "current");

  // Reset fields to defaults
  DOM.resetButton.addEventListener("click", () => {
    appState.voltage = 230;
    appState.current = 4.78;
    appState.pf = 1.00;
    appState.phase = 1;
    appState.showHp = false;
    appState.formulaDrawerOpen = false;

    DOM.inputVoltage.value = 230;
    DOM.inputCurrent.value = 4.78;

    selectAppliancePreset("microwave-rite-tek");
    toggleDrawer(false);

    calculateMetrics();
  });

  // Clear Caches
  DOM.clearCacheLink.addEventListener("click", (e) => {
    e.preventDefault();
    if ('serviceWorker' in navigator) {
      caches.keys().then((names) => {
        for (let name of names) caches.delete(name);
      }).then(() => {
        showNotification("App cache cleared. Reloading...");
        setTimeout(() => location.reload(), 1500);
      });
    }
  });

  // Network offline online status hooks
  window.addEventListener("online", () => toggleNetworkStatus(true));
  window.addEventListener("offline", () => toggleNetworkStatus(false));

  // Top banner closer
  DOM.closeNotification.addEventListener("click", () => {
    DOM.topNotificationBar.classList.add("hidden");
  });
}

// Bind fast shortcuts
function setupShortcuts(containerId, inputElement, statePropName) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".shortcut-btn");
    if (!btn) return;

    const val = parseFloat(btn.dataset.val);
    inputElement.value = val;
    appState[statePropName] = val;

    calculateMetrics();
  });
}

/* ==========================================================================
   PWA & SERVICE WORKER UTILITIES
   ========================================================================== */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => {
          console.log('[Service Worker] Registered successfully:', reg.scope);
        })
        .catch((err) => {
          console.error('[Service Worker] Registration failed:', err);
        });
    });
  }
}

// Toggle indicator UI on Network state changes
function toggleNetworkStatus(isOnline) {
  if (isOnline) {
    DOM.networkBadge.className = "network-badge online";
    DOM.networkStatusText.textContent = "Online";
    showNotification("Back online! Connection restored.");
  } else {
    DOM.networkBadge.className = "network-badge offline";
    DOM.networkStatusText.textContent = "Offline";
    showNotification("Working offline mode enabled. All tools functional.");
  }
}

// Sliding top message notices
function showNotification(msg) {
  DOM.notificationMessage.textContent = msg;
  DOM.topNotificationBar.classList.remove("hidden");
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    DOM.topNotificationBar.classList.add("hidden");
  }, 5000);
}

// PWA Install Prompter bindings
let deferredPrompt;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  DOM.installBanner.classList.remove("hidden");
});

DOM.installButton.addEventListener("click", () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  
  deferredPrompt.userChoice.then((choiceResult) => {
    deferredPrompt = null;
    DOM.installBanner.classList.add("hidden");
  });
});

DOM.dismissInstall.addEventListener("click", () => {
  DOM.installBanner.classList.add("hidden");
});

// Run app init
window.addEventListener("DOMContentLoaded", init);
