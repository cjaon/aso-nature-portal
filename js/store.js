/**
 * Footwear Complaints & Wiki Knowledge Base Store
 * LocalStorage management & realistic seed data
 */

const STORAGE_KEYS = {
  ANNOUNCEMENTS: 'footwear_announcements_v1',
  WIKI: 'footwear_wiki_v1',
  COMPLAINTS: 'footwear_complaints_v1',
  ADMIN_AUTH: 'aso_admin_auth_session',
  ADMIN_PASS: 'aso_admin_security_pass',
  GAS_URL: 'aso_gas_api_url'
};

// ASO Standard Stores List
const ASO_STORES = window.ASO_STORES || [
  { code: '2007', alphaCode: 'N', name: '內湖門市', dept: '營業一部', region: '台北市', phone: '02-27932473', address: '台北市內湖區成功路四段40號1樓' },
  { code: '2009', alphaCode: 'P', name: '忠孝門市', dept: '營業二部', region: '台北市', phone: '02-27118748', address: '台北市大安區忠孝東路四段100號1樓' },
  { code: '2046', alphaCode: 'AW', name: '永和門市', dept: '營業二部', region: '新北市', phone: '02-22324695', address: '新北市永和區永和路二段210號1樓' },
  { code: '2074', alphaCode: 'BC', name: '板橋府中門市', dept: '營業二部', region: '新北市', phone: '02-29617581', address: '新北市板橋區中山路一段5號1樓' },
  { code: '2178', alphaCode: 'OM', name: '大墩門市', dept: '營業六部', region: '台中市', phone: '04-23206380', address: '台中市南屯區大墩路556號' }
];

// Initial Seed Announcements
const SEED_ANNOUNCEMENTS = [
  {
    id: 'ANN-2026-001',
    title: '【製程升級】Poron 前掌緩衝墊全面升級為雙密度 PR-V2 規格',
    category: '製程公告',
    author: '正全義肢鞋墊製造商',
    date: '2026-09-02',
    isPinned: true,
    summary: '即日起全系列客製鞋墊前掌減震層導入雙密度 Poron，吸震率提升 25%，門市開單規格請選取 PR-V2。',
    content: `致全體門市同仁與合作夥伴：
正全工廠自 2026 年 9 月起，正式導入新一代雙密度 Poron (代號 PR-V2)。
1. **特性**：底層提供 55° 高支撐回彈，上層提供 25° 慢回彈緩衝，大幅減少蹠骨頭受壓發炎機率。
2. **加工注意**：如需前掌砂輪機修磨，請採用 120 目細砂紙並調降轉速，避免高溫使緩衝層硬化。
3. **系統代碼**：工單中「前掌減震規格」請一律勾選【PR-V2 雙密度】。
如有疑問請隨時聯絡正全技術部。`,
    tags: ['製程更新', 'Poron', '材質升級']
  },
  {
    id: 'ANN-2026-002',
    title: '【SOP 規範】3D 取模與泡棉盒下壓標準操作規範 (防退件要點)',
    category: '3D取模規範',
    author: '專業顧問',
    date: '2026-08-29',
    isPinned: true,
    summary: '近期發現部分泡棉盒取模有「壓模過深底觸」現象，特此規範半負重膝踝 90 度與垂直中立位操作標準。',
    content: `全體門市驗配人員請注意：
近兩週工廠退件統計中，有 4 件因「泡棉盒下壓過深（剩餘厚度小於 4mm）」導致外側足弓數據失真。

【3D 取模與泡棉盒三大標準】：
1. **下壓深度**：腳跟與前掌壓入泡棉盒深度應維持 20~25mm，盒底務必保留至少 10mm 緩衝厚度，嚴禁踩穿底板。
2. **膝踝角度**：受測者請坐於座椅，大腿水平、小腿與地面成 90° 垂直，維持距下關節 (Subtalar) 中立位。
3. **原鞋對比**：務必請客人取出搭配鞋款之「原廠鞋墊」，沿邊緣描線並將照片一併上傳工單系統，以確保 CNC 輪廓吻合鞋腔。`,
    tags: ['3D取模', '防退件', '標準SOP']
  },
  {
    id: 'ANN-2026-003',
    title: '【重要提醒】中秋連假工廠製程排單與加急重製收單截止通知',
    category: '製程公告',
    author: 'Jason',
    date: '2026-08-25',
    isPinned: false,
    summary: '中秋連假期間工廠歲修保養，客訴加急重製單最遲需於 9/12 18:00 前完成核准送單。',
    content: `各位門市夥伴好：
為因應即將到來的中秋連續假期，正全義肢鞋墊製造端將進行定期 CNC 機台校正與系統維護：
1. **加急重製工單**：請於 9/12 (五) 18:00 前於系統完成 Jason 覆核，工廠將於連假前寄出。
2. **一般修改與修邊件**：門市若能現場微調者，請盡量於門市現場利用砂輪機處理，減少客人等候時間。`,
    tags: ['排程公告', '交期提醒']
  }
];

