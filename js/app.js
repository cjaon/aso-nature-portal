/**
 * Footwear Complaints & Store Wiki Application Logic
 * Integrated with ASO Brand, Store Codes & Admin Password Security
 */

let pendingAdminTargetView = null;

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initStoreSelector();
  initFootPainSelector();
  initComplaintForm();
  initCaseTracker();
  initAdminDashboard();
  initAdminAuth();
  updateNavbarAdminStatus();
  renderAnnouncements();
  renderWikiList();

  // Cloud Sync Listener & Background Sync
  window.addEventListener('aso:cloud-synced', () => {
    renderAnnouncements();
    renderWikiList();
    renderAdminCases();
    renderCmsAnnouncements();
  });

  if (window.footwearStore.isCloudConnected()) {
    window.footwearStore.syncFromCloud();
  }
});

// Toast notification helper
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-emerald-600' : (type === 'error' ? 'bg-rose-600' : 'bg-blue-600');
  toast.className = `${bgColor} text-white px-4 py-3 rounded-xl shadow-lg text-sm flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0 animate-fade-in`;
  toast.innerHTML = `
    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove('opacity-0', 'translate-y-2');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0', '-translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Navigation Controller with Admin Password Protection
function initNavigation() {
  const navBtns = document.querySelectorAll('[data-view-target]');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.viewTarget;
      switchView(target);
    });
  });
}

function switchView(viewName) {
  // Security Guard for Admin Cases & CMS
  if (viewName === 'admin-cases' || viewName === 'admin-cms') {
    if (!window.footwearStore.isAdminAuthenticated()) {
      openAdminAuthModal(viewName);
      return;
    }
  }

  // Hide all views
  document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('hidden'));

  // Show target view
  const targetSec = document.getElementById(`view-${viewName}`);
  if (targetSec) {
    targetSec.classList.remove('hidden');
  }

  // Update active states on nav (Desktop Header & Mobile Bottom Dock)
  document.querySelectorAll('[data-view-target]').forEach(btn => {
    const isMobile = btn.classList.contains('mobile-nav-btn');
    const isTarget = (btn.dataset.viewTarget === viewName);

    if (isMobile) {
      if (isTarget) {
        btn.classList.add('text-blue-600', 'font-bold');
        btn.classList.remove('text-slate-500', 'font-medium');
      } else {
        btn.classList.remove('text-blue-600', 'font-bold');
        btn.classList.add('text-slate-500', 'font-medium');
      }
    } else {
      if (isTarget) {
        btn.classList.add('bg-blue-50', 'text-blue-600', 'font-bold');
        btn.classList.remove('text-slate-600');
      } else {
        btn.classList.remove('bg-blue-50', 'text-blue-600', 'font-bold');
        btn.classList.add('text-slate-600');
      }
    }
  });

  // Trigger relevant renders
  if (viewName === 'announcements') renderAnnouncements();
  if (viewName === 'wiki') renderWikiList();
  if (viewName === 'admin-cases') renderAdminCases();
  if (viewName === 'admin-cms') renderCmsAnnouncements();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- Admin Security & Password Module ---
function initAdminAuth() {
  const authForm = document.getElementById('admin-auth-form');
  if (authForm) {
    authForm.addEventListener('submit', handleAdminAuthSubmit);
  }
}

function openAdminAuthModal(targetView = 'admin-cases') {
  pendingAdminTargetView = targetView;
  const modal = document.getElementById('admin-auth-modal');
  const passInput = document.getElementById('admin-auth-password');
  if (passInput) passInput.value = '';
  modal.classList.remove('hidden');
  setTimeout(() => passInput?.focus(), 100);
}

function closeAdminAuthModal() {
  document.getElementById('admin-auth-modal').classList.add('hidden');
  pendingAdminTargetView = null;
}

function handleAdminAuthSubmit(e) {
  e.preventDefault();
  const passInput = document.getElementById('admin-auth-password');
  const enteredPass = passInput.value.trim();

  if (window.footwearStore.verifyAdminPassword(enteredPass)) {
    window.footwearStore.setAdminAuthenticated(true);
    updateNavbarAdminStatus();
    closeAdminAuthModal();
    showToast('管理員身分驗證成功，已解鎖後台！', 'success');

    const nextView = pendingAdminTargetView || 'admin-cases';
    switchView(nextView);
  } else {
    showToast('管理員密碼錯誤，請重新輸入！', 'error');
    passInput.classList.add('ring-2', 'ring-rose-500');
    setTimeout(() => passInput.classList.remove('ring-2', 'ring-rose-500'), 1000);
    passInput.value = '';
    passInput.focus();
  }
}

function adminLogout() {
  window.footwearStore.setAdminAuthenticated(false);
  updateNavbarAdminStatus();
  showToast('已安全登出管理員身分', 'info');
  switchView('announcements');
}

function updateNavbarAdminStatus() {
  const statusContainer = document.getElementById('navbar-admin-status');
  const isAuth = window.footwearStore.isAdminAuthenticated();
  const isCloud = window.footwearStore.isCloudConnected();

  const cloudTag = isCloud 
    ? `<span title="已連線至 Google 試算表雲端同步" class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full cursor-pointer" onclick="openCloudConfigModal()"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>雲端同步中</span>`
    : `<span title="未配置 Google 試算表，處於本地展示模式" class="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full cursor-pointer" onclick="openCloudConfigModal()"><span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>離線模式</span>`;

  if (statusContainer) {
    if (isAuth) {
      statusContainer.innerHTML = `
        <div class="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200 text-xs">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="font-bold">管理員</span>
          <button onclick="openChangePasswordModal()" class="ml-1 text-slate-500 hover:text-slate-800 underline">改密碼</button>
          <span class="text-slate-300">|</span>
          <button onclick="openCloudConfigModal()" class="text-blue-600 hover:text-blue-800 font-semibold underline">☁️ 雲端同步</button>
          <span class="text-slate-300">|</span>
          <button onclick="adminLogout()" class="text-rose-600 hover:text-rose-800 font-semibold underline">登出</button>
        </div>
      `;
    } else {
      statusContainer.innerHTML = `
        <div class="flex items-center gap-2">
          ${cloudTag}
          <button onclick="openAdminAuthModal('admin-cases')" class="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 transition-colors">
            <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
            <span>後台登入</span>
          </button>
        </div>
      `;
    }
  }

  // Mobile Bottom Dock admin indicator dot
  const mobileAdminDot = document.getElementById('mobile-admin-dot');
  if (mobileAdminDot) {
    if (isAuth) {
      mobileAdminDot.className = 'w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse';
      mobileAdminDot.title = '管理員已驗證';
    } else {
      mobileAdminDot.className = 'w-1.5 h-1.5 rounded-full bg-amber-500';
      mobileAdminDot.title = '需密碼驗證';
    }
  }
}

