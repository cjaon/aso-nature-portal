const lineIntake = {
  liffId: '2012148118-mnUKxIUF',
  gatewayUrl: 'https://script.google.com/macros/s/AKfycbzLrrBFf8gJ9uAxwgUD28_nrkOtM6miElIT6ibIkgwgczzj9rIbNVC4SUw7fn3i7fn5/exec',
  binding: null
};

async function linePost(action, data = {}) {
  const idToken = liff.getIDToken();
  if (!idToken) throw new Error('LINE 登入資訊不存在，請重新由 LINE 開啟。');
  const res = await fetch(lineIntake.gatewayUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action, idToken, data }) });
  const result = await res.json();
  if (!result.success) throw new Error(result.error || 'LINE 服務暫時無法使用');
  return result;
}

function setLineBinding(binding) {
  lineIntake.binding = binding;
  const select = document.getElementById('complaint-store-select');
  const code = document.getElementById('complaint-store-code');
  const name = document.getElementById('complaint-store-name');
  const reporter = document.getElementById('complaint-reporter-name');
  select.value = binding.storeCode; select.disabled = true;
  code.value = binding.storeCode; code.readOnly = true;
  name.value = binding.storeName; name.readOnly = true;
  reporter.value = binding.reporterName; reporter.readOnly = true;
}

function lockStoreFromQr(storeCode) {
  const select = document.getElementById('complaint-store-select');
  const code = document.getElementById('complaint-store-code');
  const name = document.getElementById('complaint-store-name');
  const option = select?.querySelector(`option[value="${storeCode}"]`);
  if (!option || !select || !code || !name) return null;
  select.value = storeCode; select.disabled = true;
  code.value = storeCode; code.readOnly = true;
  name.value = option.dataset.name || option.textContent; name.readOnly = true;
  return { storeCode, storeName: option.dataset.name || option.textContent };
}

function toMillimeters(centimeters) {
  return centimeters ? String(Math.round(Number(centimeters) * 10)) : '';
}

async function initLineIntake() {
  if (new URLSearchParams(location.search).get('source') !== 'line') return;
  document.getElementById('complaint-source').value = 'line';
  switchView('complaint-form');
  try {
    await liff.init({ liffId: lineIntake.liffId });
    if (!liff.isLoggedIn()) return liff.login({ redirectUri: location.href });
    const qrStore = lockStoreFromQr(new URLSearchParams(location.search).get('store'));
    const result = await linePost('getStaffBinding');
    if (result.binding) return setLineBinding(result.binding);
    const reporterName = prompt('首次使用：請輸入回報人姓名');
    const storeCode = qrStore?.storeCode || prompt('請輸入門市代號');
    const invitationCode = prompt('請輸入門市驗證碼');
    const option = document.querySelector(`#complaint-store-select option[value="${storeCode}"]`);
    if (!reporterName || !option || !invitationCode) throw new Error('綁定資料不完整或門市代號不存在');
    const bound = await linePost('bindStaff', { reporterName, storeCode, storeName: qrStore?.storeName || option.dataset.name || option.textContent, invitationCode });
    setLineBinding(bound.binding);
  } catch (error) { showToast(`LINE 身分驗證失敗：${error.message}`, 'error'); }
}

document.addEventListener('DOMContentLoaded', () => {
  initLineIntake();
  document.getElementById('complaint-submission-form')?.addEventListener('submit', async event => {
    if (document.getElementById('complaint-source').value !== 'line') return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (!lineIntake.binding) return showToast('請先完成 LINE 門市綁定', 'error');
    const value = id => document.getElementById(id)?.value.trim() || '';
    try {
      const result = await linePost('addLineComplaint', {
        caseType: value('complaint-case-type'), customerName: value('complaint-name'), phone: value('complaint-phone'), email: value('complaint-email'), orderNo: value('complaint-order'), category: value('complaint-category'), priority: value('complaint-priority'), shoeModel: value('complaint-shoe'), shoeSize: `左: ${value('complaint-size-left')} cm / 右: ${value('complaint-size-right')} cm`, wearDays: value('complaint-days'), painPoints: [...document.querySelectorAll('.hotspot-chip.selected')].map(x => x.dataset.painPoint), customerNotes: value('complaint-notes'), photoUrl: value('complaint-annotated-photo'), issueCodes: [...document.querySelectorAll('input[name="issue-code"]:checked')].map(x => x.value), replacementMaterial: value('complaint-replacement-material'), footSide: value('complaint-foot-side'), measuredLengthMm: toMillimeters(value('complaint-measured-length')), measuredWidthMm: toMillimeters(value('complaint-measured-width'))
      });
      alert(`案件 ${result.caseId} 已成功建檔`);
    } catch (error) { showToast(error.message || '案件送出失敗', 'error'); }
  }, true);
});