// Initial Seed Wiki Articles (Case history & resolutions)
const SEED_WIKI = [
  {
    id: 'W042',
    title: 'ASICS KAYANO / 慢跑鞋窄楦前掌擠腳與鞋墊波浪隆起處置',
    category: '尺寸不符',
    processor: '正全義肢鞋墊製造商',
    secondaryProcessor: '門市技師',
    shoeModel: 'ASICS GEL-KAYANO 30 (2E / D 楦)',
    symptom: '客訴鞋墊放入後，前掌側緣無法完全貼平鞋底，產生約 3mm 之波浪狀擠壓隆起，穿著時前腳掌兩側強烈夾腳。',
    rootCause: '該款跑鞋中足往鞋尖收窄幅度較大，且鞋內壁有熱壓貼合層，若依常規標準版型雷射裁切，前掌外側邊緣會卡住鞋面縫線。',
    solution: '【處理步驟】：\n1. 取出原廠附贈之薄型鞋墊作為 1:1 模板。\n2. 門市技師使用砂輪機對前掌兩側邊緣進行 45 度倒角斜切打薄。\n3. 前掌總厚度從 4.0mm 漸層砂磨至 2.2mm，重新置入後即可完美服貼。\n★ 耗時 15 分鐘，現場即可交還顧客試穿帶走。',
    preventionNote: '門市收單若遇 ASICS 或 HOKA 跑鞋，請在工單中特別備註「楦頭偏窄，前掌需做 45° 倒角修邊」。',
    date: '2026-08-18',
    views: 142
  },
  {
    id: 'W038',
    title: '左右腳足弓支撐高度顛倒製作之急件重製與覆核 SOP',
    category: '鞋墊做錯',
    processor: '正全義肢鞋墊製造商',
    secondaryProcessor: 'Jason',
    shoeModel: 'New Balance 990v6 / 訂製款',
    symptom: '客人反映左腳足弓懸空無支撐，右腳足弓強烈凸起頂撞疼痛。實體檢驗發現右腳被裝入 28mm 高支撐塊，左腳為 18mm 低支撐塊。',
    rootCause: '工廠打版人員於 CNC 切削代碼匯入時，誤將左右腳 STL 鏡像翻轉參數選錯，導致兩側支撐高度對調。',
    solution: '【處置方式】：\n1. Jason 判定工廠製程失誤，立即開立「加急免費全新品重製工單」。\n2. 正全工廠於 24 小時內啟動綠色通道生產，出廠前由品管主管以游標卡尺量測雙邊高度並錄影存查。\n3. 黑貓宅配加急送達客人府上，並附贈一組足部舒緩襪及致歉信函。',
    preventionNote: '正全已於切削前置程序新增「雙軸條碼自動核對系統」，杜絕左右腳檔案混淆。',
    date: '2026-08-10',
    views: 98
  },
  {
    id: 'W029',
    title: '高足弓客戶初次穿著內側舟狀骨痠痛之衛教與微調調校',
    category: '穿著不適',
    processor: '專業顧問',
    secondaryProcessor: 'Jason',
    shoeModel: 'Clarks 皮鞋 / 日常通勤款',
    symptom: '初次配戴客製鞋墊穿著 2 小時後，內側縱弓處出現明顯緊繃痠痛與紅印，無法持續行走。',
    rootCause: '客人長年處於足弓塌陷未矯正狀態，周遭足底筋膜與肌腱突然獲得矯正支撐，處於生理適應性緊繃；但同時鞋墊支撐片頂點略偏後 2mm。',
    solution: '【處置方式】：\n1. 顧問親自會診，使用砂輪機將舟狀骨受壓最高點向下微降 1.5mm，並加貼一層 1mm 慢回彈 Poron 減壓片。\n2. 實施「漸進式穿著引導」：第 1~3 天每天穿 2 小時，第 4~7 天每天穿 4 小時，第 2 週起恢復全天穿著。\n3. 門市客服於 D+3 與 D+14 電訪追蹤，第 14 天客人回饋痠痛完全消失，支撐度極為舒適滿意。',
    preventionNote: '交件時必須隨附《適應期衛教指引卡》，並口頭告知前一週輕微肌肉痠脹為正常適應現象。',
    date: '2026-07-25',
    views: 215
  }
];