// Change Password Modal Actions
function openChangePasswordModal() {
  document.getElementById('change-password-modal').classList.remove('hidden');
  document.getElementById('cp-old-password').value = '';
  document.getElementById('cp-new-password').value = '';
  document.getElementById('cp-confirm-password').value = '';
  setTimeout(() => document.getElementById('cp-old-password')?.focus(), 100);
}

function closeChangePasswordModal() {
  document.getElementById('change-password-modal').classList.add('hidden');
}

function handleChangePasswordSubmit(e) {
  e.preventDefault();
  const oldPass = document.getElementById('cp-old-password').value.trim();
  const newPass = document.getElementById('cp-new-password').value.trim();
  const confirmPass = document.getElementById('cp-confirm-password').value.trim();

  if (!window.footwearStore.verifyAdminPassword(oldPass)) {
    showToast('目前密碼不正確！', 'error');
    return;
  }

  if (newPass.length < 4) {
    showToast('新密碼長度請至少設定 4 碼以上！', 'error');
    return;
  }

  if (newPass !== confirmPass) {
    showToast('兩次輸入的新密碼不一致！', 'error');
    return;
  }

  window.footwearStore.setAdminPassword(newPass);
  closeChangePasswordModal();
  showToast('管理員通行密碼已成功更新！', 'success');
}

// Google Sheets Cloud Config Modal Actions
function openCloudConfigModal() {
  const modal = document.getElementById('cloud-config-modal');
  const input = document.getElementById('cloud-api-url');
  const banner = document.getElementById('cloud-status-banner');
  const currentUrl = window.footwearStore.getGasUrl();

  if (input) input.value = currentUrl;
  if (banner) {
    if (currentUrl) {
      banner.className = 'p-3 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-800 text-xs flex items-center justify-between';
      banner.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span><b>狀態：</b>已串接 Google 試算表雲端同步</span>
        </div>
        <button type="button" onclick="triggerManualCloudSync()" class="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700">立即拉取同步</button>
      `;
    } else {
      banner.className = 'p-3 rounded-xl border bg-amber-50 border-amber-200 text-amber-800 text-xs flex items-center justify-between';
      banner.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-amber-400"></span>
          <span><b>狀態：</b>本地展示模式（尚未配置 Google 試算表）</span>
        </div>
      `;
    }
  }

  modal?.classList.remove('hidden');
}

function closeCloudConfigModal() {
  document.getElementById('cloud-config-modal')?.classList.add('hidden');
}

async function handleCloudConfigSubmit(e) {
  e.preventDefault();
  const url = document.getElementById('cloud-api-url').value.trim();
  window.footwearStore.setGasUrl(url);
  updateNavbarAdminStatus();

  if (url) {
    showToast('正在測試連線並拉取 Google 試算表資料...', 'info');
    const ok = await window.footwearStore.syncFromCloud();
    if (ok) {
      showToast('成功與 Google 試算表完成同步！', 'success');
      closeCloudConfigModal();
    } else {
      showToast('網址已儲存，但連線測試逾時，請確認 Web App 是否設定為「所有人」存取。', 'warning');
      closeCloudConfigModal();
    }
  } else {
    showToast('已切換為本地離線展示模式', 'info');
    closeCloudConfigModal();
  }
}

async function triggerManualCloudSync() {
  showToast('正在向 Google 試算表同步最新資料...', 'info');
  const ok = await window.footwearStore.syncFromCloud();
  if (ok) {
    showToast('已成功載入 Google 試算表最新資料！', 'success');
    openCloudConfigModal();
  } else {
    showToast('同步失敗，請檢查網路連線或 Web App 狀態', 'error');
  }
}

// --- Store Code & Name Selector ---
function initStoreSelector() {
  const storeSelect = document.getElementById('complaint-store-select');
  const codeInput = document.getElementById('complaint-store-code');
  const nameInput = document.getElementById('complaint-store-name');

  if (!storeSelect || !codeInput || !nameInput) return;

  const stores = [...(window.ASO_STORES || [])];

  // 台灣縣市由北到南標準排序順序
  const regionOrder = [
    '台北市', '新北市', '基隆市', '桃園市', '新竹市', 
    '台中市', '彰化縣', '嘉義市', '台南市', '高雄市', '屏東縣'
  ];

  // 依照縣市分組建立門市選單 (含各縣市標籤與間數，對齊店代號與名稱，無阿瘦前綴)
  let selectHtml = `<option value="">-- 請選擇門市 (依縣市分區 / 全台共${stores.length}間) --</option>`;
  
  const usedRegions = new Set();
  regionOrder.forEach(region => {
    const regionStores = stores.filter(s => s.region === region).sort((a, b) => (a.code || '').localeCompare(b.code || ''));
    if (regionStores.length > 0) {
      usedRegions.add(region);
      selectHtml += `<optgroup label="📍 ${region} (${regionStores.length}間)">`;
      selectHtml += regionStores.map(s => {
        const cleanName = (s.name || '').replace(/^阿瘦\s*/, '');
        const isSelected = (s.code === '2009') ? 'selected' : '';
        return `<option value="${s.code}" data-name="${cleanName}" ${isSelected}>${s.code}　${cleanName}</option>`;
      }).join('');
      selectHtml += `</optgroup>`;
    }
  });

  // 其餘未在預設列表中的區域 (防呆備援)
  stores.forEach(s => {
    if (s.region && !usedRegions.has(s.region)) {
      usedRegions.add(s.region);
      const otherStores = stores.filter(os => os.region === s.region).sort((a, b) => (a.code || '').localeCompare(b.code || ''));
      selectHtml += `<optgroup label="📍 ${s.region} (${otherStores.length}間)">`;
      selectHtml += otherStores.map(os => {
        const cleanName = (os.name || '').replace(/^阿瘦\s*/, '');
        return `<option value="${os.code}" data-name="${cleanName}">${os.code}　${cleanName}</option>`;
      }).join('');
      selectHtml += `</optgroup>`;
    }
  });

  storeSelect.innerHTML = selectHtml;

  // Set default initial values
  if (codeInput && !codeInput.value) codeInput.value = '2009';
  if (nameInput && (!nameInput.value || nameInput.value.includes('阿瘦'))) nameInput.value = '忠孝門市';

  // Sync on select change
  storeSelect.addEventListener('change', () => {
    const selectedCode = storeSelect.value;
    const selectedOption = storeSelect.options[storeSelect.selectedIndex];
    if (selectedCode) {
      codeInput.value = selectedCode;
      nameInput.value = selectedOption?.dataset.name || '';
    } else {
      codeInput.value = '';
      nameInput.value = '';
    }
  });

  // Populate Admin Store Filter (依縣市分組，便於主管跨店篩選)
  const adminStoreFilter = document.getElementById('admin-store-filter');
  if (adminStoreFilter) {
    let filterHtml = `<option value="all">全部門市 (共${stores.length}間)</option>`;
    regionOrder.forEach(region => {
      const regionStores = stores.filter(s => s.region === region).sort((a, b) => (a.code || '').localeCompare(b.code || ''));
      if (regionStores.length > 0) {
        filterHtml += `<optgroup label="📍 ${region} (${regionStores.length}間)">`;
        filterHtml += regionStores.map(s => {
          const cleanName = (s.name || '').replace(/^阿瘦\s*/, '');
          return `<option value="${s.code}">${s.code}　${cleanName}</option>`;
        }).join('');
        filterHtml += `</optgroup>`;
      }
    });
    adminStoreFilter.innerHTML = filterHtml;
    adminStoreFilter.addEventListener('change', renderAdminCases);
  }
}

