/**
 * =========================================================================
 * ASO+ NATURE 自然足 · 客訴處置與門市 Wiki 系統 (Google Apps Script 後端橋樑)
 * =========================================================================
 * 
 * 部署指引：
 * 1. 在 Google 雲端硬碟建立一個新的「Google 試算表」，命名為「ASO自然足_客訴與公告管理資料庫」。
 * 2. 點選頂端選單「擴充功能」➔「Apps Script」。
 * 3. 刪除編輯器內所有預設內容，將本檔案代碼完整貼入。
 * 4. 點選上方「執行」選單 ➔ 選擇「initialSetup」執行一次（會自動建立 3 個工作表與表頭）。
 * 5. 點選右上角藍色「部署」按鈕 ➔ 選擇「新建部署」。
 * 6. 點選齒輪圖示 ➔ 選擇「網頁應用程式 (Web App)」。
 *    - 說明：ASO 自然足 API
 *    - 執行身分：我 (你的帳號)
 *    - 誰可以存取：所有人 (Anyone)  <-- 務必選「所有人」，門市才能順利連線！
 * 7. 點選「部署」➔ 複製生成的「網頁應用程式網址 (Web App URL)」。
 * 8. 將該網址貼入前端系統的管理員設定中，即可享受完全免費、跨全台 25 間門市即時同步！
 */

const SHEET_NAMES = {
  COMPLAINTS: 'Complaints',
  ANNOUNCEMENTS: 'Announcements',
  WIKI: 'Wiki'
};

// --- 初始一鍵建表 ---
function initialSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Complaints 工作表
  let cSheet = ss.getSheetByName(SHEET_NAMES.COMPLAINTS);
  if (!cSheet) {
    cSheet = ss.insertSheet(SHEET_NAMES.COMPLAINTS);
    const cHeaders = [
      '案件編號', '門市代號', '門市名稱', '客戶姓名', '聯絡電話', '電子信箱',
      '原訂單號', '客訴分類', '優先級', '搭配鞋款', '鞋子尺碼', '穿著時長',
      '足部痛點', '主訴詳情', '處理狀態', '責任處理人', '處置手段', '工單號碼',
      '交件方式', '物流追蹤碼', 'D+3追蹤紀錄', 'D+14滿意星級', 'D+14結案說明',
      '立案時間', '最後更新'
    ];
    cSheet.appendRow(cHeaders);
    cSheet.getRange(1, 1, 1, cHeaders.length).setBackground('#1e293b').setFontColor('#ffffff').setFontWeight('bold');
    cSheet.setFrozenRows(1);
  }

  // 2. Announcements 工作表
  let aSheet = ss.getSheetByName(SHEET_NAMES.ANNOUNCEMENTS);
  if (!aSheet) {
    aSheet = ss.insertSheet(SHEET_NAMES.ANNOUNCEMENTS);
    const aHeaders = ['公告編號', '公告標題', '公告分類', '發布者', '發布日期', '是否置頂', '摘要說明', '完整內文'];
    aSheet.appendRow(aHeaders);
    aSheet.getRange(1, 1, 1, aHeaders.length).setBackground('#1e3a8a').setFontColor('#ffffff').setFontWeight('bold');
    aSheet.setFrozenRows(1);
  }

  // 3. Wiki 工作表
  let wSheet = ss.getSheetByName(SHEET_NAMES.WIKI);
  if (!wSheet) {
    wSheet = ss.insertSheet(SHEET_NAMES.WIKI);
    const wHeaders = ['條目編號', '案例標題', '客訴分類', '典型症狀', '核心成因', '核定處置手段', '預防防範建議', '責任處理人', '關聯案號', '收錄者', '收錄時間'];
    wSheet.appendRow(wHeaders);
    wSheet.getRange(1, 1, 1, wHeaders.length).setBackground('#065f46').setFontColor('#ffffff').setFontWeight('bold');
    wSheet.setFrozenRows(1);
  }

  return 'ASO 自然足試算表結構初始化完成！';
}

