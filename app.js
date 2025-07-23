// FinXray – Enhanced Client-Side Logic with Landing Pages and Subscriptions ----
(() => {
  /* ---------------------------------------------------------------------
     Enhanced SPA state with subscription management
  --------------------------------------------------------------------- */
  const store = {
    isAuthenticated: false,
    user: null,               // { email, role, notify_high_risk, subscription }
    uploads: { mca: [], pitch: [] },
    currentAnalysisId: null,
    watchlist: new Set(),
    subscription: {
      type: 'trial',          // 'trial' or 'premium'
      analysesUsed: 0,
      analysesLimit: 3,
      isActive: true
    },
    currentView: 'landing'    // 'landing', 'auth', 'app'
  };

  /* ---------------------------------------------------------------------
     DOM helpers
  --------------------------------------------------------------------- */
  const el  = (id,   ctx=document) => ctx.getElementById(id);
  const qs  = (sel,  ctx=document) => ctx.querySelector(sel);
  const qsa = (sel,  ctx=document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------------------------------------------------------------------
     Toast notifications
  --------------------------------------------------------------------- */
  function toast(msg, type = 'success') {
    const container = el('toast-container');
    if (!container) return;
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.innerHTML = `<span>${msg}</span>`;
    container.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
  }

  /* ---------------------------------------------------------------------
     View management (landing, auth, app)
  --------------------------------------------------------------------- */
  function showView(view) {
    store.currentView = view;
    
    // Hide all main containers
    const containers = ['landing-container', 'auth-container', 'app-container'];
    containers.forEach(id => {
      const container = el(id);
      if (container) {
        container.classList.add('hidden');
      }
    });

    // Show target container
    const targetContainer = el(`${view}-container`);
    if (targetContainer) {
      targetContainer.classList.remove('hidden');
    }
  }

  /* ---------------------------------------------------------------------
     Landing page navigation
  --------------------------------------------------------------------- */
  function showLandingPage(pageName) {
    // Hide all landing pages
    qsa('.landing-page').forEach(page => page.classList.remove('active'));
    
    // Show target page
    const targetPage = el(`${pageName}-page`);
    if (targetPage) {
      targetPage.classList.add('active');
    }

    // Update nav links
    qsa('.nav-links .nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.page === pageName);
    });
  }

  /* ---------------------------------------------------------------------
     App page navigation
  --------------------------------------------------------------------- */
  function showPage(name) {
    // swap page visibility
    qsa('.page').forEach(p => p.classList.remove('active'));
    const page = el(`${name}-page`);
    if (page) page.classList.add('active');

    // nav link state
    qsa('.sidebar .nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.page === name);
    });
  }

  /* ---------------------------------------------------------------------
     Subscription management
  --------------------------------------------------------------------- */
  function updateTrialCounter() {
    const remaining = Math.max(0, store.subscription.analysesLimit - store.subscription.analysesUsed);
    
    // Update trial indicator in topbar
    const trialIndicator = el('trial-indicator');
    const trialCount = el('trial-count');
    if (trialCount) {
      if (store.subscription.type === 'trial') {
        trialCount.textContent = `${remaining} free analyses remaining`;
        if (remaining === 0) {
          trialCount.textContent = 'Trial expired - Upgrade to continue';
          trialIndicator?.classList.add('expired');
        }
      } else {
        trialCount.textContent = 'Premium - Unlimited analyses';
      }
    }

    // Update upload page counter
    const remainingCount = el('remaining-count');
    if (remainingCount) {
      if (store.subscription.type === 'trial') {
        remainingCount.textContent = `${remaining} analyses remaining`;
      } else {
        remainingCount.textContent = 'Unlimited analyses';
      }
    }

    // Update subscription page
    updateSubscriptionPage();
  }

  function updateSubscriptionPage() {
    const planName = el('plan-name');
    const planStatus = el('plan-status');
    const planAmount = el('plan-amount');
    const planPeriod = el('plan-period');
    const analysesUsed = el('analyses-used');
    const usageProgress = el('usage-progress');
    const upgradeSection = el('upgrade-section');

    if (store.subscription.type === 'trial') {
      if (planName) planName.textContent = 'Free Trial';
      if (planStatus) planStatus.textContent = 'Active';
      if (planAmount) planAmount.textContent = '₹0';
      if (planPeriod) planPeriod.textContent = '';
      
      const used = store.subscription.analysesUsed;
      const limit = store.subscription.analysesLimit;
      if (analysesUsed) analysesUsed.textContent = `${used} / ${limit}`;
      if (usageProgress) {
        const percentage = (used / limit) * 100;
        usageProgress.style.width = `${percentage}%`;
      }
      
      if (upgradeSection) upgradeSection.classList.remove('hidden');
    } else {
      if (planName) planName.textContent = 'Premium';
      if (planStatus) planStatus.textContent = 'Active';
      if (planAmount) planAmount.textContent = '₹25,000';
      if (planPeriod) planPeriod.textContent = '/month';
      if (analysesUsed) analysesUsed.textContent = 'Unlimited';
      if (usageProgress) usageProgress.style.width = '100%';
      if (upgradeSection) upgradeSection.classList.add('hidden');
    }
  }

  function canPerformAnalysis() {
    if (store.subscription.type === 'premium') return true;
    return store.subscription.analysesUsed < store.subscription.analysesLimit;
  }

  function consumeAnalysis() {
    if (store.subscription.type === 'trial') {
      store.subscription.analysesUsed++;
      updateTrialCounter();
      
      if (!canPerformAnalysis()) {
        toast('Trial analyses exhausted. Upgrade to Premium for unlimited access!', 'error');
        setTimeout(() => showPage('subscription'), 2000);
      }
    }
  }

  function upgradeSubscription() {
    store.subscription.type = 'premium';
    store.subscription.analysesUsed = 0;
    store.subscription.analysesLimit = Infinity;
    updateTrialCounter();
    toast('Successfully upgraded to Premium! Enjoy unlimited analyses.');
  }

  /* ---------------------------------------------------------------------
     Sidebar (for small screens)
  --------------------------------------------------------------------- */
  function toggleSidebar(force) {
    const sb = el('sidebar');
    if (!sb) return;
    const shouldOpen = force !== undefined ? force : !sb.classList.contains('open');
    sb.classList.toggle('open', shouldOpen);
  }

  /* ---------------------------------------------------------------------
     Theme switching (light / dark)
  --------------------------------------------------------------------- */
  function updateTheme() {
    const root = document.documentElement;
    const isDark = root.getAttribute('data-color-scheme') === 'dark';
    root.setAttribute('data-color-scheme', isDark ? 'light' : 'dark');

    const btn = el('theme-toggle');
    if (btn) {
      const icon = qs('i', btn);
      if (icon) {
        icon.classList.toggle('fa-moon', isDark);
        icon.classList.toggle('fa-sun', !isDark);
      }
    }
  }

  /* ---------------------------------------------------------------------
     Risk score gauge helper
  --------------------------------------------------------------------- */
  function setRiskScore(score) {
    const circle = el('risk-score-circle');
    const valueEl = el('risk-score-value');
    if (!circle || !valueEl) return;

    const safeScore = Math.min(Math.max(parseInt(score, 10) || 0, 0), 100);
    valueEl.textContent = safeScore;
    circle.style.background = `conic-gradient(var(--color-primary) 0% ${safeScore}%, var(--color-secondary) ${safeScore}% 100%)`;
  }

  /* ---------------------------------------------------------------------
     AUTH ----------------------------------------------------------------
  --------------------------------------------------------------------- */
  function handleLogin(email, role = 'analyst') {
    store.isAuthenticated = true;
    store.user = { 
      email, 
      role, 
      notify_high_risk: false,
      subscription: store.subscription 
    };

    const nameEl = el('user-name');
    if (nameEl) nameEl.textContent = email;

    showView('app');

    // role-based nav visibility
    qsa('.partner-only').forEach(a => a.style.display = (role === 'partner' ? 'flex' : 'none'));

    loadSettings();
    updateTrialCounter();
    showPage('dashboard');
    
    toast(`Welcome to FinXray! You have ${store.subscription.analysesLimit - store.subscription.analysesUsed} free analyses remaining.`);
  }

  function handleLogout() {
    store.isAuthenticated = false;
    store.user = null;
    store.watchlist.clear();
    resetUploadForm();
    showView('landing');
    showLandingPage('landing');
    toast('Logged out successfully');
  }

  /* ---------------------------------------------------------------------
     Upload helpers (drag/drop + list)
  --------------------------------------------------------------------- */
  function renderFileList(containerId, files) {
    const container = el(containerId);
    if (!container) return;
    container.innerHTML = '';

    files.forEach((file, index) => {
      const item = document.createElement('div');
      item.className = 'file-item';
      item.innerHTML = `<span>${file.name}</span><button class="remove-btn" aria-label="Remove">&times;</button>`;
      qs('.remove-btn', item).addEventListener('click', () => {
        files.splice(index, 1);
        renderFileList(containerId, files);
      });
      container.appendChild(item);
    });
  }

  function bindDropzone(zoneId, inputId, arr) {
    const dz = el(zoneId);
    const input = el(inputId);
    if (!dz || !input) return;

    // click to open
    dz.addEventListener('click', () => input.click());

    // input change
    input.addEventListener('change', () => {
      arr.push(...Array.from(input.files));
      input.value = '';
      renderFileList(zoneId.replace('dropzone', 'files'), arr);
    });

    // drag events
    ['dragenter', 'dragover'].forEach(ev => dz.addEventListener(ev, e => {
      e.preventDefault();
      dz.classList.add('dragover');
    }));
    ['dragleave', 'dragend', 'drop'].forEach(ev => dz.addEventListener(ev, () => dz.classList.remove('dragover')));

    dz.addEventListener('drop', e => {
      e.preventDefault();
      arr.push(...Array.from(e.dataTransfer.files));
      renderFileList(zoneId.replace('dropzone', 'files'), arr);
    });
  }

  function resetUploadForm() {
    store.uploads.mca = [];
    store.uploads.pitch = [];
    renderFileList('mca-files', store.uploads.mca);
    renderFileList('pitch-files', store.uploads.pitch);
    const form = el('upload-form');
    if (form) form.reset();
  }

  /* ---------------------------------------------------------------------
     Simulated analysis flow (demo)                                        
  --------------------------------------------------------------------- */
  function simulateAnalysis() {
    if (!canPerformAnalysis()) {
      toast('No analyses remaining. Please upgrade to Premium.', 'error');
      showPage('subscription');
      return;
    }

    const id = `analysis-${Date.now()}`;
    store.currentAnalysisId = id;

    showPage('analysis');

    // show loading state
    el('analysis-loading').classList.remove('hidden');
    el('analysis-content').classList.add('hidden');

    // reset title
    el('analysis-title').textContent = 'Startup Analysis';
    el('analysis-subtitle').textContent = 'AI-powered risk assessment results';

    // after delay show dummy content
    setTimeout(() => {
      el('analysis-loading').classList.add('hidden');
      el('analysis-content').classList.remove('hidden');

      setRiskScore(Math.floor(Math.random()*100));

      // simple placeholder content
      el('risk-level-badge').innerHTML = '<span class="status status--info">Moderate Risk</span>';
      el('risk-breakdown').innerHTML  = '<p class="text-text-secondary">Risk breakdown shows compliance: 85%, financial: 72%, founder: 90%</p>';
      el('founder-profile').innerHTML = '<p class="text-text-secondary">Founder has 8+ years experience in fintech with previous successful exit</p>';
      el('traction-analysis').innerHTML = '<p class="text-text-secondary">Revenue growth of 15% MoM with 10K+ active users validated</p>';
      el('red-flags').innerHTML      = '<p class="text-text-secondary">Minor concern: Limited market diversification identified</p>';

      updateWatchlistButton();
      
      // Consume an analysis
      consumeAnalysis();
    }, 4000);
  }

  /* ---------------------------------------------------------------------
     Watchlist helpers
  --------------------------------------------------------------------- */
  function updateWatchlistButton() {
    const btn = el('toggle-watchlist');
    if (!btn) return;
    const span = qs('span', btn);
    const icon = qs('i', btn);

    const inList = store.watchlist.has(store.currentAnalysisId);

    if (inList) {
      span.textContent = 'In Watchlist';
      icon.className = 'fas fa-check-circle';
    } else {
      span.textContent = 'Add to Watchlist';
      icon.className = 'fas fa-eye';
    }
  }

  function renderWatchlist() {
    const container = el('watchlist-container');
    if (!container) return;
    container.innerHTML = '';

    if (store.watchlist.size === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-eye"></i>
          <h3>Your watchlist is empty</h3>
          <p>Add startups from analysis results to track them</p>
          <button class="btn btn--primary gradient-btn" data-navigate="startups">
            <i class="fas fa-search"></i>
            <span>Browse Startups</span>
          </button>
        </div>`;
      qs('[data-navigate]', container)?.addEventListener('click', e => showPage(e.currentTarget.dataset.navigate));
      return;
    }

    const list = document.createElement('ul');
    list.className = 'file-list';
    [...store.watchlist].forEach(id => {
      const li = document.createElement('li');
      li.className = 'file-item';
      li.innerHTML = `<span>${id}</span><button class="btn btn--secondary btn--sm" data-id="${id}">View</button>`;
      qs('button', li).addEventListener('click', () => {
        store.currentAnalysisId = id;
        simulateAnalysis();
      });
      list.appendChild(li);
    });
    container.appendChild(list);
  }

  /* ---------------------------------------------------------------------
     Settings load/save
  --------------------------------------------------------------------- */
  function loadSettings() {
    el('settings-email').value = store.user?.email || '';
    el('settings-role').value  = store.user?.role  || '';
    el('notify-high-risk').checked = !!store.user?.notify_high_risk;
  }

  /* ---------------------------------------------------------------------
     Document ready: bind events
  --------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    /* Hide loading overlay */
    setTimeout(() => {
      el('loading-screen').classList.add('hidden');
    }, 1000);

    /* Landing page navigation */
    qsa('.nav-links .nav-link').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const page = link.dataset.page;
        if (page === 'auth') {
          showView('auth');
        } else {
          showLandingPage(page);
        }
      });
    });

    /* Landing page CTA buttons */
    qsa('[data-page]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const page = btn.dataset.page;
        if (page === 'auth') {
          showView('auth');
        } else {
          showLandingPage(page);
        }
      });
    });

    /* Back to landing from auth */
    el('back-to-landing')?.addEventListener('click', () => {
      showView('landing');
      showLandingPage('landing');
    });

    /* Auth form switch */
    el('show-signup')?.addEventListener('click', e => {
      e.preventDefault();
      el('login-form').classList.remove('active');
      el('signup-form').classList.add('active');
    });

    el('show-login')?.addEventListener('click', e => {
      e.preventDefault();
      el('signup-form').classList.remove('active');
      el('login-form').classList.add('active');
    });

    /* Login */
    el('login-form-element')?.addEventListener('submit', async e => {
      e.preventDefault();
      const data = new FormData(e.target);
      const email = data.get('email');
      const pass  = data.get('password');
      if (!email || !pass) return toast('Please fill all fields', 'error');
      await new Promise(r => setTimeout(r, 800));
      toast('Signed in successfully');
      handleLogin(email, 'analyst');
    });

    /* Signup */
    el('signup-form-element')?.addEventListener('submit', async e => {
      e.preventDefault();
      const d = new FormData(e.target);
      const email = d.get('email');
      const pass  = d.get('password');
      const role  = d.get('role');
      if (!email || !pass || !role) return toast('Please fill all fields', 'error');
      await new Promise(r => setTimeout(r, 800));
      toast('Account created successfully');
      handleLogin(email, role);
    });

    /* Theme + sidebar toggles */
    el('theme-toggle')?.addEventListener('click', updateTheme);
    el('sidebar-toggle')?.addEventListener('click', () => toggleSidebar());

    /* App navigation links */
    qsa('.sidebar .nav-link').forEach(link => link.addEventListener('click', e => {
      e.preventDefault();
      const page = link.dataset.page;
      showPage(page);
      toggleSidebar(false);
    }));

    /* Feature / CTA cards */
    qsa('[data-navigate]').forEach(card => card.addEventListener('click', () => showPage(card.dataset.navigate)));

    /* Upload drag/drop */
    bindDropzone('mca-dropzone',   'mca-input',   store.uploads.mca);
    bindDropzone('pitch-dropzone', 'pitch-input', store.uploads.pitch);

    el('clear-upload')?.addEventListener('click', resetUploadForm);

    /* Upload submit */
    el('upload-form')?.addEventListener('submit', async e => {
      e.preventDefault();
      
      if (!canPerformAnalysis()) {
        toast('No analyses remaining. Please upgrade to Premium.', 'error');
        showPage('subscription');
        return;
      }

      const btn = el('submit-upload');
      const text = qs('.upload-text', btn);
      const spin = qs('.upload-spinner', btn);
      text.classList.add('hidden');
      spin.classList.remove('hidden');
      btn.disabled = true;
      
      await new Promise(r => setTimeout(r, 1500));
      toast('Files uploaded. Analysis started.');
      btn.disabled = false;
      spin.classList.add('hidden');
      text.classList.remove('hidden');
      simulateAnalysis();
    });

    /* Analysis page buttons */
    el('back-to-startups')?.addEventListener('click', () => showPage('startups'));

    el('download-report')?.addEventListener('click', () => {
      if (!store.currentAnalysisId) return toast('No analysis selected', 'error');
      toast('PDF report downloaded successfully');
    });

    el('toggle-watchlist')?.addEventListener('click', () => {
      if (!store.currentAnalysisId) return;
      const id = store.currentAnalysisId;
      if (store.watchlist.has(id)) {
        store.watchlist.delete(id);
        toast('Removed from watchlist');
      } else {
        store.watchlist.add(id);
        toast('Added to watchlist');
      }
      updateWatchlistButton();
      renderWatchlist();
    });

    /* Subscription management */
    el('upgrade-btn')?.addEventListener('click', () => {
      // In a real app, this would integrate with payment processing
      upgradeSubscription();
      toast('Welcome to FinXray Premium! Payment integration would be handled here.');
    });

    /* Settings save */
    el('settings-form')?.addEventListener('submit', e => {
      e.preventDefault();
      store.user.notify_high_risk = el('notify-high-risk').checked;
      toast('Settings saved successfully');
    });

    /* Logout */
    el('logout-btn')?.addEventListener('click', handleLogout);

    /* Initialize with landing page */
    showView('landing');
    showLandingPage('landing');
  });
})();