// --- 1. Announcements Module ---
let currentAnnFilter = 'all';

function renderAnnouncements() {
  const container = document.getElementById('announcements-grid');
  if (!container) return;

  let list = window.footwearStore.getAnnouncements();
  if (currentAnnFilter !== 'all') {
    list = list.filter(item => item.category === currentAnnFilter);
  }

  const query = document.getElementById('announcement-search')?.value.trim().toLowerCase() || '';
  if (query) {
    list = list.filter(item => 
      item.title.toLowerCase().includes(query) || 
      item.summary.toLowerCase().includes(query) ||
      item.author.toLowerCase().includes(query)
    );
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400">
        <p>查無符合分類或關鍵字的公告項目</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(item => `
    <div class="bg-white rounded-2xl border ${item.isPinned ? 'border-blue-300 ring-2 ring-blue-50' : 'border-slate-200'} p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between gap-2 mb-3">
          <div class="flex items-center gap-2">
            ${item.isPinned ? '<span class="px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-bold">置頂</span>' : ''}
            <span class="px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeClass(item.category)}">
              ${item.category}
            </span>
          </div>
          <span class="text-xs text-slate-400 font-mono">${item.date}</span>
        </div>

        <h3 class="font-bold text-slate-900 text-base mb-2 hover:text-blue-600 cursor-pointer transition-colors" onclick="openAnnouncementModal('${item.id}')">
          ${item.title}
        </h3>
        <p class="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed">
          ${item.summary}
        </p>
      </div>

      <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div class="flex items-center gap-1 text-slate-500">
          <span>發布人：</span>
          <span class="font-medium text-slate-700">${item.author}</span>
        </div>
        <button onclick="openAnnouncementModal('${item.id}')" class="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1">
          閱讀全文 →
        </button>
      </div>
    </div>
  `).join('');
}

function getCategoryBadgeClass(cat) {
  switch (cat) {
    case '製程公告': return 'bg-amber-100 text-amber-800 border border-amber-200';
    case '3D取模規範': return 'bg-purple-100 text-purple-800 border border-purple-200';
    case '門市服務SOP': return 'bg-blue-100 text-blue-800 border border-blue-200';
    default: return 'bg-slate-100 text-slate-700';
  }
}

function filterAnnouncements(category, btn) {
  currentAnnFilter = category;
  document.querySelectorAll('.ann-filter-btn').forEach(b => {
    b.classList.remove('bg-slate-900', 'text-white');
    b.classList.add('bg-slate-100', 'text-slate-600');
  });
  if (btn) {
    btn.classList.add('bg-slate-900', 'text-white');
    btn.classList.remove('bg-slate-100', 'text-slate-600');
  }
  renderAnnouncements();
}

function openAnnouncementModal(id) {
  const item = window.footwearStore.getAnnouncements().find(a => a.id === id);
  if (!item) return;

  const modal = document.getElementById('announcement-modal');
  document.getElementById('modal-ann-title').textContent = item.title;
  document.getElementById('modal-ann-meta').innerHTML = `
    <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${getCategoryBadgeClass(item.category)}">${item.category}</span>
    <span class="text-slate-400">|</span>
    <span class="text-slate-600">發布單位：<b>${item.author}</b></span>
    <span class="text-slate-400">|</span>
    <span class="text-slate-500 font-mono">${item.date}</span>
  `;
  document.getElementById('modal-ann-body').innerHTML = item.content.replace(/\n/g, '<br>');

  modal.classList.remove('hidden');
}

function closeAnnouncementModal() {
  document.getElementById('announcement-modal').classList.add('hidden');
}

// --- 2. Store Wiki Module ---
let currentWikiFilter = 'all';
let currentProcessorFilter = 'all';

function renderWikiList() {
  const container = document.getElementById('wiki-grid');
  if (!container) return;

  let list = window.footwearStore.getWikiArticles();

  if (currentWikiFilter !== 'all') {
    list = list.filter(w => w.category === currentWikiFilter);
  }

  if (currentProcessorFilter !== 'all') {
    list = list.filter(w => w.processor.includes(currentProcessorFilter) || (w.secondaryProcessor && w.secondaryProcessor.includes(currentProcessorFilter)));
  }

  const query = document.getElementById('wiki-search')?.value.trim().toLowerCase() || '';
  if (query) {
    list = list.filter(w => 
      w.title.toLowerCase().includes(query) ||
      w.shoeModel.toLowerCase().includes(query) ||
      w.symptom.toLowerCase().includes(query) ||
      w.solution.toLowerCase().includes(query) ||
      w.processor.toLowerCase().includes(query)
    );
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400">
        <p>查無符合關鍵字或處理人的 Wiki 案例紀錄</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(item => `
    <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between gap-2 mb-2.5">
          <div class="flex items-center gap-2">
            <span class="font-mono text-xs font-bold text-slate-400">#${item.id}</span>
            <span class="px-2 py-0.5 rounded text-xs font-semibold ${getWikiCategoryBadgeClass(item.category)}">
              ${item.category}
            </span>
          </div>
          <span class="text-xs text-slate-400">閱覽 ${item.views || 0} 次</span>
        </div>

        <h3 class="font-bold text-slate-900 text-base mb-1.5 hover:text-blue-600 cursor-pointer" onclick="openWikiModal('${item.id}')">
          ${item.title}
        </h3>

        <div class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium mb-3">
          <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
          </svg>
          <span>鞋款：${item.shoeModel}</span>
        </div>

        <div class="space-y-2 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div>
            <span class="font-semibold text-slate-700">【問題現象】</span>
            <p class="line-clamp-2 text-slate-600 mt-0.5">${item.symptom}</p>
          </div>
          <div>
            <span class="font-semibold text-slate-700">【處置精要】</span>
            <p class="line-clamp-2 text-emerald-700 font-medium mt-0.5">${item.solution}</p>
          </div>
        </div>
      </div>

      <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div class="flex items-center gap-1">
          <span class="text-slate-400">處理人：</span>
          <span class="font-semibold ${getProcessorColor(item.processor)}">${item.processor}</span>
          ${item.secondaryProcessor ? `<span class="text-slate-300">/</span><span class="text-slate-600">${item.secondaryProcessor}</span>` : ''}
        </div>
        <button onclick="openWikiModal('${item.id}')" class="text-blue-600 font-bold hover:underline">
          查閱詳情
        </button>
      </div>
    </div>
  `).join('');
}

function getWikiCategoryBadgeClass(cat) {
  switch (cat) {
    case '鞋墊做錯': return 'bg-red-100 text-red-800 border border-red-200';
    case '尺寸不符': return 'bg-amber-100 text-amber-800 border border-amber-200';
    case '穿著不適': return 'bg-blue-100 text-blue-800 border border-blue-200';
    default: return 'bg-slate-100 text-slate-700';
  }
}

function getProcessorColor(proc) {
  if (proc.includes('正全')) return 'text-amber-700 font-bold';
  if (proc.includes('顧問')) return 'text-purple-700 font-bold';
  if (proc.includes('Jason')) return 'text-blue-700 font-bold';
  return 'text-slate-700 font-medium';
}

function filterWikiCategory(cat, btn) {
  currentWikiFilter = cat;
  document.querySelectorAll('.wiki-cat-btn').forEach(b => {
    b.classList.remove('bg-blue-600', 'text-white');
    b.classList.add('bg-slate-100', 'text-slate-600');
  });
  if (btn) {
    btn.classList.add('bg-blue-600', 'text-white');
    btn.classList.remove('bg-slate-100', 'text-slate-600');
  }
  renderWikiList();
}

function filterWikiProcessor(proc, btn) {
  currentProcessorFilter = proc;
  document.querySelectorAll('.wiki-proc-btn').forEach(b => {
    b.classList.remove('bg-slate-900', 'text-white');
    b.classList.add('bg-slate-100', 'text-slate-600');
  });
  if (btn) {
    btn.classList.add('bg-slate-900', 'text-white');
    btn.classList.remove('bg-slate-100', 'text-slate-600');
  }
  renderWikiList();
}

function openWikiModal(id) {
  const item = window.footwearStore.getWikiArticles().find(w => w.id === id);
  if (!item) return;

  window.footwearStore.incrementWikiViews(id);

  const modal = document.getElementById('wiki-modal');
  document.getElementById('modal-wiki-id').textContent = '#' + item.id;
  document.getElementById('modal-wiki-title').textContent = item.title;
  document.getElementById('modal-wiki-category').innerHTML = `
    <span class="px-2.5 py-0.5 rounded text-xs font-semibold ${getWikiCategoryBadgeClass(item.category)}">${item.category}</span>
  `;
  document.getElementById('modal-wiki-shoe').textContent = item.shoeModel;
  document.getElementById('modal-wiki-processor').innerHTML = `
    <span class="font-bold text-slate-800">${item.processor}</span>
    ${item.secondaryProcessor ? ` / <span class="text-slate-600">${item.secondaryProcessor}</span>` : ''}
  `;
  document.getElementById('modal-wiki-symptom').textContent = item.symptom;
  document.getElementById('modal-wiki-rootcause').textContent = item.rootCause;
  document.getElementById('modal-wiki-solution').innerHTML = item.solution.replace(/\n/g, '<br>');
  document.getElementById('modal-wiki-prevention').textContent = item.preventionNote || '無特定註記';

  modal.classList.remove('hidden');
}

function closeWikiModal() {
  document.getElementById('wiki-modal').classList.add('hidden');
}

// --- 3. Foot Pain Selector & Complaint Submission ---
let selectedPainPoints = [];

function initFootPainSelector() {
  const chips = document.querySelectorAll('.hotspot-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const val = chip.dataset.painPoint;
      if (selectedPainPoints.includes(val)) {
        selectedPainPoints = selectedPainPoints.filter(p => p !== val);
        chip.classList.remove('selected');
      } else {
        selectedPainPoints.push(val);
        chip.classList.add('selected');
      }
      updatePainPointDisplay();
      updateWikiSuggestions();
    });
  });
}