// Initial Seed Complaints
const SEED_COMPLAINTS = [
  {
    id: 'CMP-20260905-0102',
    storeCode: '2009',
    storeName: '忠孝門市',
    customerName: '張冠廷',
    phone: '0912-345-678',
    email: 'chang.kt@example.com',
    orderNo: 'ORD-2026-9041',
    category: '鞋墊做錯',
    priority: '急件',
    shoeModel: 'ASICS GEL-KAYANO 30 (2E)',
    shoeSize: 'US 10.5',
    wearDays: '初次試穿即不適',
    painPoints: ['內側足弓過高', '左右足弓高度不對稱'],
    customerNotes: '收到鞋墊放入球鞋試穿，右腳足弓像有一顆硬石頭狠狠頂著，非常劇痛。左腳感覺剛好，兩隻腳踩起來高低差非常明顯！',
    status: '正全重製中',
    assignedTo: '正全義肢鞋墊製造商',
    diagnosisLog: '2026-09-05 正全工程師調閱原始 3D 雕刻 STL 點雲檔，原始右腳內側縱弓頂點高度設定為 18mm，因 CNC 零點坐標偏移，實際切削出 26mm，確認為工廠製作疏失。',
    actionPlan: '急件免費全新品重製',
    workOrderNo: 'WO-REMAKE-0905-A',
    deliveryType: '黑貓宅配到府',
    trackingCode: '9021-8832-1102 (待發貨)',
    d3Log: '',
    d14Rating: 0,
    d14Log: '',
    isSavedToWiki: true,
    createdAt: '2026-09-05 10:30',
    updatedAt: '2026-09-05 14:15'
  },
  {
    id: 'CMP-20260904-0088',
    storeCode: '2074',
    storeName: '板橋府中門市',
    customerName: '林美玲',
    phone: '0922-888-999',
    email: 'meiling.lin@example.com',
    orderNo: 'ORD-2026-8912',
    category: '尺寸不符',
    priority: '一般',
    shoeModel: 'HOKA Bondi 8 慢跑鞋',
    shoeSize: '24.0 cm',
    wearDays: '穿著 1~3 天',
    painPoints: ['前掌邊緣溢出', '後跟杯卡死'],
    customerNotes: '鞋墊長度好像稍微長了半公分，前面會被鞋頭擠到翹起來，走起路來腳趾一直頂到皺摺。',
    status: '門市微調中',
    assignedTo: '門市技師',
    diagnosisLog: '2026-09-04 門市比對客人原廠 HOKA 鞋墊，發現此款鞋頭較圓短，原樣板長度多出 4mm。建議現場砂輪機磨修即可。',
    actionPlan: '現場修磨微調',
    workOrderNo: 'WO-STORE-0904-B',
    deliveryType: '預約門市試穿取件',
    trackingCode: '門市預約：9/6 15:00 來店取件',
    d3Log: '9/4 電聯確認，已告知週六可來店現場微調 10 分鐘取件。',
    d14Rating: 0,
    d14Log: '',
    isSavedToWiki: false,
    createdAt: '2026-09-04 15:20',
    updatedAt: '2026-09-05 09:30'
  },
  {
    id: 'CMP-20260901-0045',
    storeCode: '2178',
    storeName: '大墩門市',
    customerName: '陳建銘',
    phone: '0933-112-233',
    email: 'jmchen@example.com',
    orderNo: 'ORD-2026-8720',
    category: '穿著不適',
    priority: '一般',
    shoeModel: 'Ecco 商務休閒皮鞋',
    shoeSize: 'EU 42',
    wearDays: '穿著 1~2 週',
    painPoints: ['內側足弓過高', '腳底筋膜緊繃'],
    customerNotes: '已經穿了快一週，足弓還是覺得有些痠痛，站超過半小時就很想脫下來。',
    status: '售後追蹤期',
    assignedTo: '專業顧問',
    diagnosisLog: '2026-09-02 顧問檢視：因客人為重度平足，原支撐力道較強，已於 9/2 門市會診微調降高 1.5mm 並貼附 1mm Poron 緩衝片。',
    actionPlan: '回店重測足壓調校',
    workOrderNo: 'WO-MOD-0902-C',
    deliveryType: '預約門市試穿取件',
    trackingCode: '9/2 現場微調交付完畢',
    d3Log: '9/5 追蹤電訪：微調降高後已無頂撞痛感，目前每日穿著 4 小時感覺良好，持續觀察。',
    d14Rating: 4,
    d14Log: '預計 9/16 進行滿意度結案回訪。',
    isSavedToWiki: true,
    createdAt: '2026-09-01 11:00',
    updatedAt: '2026-09-05 11:30'
  },
  {
    id: 'CMP-20260826-0019',
    storeCode: '2108',
    storeName: '明誠門市',
    customerName: '黃雅婷',
    phone: '0955-667-788',
    email: 'yating.huang@example.com',
    orderNo: 'ORD-2026-8550',
    category: '鞋墊做錯',
    priority: '急件',
    shoeModel: 'Nike Pegasus 40',
    shoeSize: 'US 7.5',
    wearDays: '初次試穿即不適',
    painPoints: ['足弓硬度做錯', '表面包布脫膠'],
    customerNotes: '當初訂購有特別備註因拇趾外翻要用軟式包布，結果送來的是硬質透氣皮面，踩起來很硬。',
    status: '已結案',
    assignedTo: 'Jason',
    diagnosisLog: '2026-08-26 Jason 審核原工單，確認門市有特別勾選「軟質抗菌減壓布」，正全出廠檢驗疏漏。已責成工廠於 48 小時內重製。',
    actionPlan: '急件免費全新品重製',
    workOrderNo: 'WO-REMAKE-0826-X',
    deliveryType: '黑貓宅配到府',
    trackingCode: '黑貓 9012-4411-9988 (8/29 客戶已簽收)',
    d3Log: '8/31 電訪確認：新鞋墊軟質布面非常親膚舒適，拇趾外翻處無壓迫。',
    d14Rating: 5,
    d14Log: '9/5 滿意度回訪：五星滿意！客人感謝 Jason 主管親自追蹤與工廠的迅速重製。已正式結案。',
    isSavedToWiki: true,
    createdAt: '2026-08-26 09:15',
    updatedAt: '2026-09-05 16:00'
  }
];