// --- GET 請求：讀取資料 ---
function doGet(e) {
  try {
    const action = e.parameter.action || 'getAll';
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'getAll') {
      const complaints = getSheetRows(ss, SHEET_NAMES.COMPLAINTS, parseComplaintRow);
      const announcements = getSheetRows(ss, SHEET_NAMES.ANNOUNCEMENTS, parseAnnouncementRow);
      const wiki = getSheetRows(ss, SHEET_NAMES.WIKI, parseWikiRow);

      return createJsonResponse({
        success: true,
        complaints: complaints,
        announcements: announcements,
        wiki: wiki
      });
    }

    if (action === 'getComplaints') {
      return createJsonResponse({
        success: true,
        complaints: getSheetRows(ss, SHEET_NAMES.COMPLAINTS, parseComplaintRow)
      });
    }

    return createJsonResponse({ success: false, error: 'Unknown action' });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

// --- POST 請求：寫入 / 更新資料 ---
function doPost(e) {
  try {
    const rawData = e.postData.contents;
    const body = JSON.parse(rawData);
    const action = body.action || 'addComplaint';
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'addComplaint') {
      const cSheet = ss.getSheetByName(SHEET_NAMES.COMPLAINTS);
      if (!cSheet) initialSetup();
      
      const c = body.data;
      const row = [
        c.id,
        c.storeCode,
        c.storeName,
        c.customerName,
        c.phone,
        c.email || '',
        c.orderNo,
        c.category,
        c.priority,
        c.shoeModel || '',
        c.shoeSize || '',
        c.wearDays || '',
        (c.painPoints || []).join('、'),
        c.customerNotes,
        c.status || '待受理',
        c.assignedTo || '',
        c.actionPlan || '',
        c.workOrderNo || '',
        c.deliveryType || '',
        c.trackingCode || '',
        c.d3Log || '',
        c.d14Rating || 0,
        c.d14Log || '',
        c.createdAt,
        c.updatedAt
      ];
      ss.getSheetByName(SHEET_NAMES.COMPLAINTS).appendRow(row);
      return createJsonResponse({ success: true, caseId: c.id });
    }

    if (action === 'updateComplaint') {
      const cSheet = ss.getSheetByName(SHEET_NAMES.COMPLAINTS);
      const data = cSheet.getDataRange().getValues();
      const targetId = body.id;
      const updates = body.updates || {};

      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === targetId) {
          rowIndex = i + 1; // 1-indexed
          break;
        }
      }

      if (rowIndex !== -1) {
        if (updates.status !== undefined) cSheet.getRange(rowIndex, 15).setValue(updates.status);
        if (updates.assignedTo !== undefined) cSheet.getRange(rowIndex, 16).setValue(updates.assignedTo);
        if (updates.actionPlan !== undefined) cSheet.getRange(rowIndex, 17).setValue(updates.actionPlan);
        if (updates.workOrderNo !== undefined) cSheet.getRange(rowIndex, 18).setValue(updates.workOrderNo);
        if (updates.deliveryType !== undefined) cSheet.getRange(rowIndex, 19).setValue(updates.deliveryType);
        if (updates.trackingCode !== undefined) cSheet.getRange(rowIndex, 20).setValue(updates.trackingCode);
        if (updates.d3Log !== undefined) cSheet.getRange(rowIndex, 21).setValue(updates.d3Log);
        if (updates.d14Rating !== undefined) cSheet.getRange(rowIndex, 22).setValue(updates.d14Rating);
        if (updates.d14Log !== undefined) cSheet.getRange(rowIndex, 23).setValue(updates.d14Log);
        if (updates.updatedAt !== undefined) cSheet.getRange(rowIndex, 25).setValue(updates.updatedAt);
        return createJsonResponse({ success: true, updatedId: targetId });
      } else {
        return createJsonResponse({ success: false, error: 'Case ID not found' });
      }
    }

    return createJsonResponse({ success: false, error: 'Action unsupported' });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

// --- 輔助函式 ---
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheetRows(ss, sheetName, parser) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    rows.push(parser(values[i]));
  }
  return rows;
}

function parseComplaintRow(row) {
  return {
    id: row[0],
    storeCode: String(row[1]),
    storeName: row[2],
    customerName: row[3],
    phone: row[4],
    email: row[5],
    orderNo: row[6],
    category: row[7],
    priority: row[8],
    shoeModel: row[9],
    shoeSize: row[10],
    wearDays: row[11],
    painPoints: row[12] ? String(row[12]).split('、') : [],
    customerNotes: row[13],
    status: row[14],
    assignedTo: row[15],
    actionPlan: row[16],
    workOrderNo: row[17],
    deliveryType: row[18],
    trackingCode: row[19],
    d3Log: row[20],
    d14Rating: Number(row[21]) || 0,
    d14Log: row[22],
    createdAt: row[23],
    updatedAt: row[24]
  };
}

function parseAnnouncementRow(row) {
  return {
    id: row[0],
    title: row[1],
    category: row[2],
    author: row[3],
    date: row[4],
    isPinned: row[5] === true || row[5] === 'TRUE',
    summary: row[6],
    content: row[7]
  };
}

function parseWikiRow(row) {
  return {
    id: row[0],
    title: row[1],
    category: row[2],
    symptom: row[3],
    cause: row[4],
    action: row[5],
    prevent: row[6],
    assignedTo: row[7],
    caseRef: row[8],
    author: row[9],
    updatedAt: row[10]
  };
}