function updatePainPointDisplay() {
  const display = document.getElementById('selected-pain-display');
  if (!display) return;
  if (selectedPainPoints.length === 0) {
    display.innerHTML = '<span class="text-slate-400 italic">尚未選取痛點部位</span>';
  } else {
    display.innerHTML = selectedPainPoints.map(p => `
      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-medium">
        ● ${p}
      </span>
    `).join(' ');
  }
}

// Live Wiki suggestions when filling out complaint form
function updateWikiSuggestions() {
  const container = document.getElementById('form-wiki-suggestions');
  if (!container) return;

  const category = document.getElementById('complaint-category')?.value || '';
  const shoeModel = document.getElementById('complaint-shoe')?.value || '';
  
  const wikiList = window.footwearStore.getWikiArticles();
  const matched = wikiList.filter(w => {
    if (category && w.category === category) return true;
    if (shoeModel && w.shoeModel.toLowerCase().includes(shoeModel.toLowerCase())) return true;
    return false;
  }).slice(0, 2);

  if (matched.length === 0) {
    container.innerHTML = `
      <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-xs text-center">
        根據您選擇的分類與鞋款，系統將在此即時提示過往 Wiki 解法供門市參考。
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="space-y-2">
        <div class="text-xs font-bold text-blue-700 flex items-center gap-1">
          <span>💡 推薦參考過往 Wiki 解法：</span>
        </div>
        ${matched.map(w => `
          <div class="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 text-xs hover:bg-blue-100/70 cursor-pointer transition-colors" onclick="openWikiModal('${w.id}')">
            <div class="font-bold text-slate-800">${w.title}</div>
            <div class="text-[11px] text-slate-500 mt-0.5">處理人：<b>${w.processor}</b> ｜ 解法：${w.category}</div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

function initComplaintForm() {
  const form = document.getElementById('complaint-submission-form');
  if (!form) return;

  document.getElementById('complaint-category')?.addEventListener('change', updateWikiSuggestions);
  document.getElementById('complaint-shoe')?.addEventListener('input', updateWikiSuggestions);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const storeCode = document.getElementById('complaint-store-code').value.trim() || '2009';
    const storeName = document.getElementById('complaint-store-name').value.trim() || '忠孝門市';
    const customerName = document.getElementById('complaint-name').value.trim();
    const phone = document.getElementById('complaint-phone').value.trim();
    const email = document.getElementById('complaint-email').value.trim();
    const orderNo = document.getElementById('complaint-order').value.trim();
    const category = document.getElementById('complaint-category').value;
    const priority = document.getElementById('complaint-priority').value;
    const shoeModel = document.getElementById('complaint-shoe').value.trim();
    const shoeSize = document.getElementById('complaint-size').value.trim();
    const wearDays = document.getElementById('complaint-days').value;
    const customerNotes = document.getElementById('complaint-notes').value.trim();

    if (!customerName || !phone || !orderNo || !category || !customerNotes) {
      showToast('請完整填寫必填欄位與事由描述！', 'error');
      return;
    }

    // Determine initial auto assignment suggestion
    let defaultAssigned = '';
    let defaultAction = '';
    if (category === '鞋墊做錯') {
      defaultAssigned = '正全義肢鞋墊製造商';
      defaultAction = '急件免費全新品重製';
    } else if (category === '尺寸不符') {
      defaultAssigned = '門市技師';
      defaultAction = '現場修磨微調';
    } else if (category === '穿著不適') {
      defaultAssigned = '專業顧問';
      defaultAction = '回店重測足壓調校';
    }

    const newCase = window.footwearStore.createComplaint({
      storeCode,
      storeName,
      customerName,
      phone,
      email,
      orderNo,
      category,
      priority,
      shoeModel,
      shoeSize,
      wearDays,
      painPoints: [...selectedPainPoints],
      customerNotes,
      assignedTo: defaultAssigned,
      actionPlan: defaultAction
    });

    // Reset Form
    form.reset();
    selectedPainPoints = [];
    document.querySelectorAll('.hotspot-chip').forEach(c => c.classList.remove('selected'));
    updatePainPointDisplay();
    updateWikiSuggestions();

    // Show Success Modal with Case ID
    document.getElementById('submitted-case-id').textContent = newCase.id;
    document.getElementById('submit-success-modal').classList.remove('hidden');
    showToast(`客訴案件 ${newCase.id} 已成功建檔！`, 'success');
  });
}