class Store {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) {
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(SEED_ANNOUNCEMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.WIKI)) {
      localStorage.setItem(STORAGE_KEYS.WIKI, JSON.stringify(SEED_WIKI));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMPLAINTS)) {
      localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(SEED_COMPLAINTS));
    }
  }

  // Reset to seed data
  resetAll() {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(SEED_ANNOUNCEMENTS));
    localStorage.setItem(STORAGE_KEYS.WIKI, JSON.stringify(SEED_WIKI));
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(SEED_COMPLAINTS));
  }

  // --- Admin Authentication ---
  isAdminAuthenticated() {
    return sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
  }

  setAdminAuthenticated(val) {
    if (val) {
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    }
  }

  getAdminPassword() {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_PASS) || 'Aso#Nature2026';
  }

  setAdminPassword(newPass) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PASS, newPass);
  }

  verifyAdminPassword(inputPass) {
    return inputPass === this.getAdminPassword();
  }

  // --- Google Sheets / Cloud Sync Backend ---
  getGasUrl() {
    return localStorage.getItem(STORAGE_KEYS.GAS_URL) || window.DEFAULT_GAS_API_URL || '';
  }

  setGasUrl(url) {
    if (url) {
      localStorage.setItem(STORAGE_KEYS.GAS_URL, url.trim());
    } else {
      localStorage.removeItem(STORAGE_KEYS.GAS_URL);
    }
  }

  isCloudConnected() {
    return !!this.getGasUrl();
  }

  async syncFromCloud() {
    const url = this.getGasUrl();
    if (!url) return false;
    try {
      const resp = await fetch(`${url}?action=getAll`);
      const res = await resp.json();
      if (res.success) {
        if (res.complaints && res.complaints.length > 0) {
          localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(res.complaints));
        }
        if (res.announcements && res.announcements.length > 0) {
          localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(res.announcements));
        }
        if (res.wiki && res.wiki.length > 0) {
          localStorage.setItem(STORAGE_KEYS.WIKI, JSON.stringify(res.wiki));
        }
        window.dispatchEvent(new CustomEvent('aso:cloud-synced'));
        return true;
      }
    } catch (e) {
      console.warn('Google Sheets cloud sync fallback to local cache:', e);
    }
    return false;
  }

  // --- Announcements ---
  getAnnouncements() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS) || '[]');
  }

  saveAnnouncement(data) {
    const list = this.getAnnouncements();
    if (data.id) {
      const idx = list.findIndex(item => item.id === data.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...data, updatedAt: new Date().toISOString().slice(0, 10) };
      }
    } else {
      const newAnn = {
        id: 'ANN-' + Date.now().toString().slice(-6),
        ...data,
        date: new Date().toISOString().slice(0, 10)
      };
      list.unshift(newAnn);
    }
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(list));
    return list;
  }

  deleteAnnouncement(id) {
    let list = this.getAnnouncements();
    list = list.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(list));
    return list;
  }

  // --- Wiki ---
  getWikiArticles() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.WIKI) || '[]');
  }

  saveWikiArticle(data) {
    const list = this.getWikiArticles();
    if (data.id) {
      const idx = list.findIndex(item => item.id === data.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...data };
      } else {
        list.unshift(data);
      }
    } else {
      const newArticle = {
        id: 'W' + Math.floor(100 + Math.random() * 900),
        views: 1,
        date: new Date().toISOString().slice(0, 10),
        ...data
      };
      list.unshift(newArticle);
    }
    localStorage.setItem(STORAGE_KEYS.WIKI, JSON.stringify(list));
    return list;
  }

  incrementWikiViews(id) {
    const list = this.getWikiArticles();
    const item = list.find(w => w.id === id);
    if (item) {
      item.views = (item.views || 0) + 1;
      localStorage.setItem(STORAGE_KEYS.WIKI, JSON.stringify(list));
    }
  }

  // --- Complaints ---
  getComplaints() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLAINTS) || '[]');
  }

  getComplaintById(id) {
    const list = this.getComplaints();
    return list.find(c => c.id === id || c.orderNo === id);
  }

  generateCaseId() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `CMP-${y}${m}${d}-${rand}`;
  }

  createComplaint(data) {
    const list = this.getComplaints();
    const id = this.generateCaseId();
    const nowStr = new Date().toLocaleString('zh-TW', { hour12: false });
    const newCase = {
      id,
      storeCode: data.storeCode || '2009',
      storeName: data.storeName || '忠孝門市',
      status: '待受理',
      assignedTo: '',
      diagnosisLog: '',
      actionPlan: '',
      workOrderNo: '',
      deliveryType: '預約門市試穿取件',
      trackingCode: '',
      d3Log: '',
      d14Rating: 0,
      d14Log: '',
      isSavedToWiki: false,
      createdAt: nowStr,
      updatedAt: nowStr,
      ...data
    };
    list.unshift(newCase);
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(list));

    // Async push to Google Sheets
    const gasUrl = this.getGasUrl();
    if (gasUrl) {
      fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'addComplaint', data: newCase })
      }).catch(err => console.warn('Cloud post error:', err));
    }

    return newCase;
  }

  updateComplaint(id, updates) {
    const list = this.getComplaints();
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) {
      const nowStr = new Date().toLocaleString('zh-TW', { hour12: false });
      list[idx] = {
        ...list[idx],
        ...updates,
        updatedAt: nowStr
      };
      localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(list));

      // Async push to Google Sheets
      const gasUrl = this.getGasUrl();
      if (gasUrl) {
        fetch(gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'updateComplaint', id, updates })
        }).catch(err => console.warn('Cloud update error:', err));
      }

      return list[idx];
    }
    return null;
  }

  deleteComplaint(id) {
    let list = this.getComplaints();
    list = list.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(list));
    return list;
  }
}

// Global store singleton
window.footwearStore = new Store();
window.ASO_STORES = ASO_STORES;