function closeSuccessModal() {
  document.getElementById('submit-success-modal').classList.add('hidden');
}

function jumpToTrackCase(caseId) {
  closeSuccessModal();
  switchView('track-case');
  document.getElementById('track-search-input').value = caseId;
  executeTrackSearch();
}

// --- 4. Case Tracking Module ---
function initCaseTracker() {
  const btn = document.getElementById('track-search-btn');
  const input = document.getElementById('track-search-input');
  if (btn && input) {
    btn.addEventListener('click', executeTrackSearch);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') executeTrackSearch();
    });
  }
}

function executeTrackSearch() {
  const query = document.getElementById('track-search-input')?.value.trim();
  const resultCard = document.getElementById('track-result-card');
  const emptyCard = document.getElementById('track-empty-state');
  if (!query || !resultCard) return;

  const found = window.footwearStore.getComplaintById(query);
  if (!found) {
    emptyCard.classList.remove('hidden');
    resultCard.classList.add('hidden');
    return;
  }

  emptyCard.classList.add('hidden');
  resultCard.classList.remove('hidden');

  // Fill in Case Information
  document.getElementById('track-case-no').textContent = found.id;
  document.getElementById('track-customer-name').textContent = found.customerName + ' 貴賓';
  document.getElementById('track-store-info').textContent = `${found.storeCode || '2009'} ${found.storeName || '門市'}`;
  document.getElementById('track-order-no').textContent = found.orderNo;
  document.getElementById('track-category-badge').textContent = found.category;
  document.getElementById('track-category-badge').className = `px-2.5 py-0.5 rounded-full text-xs font-bold ${getWikiCategoryBadgeClass(found.category)}`;
  document.getElementById('track-priority-badge').textContent = found.priority;
  document.getElementById('track-shoe-info').textContent = `${found.shoeModel || '自備鞋款'} (${found.shoeSize || '未填寫尺碼'})`;
  document.getElementById('track-created-at').textContent = found.createdAt;
  document.getElementById('track-notes').textContent = found.customerNotes;

  // Pain Points
  const painPointsContainer = document.getElementById('track-pain-points');
  if (found.painPoints && found.painPoints.length > 0) {
    painPointsContainer.innerHTML = found.painPoints.map(p => `
      <span class="px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-xs font-medium">● ${p}</span>
    `).join(' ');
  } else {
    painPointsContainer.innerHTML = '<span class="text-slate-400 text-xs">無特定部位勾選</span>';
  }

  // Processor & Action
  document.getElementById('track-processor-name').textContent = found.assignedTo || '客服主管指派中';
  document.getElementById('track-action-plan').textContent = found.actionPlan || '診斷方案研擬中';
  document.getElementById('track-official-diagnosis').innerHTML = found.diagnosisLog 
    ? found.diagnosisLog.replace(/\n/g, '<br>') 
    : '<span class="text-slate-400 italic">技術團隊目前正在審閱 3D 取模與鞋況資料，稍後將更新診斷細節。</span>';

  // Delivery Info
  document.getElementById('track-delivery-method').textContent = found.deliveryType || '待確認';
  document.getElementById('track-tracking-code').textContent = found.trackingCode || '待物流或門市登錄單號';

  // Timeline Step calculation
  renderTrackingTimeline(found.status);
}

function renderTrackingTimeline(status) {
  const steps = [
    { key: 'intake', label: '1. 案件受理', desc: '門市建檔完成' },
    { key: 'diagnose', label: '2. 診斷處置中', desc: '指派正全/顧問處理' },
    { key: 'fulfill', label: '3. 完工待交件', desc: '門市試穿/黑貓寄出' },
    { key: 'followup', label: '4. 售後追蹤與結案', desc: 'D+3關懷/D+14結案' }
  ];

  let currentIdx = 0;
  if (status === '待受理') currentIdx = 0;
  else if (status === '診斷中' || status === '正全重製中' || status === '門市微調中') currentIdx = 1;
  else if (status === '待交件') currentIdx = 2;
  else if (status === '售後追蹤期' || status === '已結案') currentIdx = 3;

  const container = document.getElementById('tracking-timeline-steps');
  if (!container) return;

  container.innerHTML = steps.map((step, idx) => {
    let dotClass = 'bg-slate-300 text-slate-600';
    let textClass = 'text-slate-400';

    if (idx < currentIdx) {
      dotClass = 'bg-emerald-600 text-white font-bold';
      textClass = 'text-emerald-700 font-bold';
    } else if (idx === currentIdx) {
      dotClass = 'bg-blue-600 text-white font-bold ring-4 ring-blue-100';
      textClass = 'text-blue-700 font-bold';
    }

    return `
      <div class="flex-1 relative text-center px-1">
        <div class="w-7 h-7 sm:w-8 sm:h-8 mx-auto rounded-full flex items-center justify-center text-xs mb-1.5 sm:mb-2 transition-all ${dotClass}">
          ${idx < currentIdx ? '✓' : (idx + 1)}
        </div>
        <div class="text-[10px] sm:text-xs font-semibold ${textClass} leading-tight">${step.label}</div>
        <div class="text-[9px] sm:text-[11px] text-slate-400 mt-0.5 leading-tight">${step.desc}</div>
      </div>
    `;
  }).join('');
}

// --- 5. Admin Dashboard Module ---
let currentAdminStatus = 'all';

function initAdminDashboard() {
  document.getElementById('admin-case-search')?.addEventListener('input', renderAdminCases);
  document.getElementById('admin-assigned-filter')?.addEventListener('change', renderAdminCases);
}

function renderAdminCases() {
  const list = window.footwearStore.getComplaints();
  updateAdminMetrics(list);

  let filtered = [...list];
  if (currentAdminStatus !== 'all') {
    filtered = filtered.filter(c => c.status === currentAdminStatus);
  }

  const assignedFilter = document.getElementById('admin-assigned-filter')?.value;
  if (assignedFilter && assignedFilter !== 'all') {
    filtered = filtered.filter(c => c.assignedTo.includes(assignedFilter));
  }

  const storeFilter = document.getElementById('admin-store-filter')?.value;
  if (storeFilter && storeFilter !== 'all') {
    filtered = filtered.filter(c => c.storeCode === storeFilter);
  }

  const query = document.getElementById('admin-case-search')?.value.trim().toLowerCase() || '';
  if (query) {
    filtered = filtered.filter(c => 
      c.id.toLowerCase().includes(query) ||
      c.customerName.toLowerCase().includes(query) ||
      c.orderNo.toLowerCase().includes(query) ||
      c.shoeModel.toLowerCase().includes(query) ||
      (c.storeName && c.storeName.toLowerCase().includes(query)) ||
      (c.storeCode && c.storeCode.toLowerCase().includes(query)) ||
      c.customerNotes.toLowerCase().includes(query)
    );
  }

  const tbody = document.getElementById('admin-cases-table-body');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="py-10 text-center text-slate-400">
          查無符合狀態或條件的客訴案件
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(item => `
    <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100 text-xs">
      <td class="py-3.5 px-4 font-mono font-bold text-slate-900">
        <a href="javascript:void(0)" onclick="openCaseDrawer('${item.id}')" class="text-blue-600 hover:underline">
          ${item.id}
        </a>
      </td>
      <td class="py-3.5 px-4">
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium font-mono">
          ${item.storeCode || '2009'}
        </span>
        <div class="text-[11px] text-slate-500 mt-0.5">${item.storeName || '門市'}</div>
      </td>
      <td class="py-3.5 px-4">
        <div class="font-bold text-slate-800">${item.customerName}</div>
        <div class="text-[11px] text-slate-400 font-mono">${item.orderNo}</div>
      </td>
      <td class="py-3.5 px-4">
        <span class="px-2 py-0.5 rounded text-xs font-semibold ${getWikiCategoryBadgeClass(item.category)}">
          ${item.category}
        </span>
      </td>
      <td class="py-3.5 px-4">
        <span class="px-2 py-0.5 rounded-full text-xs font-bold ${getStatusBadgeClass(item.status)}">
          ● ${item.status}
        </span>
      </td>
      <td class="py-3.5 px-4 font-medium">
        <span class="${getProcessorColor(item.assignedTo)}">
          ${item.assignedTo || '<span class="text-slate-400 italic">待指派</span>'}
        </span>
      </td>
      <td class="py-3.5 px-4 text-slate-500 font-mono">
        ${item.createdAt}
      </td>
      <td class="py-3.5 px-4 text-right space-x-2">
        <button onclick="openCaseDrawer('${item.id}')" class="px-2.5 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold transition-colors">
          處置抽屜
        </button>
      </td>
    </tr>
  `).join('');
}

function updateAdminMetrics(list) {
  const total = list.length;
  const pending = list.filter(c => c.status === '待受理' || c.status === '診斷中').length;
  const inProgress = list.filter(c => c.status === '正全重製中' || c.status === '門市微調中' || c.status === '待交件').length;
  const tracking = list.filter(c => c.status === '售後追蹤期').length;
  const closed = list.filter(c => c.status === '已結案').length;

  document.getElementById('metric-total')?.replaceChildren(total);
  document.getElementById('metric-pending')?.replaceChildren(pending);
  document.getElementById('metric-in-progress')?.replaceChildren(inProgress);
  document.getElementById('metric-tracking')?.replaceChildren(tracking);
  document.getElementById('metric-closed')?.replaceChildren(closed);
}

function getStatusBadgeClass(status) {
  switch (status) {
    case '待受理': return 'bg-slate-100 text-slate-700';
    case '診斷中': return 'bg-purple-100 text-purple-700';
    case '正全重製中': return 'bg-amber-100 text-amber-800';
    case '門市微調中': return 'bg-orange-100 text-orange-800';
    case '待交件': return 'bg-cyan-100 text-cyan-800';
    case '售後追蹤期': return 'bg-blue-100 text-blue-800';
    case '已結案': return 'bg-emerald-100 text-emerald-800';
    default: return 'bg-slate-100 text-slate-700';
  }
}

function filterAdminStatus(status, btn) {
  currentAdminStatus = status;
  document.querySelectorAll('.admin-status-tab').forEach(b => {
    b.classList.remove('border-blue-600', 'text-blue-600', 'font-bold');
    b.classList.add('border-transparent', 'text-slate-500');
  });
  if (btn) {
    btn.classList.add('border-blue-600', 'text-blue-600', 'font-bold');
    btn.classList.remove('border-transparent', 'text-slate-500');
  }
  renderAdminCases();
}

// Case Drawer (Admin detailed handling modal)
let activeDrawerCaseId = null;

function openCaseDrawer(caseId) {
  if (!window.footwearStore.isAdminAuthenticated()) {
    openAdminAuthModal('admin-cases');
    return;
  }

  const item = window.footwearStore.getComplaintById(caseId);
  if (!item) return;
  activeDrawerCaseId = caseId;

  const drawer = document.getElementById('case-drawer-modal');
  document.getElementById('drawer-case-id').textContent = item.id;
  document.getElementById('drawer-store-info').textContent = `${item.storeCode || '2009'} ${item.storeName || '門市'}`;
  document.getElementById('drawer-customer-name').textContent = item.customerName;
  document.getElementById('drawer-customer-phone').textContent = item.phone;
  document.getElementById('drawer-order-no').textContent = item.orderNo;
  document.getElementById('drawer-shoe-model').textContent = `${item.shoeModel || '無'} (${item.shoeSize || '無'})`;
  document.getElementById('drawer-wear-days').textContent = item.wearDays || '未填寫';
  document.getElementById('drawer-customer-notes').textContent = item.customerNotes;

  // Pain Points
  const ppCont = document.getElementById('drawer-pain-points');
  if (item.painPoints && item.painPoints.length > 0) {
    ppCont.innerHTML = item.painPoints.map(p => `
      <span class="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-xs font-medium">● ${p}</span>
    `).join(' ');
  } else {
    ppCont.innerHTML = '<span class="text-slate-400 text-xs">無</span>';
  }

  // Editable Fields
  document.getElementById('drawer-status').value = item.status;
  document.getElementById('drawer-assigned').value = item.assignedTo || '正全義肢鞋墊製造商';
  document.getElementById('drawer-action-plan').value = item.actionPlan || '急件免費全新品重製';
  document.getElementById('drawer-work-order').value = item.workOrderNo || '';
  document.getElementById('drawer-diagnosis-log').value = item.diagnosisLog || '';
  document.getElementById('drawer-delivery-type').value = item.deliveryType || '黑貓宅配到府';
  document.getElementById('drawer-tracking-code').value = item.trackingCode || '';
  document.getElementById('drawer-d3-log').value = item.d3Log || '';
  document.getElementById('drawer-d14-rating').value = item.d14Rating || 5;
  document.getElementById('drawer-d14-log').value = item.d14Log || '';
  document.getElementById('drawer-save-wiki').checked = !!item.isSavedToWiki;

  drawer.classList.remove('hidden');
}

function closeCaseDrawer() {
  document.getElementById('case-drawer-modal').classList.add('hidden');
  activeDrawerCaseId = null;
}

function saveCaseDrawerUpdates() {
  if (!activeDrawerCaseId) return;

  const status = document.getElementById('drawer-status').value;
  const assignedTo = document.getElementById('drawer-assigned').value;
  const actionPlan = document.getElementById('drawer-action-plan').value;
  const workOrderNo = document.getElementById('drawer-work-order').value.trim();
  const diagnosisLog = document.getElementById('drawer-diagnosis-log').value.trim();
  const deliveryType = document.getElementById('drawer-delivery-type').value;
  const trackingCode = document.getElementById('drawer-tracking-code').value.trim();
  const d3Log = document.getElementById('drawer-d3-log').value.trim();
  const d14Rating = parseInt(document.getElementById('drawer-d14-rating').value, 10);
  const d14Log = document.getElementById('drawer-d14-log').value.trim();
  const isSavedToWiki = document.getElementById('drawer-save-wiki').checked;

  const currentCase = window.footwearStore.getComplaintById(activeDrawerCaseId);

  // If newly checked "save to wiki", create a Wiki entry
  if (isSavedToWiki && !currentCase.isSavedToWiki) {
    window.footwearStore.saveWikiArticle({
      title: `${currentCase.shoeModel || '客製鞋墊'} ${currentCase.category} 處置方案紀錄 (${currentCase.storeName || '門市'})`,
      category: currentCase.category,
      processor: assignedTo,
      secondaryProcessor: 'Jason 覆核',
      shoeModel: currentCase.shoeModel || '客製鞋墊',
      symptom: currentCase.customerNotes,
      rootCause: diagnosisLog || '經技師調閱 3D 取模與實體檢視判定。',
      solution: `【核定方案】：${actionPlan}\n【工單資訊】：${workOrderNo}\n【追蹤成果】：${d14Log || '客戶反饋滿意度良好結案。'}`,
      preventionNote: `門市（${currentCase.storeName || '阿瘦'}）於下次類似鞋款取模時請參閱此標準流程。`
    });
    showToast('案件已同步沉澱收錄至【門市 Wiki 知識庫】！', 'success');
  }

  window.footwearStore.updateComplaint(activeDrawerCaseId, {
    status,
    assignedTo,
    actionPlan,
    workOrderNo,
    diagnosisLog,
    deliveryType,
    trackingCode,
    d3Log,
    d14Rating,
    d14Log,
    isSavedToWiki
  });

  showToast(`案件 ${activeDrawerCaseId} 更新成功！`, 'success');
  closeCaseDrawer();
  renderAdminCases();
}

function printWorkOrder() {
  if (!activeDrawerCaseId) return;
  const item = window.footwearStore.getComplaintById(activeDrawerCaseId);
  if (!item) return;

  const printArea = document.getElementById('printable-work-order');
  if (!printArea) return;

  printArea.innerHTML = `
    <div class="p-8 border-2 border-black rounded-lg max-w-2xl mx-auto my-4 text-black bg-white">
      <div class="flex items-center justify-between border-b-2 border-black pb-4 mb-4">
        <div class="flex items-center gap-3">
          <img src="assets/aso_nature_logo.png" alt="ASO+ NATURE 足醫中心" class="h-12 rounded object-contain border border-slate-200" onerror="this.style.display='none'">
          <div>
            <h1 class="text-xl font-bold">ASO+ NATURE 足醫中心 × 正全義肢鞋墊製造商</h1>
            <p class="text-xs text-slate-700">3D 列印自然足鞋墊客訴處置/重製派工單 (主管審定：Jason)</p>
          </div>
        </div>
        <div class="text-right">
          <span class="text-xs font-mono font-bold block">案號：${item.id}</span>
          <span class="text-xs bg-slate-100 px-2 py-0.5 rounded border border-black">${item.storeCode || '2009'} ${item.storeName || '門市'}</span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 text-sm mb-4 border-b border-black pb-4">
        <div><b>受理門市：</b> ${item.storeCode || '2009'} ${item.storeName || '門市'}</div>
        <div><b>原訂單編號：</b> ${item.orderNo}</div>
        <div><b>客戶姓名：</b> ${item.customerName} (${item.phone})</div>
        <div><b>搭配鞋款：</b> ${item.shoeModel} (${item.shoeSize})</div>
        <div><b>客訴類別：</b> ${item.category} (優先級：${item.priority})</div>
        <div><b>主要處理人：</b> ${item.assignedTo}</div>
        <div class="col-span-2"><b>核定處置手段：</b> ${item.actionPlan}</div>
      </div>

      <div class="text-sm mb-4 border-b border-black pb-4">
        <div class="font-bold mb-1">【客訴主訴與足部痛點】</div>
        <p class="mb-2 text-xs leading-relaxed">${item.customerNotes}</p>
        <div class="text-xs">痛點勾選：${(item.painPoints || []).join('、 ') || '無'}</div>
      </div>

      <div class="text-sm mb-4 border-b border-black pb-4">
        <div class="font-bold mb-1">【技術診斷與製程要求】</div>
        <p class="text-xs whitespace-pre-line leading-relaxed">${item.diagnosisLog || '無補充'}</p>
      </div>

      <div class="text-sm mb-4 border-b border-black pb-4">
        <div class="font-bold mb-1">【出廠 QC 品管覆驗簽章】</div>
        <div class="grid grid-cols-3 gap-2 text-xs mt-3">
          <div class="border border-black p-2 h-16">卡尺高度覆核：</div>
          <div class="border border-black p-2 h-16">原鞋樣板套量：</div>
          <div class="border border-black p-2 h-16">品管員簽章：</div>
        </div>
      </div>

      <div class="flex justify-between text-xs text-slate-600">
        <span>立案時間：${item.createdAt}</span>
        <span>列印日期：${new Date().toLocaleString('zh-TW')}</span>
      </div>
    </div>
  `;

  window.print();
}

// Export complaints to CSV with Store fields
function exportComplaintsCsv() {
  const list = window.footwearStore.getComplaints();
  if (list.length === 0) {
    showToast('目前無客訴資料可匯出', 'info');
    return;
  }

  const headers = ['案件編號', '門市代號', '門市名稱', '客戶姓名', '電話', '原訂單號', '客訴分類', '優先級', '鞋款型號', '狀態', '處理人', '處置方案', '追蹤碼', '立案時間'];
  const rows = list.map(c => [
    `"${c.id}"`,
    `"${c.storeCode || '2009'}"`,
    `"${c.storeName || '門市'}"`,
    `"${c.customerName}"`,
    `"${c.phone}"`,
    `"${c.orderNo}"`,
    `"${c.category}"`,
    `"${c.priority}"`,
    `"${c.shoeModel} ${c.shoeSize}"`,
    `"${c.status}"`,
    `"${c.assignedTo}"`,
    `"${c.actionPlan}"`,
    `"${c.trackingCode}"`,
    `"${c.createdAt}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `ASO客訴案件清冊_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('CSV 報表已成功匯出！', 'success');
}

// --- 6. Admin CMS Module ---
function renderCmsAnnouncements() {
  const list = window.footwearStore.getAnnouncements();
  const tbody = document.getElementById('cms-announcements-table');
  if (!tbody) return;

  tbody.innerHTML = list.map(item => `
    <tr class="hover:bg-slate-50 border-b border-slate-100 text-xs">
      <td class="py-3 px-4 font-bold text-slate-800">${item.title}</td>
      <td class="py-3 px-4">
        <span class="px-2 py-0.5 rounded text-xs font-semibold ${getCategoryBadgeClass(item.category)}">${item.category}</span>
      </td>
      <td class="py-3 px-4 text-slate-600 font-medium">${item.author}</td>
      <td class="py-3 px-4 font-mono text-slate-400">${item.date}</td>
      <td class="py-3 px-4 text-right space-x-2">
        <button onclick="deleteCmsAnnouncement('${item.id}')" class="text-rose-600 hover:underline font-semibold">刪除</button>
      </td>
    </tr>
  `).join('');
}

function handleNewAnnouncementSubmit(e) {
  e.preventDefault();
  if (!window.footwearStore.isAdminAuthenticated()) {
    openAdminAuthModal('admin-cms');
    return;
  }

  const title = document.getElementById('new-ann-title').value.trim();
  const category = document.getElementById('new-ann-category').value;
  const author = document.getElementById('new-ann-author').value;
  const isPinned = document.getElementById('new-ann-pinned').checked;
  const summary = document.getElementById('new-ann-summary').value.trim();
  const content = document.getElementById('new-ann-content').value.trim();

  if (!title || !summary || !content) {
    showToast('請完整填寫公告標題與內容', 'error');
    return;
  }

  window.footwearStore.saveAnnouncement({
    title,
    category,
    author,
    isPinned,
    summary,
    content,
    tags: [category]
  });

  e.target.reset();
  showToast('新公告發布成功！', 'success');
  renderCmsAnnouncements();
  renderAnnouncements();
}

function deleteCmsAnnouncement(id) {
  if (!window.footwearStore.isAdminAuthenticated()) {
    openAdminAuthModal('admin-cms');
    return;
  }

  if (confirm('確定要刪除此則公告嗎？')) {
    window.footwearStore.deleteAnnouncement(id);
    showToast('公告已刪除', 'info');
    renderCmsAnnouncements();
    renderAnnouncements();
  }
}

function resetSystemData() {
  if (confirm('確定要將所有公告、客訴與 Wiki 重置為預設展示資料嗎？此操作無法復原。')) {
    window.footwearStore.resetAll();
    showToast('系統資料已重置為預設展示狀態！', 'success');
    setTimeout(() => location.reload(), 600);
  }
}

// Global functions for inline HTML events
window.switchView = switchView;
window.filterAnnouncements = filterAnnouncements;
window.openAnnouncementModal = openAnnouncementModal;
window.closeAnnouncementModal = closeAnnouncementModal;
window.filterWikiCategory = filterWikiCategory;
window.filterWikiProcessor = filterWikiProcessor;
window.openWikiModal = openWikiModal;
window.closeWikiModal = closeWikiModal;
window.closeSuccessModal = closeSuccessModal;
window.jumpToTrackCase = jumpToTrackCase;
window.executeTrackSearch = executeTrackSearch;
window.filterAdminStatus = filterAdminStatus;
window.openCaseDrawer = openCaseDrawer;
window.closeCaseDrawer = closeCaseDrawer;
window.saveCaseDrawerUpdates = saveCaseDrawerUpdates;
window.printWorkOrder = printWorkOrder;
window.exportComplaintsCsv = exportComplaintsCsv;
window.handleNewAnnouncementSubmit = handleNewAnnouncementSubmit;
window.deleteCmsAnnouncement = deleteCmsAnnouncement;
window.resetSystemData = resetSystemData;
window.openAdminAuthModal = openAdminAuthModal;
window.closeAdminAuthModal = closeAdminAuthModal;
window.handleAdminAuthSubmit = handleAdminAuthSubmit;
window.adminLogout = adminLogout;
window.openChangePasswordModal = openChangePasswordModal;
window.closeChangePasswordModal = closeChangePasswordModal;
window.handleChangePasswordSubmit = handleChangePasswordSubmit;
window.openCloudConfigModal = openCloudConfigModal;
window.closeCloudConfigModal = closeCloudConfigModal;
window.handleCloudConfigSubmit = handleCloudConfigSubmit;
window.triggerManualCloudSync = triggerManualCloudSync;
