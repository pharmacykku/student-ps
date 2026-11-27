/**
 * ระบบฐานข้อมูลนักศึกษาระดับปริญญาตรี คณะเภสัชศาสตร์ มหาวิทยาลัยขอนแก่น
 * Google Apps Script (ผูกกับ Google Sheet) + Google Drive
 *
 * ไฟล์ในโปรเจกต์: Code.gs, Styles.html, Index.html, Admin.html
 * ติดตั้ง: เปิด Google Sheet > ส่วนขยาย > Apps Script > วางไฟล์ทั้งหมด
 *          > รันฟังก์ชัน setup() 1 ครั้ง > Deploy เป็น Web app
 */

// ======================= CONFIG =======================
const SH = {
  STUDENTS: 'นักศึกษา',
  GRADES: 'ผลการเรียน',
  USERS: 'ผู้ใช้',
  LOG: 'บันทึกการแก้ไข',
  FILES: 'ไฟล์',
  SETTINGS: 'ตั้งค่า',
  COURSES: 'รายวิชา',
  GRADCHK: 'สรุปตรวจสอบจบ',
  ADVISORS: 'อาจารย์ที่ปรึกษา',
  REPORTLOG: 'ประวัติส่งรายงาน',
  ACCESS: 'บันทึกการเข้าใช้',
  NOTES: 'บันทึกนักศึกษา',
  PLAN: 'แผนการศึกษา',
  STATUSHIST: 'ประวัติสถานะ',
  MASTER: 'ข้อมูลหลัก',
  IMPORTLOG: 'ประวัตินำเข้า',
  UNDO: '_สำรองก่อนนำเข้า',
  MENTAL: 'สุขภาพจิต',
  ELIGREV: 'ผลตรวจทานสิทธิ์',
  ELIGSNAP: 'รอบผลตรวจสิทธิ์',
  MHCARE: 'การดูแลสุขภาวะ',
  CAL: 'ปฏิทินการศึกษา',
  TERMSNAP: 'ข้อมูลนักศึกษารายภาค',
  REQ: 'คำร้อง REQ'
};
const MASTER_HEADERS = ['ประเภท', 'ค่า', 'ลำดับ', 'ใช้งาน', 'หมายเหตุ'];
const IMPORTLOG_HEADERS = ['BatchId', 'เวลา', 'ผู้ใช้', 'ประเภท', 'ภาคการศึกษา', 'สรุป (JSON)', 'ไฟล์ต้นฉบับ', 'สถานะ'];
const UNDO_HEADERS = ['BatchId', 'ชีต', 'JSON'];
const ELIGREV_HEADERS = ['รอบ', 'โหมด', 'รหัสนักศึกษา', 'ผลตรวจระบบ', 'ผลหลังตรวจทาน', 'รายการที่แก้ (JSON)', 'ตรวจทานแล้ว', 'หมายเหตุ', 'วันที่ไฟล์ REG', 'ผู้ตรวจทาน', 'เวลา'];
const ELIGSNAP_HEADERS = ['SnapId', 'โหมด', 'รอบ', 'ชื่อรอบ', 'ประเภท', 'เวลา', 'ผู้บันทึก', 'จำนวน', 'สรุป (JSON)', 'ข้อมูล 1', 'ข้อมูล 2', 'ข้อมูล 3', 'ข้อมูล 4', 'ข้อมูล 5', 'ข้อมูล 6'];
const MHCARE_HEADERS = ['รหัสนักศึกษา', 'สถานะการดูแล', 'หมายเหตุ', 'ผู้บันทึก', 'เวลา'];
const MENTAL_HEADERS = ['รหัสนักศึกษา', 'วันที่ประเมิน', 'ปีการศึกษา', 'ภาคการศึกษา', 'คะแนน (%)', 'ระดับ', 'สถานะความเสี่ยง', 'ซึมเศร้า (%)', 'ซึมเศร้า (ระดับ)', 'เครียด (%)', 'เครียด (ระดับ)', 'กดดัน (%)', 'กดดัน (ระดับ)', 'แบบประเมิน', 'คะแนนดิบ', 'คะแนนเต็ม', 'หมายเหตุ', 'แหล่งข้อมูล', 'BatchId', 'นำเข้าโดย', 'นำเข้าเมื่อ'];

const STUDENT_HEADERS = [
  'รหัสนักศึกษา', 'คำนำหน้า', 'ชื่อ', 'นามสกุล', 'ชั้นปี', 'หลักสูตร', 'จังหวัด',
  'อาจารย์ที่ปรึกษา', 'สถานะ', 'เบอร์โทร', 'อีเมล', 'ลิงก์ใบตรวจสอบจบ', 'หมายเหตุ',
  'สถานะการอนุมัติ', 'สาขาเน้น', 'LineID', 'Facebook', 'บทบาทชั้นปี',
  'โรงเรียนเดิม', 'GPAX มัธยมปลาย', 'รอบการรับเข้า', 'อัปเดตล่าสุด'
];
const ADMISSION_ROUNDS = ['รอบที่ 1 Portfolio', 'รอบที่ 2 โควตา', 'รอบที่ 3 Admission', 'รอบที่ 4 Direct Admission', 'อื่นๆ'];
const ROLES = ['owner', 'admin', 'staff', 'viewer'];
const GRADE_HEADERS = ['รหัสนักศึกษา', 'ปีการศึกษา', 'ภาคการศึกษา', 'GPA', 'GPAX', 'หน่วยกิตสะสม', 'บันทึกเมื่อ'];
const USER_HEADERS = ['email', 'ชื่อที่แสดง', 'role', 'active', 'เพิ่มโดย', 'สร้างเมื่อ', 'เข้าใช้ล่าสุด', 'เมนูที่อนุญาต'];
const TERMSNAP_HEADERS = ['ภาค', 'รหัสนักศึกษา', 'ชั้นปี', 'สถานะ', 'หลักสูตร', 'อาจารย์ที่ปรึกษา', 'บันทึกเมื่อ', 'ที่มา'];
const CAL_HEADERS = ['Id', 'วันที่', 'ถึงวันที่', 'หัวข้อ', 'ประเภท', 'เตือนล่วงหน้า (วัน)', 'เมนูที่เกี่ยวข้อง', 'รายละเอียด', 'ผู้บันทึก', 'บันทึกเมื่อ'];
const STATUSHIST_HEADERS = ['HistId', 'รหัสนักศึกษา', 'สถานะเดิม', 'สถานะใหม่', 'ภาคที่มีผล', 'เหตุผล/หมายเหตุ', 'เลขที่คำสั่ง/ประกาศ', 'ที่มา', 'ผู้บันทึก', 'บันทึกเมื่อ'];
const CONTACT_FIELDS = ['เบอร์โทร', 'LineID', 'Facebook'];
const PLAN_HEADERS = ['รหัสหลักสูตร', 'ชื่อหลักสูตร', 'ชั้นปี', 'ภาคการศึกษา', 'รหัสวิชา', 'ชื่อวิชา', 'หน่วยกิต', 'หมวด', 'รหัสวิชาทดแทน', 'หมายเหตุ', 'สาขาเน้น'];
const NOTE_HEADERS = ['NoteId', 'รหัสนักศึกษา', 'หมวด', 'ข้อความ', 'วันนัดติดตาม', 'สถานะ', 'ปักหมุด', 'การมองเห็น', 'ผู้บันทึก', 'ชื่อผู้บันทึก', 'บันทึกเมื่อ', 'แก้ไขล่าสุด'];
const NOTE_CATS = ['ทั่วไป', 'การเรียน', 'ให้คำปรึกษา', 'ติดต่อผู้ปกครอง', 'เอกสาร/คำร้อง', 'ทุนการศึกษา', 'กิจกรรม', 'อื่นๆ'];
const ACCESS_HEADERS = ['เวลา', 'อีเมล', 'ชื่อ', 'เหตุการณ์', 'รายละเอียด', 'อุปกรณ์/เบราว์เซอร์'];
const LOG_HEADERS = ['เวลา', 'ผู้ใช้', 'การกระทำ', 'รหัสนักศึกษา', 'รายละเอียด'];
const FILE_HEADERS = ['เวลา', 'รหัสนักศึกษา', 'ประเภท', 'ชื่อไฟล์', 'FileId', 'URL', 'ผู้อัปโหลด'];
const COURSE_HEADERS = ['รหัสนักศึกษา', 'หมวด', 'รหัสวิชา', 'ชื่อวิชา', 'หน่วยกิต', 'ครั้งที่', 'ภาคการศึกษา', 'ปีการศึกษา', 'เกรด', 'เกรดล่าสุด', 'อัปเดตเมื่อ'];
const GRADCHK_HEADERS = ['รหัสนักศึกษา', 'ชื่อในไฟล์', 'ชั้นปีในไฟล์', 'รหัสหลักสูตร', 'หลักสูตร', 'หน่วยกิตต้องผ่าน', 'หน่วยกิตที่ลง', 'หน่วยกิตผ่าน', 'ขาด', 'GPAX', 'ภาษาอังกฤษ', 'รอเกรด (วิชา)', 'ผลตรวจ REG', 'หมวดไม่ผ่าน', 'สถานะหมวด (JSON)', 'วันที่รายงาน REG', 'ไฟล์', 'อัปโหลดเมื่อ', 'ผู้อัปโหลด', 'ข้อมูล ณ ภาค'];
const ADVISOR_HEADERS = ['ชื่ออาจารย์ที่ปรึกษา', 'อีเมล', 'หมายเหตุ', 'สาขาวิชา'];
const REPORTLOG_HEADERS = ['เวลา', 'ภาคการศึกษา', 'อาจารย์ที่ปรึกษา', 'อีเมล', 'จำนวนต่ำกว่าเกณฑ์', 'จำนวนเฝ้าระวัง', 'สถานะ', 'ผู้ส่ง'];

const DEFAULT_SETTINGS = {
  GPAX_THRESHOLD: '2.00',      // ต่ำกว่าเกณฑ์ (วิกฤต)
  GPAX_WATCH: '2.50',          // เฝ้าระวัง
  REPORT_CC: '',               // อีเมลสำเนารายงานสิ้นภาค (คั่นด้วย ,)
  DRIVE_FOLDER_ID: '',
  FACULTY_NAME: 'คณะเภสัชศาสตร์ มหาวิทยาลัยขอนแก่น',
  // สถานภาพ (ปรับให้ตรงระเบียบ มข. ได้ที่แท็บ ตรวจสิทธิ์ → สถานภาพ)
  PROB_DISMISS: '1.50',        // GPAX ต่ำกว่านี้ = เข้าเกณฑ์พ้นสภาพ
  PROB_LOW: '2.00',            // GPAX ต่ำกว่านี้ = รอพินิจ
  PROB_START_TERM: '2',        // เริ่มพิจารณาตั้งแต่ภาคปกติที่
  PROB_CONSEC: '2',            // รอพินิจติดต่อกันกี่ภาค = เข้าเกณฑ์พ้นสภาพ
  GRAD_GPAX: '2.00',           // GPAX ขั้นต่ำสำเร็จการศึกษา
  // ความปลอดภัย
  MASK_CONTACT: 'on',          // ปิดบังเบอร์โทร/Line/Facebook ในหน้าจอ (กดดูได้ และถูกบันทึก)
  IDLE_MIN: '30',              // ออกจากระบบอัตโนมัติเมื่อไม่ใช้งาน (นาที) 0 = ปิด
  BACKUP_AUTO: 'off',          // สำรองอัตโนมัติรายวัน
  BACKUP_HOUR: '2',
  BACKUP_KEEP: '14',           // เก็บไฟล์สำรองล่าสุดกี่ชุด
  // หน้าค้นหานักศึกษา (หน้า Dashboard ไม่ต้องเข้าสู่ระบบ)
  PUBLIC_SEARCH: 'on',
  PUBLIC_FIELDS: 'รหัสนักศึกษา,ชื่อ-สกุล,ชั้นปี,หลักสูตร,สถานะ,อาจารย์ที่ปรึกษา,อีเมล,เบอร์โทร,GPAX ล่าสุด',
  PUBLIC_REVEAL_MAX: '120'     // จำนวนครั้งสูงสุดที่กดดูข้อมูลปิดบังได้ต่อชั่วโมง (ทั้งระบบ) กันการดึงข้อมูลจำนวนมาก
};
/** ช่องที่อนุญาตให้เลือกแสดงในหน้าค้นหาสาธารณะ (Line/Facebook/บันทึก/โรงเรียน ไม่เปิดสาธารณะ) */
const PUBLIC_FIELD_OPTIONS = ['รหัสนักศึกษา', 'ชื่อ-สกุล', 'ชั้นปี', 'หลักสูตร', 'สถานะ', 'อาจารย์ที่ปรึกษา', 'สาขาเน้น', 'บทบาทชั้นปี', 'อีเมล', 'เบอร์โทร', 'GPAX ล่าสุด'];
/** ช่องที่ปิดบัง (เบลอ) ในหน้าสาธารณะ — ไม่ส่งค่าจริงไปพร้อมผลค้นหา ต้องกดไอคอนดวงตาจึงดึงทีละช่อง และบันทึกทุกครั้ง */
const PUBLIC_SECRET = ['อีเมล', 'เบอร์โทร', 'GPAX ล่าสุด'];

const STATUS_LIST = ['กำลังศึกษา', 'ลาพัก', 'ลาออก', 'พ้นสภาพ', 'สำเร็จการศึกษา', 'ย้ายคณะ'];
const PROGRAM_LIST = ['ภาคปกติ', 'นานาชาติ', 'โครงการพิเศษ', 'โครงการพิเศษ ปฐมภูมิ'];
const PRIMARY_PROG = 'โครงการพิเศษ ปฐมภูมิ';
const PRIMARY_PROVINCES = ['ขอนแก่น', 'อุดรธานี', 'สกลนคร', 'หนองคาย'];
function isPrimary_(p) { return String(p || '').replace(/\s+/g, ' ').trim() === PRIMARY_PROG; }
/** ชื่อหลักสูตรสำหรับแสดงผล: ปฐมภูมิ ต่อท้ายด้วยจังหวัด */
function progLabel_(r, H) {
  const p = String(r[H['หลักสูตร']] || ''), v = H['จังหวัด'] !== undefined ? String(r[H['จังหวัด']] || '').trim() : '';
  return isPrimary_(p) && v ? p + ' (' + v + ')' : p;
}
const SESSION_HOURS = 6;
const TEXT_COLS = ['รหัสนักศึกษา', 'เบอร์โทร', 'LineID'];

// ======================= WEB =======================
/** รับข้อมูลจากปุ่ม "ซิงค์คำร้อง REQ" (bookmarklet บนหน้า req.kku.ac.th) */
function doPost(e) {
  const P = (e && e.parameter) || {};
  if (P.act === 'reqsync') return reqSyncPage_(P);
  // สคริปต์อัตโนมัติ (Tampermonkey) ส่ง JSON มาเป็น text/plain
  let J = null; try { J = JSON.parse((e && e.postData && e.postData.contents) || ''); } catch (x) {}
  if (J && J.act === 'reqforms') {   // สคริปต์ส่งรายชื่อหัวข้อคำร้องทั้งหมดในระบบ REQ → ตอบหัวข้อที่เปิดเชื่อมโยง
    let out; try { const c = reqCfg_(); if (!c.on) throw new Error('REQ_OFF'); if (String(J.key || '') !== c.key) throw new Error('BAD_KEY');
      const L = (Array.isArray(J.forms) ? J.forms : []).slice(0, 200).map(f => ({ code: String(f.code || '').replace(/[^\w-]/g, '').slice(0, 20), title: String(f.title || '').slice(0, 120) })).filter(f => f.code);
      if (L.length && JSON.stringify(L) !== String(getSettings_().REQ_FORM_LIST || '')) setSetting_('REQ_FORM_LIST', JSON.stringify(L));
      out = { ok: true, codes: Object.keys(reqTypes_()), fac: REQ_FAC }; } catch (x) { out = { ok: false, error: String(x.message || x) }; }
    return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
  }
  if (J && J.act === 'reqsync') {
    let out; try { const R = reqSyncCore_(J.key, J.items || []); out = { ok: true, read: R.read, added: R.added, applied: R.applied, pending: R.pending, notFound: R.notFound }; } catch (x) { out = { ok: false, error: String(x.message || x) }; }
    return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput('unsupported');
}
function doGet(e) {
  const page = (e && e.parameter && e.parameter.page) === 'admin' ? 'Admin' : 'Index';
  const t = HtmlService.createTemplateFromFile(page);
  t.appUrl = appUrl_(); t.pubDash = pubLink_(false); t.pubAdmin = pubLink_(true);
  t.tab = String((e && e.parameter && e.parameter.tab) || '').replace(/[^a-z]/gi, '');
  t.sid = String((e && e.parameter && e.parameter.sid) || '').replace(/[^\d-]/g, '').slice(0, 12);
  t.pal = uiTheme_();
  return t.evaluate()
    .setTitle(page === 'Admin' ? 'ผู้ดูแลระบบ | ฐานข้อมูลนักศึกษา เภสัชฯ มข.' : 'Dashboard ฐานข้อมูลนักศึกษา เภสัชฯ มข.')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * URL ของเว็บแอปสำหรับลิงก์ภายในระบบ
 * ScriptApp.getService().getUrl() ของบัญชีองค์กรคืนรูปแบบเก่า /a/<โดเมน>/macros/s/… ซึ่งมักเปิดไม่ได้
 * ("ขออภัย ไม่สามารถเปิดไฟล์ได้ในเวลานี้") เมื่อเบราว์เซอร์ล็อกอินหลายบัญชี → แปลงเป็นรูปแบบปัจจุบัน /a/macros/<โดเมน>/s/…
 * ตั้งค่าเองได้ที่ ตั้งค่า → URL ของเว็บแอป (APP_URL) ให้ตรงกับลิงก์ที่ได้จาก Deploy → Manage deployments
 */
/** ธีมสีของระบบ: olive = เขียวมะกอก สีประจำคณะ (ค่าเริ่มต้น) · go = เขียว-ส้ม · earth = เขียวเอิร์ธโทน · orange = ส้ม */
const UI_THEMES = ['olive', 'go', 'earth', 'orange'];
function uiTheme_() { const t = String(getSettings_().UI_THEME || 'olive'); return UI_THEMES.indexOf(t) >= 0 ? t : 'olive'; }
function adminSetTheme(token, t) {
  const s = auth_(token, true);
  if (UI_THEMES.indexOf(t) < 0) throw new Error('ไม่รู้จักธีม');
  setSetting_('UI_THEME', t); log_(s.u, 'เปลี่ยนธีมสี', '', t); return t;
}
function appUrl_() {
  // ใช้รูปแบบกลาง https://script.google.com/macros/s/<ID>/exec เสมอ
  // (/a/macros/<โดเมน>/… เปิดไม่ได้เมื่อผู้ใช้ไม่ได้ล็อกอินบัญชีโดเมนนั้น เช่น โหมดไม่ระบุตัวตน → "ขออภัย ไม่สามารถเปิดไฟล์ได้ในเวลานี้")
  const norm = u => String(u || '').trim().replace(/^https:\/\/script\.google\.com\/a\/(?:macros\/)?[^/]+\/(?:macros\/)?s\//, 'https://script.google.com/macros/s/');
  const set = norm(getSettings_().APP_URL);
  if (/^https:\/\/script\.google\.com\/.+\/(exec|dev)$/.test(set)) return set;
  return norm(ScriptApp.getService().getUrl());
}

/** ลิงก์สำหรับส่งให้ผู้ใช้ (อีเมล/ปุ่มในระบบ) — ถ้าตั้ง "ลิงก์หน้าทางเข้า" (PUBLIC_URL เช่น GitHub Pages) ใช้ลิงก์นั้น
 *  pubLink_(true, '&tab=req') → https://pharmacykku.github.io/student-ps/?admin&tab=req */
const PUBLIC_URL_DEF = 'https://pharmacykku.github.io/student-ps/';
function pubBase_() { const v = getSettings_().PUBLIC_URL; const u = String(v === undefined ? PUBLIC_URL_DEF : v).trim(); return /^https:\/\/[^\s?#]+$/.test(u) ? u : ''; }
function pubLink_(admin, extra) {
  const b = pubBase_(), x = String(extra || '').replace(/^[?&]/, '');
  if (b) return b + (admin ? '?admin' + (x ? '&' + x : '') : (x ? '?' + x : ''));
  return appUrl_() + (admin ? '?page=admin' + (x ? '&' + x : '') : (x ? '?' + x : ''));
}
function include(name) {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}

// ======================= SETUP =======================
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheet_(SH.STUDENTS, STUDENT_HEADERS);
  ensureSheet_(SH.GRADES, GRADE_HEADERS);
  ensureSheet_(SH.USERS, USER_HEADERS);
  ensureSheet_(SH.LOG, LOG_HEADERS);
  ensureSheet_(SH.FILES, FILE_HEADERS);
  ensureSheet_(SH.COURSES, COURSE_HEADERS).getRange('A:C').setNumberFormat('@');
  ensureSheet_(SH.GRADCHK, GRADCHK_HEADERS).getRange('A:A').setNumberFormat('@');
  ensureSheet_(SH.ADVISORS, ADVISOR_HEADERS);
  ensureSheet_(SH.NOTES, NOTE_HEADERS).getRange('A:B').setNumberFormat('@');
  ensureSheet_(SH.PLAN, PLAN_HEADERS).getRange('A:A').setNumberFormat('@');
  ensureSheet_(SH.STATUSHIST, STATUSHIST_HEADERS).getRange('A:B').setNumberFormat('@');
  ensureSheet_(SH.REQ, REQ_HEADERS).getRange('C:C').setNumberFormat('@');
  ensureSheet_(SH.REPORTLOG, REPORTLOG_HEADERS);
  ensureSheet_(SH.MASTER, MASTER_HEADERS);
  ensureSheet_(SH.IMPORTLOG, IMPORTLOG_HEADERS).getRange('A:A').setNumberFormat('@');
  ensureSheet_(SH.UNDO, UNDO_HEADERS);
  ensureHeaders_(ss.getSheetByName(SH.GRADCHK), GRADCHK_HEADERS);
  const st = ensureSheet_(SH.SETTINGS, ['key', 'value']);

  // เพิ่มคอลัมน์ใหม่ที่ยังไม่มี (อัปเกรดจากเวอร์ชันก่อน)
  const s = ss.getSheetByName(SH.STUDENTS);
  const have = s.getRange(1, 1, 1, Math.max(1, s.getLastColumn())).getValues()[0].map(String);
  STUDENT_HEADERS.filter(h => have.indexOf(h) < 0).forEach(h => {
    s.getRange(1, s.getLastColumn() + 1).setValue(h).setFontWeight('bold').setBackground('#6b7b28').setFontColor('#ffffff');
  });
  // คอลัมน์ที่ต้องเก็บเป็นข้อความ (กันเลข 0 นำหน้าหาย)
  const hdr = s.getRange(1, 1, 1, s.getLastColumn()).getValues()[0].map(String);
  TEXT_COLS.forEach(h => {
    const c = hdr.indexOf(h) + 1; if (!c) return;
    s.getRange(1, c, s.getMaxRows(), 1).setNumberFormat('@');
  });
  ss.getSheetByName(SH.GRADES).getRange('A:A').setNumberFormat('@');

  // ค่าตั้งต้น
  const cur = getSettings_();
  Object.keys(DEFAULT_SETTINGS).forEach(k => {
    if (cur[k] === undefined) st.appendRow([k, DEFAULT_SETTINGS[k]]);
  });

  // โฟลเดอร์ Google Drive
  const root = getRootFolder_();
  getSubFolder_(root, 'ไฟล์นักศึกษา');
  getSubFolder_(root, 'ไฟล์นำเข้า');
  getSubFolder_(root, 'สำรองข้อมูล');
  ['ผลการเรียน', 'ไฟล์ตรวจสอบจบ', 'รายงานสิ้นภาค'].forEach(n => getSubFolder_(root, n));

  // ผู้ดูแลหลัก = เจ้าของสคริปต์ (บัญชีที่รัน setup)
  ensureSheet_(SH.ACCESS, ACCESS_HEADERS);
  let u = ss.getSheetByName(SH.USERS);
  if (String(u.getRange(1, 1).getValue()) === 'username') {       // อัปเกรดจากระบบรหัสผ่านเดิม
    u.setName('ผู้ใช้_เดิม_ไม่ใช้แล้ว');
    u = ensureSheet_(SH.USERS, USER_HEADERS);
    Logger.log('ย้ายชีตผู้ใช้เดิม (username/รหัสผ่าน) ไปที่ "ผู้ใช้_เดิม_ไม่ใช้แล้ว" — ระบบใหม่เข้าด้วยอีเมล + OTP');
  }
  const owner = normEmail_(Session.getEffectiveUser().getEmail());
  const hasOwner = u.getLastRow() > 1 && u.getRange(2, 3, u.getLastRow() - 1, 1).getValues().some(r => r[0] === 'owner');
  if (!hasOwner && owner) {
    u.appendRow([owner, 'ผู้ดูแลหลัก', 'owner', true, 'setup', new Date(), '']);
    Logger.log('ตั้ง ' + owner + ' เป็นผู้ดูแลหลัก (owner)');
  }
  Logger.log('โฟลเดอร์ข้อมูล: ' + root.getUrl());
  clearDashCache_();
}

/** ตั้งเวลาสำรองข้อมูลอัตโนมัติทุกวัน ~02:00 (รันครั้งเดียว) */
function installDailyBackup(hour) {
  try { CacheService.getScriptCache().remove('bkst'); } catch (e) {}
  ScriptApp.getProjectTriggers().filter(t => ['backupNow_', 'dailyBackup'].indexOf(t.getHandlerFunction()) >= 0)
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('dailyBackup').timeBased().everyDays(1).atHour(Number(hour) >= 0 ? Number(hour) : 2).create();
  setSetting_('BACKUP_AUTO', 'on');
}
function removeDailyBackup_() {
  try { CacheService.getScriptCache().remove('bkst'); } catch (e) {}
  ScriptApp.getProjectTriggers().filter(t => ['backupNow_', 'dailyBackup'].indexOf(t.getHandlerFunction()) >= 0).forEach(t => ScriptApp.deleteTrigger(t));
  setSetting_('BACKUP_AUTO', 'off');
}
/** เรียกโดย trigger รายวัน (กันเรียกซ้ำภายใน 6 ชม.) */
function dailyBackup() {
  const c = CacheService.getScriptCache();
  if (c.get('bk_lock')) return;
  c.put('bk_lock', '1', 6 * 3600);
  backupNow_('อัตโนมัติ');
}

function backupNow_(by) {
  try { CacheService.getScriptCache().remove('bkst'); } catch (e) {}
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const folder = getSubFolder_(getRootFolder_(), 'สำรองข้อมูล');
  const name = 'สำรอง_' + ss.getName() + '_' + Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyyMMdd_HHmm');
  const f = DriveApp.getFileById(ss.getId()).makeCopy(name, folder);
  // เก็บเฉพาะ N ชุดล่าสุด
  const keep = Number(getSettings_().BACKUP_KEEP || 14);
  if (keep > 0) {
    const L = [], it = folder.getFiles();
    while (it.hasNext()) { const x = it.next(); if (/^สำรอง_/.test(x.getName())) L.push(x); }
    L.sort((a, b) => b.getDateCreated() - a.getDateCreated()).slice(keep).forEach(x => x.setTrashed(true));
  }
  log_(by || 'ระบบ', 'สำรองข้อมูล', '', name);
  return f.getUrl();
}

// ======================= HELPERS =======================
function ensureSheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers])
      .setFontWeight('bold').setBackground('#6b7b28').setFontColor('#ffffff');
    sh.setFrozenRows(1);
  }
  return sh;
}

function sheet_(name) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sh) throw new Error('ไม่พบชีต "' + name + '" กรุณารัน setup()');
  return sh;
}

// ---- แคชภายในคำขอเดียว (ทุกครั้งที่เรียก google.script.run เป็นคำขอใหม่ จึงไม่ค้างข้ามคำขอ) ----
const MEMO_ = {};
let IN_LOCK_ = false;     // ระหว่างแก้ไขข้อมูล (withLock_) อ่านจากชีตจริงเสมอ ไม่ใช้ค่าที่จำไว้
function memo_(k, fn) { if (IN_LOCK_) return fn(); if (!(k in MEMO_)) MEMO_[k] = fn(); return MEMO_[k]; }
function dirty_() { Object.keys(MEMO_).forEach(k => delete MEMO_[k]); }

/** อ่านทั้งชีต (อ่านซ้ำในคำขอเดียวกันใช้ผลเดิม · ภายใน withLock_ อ่านใหม่เสมอ) */
function readTable_(name) { return memo_('t:' + name, () => readTableRaw_(name)); }
function readTableRaw_(name) {
  const sh = sheet_(name);
  const v = sh.getDataRange().getValues();
  const headers = v.shift() || [];
  return { sh, headers, rows: v };
}

function getSettings_() { return memo_('settings', () => {
  // แคชค่าตั้งค่า 10 นาที (ทุกคำขออ่านชีตตั้งค่า → ช้า) · ล้างอัตโนมัติเมื่อบันทึกผ่าน setSetting_
  const c = CacheService.getScriptCache(); let v = null; try { v = c.get('settings_c'); } catch (e) {}
  if (v) { try { return JSON.parse(v); } catch (e) {} }
  const o = getSettingsRaw_(); try { c.put('settings_c', JSON.stringify(o), 600); } catch (e) {} return o;
}); }
function getSettingsRaw_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.SETTINGS);
  const out = {};
  if (!sh) return out;
  sh.getDataRange().getValues().slice(1).forEach(r => { if (r[0]) out[String(r[0])] = String(r[1]); });
  return out;
}

function setSetting_(key, value) {
  const sh = sheet_(SH.SETTINGS);
  const v = sh.getDataRange().getValues();
  let row = 0;
  for (let i = 1; i < v.length; i++) if (v[i][0] === key) { row = i + 1; if (String(v[i][1]) === String(value)) return; break; }   // ค่าเดิม → ไม่ต้องเขียน/ไม่ล้างแคช
  if (row) sh.getRange(row, 2).setValue(value); else sh.appendRow([key, value]);
  delete MEMO_.settings; try { const c = CacheService.getScriptCache(); c.remove('settings_c'); c.put('dver', String(Date.now()), 21600); delete MEMO_.dver; } catch (e) {}
}

function getRootFolder_() {
  const id = getSettings_().DRIVE_FOLDER_ID;
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  const f = DriveApp.createFolder('ฐานข้อมูลนักศึกษา เภสัชฯ มข.');
  setSetting_('DRIVE_FOLDER_ID', f.getId());
  return f;
}

function getSubFolder_(parent, name) {
  const it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}
/** ชื่อโฟลเดอร์ภาค: ภาค 1 / ภาค 2 / ภาค 3 (ฤดูร้อน) */
function termFolderName_(t) { t = Number(t); return t === 3 ? 'ภาค 3 (ฤดูร้อน)' : 'ภาค ' + t; }
/** โฟลเดอร์แยกตามภาค: <root>/<kind>/<ปีการศึกษา>/ภาค n */
function termFolder_(kind, year, term) {
  const k = getSubFolder_(getRootFolder_(), kind);
  if (!Number(year) || !Number(term)) return k;
  return getSubFolder_(getSubFolder_(k, String(year)), termFolderName_(term));
}
/** เพิ่มคอลัมน์หัวตารางที่ยังไม่มี (อัปเกรดชีตเดิม) */
function ensureHeaders_(sh, headers) {
  if (!sh) return;
  const have = sh.getLastColumn() ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String) : [];
  headers.filter(h => have.indexOf(h) < 0).forEach(h => sh.getRange(1, sh.getLastColumn() + 1).setValue(h).setFontWeight('bold').setBackground('#6b7b28').setFontColor('#ffffff'));
}
function ensureSheetLazy_(name, headers) { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name) || ensureSheet_(name, headers); }

function hash_(salt, pw) {
  const b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + '|' + pw, Utilities.Charset.UTF_8);
  return b.map(x => ('0' + (x & 0xff).toString(16)).slice(-2)).join('');
}

function safe_(v) {
  if (typeof v === 'string') {
    v = v.trim();
    if (/^[=+@]/.test(v)) v = "'" + v;
  }
  return v;
}

function num_(v) {
  if (v === '' || v === null || v === undefined) return '';
  const n = Number(String(v).replace(/,/g, ''));
  return isNaN(n) ? '' : n;
}

function normId_(v) { return String(v || '').trim(); }

function log_(user, action, sid, detail) {
  try {
    sheet_(SH.LOG).appendRow([new Date(), user, action, sid || '', String(detail || '').slice(0, 5000)]);
  } catch (e) {}
}

/** keep = true: งานที่ไม่กระทบข้อมูลนักศึกษา/สรุปผล (บันทึกโน้ต ตรวจทาน ปฏิทิน ฯลฯ) → ไม่ล้างแคชรวม ระบบจึงไม่ต้องคำนวณใหม่ทั้งหมด */
function withLock_(fn, keep) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  dirty_(); IN_LOCK_ = true;
  try { return fn(); } finally { IN_LOCK_ = false; lock.releaseLock(); dirty_(); if (!keep) clearDashCache_(); }
}

// ---- cache ขนาดใหญ่ (แบ่งเป็นชิ้น) ----
function cachePutBig_(key, str, sec) {
  const c = CacheService.getScriptCache();
  const size = 30000, parts = {};
  const n = Math.ceil(str.length / size);
  for (let i = 0; i < n; i++) parts[key + '_' + i] = str.substr(i * size, size);
  parts[key + '_n'] = String(n);
  c.putAll(parts, sec);
}
function cacheGetBig_(key) {
  const c = CacheService.getScriptCache();
  const n = Number(c.get(key + '_n') || 0);
  if (!n) return null;
  const keys = []; for (let i = 0; i < n; i++) keys.push(key + '_' + i);
  const got = c.getAll(keys);
  let s = '';
  for (const k of keys) { if (got[k] == null) return null; s += got[k]; }
  return s;
}
/** ล้างแคชข้อมูลสรุป (เรียกอัตโนมัติหลังทุกการแก้ไขผ่าน withLock_) */
function clearDashCache_() { const c = CacheService.getScriptCache(); c.removeAll(['dash_n', 'psidx_n']); c.put('dver', String(Date.now()), 21600); delete MEMO_.dver; }
/** เลขเวอร์ชันข้อมูล — เปลี่ยนทุกครั้งที่มีการแก้ไข (ใช้เป็นกุญแจแคชผลคำนวณหนัก) */
function dataVer_() { return memo_('dver', () => { const c = CacheService.getScriptCache(); let v = c.get('dver'); if (!v) { v = String(Date.now()); c.put('dver', v, 21600); } return v; }); }
/** แคชผลคำนวณตามเวอร์ชันข้อมูล (ล้างอัตโนมัติเมื่อมีการแก้ไข) */
function verCache_(key, sec, fn) {
  const k = key + '@' + dataVer_(), hit = cacheGetBig_(k); if (hit) { try { return JSON.parse(hit); } catch (e) {} }
  const v = fn(); try { cachePutBig_(k, JSON.stringify(v), sec); } catch (e) {} return v;
}
/** ผลการเรียนรายภาคเปลี่ยน → ล้างสรุป GPAX */
function clearGradeCache_() { delete MEMO_.gsum; CacheService.getScriptCache().removeAll(['gsum_n', 'dash_n']); }
/** รายวิชา (ไฟล์ตรวจสอบจบ) เปลี่ยน → ล้างสถิติ F */
function clearCourseCache_() { delete MEMO_.fst; delete MEMO_.gcidx; CacheService.getScriptCache().removeAll(['fst_n', 'dash_n']); }

// ======================= PUBLIC DASHBOARD =======================
/**
 * ส่งข้อมูลแบบไม่ระบุตัวตน (ไม่มีรหัส/ชื่อ/ข้อมูลติดต่อ) ให้หน้า Dashboard คำนวณกราฟ
 */
function getDashboardData() {
  const cached = cacheGetBig_('dash');
  if (cached) return cached;

  const set = getSettings_();
  const st = readTable_(SH.STUDENTS);
  const H = idx_(st.headers);
  const programs = [], majors = [], rounds = [];
  const rIdx = r => { if (!r) return -1; let i = rounds.indexOf(r); if (i < 0) { rounds.push(r); i = rounds.length - 1; } return i; };
  const pIdx = p => { let i = programs.indexOf(p); if (i < 0) { programs.push(p); i = programs.length - 1; } return i; };
  const mIdx = m => { if (!m) return -1; let i = majors.indexOf(m); if (i < 0) { majors.push(m); i = majors.length - 1; } return i; };

  const map = {};
  const students = [];
  const provs = provinces_();
  const gcm = gradChkMap_(), gradG = Number(set.GRAD_GPAX || 2), nowYear = acadYearNow_();
  st.rows.forEach(r => {
    const id = normId_(r[H['รหัสนักศึกษา']]);
    if (!id) return;
    const note = String(r[H['หมายเหตุ']] || '');
    const m = note.match(/ลาออก\s*ภาค\s*(\d)\s*\/\s*(\d{2,4})/);
    const rec = {
      y: Number(r[H['ชั้นปี']]) || 0,
      c: cohort_(id),
      p: pIdx(String(r[H['หลักสูตร']] || 'ไม่ระบุ').trim()),
      s: String(r[H['สถานะ']] || 'ไม่ระบุ').trim(),
      m: mIdx(normMajor_(r[H['สาขาเน้น']])),
      v: isPrimary_(r[H['หลักสูตร']]) && H['จังหวัด'] !== undefined ? provs.indexOf(String(r[H['จังหวัด']] || '').trim()) : -1,
      r: m ? m[1] + '/' + String(m[2]).slice(-2) : '',
      a: H['รอบการรับเข้า'] !== undefined ? rIdx(normRound_(r[H['รอบการรับเข้า']])) : -1,
      h: H['GPAX มัธยมปลาย'] !== undefined && num_(r[H['GPAX มัธยมปลาย']]) !== '' ? num_(r[H['GPAX มัธยมปลาย']]) : null,
      x: sexOf_(r[H['คำนำหน้า']]),
      g: []
    };
    // ตกค้าง (เปอร์): กำลังศึกษา ชั้นปี 6 ขึ้นไป หรือศึกษามาเกิน 6 ปี · o = 1 ยังไม่ผ่านเกณฑ์จบ, 2 ไม่มีไฟล์ตรวจสอบจบ, 3 ผ่านเกณฑ์แล้ว (รอสำเร็จการศึกษา)
    const studied = nowYear ? nowYear - (2500 + Number(id.slice(0, 2))) + 1 : 0;
    if (rec.s === 'กำลังศึกษา' && (rec.y >= 6 || studied > 6)) { const gs = gradStatus_(gcm[id], gradG); rec.o = gs === 'no' ? 1 : gs === 'nodata' ? 2 : 3; rec.n = studied; }
    map[id] = rec;
    students.push(rec);
  });

  // ผลการเรียน
  const terms = [];
  const gr = readTable_(SH.GRADES);
  const G = idx_(gr.headers);
  const tmp = [];
  gr.rows.forEach(r => {
    const id = normId_(r[G['รหัสนักศึกษา']]);
    const rec = map[id];
    if (!rec) return;
    const yr = Number(r[G['ปีการศึกษา']]), tm = Number(r[G['ภาคการศึกษา']]);
    if (!yr || !tm) return;
    const key = yr * 10 + tm;
    if (terms.indexOf(key) < 0) terms.push(key);
    tmp.push([rec, key, num_(r[G['GPA']]), num_(r[G['GPAX']])]);
  });
  dataTerms_().forEach(k => { if (terms.indexOf(k) < 0) terms.push(k); });   // ภาคที่ผู้ดูแลอัปเดตข้อมูลนักศึกษา (อาจยังไม่มีเกรด)
  terms.sort((a, b) => a - b);
  tmp.forEach(t => t[0].g.push([terms.indexOf(t[1]), t[2] === '' ? null : t[2], t[3] === '' ? null : t[3]]));
  students.forEach(s => s.g.sort((a, b) => a[0] - b[0]));

  const out = JSON.stringify({
    updated: Utilities.formatDate(new Date(), 'Asia/Bangkok', 'd/M/yyyy HH:mm'),
    faculty: set.FACULTY_NAME || DEFAULT_SETTINGS.FACULTY_NAME,
    threshold: Number(set.GPAX_THRESHOLD || 2),
    watch: Number(set.GPAX_WATCH || 2.25),
    programs, majors, rounds, provinces: provs, primary: PRIMARY_PROG,
    terms: terms.map(k => (k % 10) + '/' + Math.floor(k / 10)), termKeys: terms, curTerm: curTerm_(), dataTerms: dataTerms_(),
    students, fcourses: dashF_(map, students)
  });
  try { cachePutBig_('dash', out, 21600); } catch (e) {}
  return out;
}

/** เพศจากคำนำหน้า: 1 = ชาย, 2 = หญิง, 0 = ไม่ระบุ */
function sexOf_(prefix) {
  const p = String(prefix || '').replace(/\s+/g, '').toLowerCase();
  if (/^(นาย|mr\.?|ด\.ช\.|เด็กชาย)$/.test(p)) return 1;
  if (/^(นางสาว|นาง|น\.ส\.|ms\.?|mrs\.?|miss|ด\.ญ\.|เด็กหญิง)$/.test(p)) return 2;
  return 0;
}
/** ผลตรวจเกณฑ์สำเร็จการศึกษาจากไฟล์ REG: 'ok' | 'no' | 'nodata' (ใช้ร่วมกับหน้าตรวจสิทธิ์) */
function gradStatus_(g, gradG) {
  if (!g) return 'nodata';
  const bad = Number(g.missing) > 0 || Number(g.pending) > 0 || (g.cats || []).some(x => x.status && x.status !== 'PASS') || g.gpax === '' || Number(g.gpax) < gradG;
  return bad ? 'no' : 'ok';
}

function idx_(headers) { const o = {}; headers.forEach((h, i) => o[String(h).trim()] = i); return o; }

function cohort_(id) { const m = String(id).match(/^(\d{2})/); return m ? m[1] : ''; }

function normMajor_(v) {
  v = String(v || '').trim();
  if (!v) return '';
  if (/ยังไม่เลือก/.test(v)) return 'ยังไม่เลือกสาขา';
  if (/อุตสาหการ/.test(v)) return 'เภสัชกรรมอุตสาหการ';
  if (/คุ้มครองผู้บริโภค/.test(v)) return 'คุ้มครองผู้บริโภคฯ';
  if (/E-?DIS/i.test(v)) return 'บริบาลฯ (E-DIS)';
  if (/ร้านยา/.test(v)) return 'บริบาลฯ (บริหารร้านยา)';
  if (/คลินิก/.test(v)) return 'บริบาลฯ (เภสัชกรรมคลินิก)';
  return v.replace(/^กลุ่มวิชา(สาขา)?เน้น/, '');
}

function normRound_(v) {
  v = String(v || '').trim();
  if (!v) return '';
  if (/port|รอบ\s*(ที่)?\s*1\b|^1$|tcas\s*1/i.test(v)) return ADMISSION_ROUNDS[0];
  if (/โควต|quota|รอบ\s*(ที่)?\s*2\b|^2$|tcas\s*2/i.test(v)) return ADMISSION_ROUNDS[1];
  if (/direct|รอบ\s*(ที่)?\s*4\b|^4$|tcas\s*4/i.test(v)) return ADMISSION_ROUNDS[3];
  if (/admission|รอบ\s*(ที่)?\s*3\b|^3$|tcas\s*3/i.test(v)) return ADMISSION_ROUNDS[2];
  return v;
}

/** ความชันเชิงเส้นของ GPA รายภาค (ต่อภาค) */
function slope_(ys) {
  const n = ys.length; if (n < 2) return null;
  let sx = 0, sy = 0, sxy = 0, sxx = 0;
  ys.forEach((y, x) => { sx += x; sy += y; sxy += x * y; sxx += x * x; });
  const d = n * sxx - sx * sx; return d ? (n * sxy - sx * sy) / d : null;
}

// ======================= AUTH (อีเมล + OTP ทุกครั้ง) =======================
const OTP_MINUTES = 10, OTP_MAX_TRY = 5, OTP_MAX_SEND = 3;   // ส่งได้ไม่เกิน 3 ครั้ง / 15 นาที
const ADMIN_ROLES = ['owner', 'admin'];

function normEmail_(e) { return String(e || '').trim().toLowerCase(); }
function isActive_(v) { return !(v === false || String(v).toUpperCase() === 'FALSE'); }
function roleName_(r) { return { owner: 'ผู้ดูแลหลัก', admin: 'ผู้ดูแลระบบ', staff: 'เจ้าหน้าที่', viewer: 'ดูอย่างเดียว', advisor: 'อาจารย์ที่ปรึกษา' }[r] || r; }

function findUser_(email) {
  const t = readTable_(SH.USERS), U = idx_(t.headers);
  for (let i = 0; i < t.rows.length; i++) {
    if (normEmail_(t.rows[i][U.email]) === email) return { t, U, i, r: t.rows[i] };
  }
  return null;
}

/** บันทึกการเข้าใช้ระบบ (ผู้ดูแลหลักดูได้คนเดียว) */
function access_(email, name, event, detail, ua) {
  try { sheet_(SH.ACCESS).appendRow([new Date(), email || '', name || '', event, String(detail || '').slice(0, 500), String(ua || '').slice(0, 200)]); } catch (e) {}
}

/** ขั้นที่ 1: ขอรหัส OTP ทางอีเมล */
function requestOtp(email, ua) {
  email = normEmail_(email);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('รูปแบบอีเมลไม่ถูกต้อง');
  const c = CacheService.getScriptCache();
  const sendKey = 'otps_' + email, n = Number(c.get(sendKey) || 0);
  if (n >= OTP_MAX_SEND) { access_(email, '', 'ขอ OTP เกินจำนวน', '', ua); throw new Error('ขอรหัสบ่อยเกินไป กรุณารอ 15 นาที'); }
  c.put(sendKey, String(n + 1), 900);
  const f = findUser_(email), adv = f ? null : advNamesOf_(email);
  if ((!f || !isActive_(f.r[f.U.active])) && !(adv && adv.length)) {
    access_(email, '', 'ปฏิเสธ: ไม่มีสิทธิ์เข้าใช้', f ? 'บัญชีถูกปิด' : 'ไม่พบอีเมลในรายชื่อผู้ใช้', ua);
    return { sent: true, masked: maskEmail_(email) };   // ไม่บอกว่าอีเมลมีอยู่หรือไม่
  }
  const dispName = f ? f.r[f.U['ชื่อที่แสดง']] : adv[0];
  const code = String(parseInt(Utilities.getUuid().replace(/-/g, '').slice(0, 12), 16) % 900000 + 100000);
  const salt = Utilities.getUuid();
  c.put('otp_' + email, JSON.stringify({ h: hash_(salt, code), salt, tries: 0 }), OTP_MINUTES * 60);
  const faculty = getSettings_().FACULTY_NAME || DEFAULT_SETTINGS.FACULTY_NAME;
  MailApp.sendEmail({
    to: email, name: 'ระบบฐานข้อมูลนักศึกษา ' + faculty,
    subject: 'รหัสยืนยันเข้าสู่ระบบ: ' + code,
    htmlBody: `<div style="font-family:Sarabun,Tahoma,sans-serif;color:#2a1a10;line-height:1.6;max-width:480px">
      <p>เรียน ${dispName || email}</p>
      <p>รหัสยืนยัน (OTP) สำหรับเข้าสู่ระบบฐานข้อมูลนักศึกษา ${faculty} คือ</p>
      <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#000000;margin:12px 0">${code}</p>
      <p>รหัสนี้ใช้ได้ ${OTP_MINUTES} นาที และใช้ได้ครั้งเดียว<br>หากคุณไม่ได้ขอรหัสนี้ โปรดแจ้งผู้ดูแลระบบ และไม่ต้องส่งรหัสนี้ให้ผู้ใด</p>
      <p style="font-size:12px;color:#9a8576">ขอเมื่อ ${Utilities.formatDate(new Date(), 'Asia/Bangkok', 'd/M/yyyy HH:mm')} น.</p></div>`
  });
  access_(email, dispName, 'ส่ง OTP', adv ? 'อาจารย์ที่ปรึกษา' : '', ua);
  return { sent: true, masked: maskEmail_(email), minutes: OTP_MINUTES };
}

function maskEmail_(e) { const [a, d] = e.split('@'); return a.slice(0, 2) + '•••' + (a.length > 4 ? a.slice(-1) : '') + '@' + d; }

/** ขั้นที่ 2: ยืนยัน OTP → เปิด session */
function verifyOtp(email, code, ua) {
  email = normEmail_(email);
  const c = CacheService.getScriptCache(), key = 'otp_' + email;
  const raw = c.get(key);
  if (!raw) { access_(email, '', 'OTP หมดอายุ/ไม่มี', '', ua); throw new Error('รหัสหมดอายุ กรุณาขอรหัสใหม่'); }
  const o = JSON.parse(raw);
  if (hash_(o.salt, String(code).trim()) !== o.h) {
    o.tries++;
    if (o.tries >= OTP_MAX_TRY) { c.remove(key); access_(email, '', 'OTP ผิดเกินกำหนด', '', ua); throw new Error('ใส่รหัสผิดเกิน ' + OTP_MAX_TRY + ' ครั้ง กรุณาขอรหัสใหม่'); }
    c.put(key, JSON.stringify(o), OTP_MINUTES * 60);
    access_(email, '', 'OTP ไม่ถูกต้อง', 'ครั้งที่ ' + o.tries, ua);
    throw new Error('รหัสไม่ถูกต้อง (เหลือ ' + (OTP_MAX_TRY - o.tries) + ' ครั้ง)');
  }
  c.remove(key);
  const f = findUser_(email);
  if (f && isActive_(f.r[f.U.active])) return startSession_(f, ua);
  const adv = f ? null : advNamesOf_(email);
  if (adv && adv.length) return startAdvSession_(email, adv, ua);
  throw new Error('บัญชีนี้ไม่มีสิทธิ์เข้าใช้');
}

function startSession_(f, ua) {
  const email = normEmail_(f.r[f.U.email]);
  const token = Utilities.getUuid() + Utilities.getUuid().slice(0, 8);
  const sess = { u: email, name: f.r[f.U['ชื่อที่แสดง']] || email, role: f.r[f.U.role] || 'staff', t0: Date.now() };
  const tabs = f.U['เมนูที่อนุญาต'] !== undefined ? String(f.r[f.U['เมนูที่อนุญาต']] || '').split(',').map(x => x.trim()).filter(x => /^p[A-Z]\w+$/.test(x)) : [];
  if (tabs.length && ADMIN_ROLES.indexOf(sess.role) < 0) sess.tabs = tabs;
  CacheService.getScriptCache().put('sess_' + token, JSON.stringify(sess), SESSION_HOURS * 3600);
  f.t.sh.getRange(f.i + 2, f.U['เข้าใช้ล่าสุด'] + 1).setValue(new Date());
  access_(email, sess.name, 'เข้าสู่ระบบสำเร็จ', roleName_(sess.role), ua);
  log_(email, 'เข้าสู่ระบบ', '', '');
  return { token, name: sess.name, role: sess.role, u: email };
}

/** บันทึกการกด "อนุญาตและเข้าสู่ระบบ" */
function acceptConsent(token, ua) {
  const s = auth_(token, false, true);
  access_(s.u, s.name, 'อนุญาตการเข้าถึงบัญชี', roleName_(s.role), ua);
  return true;
}
function logout(token) {
  const c = CacheService.getScriptCache(), s = c.get('sess_' + token);
  if (s) { const o = JSON.parse(s); access_(o.u, o.name, 'ออกจากระบบ', 'ใช้งาน ' + Math.round((Date.now() - (o.t0 || Date.now())) / 60000) + ' นาที', ''); }
  c.remove('sess_' + token); return true;
}

function auth_(token, needAdmin, allowAdv) {
  const c = CacheService.getScriptCache(), s = c.get('sess_' + token);
  if (!s) throw new Error('SESSION_EXPIRED');
  const sess = JSON.parse(s);
  c.put('sess_' + token, s, SESSION_HOURS * 3600);
  // อาจารย์ที่ปรึกษา (เข้าผ่านพอร์ทัล) เรียกได้เฉพาะฟังก์ชันที่อนุญาตไว้ชัดเจน
  if (sess.role === 'advisor' && !allowAdv) throw new Error('สิทธิ์ไม่เพียงพอ');
  if (needAdmin && ADMIN_ROLES.indexOf(sess.role) < 0) throw new Error('สิทธิ์ไม่เพียงพอ (ต้องเป็นผู้ดูแลระบบ)');
  return sess;
}

function authOwner_(token) {
  const s = auth_(token);
  if (s.role !== 'owner') throw new Error('เฉพาะผู้ดูแลหลักเท่านั้น');
  return s;
}

/** สิทธิ์เขียนข้อมูล (owner/admin/staff) — viewer ดูได้อย่างเดียว */
function authW_(token) {
  const s = auth_(token);
  if (s.role === 'viewer') throw new Error('บัญชีนี้มีสิทธิ์ดูข้อมูลอย่างเดียว');
  return s;
}

function checkSession(token) {
  try { const s = auth_(token, false, true); return { name: s.name, role: s.role, u: s.u }; } catch (e) { return null; }
}

// ---- จัดการผู้ใช้ (ผู้ดูแลหลักเท่านั้น) ----
function adminListUsers(token) {
  authOwner_(token);
  const t = readTable_(SH.USERS), U = idx_(t.headers);
  const fmt = d => d ? Utilities.formatDate(new Date(d), 'Asia/Bangkok', 'd/M/yyyy HH:mm') : '';
  return t.rows.filter(r => r[U.email]).map(r => ({
    email: normEmail_(r[U.email]), name: r[U['ชื่อที่แสดง']], role: r[U.role], active: isActive_(r[U.active]),
    by: r[U['เพิ่มโดย']], created: fmt(r[U['สร้างเมื่อ']]), last: fmt(r[U['เข้าใช้ล่าสุด']]), tabs: U['เมนูที่อนุญาต'] !== undefined ? String(r[U['เมนูที่อนุญาต']] || '') : ''
  }));
}

function adminSaveUser(token, user) {
  const s = authOwner_(token);
  const email = normEmail_(user.email);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('รูปแบบอีเมลไม่ถูกต้อง');
  if (['admin', 'staff', 'viewer'].indexOf(user.role) < 0) throw new Error('สิทธิ์ไม่ถูกต้อง');
  const tabs = [].concat(user.tabs || []).filter(x => MENU_TABS[x]).join(',');
  return withLock_(() => {
    ensureHeaders_(sheet_(SH.USERS), USER_HEADERS);
    const f = findUser_(email);
    const now = new Date();
    if (!f) {
      sheet_(SH.USERS).appendRow([email, user.name || email, user.role, user.active !== false, s.u, now, '', tabs]);
      log_(s.u, 'เพิ่มผู้ใช้', '', email + ' (' + user.role + ')');
      access_(s.u, s.name, 'เพิ่มผู้ใช้', email + ' · ' + roleName_(user.role), '');
      if (user.notify !== false) {
        try {
          const faculty = getSettings_().FACULTY_NAME || DEFAULT_SETTINGS.FACULTY_NAME;
          const url = pubLink_(true);
          MailApp.sendEmail({ to: email, name: 'ระบบฐานข้อมูลนักศึกษา ' + faculty, subject: 'คุณได้รับสิทธิ์เข้าใช้ระบบฐานข้อมูลนักศึกษา ' + faculty,
            htmlBody: `<div style="font-family:Sarabun,Tahoma,sans-serif;line-height:1.6">เรียน ${user.name || email}<br><br>${s.name} ได้เพิ่มคุณเป็นผู้ใช้ระบบฐานข้อมูลนักศึกษา ${faculty} สิทธิ์: <b>${roleName_(user.role)}</b><br>
            เข้าใช้งานได้ที่ <a href="${url}">${url}</a> โดยกรอกอีเมลนี้ ระบบจะส่งรหัส OTP มาทางอีเมลทุกครั้งที่เข้าสู่ระบบ</div>` });
        } catch (e) {}
      }
    } else {
      if (f.r[f.U.role] === 'owner') throw new Error('ไม่สามารถแก้ไขบัญชีผู้ดูแลหลักได้');
      f.t.sh.getRange(f.i + 2, f.U['ชื่อที่แสดง'] + 1).setValue(user.name || email);
      f.t.sh.getRange(f.i + 2, f.U.role + 1).setValue(user.role);
      f.t.sh.getRange(f.i + 2, f.U.active + 1).setValue(user.active !== false);
      f.t.sh.getRange(f.i + 2, idx_(f.t.sh.getRange(1, 1, 1, f.t.sh.getLastColumn()).getValues()[0].map(String))['เมนูที่อนุญาต'] + 1).setValue(tabs);
      log_(s.u, 'แก้ไขผู้ใช้', '', email + ' → ' + user.role + (user.active === false ? ' (ปิดใช้งาน)' : ''));
      access_(s.u, s.name, 'แก้ไขผู้ใช้', email + ' · ' + roleName_(user.role) + (user.active === false ? ' · ปิดใช้งาน' : ''), '');
    }
    return adminListUsers(token);
  });
}

/** บันทึกการเข้าใช้ระบบ — ผู้ดูแลหลักเท่านั้น */
function ownerGetAccessLog(token, days) {
  authOwner_(token);
  const sh = sheet_(SH.ACCESS), last = sh.getLastRow();
  if (last < 2) return [];
  const since = Date.now() - (Number(days) || 30) * 86400000;
  const n = Math.min(last - 1, 5000);
  return sh.getRange(last - n + 1, 1, n, ACCESS_HEADERS.length).getValues()
    .filter(r => r[0] instanceof Date && r[0].getTime() >= since).reverse()
    .map(r => ({ time: Utilities.formatDate(r[0], 'Asia/Bangkok', 'd/M/yyyy HH:mm:ss'), ts: r[0].getTime(), email: r[1], name: r[2], event: r[3], detail: r[4], ua: r[5] }));
}

// ======================= STUDENTS (ADMIN) =======================
function rowToObj_(headers, r) {
  const o = {};
  headers.forEach((h, i) => {
    let v = r[i];
    if (v instanceof Date) v = Utilities.formatDate(v, 'Asia/Bangkok', 'd/M/yyyy HH:mm');
    o[h] = v === null || v === undefined ? '' : v;
  });
  return o;
}

/** สัญญาณสุขภาวะของนักศึกษา 1 คน (โหลดเมื่อเปิดโปรไฟล์) */
function adminWBOne(token, id) {
  const s = auth_(token); if (!canMH_(s)) throw new Error('สิทธิ์ไม่เพียงพอ');
  id = normId_(id);
  const WBM = verCache_('wbm', 3600, () => { const t = readTable_(SH.STUDENTS), H = idx_(t.headers), sum = gradeSummary_(), fs = fStats_().byId, mh = mhLatest_(), care = mhCare_(), o = {}; t.rows.forEach(r => { const k = normId_(r[0]); if (k) o[k] = wbOf_(k, sum[k], fs[k], mh[k], care[k], r, H); }); return o; });
  const w = WBM[id]; return w ? { reasons: w.reasons || [] } : { reasons: [] };
}
function adminBootstrap(token) {
  const s = auth_(token), mask = getSettings_().MASK_CONTACT !== 'off', mhOk = canMH_(s);
  // ส่วนที่เหมือนกันทุกคน (ตามสิทธิ์ข้อมูลสุขภาพจิต/การปิดบังข้อมูลติดต่อ) แคชไว้จนกว่าจะมีการแก้ไขข้อมูล
  const stuPack = verCache_('bstu' + (mhOk ? 1 : 0) + (mask ? 1 : 0), 3600, () => {
    const t = readTable_(SH.STUDENTS), H = idx_(t.headers), sum = gradeSummary_(), fs = fStats_().byId;
    const mh = mhOk ? mhLatest_() : {}, care = mhOk ? mhCare_() : {};
    const WBM = mhOk ? verCache_('wbm', 3600, () => { const o = {}; t.rows.forEach(r => { const id = normId_(r[0]); if (id) o[id] = wbOf_(id, sum[id], fs[id], mh[id], care[id], r, H); }); return o; }) : {};
    const cols = STUDENT_HEADERS.concat(['_gpax', '_term', '_prev', '_first', '_slope', '_n', '_h', '_fopen', '_fever', '_ftimes', '_stT']).concat(mhOk ? ['_mh', '_wb'] : []);
    // ภาคที่มีผลของสถานะปัจจุบัน (จากประวัติสถานะ เช่น ลาพัก ภาค 2/2569)
    const stT = {}; try { const sh = readTable_(SH.STATUSHIST), S = idx_(sh.headers); sh.rows.forEach(r => { const k = normId_(r[S['รหัสนักศึกษา']]); if (!k) return; const tm = termStr_(r[S['ภาคที่มีผล']]), key = String(r[S['สถานะใหม่']]); const c = stT[k + '|' + key]; if (!c || termSortKey_(tm) >= termSortKey_(c)) stT[k + '|' + key] = tm; }); } catch (e) {}
    t.headers.forEach(h => { if (cols.indexOf(h) < 0) cols.push(h); });
    const rows = t.rows.filter(r => normId_(r[0])).map(r => {
      const o = rowToObj_(t.headers, r), id = normId_(r[0]);
      if (mask) CONTACT_FIELDS.forEach(h => { o[h] = maskVal_(h, o[h]); });
      const g = sum[id], f = fs[id];
      o._gpax = g ? g.gpax : ''; o._term = g ? g.term : ''; o._prev = g ? g.prev : ''; o._first = g ? g.first : '';
      o._slope = g && g.slope != null ? Math.round(g.slope * 1000) / 1000 : ''; o._n = g ? g.n : 0; o._h = g ? g.h : [];
      o._fopen = f ? f.open : ''; o._fever = f ? f.ever : ''; o._ftimes = f ? f.times : '';
      { const cs = String(o['สถานะ'] || ''); o._stT = cs && cs !== 'กำลังศึกษา' ? (stT[id + '|' + cs] || '') : ''; }
      if (mhOk) { const w = WBM[id]; if (w) { o._wb = Object.assign({}, w); delete o._wb.reasons; } else o._wb = null; o._mh = mh[id] || null; }   // สัญญาณ (reasons) โหลดเมื่อเปิดโปรไฟล์ → ลดขนาดข้อมูลตอนเข้าระบบ
      return cols.map(k => o[k] === undefined || o[k] === null ? (k === '_mh' || k === '_wb' ? null : '') : o[k]);
    });
    return { cols, rows };
  });
  const com = verCache_('bcom', 3600, () => {
    const set = getSettings_(), sum = gradeSummary_(), termCount = {};
    Object.keys(sum).forEach(id => sum[id].h.forEach(x => termCount[x[0]] = (termCount[x[0]] || 0) + 1));
    return {
    statusList: masterList_('สถานะ'), programList: masterList_('หลักสูตร'), provinceList: provinces_(), primaryProg: PRIMARY_PROG, roundList: masterList_('รอบการรับเข้า'),
    majorList: masterList_('สาขาเน้น'), advisorList: Object.keys(advisorMap_()).sort((a, b) => a.localeCompare(b, 'th')),
    terms: [...new Set(Object.keys(termCount).map(Number).concat(dataTerms_()))].sort((a, b) => b - a).map(k => ({ key: k, label: termLabel_(k), n: termCount[k] || 0, data: dataTerms_().indexOf(k) >= 0 })),
    curTerm: curTerm_(), dataTerms: dataTerms_(), snapTerms: Object.keys(termSnaps_()).map(Number),
    closedTerms: closedTerms_(),
    settings: { ADV_PORTAL: advPortalOn_() ? 'on' : 'off', WB_BANDS: wbBands_(), LEVELS: acadLevels_(), ACAD: acadRules_(), ACAD_TYPES: ACAD_TYPES, UI_THEME: uiTheme_(), APP_URL: set.APP_URL || '', PUBLIC_URL: pubBase_(), APP_URL_AUTO: appUrl_(), GPAX_THRESHOLD: set.GPAX_THRESHOLD, GPAX_WATCH: set.GPAX_WATCH, FACULTY_NAME: set.FACULTY_NAME, DRIVE_FOLDER_ID: set.DRIVE_FOLDER_ID, REPORT_CC: set.REPORT_CC || '', MASK_CONTACT: set.MASK_CONTACT || 'on', IDLE_MIN: set.IDLE_MIN || '30', GRAD_GPAX: set.GRAD_GPAX || '2.00', PROB_DISMISS: set.PROB_DISMISS || '1.50', PROB_LOW: set.PROB_LOW || '2.00', PROB_START_TERM: set.PROB_START_TERM || '2', PROB_CONSEC: set.PROB_CONSEC || '2' },
    gradChecked: gradCheckIndex_(), advDept: (() => { const AI = advisorInfo_(), o = {}; Object.keys(AI).forEach(n => { if (AI[n].dept) o[n] = AI[n].dept; }); return o; })(), advDepts: advDepts_(),
    driveUrl: set.DRIVE_FOLDER_ID ? 'https://drive.google.com/drive/folders/' + set.DRIVE_FOLDER_ID : '' };
  });
  return Object.assign({}, com, { me: s, menuTabs: MENU_TABS, headers: STUDENT_HEADERS, stuPack, canMH: mhOk, mhAdmin: ADMIN_ROLES.indexOf(s.role) >= 0, notes: notesOverview_(s), noteCats: NOTE_CATS });
}

function gradeSummary_() {
  return memo_('gsum', () => {
    const hit = cacheGetBig_('gsum'); if (hit) { try { return JSON.parse(hit); } catch (e) {} }
    const v = gradeSummary_Raw_(); try { cachePutBig_('gsum', JSON.stringify(v), 21600); } catch (e) {}
    return v;
  });
}
function gradeSummary_Raw_() {
  const gr = readTable_(SH.GRADES), G = idx_(gr.headers), by = {};
  gr.rows.forEach(r => {
    const id = normId_(r[G['รหัสนักศึกษา']]);
    const y = Number(r[G['ปีการศึกษา']]), t = Number(r[G['ภาคการศึกษา']]);
    if (!id || !y || !t) return;
    (by[id] = by[id] || []).push({ key: y * 10 + t, term: t + '/' + y, gpa: num_(r[G['GPA']]), gpax: num_(r[G['GPAX']]) });
  });
  const out = {};
  Object.keys(by).forEach(id => {
    const L = by[id].sort((a, b) => a.key - b.key);
    const gx = L.filter(x => x.gpax !== '');
    const last = gx[gx.length - 1];
    out[id] = {
      gpax: last ? last.gpax : '', term: last ? last.term : '',
      prev: gx.length > 1 ? gx[gx.length - 2].gpax : '',
      first: gx.length ? gx[0].gpax : '',
      slope: slope_(L.filter(x => x.gpa !== '').map(x => x.gpa)),
      n: L.length,
      h: L.map(x => [x.key, x.gpa, x.gpax])
    };
  });
  return out;
}

// ======================= หัวหน้านักศึกษา (เก็บในคอลัมน์ "บทบาทชั้นปี") =======================
const LEAD_TOK = { year: 'หัวหน้าชั้นปี', group: 'หัวหน้ากลุ่ม', major: 'หัวหน้าสาขาเน้น', sub: 'หัวหน้าสาขาย่อย' };
const leadGrp_ = p => { p = String(p || '').trim(); return /^โครงการพิเศษ/.test(p) ? 'โครงการพิเศษ' : /นานาชาติ/.test(p) ? 'นานาชาติ' : /ภาคปกติ/.test(p) ? 'ภาคปกติ' : p; };
/** สาขาเน้น 3 สาขา (รวมสาขาย่อย/สะกดต่างกัน) */
const LEAD_MAJ = ['คุ้มครองผู้บริโภค', 'บริบาลทางเภสัชกรรม', 'เภสัชกรรมอุตสาหการ'];
/** สาขาย่อยของการบริบาลทางเภสัชกรรม */
const LEAD_SUB = ['E-DIS', 'ร้านยา', 'เภสัชกรรมคลินิก'];
const leadSub_ = m => { m = String(m || ''); return /E\s*-?\s*DIS/i.test(m) ? LEAD_SUB[0] : /ร้านยา/.test(m) ? LEAD_SUB[1] : /คลินิก/.test(m) ? LEAD_SUB[2] : ''; };
const leadMaj_ = m => { m = String(m || ''); return /คุ้มครองผู้บริโภค/.test(m) ? LEAD_MAJ[0] : /บริบาล/.test(m) ? LEAD_MAJ[1] : /อุตสาหการ/.test(m) ? LEAD_MAJ[2] : ''; };
const roleToks_ = v => String(v || '').split(/\s*[,،]\s*/).map(x => x.trim()).filter(Boolean);
/**
 * กำหนด/นำออกหัวหน้า · o = { kind: 'year'|'group'|'major', year, group, major, id ('' = นำออก) }
 * หนึ่งตำแหน่งต่อหนึ่งขอบเขต: คนเดิมในขอบเขตเดียวกันจะถูกนำบทบาทออกให้อัตโนมัติ
 */
function adminSetLeader(token, o) {
  const s = authW_(token); tabGuard_(s, 'pStudents');
  const tok = LEAD_TOK[o && o.kind]; if (!tok) throw new Error('ประเภทหัวหน้าไม่ถูกต้อง');
  const y = String(Number(o.year) || ''), id = o.id ? normId_(o.id) : '';
  if (!y) throw new Error('ไม่ระบุชั้นปี');
  if (o.kind === 'major' && (LEAD_MAJ.indexOf(o.major) < 0 || o.major === LEAD_MAJ[1])) throw new Error(o.major === LEAD_MAJ[1] ? 'สาขาการบริบาลทางเภสัชกรรมกำหนดหัวหน้าที่สาขาย่อย (E-DIS / ร้านยา / เภสัชกรรมคลินิก)' : 'สาขาเน้นไม่ถูกต้อง');
  if (o.kind === 'sub') { o.major = LEAD_MAJ[1]; if (LEAD_SUB.indexOf(o.sub) < 0) throw new Error('สาขาย่อยไม่ถูกต้อง'); }
  return withLock_(() => {
    const sh = sheet_(SH.STUDENTS), v = sh.getDataRange().getValues(), H = idx_(v[0]);
    if (H['บทบาทชั้นปี'] === undefined) throw new Error('ไม่พบคอลัมน์ "บทบาทชั้นปี" ในชีตนักศึกษา');
    const inScope = r => String(Number(r[H['ชั้นปี']])) === y && (o.kind !== 'group' || leadGrp_(r[H['หลักสูตร']]) === o.group) && (o.kind !== 'major' || leadMaj_(r[H['สาขาเน้น']]) === o.major) && (o.kind !== 'sub' || (leadMaj_(r[H['สาขาเน้น']]) === o.major && leadSub_(r[H['สาขาเน้น']]) === o.sub));
    const changes = {}; let target = null;
    for (let i = 1; i < v.length; i++) {
      const rid = normId_(v[i][0]); if (!rid) continue;
      const T = roleToks_(v[i][H['บทบาทชั้นปี']]);
      if (rid === id) { if (!inScope(v[i])) throw new Error('นักศึกษาคนนี้ไม่อยู่ในกลุ่มที่เลือก'); target = i; }
      if (inScope(v[i]) && T.indexOf(tok) >= 0 && rid !== id) { const n = T.filter(x => x !== tok).join(', '); sh.getRange(i + 1, H['บทบาทชั้นปี'] + 1).setValue(n); changes[rid] = n; }
    }
    if (id) {
      if (target == null) throw new Error('ไม่พบรหัส ' + id);
      const T = roleToks_(v[target][H['บทบาทชั้นปี']]);
      if (T.indexOf(tok) < 0) { const n = T.concat(tok).join(', '); sh.getRange(target + 1, H['บทบาทชั้นปี'] + 1).setValue(n); changes[id] = n; }
    }
    const scope = 'ชั้นปี ' + y + (o.kind === 'group' ? ' ' + o.group : o.kind === 'major' ? ' ' + o.major : o.kind === 'sub' ? ' ' + o.major + ' (' + o.sub + ')' : '');
    log_(s.u, id ? 'กำหนดหัวหน้า' : 'นำหัวหน้าออก', id, tok + ' · ' + scope);
    return { changes };
  });
}

function adminSaveStudent(token, obj, isNew) {
  const s = authW_(token);
  const id = normId_(obj['รหัสนักศึกษา']);
  if (!/^\d{9}-\d$/.test(id)) throw new Error('รูปแบบรหัสนักศึกษาต้องเป็น 000000000-0');
  return withLock_(() => {
    const sh = sheet_(SH.STUDENTS);
    const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    const found = sh.getRange('A:A').createTextFinder(id).matchEntireCell(true).findNext();
    if (isNew && found) throw new Error('มีรหัสนักศึกษานี้อยู่แล้ว');
    if (!isNew && !found) throw new Error('ไม่พบรหัสนักศึกษา');
    obj['อัปเดตล่าสุด'] = new Date();
    if (isNew && !obj['สถานะการอนุมัติ']) obj['สถานะการอนุมัติ'] = 'รออนุมัติ';
    let before = null;
    let rowIdx;
    if (found) {
      rowIdx = found.getRow();
      before = rowToObj_(headers, sh.getRange(rowIdx, 1, 1, headers.length).getValues()[0]);
    } else {
      rowIdx = sh.getLastRow() + 1;
    }
    CONTACT_FIELDS.forEach(h => { if (before && /•/.test(String(obj[h] || ''))) obj[h] = before[h]; });
    const progNew = obj['หลักสูตร'] !== undefined ? obj['หลักสูตร'] : (before ? before['หลักสูตร'] : '');
    const provNew = String(obj['จังหวัด'] !== undefined ? obj['จังหวัด'] : (before ? before['จังหวัด'] : '')).trim();
    const PV = provinces_();
    if (isPrimary_(progNew) && PV.indexOf(provNew) < 0) throw new Error('โครงการพิเศษ ปฐมภูมิ ต้องระบุจังหวัด: ' + PV.join(' / '));   // ค่าที่ถูกปิดบัง = ไม่เปลี่ยน
    const row = headers.map(h => {
      if (h === 'ชั้นปี' || h === 'GPAX มัธยมปลาย') return num_(obj[h]);
      if (h === 'รอบการรับเข้า') return normRound_(obj[h]);
      if (obj[h] === undefined) return before ? before[h] : '';
      return safe_(obj[h]);
    });
    sh.getRange(rowIdx, 1, 1, headers.length).setValues([row]);
    const diff = before ? headers.filter(h => h !== 'อัปเดตล่าสุด' && String(before[h]) !== String(row[headers.indexOf(h)]))
      .map(h => h + ': ' + before[h] + ' → ' + row[headers.indexOf(h)]).join('; ') : 'เพิ่มใหม่';
    log_(s.u, isNew ? 'เพิ่มนักศึกษา' : 'แก้ไขนักศึกษา', id, diff);
    const newSt = String(row[headers.indexOf('สถานะ')] || ''), oldSt = before ? String(before['สถานะ'] || '') : '';
    if (newSt && newSt !== oldSt) addStatusHist_([[id, oldSt || '(เพิ่มใหม่)', newSt, obj._stTerm || '', obj._stReason || '', obj._stRef || '', isNew ? 'เพิ่มนักศึกษา' : 'แก้ไขข้อมูล', s.u]]);
    const out = rowToObj_(headers, row);
    if (getSettings_().MASK_CONTACT !== 'off') CONTACT_FIELDS.forEach(h => out[h] = maskVal_(h, out[h]));
    return out;
  });
}

function adminDeleteStudent(token, id) {
  const s = auth_(token, true);
  id = normId_(id);
  return withLock_(() => {
    const sh = sheet_(SH.STUDENTS);
    const f = sh.getRange('A:A').createTextFinder(id).matchEntireCell(true).findNext();
    if (!f) throw new Error('ไม่พบรหัสนักศึกษา');
    const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    const before = sh.getRange(f.getRow(), 1, 1, headers.length).getValues()[0];
    sh.deleteRow(f.getRow());
    log_(s.u, 'ลบนักศึกษา', id, JSON.stringify(before));
    return true;
  });
}

const BULK_FIELDS = ['สถานะ', 'ชั้นปี', 'สถานะการอนุมัติ', 'อาจารย์ที่ปรึกษา', 'หลักสูตร', 'สาขาเน้น', 'รอบการรับเข้า'];
function adminBulkUpdate(token, ids, field, value, meta) {
  meta = meta || {};
  const s = authW_(token);
  if (BULK_FIELDS.indexOf(field) < 0) throw new Error('ไม่อนุญาตให้แก้ไขฟิลด์นี้แบบกลุ่ม');
  if (!ids || !ids.length) throw new Error('ยังไม่ได้เลือกนักศึกษา');
  return withLock_(() => {
    const t = readTable_(SH.STUDENTS), H = idx_(t.headers);
    const set = {}; ids.forEach(i => set[normId_(i)] = 1);
    const col = H[field], upCol = H['อัปเดตล่าสุด'];
    let n = 0; const now = new Date(); const hist = [];
    t.rows.forEach(r => {
      if (!set[normId_(r[0])]) return;
      if (field === 'สถานะ' && String(r[col]) !== String(value)) hist.push([normId_(r[0]), String(r[col] || ''), value, meta.term || '', meta.reason || '', meta.ref || '', 'แก้ไขแบบกลุ่ม', s.u]);
      r[col] = field === 'ชั้นปี' ? num_(value) : field === 'รอบการรับเข้า' ? normRound_(value) : safe_(value);
      if (upCol !== undefined) r[upCol] = now;
      n++;
    });
    if (t.rows.length) t.sh.getRange(2, 1, t.rows.length, t.headers.length).setValues(t.rows);
    if (hist.length) addStatusHist_(hist);
    log_(s.u, 'แก้ไขแบบกลุ่ม', '', field + ' = ' + value + ' (' + n + ' คน): ' + ids.join(', ').slice(0, 3000));
    return n;
  });
}

/** เลื่อนชั้นปี +1 ให้นักศึกษาที่ "กำลังศึกษา" (ขึ้นปีการศึกษาใหม่) */
function adminPromoteYear(token) {
  const s = auth_(token, true);
  return withLock_(() => {
    const t = readTable_(SH.STUDENTS), H = idx_(t.headers);
    let n = 0;
    t.rows.forEach(r => {
      if (String(r[H['สถานะ']]).trim() !== 'กำลังศึกษา') return;
      const y = Number(r[H['ชั้นปี']]);
      if (y >= 1 && y < 6) { r[H['ชั้นปี']] = y + 1; n++; }
    });
    if (t.rows.length) t.sh.getRange(2, 1, t.rows.length, t.headers.length).setValues(t.rows);
    log_(s.u, 'เลื่อนชั้นปี', '', n + ' คน');
    return n;
  });
}

/**
 * นำเข้า/อัปเดตนักศึกษา (upsert ด้วยรหัสนักศึกษา)
 * rows: array ของ object {หัวคอลัมน์: ค่า}; mode: 'upsert' | 'insertOnly'
 */
function adminImportStudents(token, rows, mode, meta) {
  const s = authW_(token); tabGuard_(s, 'pImport');
  meta = meta || {};
  return withLock_(() => {
    const t = readTable_(SH.STUDENTS), H = idx_(t.headers);
    const pos = {}; t.rows.forEach((r, i) => pos[normId_(r[0])] = i);
    const PV = provinces_(), snap = [], seen = {};
    let added = 0, updated = 0, skipped = 0; const now = new Date(); const errs = [], hist = [];
    rows.forEach((o, k) => {
      const id = normId_(o['รหัสนักศึกษา']);
      if (!/^\d{9}-\d$/.test(id)) { skipped++; if (id) errs.push('แถว ' + (k + 2) + ': รหัสไม่ถูกต้อง ' + id); return; }
      let r;
      const oldSt = pos[id] !== undefined && H['สถานะ'] !== undefined ? String(t.rows[pos[id]][H['สถานะ']] || '') : null;
      if (!seen[id] && !(pos[id] !== undefined && mode === 'insertOnly')) { seen[id] = 1; snap.push([id, pos[id] !== undefined ? t.rows[pos[id]].slice() : null]); }
      if (pos[id] !== undefined) {
        if (mode === 'insertOnly') { skipped++; return; }
        r = t.rows[pos[id]]; updated++;
      } else {
        r = t.headers.map(() => ''); t.rows.push(r); pos[id] = t.rows.length - 1; added++;
        if (H['สถานะการอนุมัติ'] !== undefined) r[H['สถานะการอนุมัติ']] = 'รออนุมัติ';
      }
      t.headers.forEach((h, i) => {
        if (o[h] === undefined || o[h] === null || o[h] === '') return; // ไม่ทับค่าเดิมด้วยค่าว่าง
        r[i] = (h === 'ชั้นปี' || h === 'GPAX มัธยมปลาย') ? num_(o[h]) : h === 'รอบการรับเข้า' ? normRound_(o[h]) : safe_(String(o[h]));
      });
      r[0] = id;
      if (H['อัปเดตล่าสุด'] !== undefined) r[H['อัปเดตล่าสุด']] = now;
      if (H['หลักสูตร'] !== undefined && isPrimary_(r[H['หลักสูตร']]) && H['จังหวัด'] !== undefined && PV.indexOf(String(r[H['จังหวัด']] || '').trim()) < 0)
        errs.push('แถว ' + (k + 2) + ': ' + id + ' ปฐมภูมิ แต่จังหวัดไม่ใช่ ' + PV.join('/') + ' (นำเข้าแล้ว กรุณาแก้ไข)');
      if (oldSt !== null && H['สถานะ'] !== undefined && String(r[H['สถานะ']]) !== oldSt) hist.push([id, oldSt, String(r[H['สถานะ']]), '', '', '', 'นำเข้าไฟล์', s.u]);
    });
    if (hist.length) addStatusHist_(hist);
    if (t.rows.length) {
      const rng = t.sh.getRange(2, 1, t.rows.length, t.headers.length);
      rng.setValues(t.rows);
    }
    const tk = Number(meta.year) * 10 + Number(meta.term), tl = tk > 25000 ? termLabel_(tk) : '';
    log_(s.u, 'นำเข้านักศึกษา', '', (tl ? 'ข้อมูล ณ ภาค ' + tl + ' · ' : '') + 'เพิ่ม ' + added + ', อัปเดต ' + updated + ', ข้าม ' + skipped);
    const batch = importBatch_(meta.batchId, s.u, 'นักศึกษา', tl, { added, updated, skipped }, SH.STUDENTS, snap, meta.file);
    if (tl) { addDataTerm_(tk, true); try { termSnapSave_(tk, s.u, 'นำเข้าข้อมูลนักศึกษา'); } catch (e) {} }
    return { added, updated, skipped, errors: errs.slice(0, 50), batch };
  });
}

// ======================= GRADES =======================
function adminImportGrades(token, rows, meta) {
  const s = authW_(token); tabGuard_(s, 'pImport');
  meta = meta || {};
  return withLock_(() => {
    const t = readTable_(SH.GRADES), G = idx_(t.headers);
    const key = (id, y, tm) => id + '|' + Number(y) + '|' + Number(tm);
    const pos = {}; t.rows.forEach((r, i) => pos[key(normId_(r[0]), r[G['ปีการศึกษา']], r[G['ภาคการศึกษา']])] = i);
    let added = 0, updated = 0, skipped = 0; const now = new Date(); const errs = [], snap = [], seen = {};
    const fy = Number(meta.year) || 0, ft = Number(meta.term) || 0;   // ภาคที่เลือกตอนนำเข้า (บังคับใช้กับทุกแถว)
    rows.forEach((o, k) => {
      const id = normId_(o['รหัสนักศึกษา']);
      let y = fy || Number(o['ปีการศึกษา']); const tm = ft || Number(o['ภาคการศึกษา']);
      if (y && y < 100) y += 2500;
      const gpa = num_(o['GPA']), gpax = num_(o['GPAX']);
      const bad = !/^\d{9}-\d$/.test(id) || !y || [1, 2, 3].indexOf(tm) < 0 ||
        (gpa !== '' && (gpa < 0 || gpa > 4)) || (gpax !== '' && (gpax < 0 || gpax > 4)) || (gpa === '' && gpax === '');
      if (bad) { skipped++; errs.push('แถว ' + (k + 2) + ': ข้อมูลไม่ครบ/ไม่ถูกต้อง (' + id + ')'); return; }
      const row = [id, y, tm, gpa, gpax, num_(o['หน่วยกิตสะสม']), now];
      const kk = key(id, y, tm);
      if (!seen[kk]) { seen[kk] = 1; snap.push([kk, pos[kk] !== undefined ? t.rows[pos[kk]].slice(0, GRADE_HEADERS.length) : null]); }
      if (pos[kk] !== undefined) { t.rows[pos[kk]] = row; updated++; }
      else { t.rows.push(row); pos[kk] = t.rows.length - 1; added++; }
    });
    if (t.rows.length) t.sh.getRange(2, 1, t.rows.length, GRADE_HEADERS.length).setValues(t.rows.map(r => r.slice(0, GRADE_HEADERS.length)));
    log_(s.u, 'นำเข้าผลการเรียน', '', (fy ? 'ภาค ' + ft + '/' + fy + ': ' : '') + 'เพิ่ม ' + added + ', อัปเดต ' + updated + ', ข้าม ' + skipped);
    clearGradeCache_();
    const batch = rows.length > 1 || meta.batchId ? importBatch_(meta.batchId, s.u, 'ผลการเรียน', fy ? ft + '/' + fy : '', { added, updated, skipped }, SH.GRADES, snap, meta.file) : '';
    return { added, updated, skipped, errors: errs.slice(0, 50), batch };
  });
}

function adminGetGrades(token, id) {
  auth_(token);
  id = normId_(id);
  const t = readTable_(SH.GRADES), G = idx_(t.headers);
  return t.rows.filter(r => normId_(r[0]) === id)
    .map(r => ({ year: r[G['ปีการศึกษา']], term: r[G['ภาคการศึกษา']], gpa: r[G['GPA']], gpax: r[G['GPAX']], credits: r[G['หน่วยกิตสะสม']] }))
    .sort((a, b) => (a.year * 10 + a.term) - (b.year * 10 + b.term));
}

// ======================= ล้างข้อมูลผลการเรียน (เฉพาะผู้ดูแลหลัก · สำรองก่อนล้างเสมอ) =======================
/** what: 'grades' = ผลการเรียนรายภาค (GPA/GPAX) · 'gradchk' = ใบตรวจสอบจบ REG + รายวิชา
 *  o.term: 'all' | 'yyyy/t' (grades) · o.year: '' | '1'..'6' ชั้นปีปัจจุบันในฐานข้อมูล (gradchk) */
function gradeClearPlan_(what, o) {
  o = o || {};
  if (what === 'grades') {
    const t = readTable_(SH.GRADES), terms = {};
    t.rows.forEach(r => { const k = r[1] + '/' + r[2]; terms[k] = (terms[k] || 0) + 1; });
    const m = String(o.term || 'all').match(/^(\d{4})\/([123])$/);
    const hit = r => !m || (Number(r[1]) === Number(m[1]) && Number(r[2]) === Number(m[2]));
    return { sheets: [{ name: SH.GRADES, t, hit }], terms: Object.keys(terms).sort((a, b) => b.split('/')[0] - a.split('/')[0] || b.split('/')[1] - a.split('/')[1]).map(k => [k, terms[k]]),
      label: 'ผลการเรียนรายภาค ' + (m ? 'ภาค ' + m[2] + '/' + m[1] : 'ทุกภาค') };
  }
  if (what === 'gradchk') {
    const y = String(o.year || ''), ids = {};
    if (y) { const st = readTable_(SH.STUDENTS), H = idx_(st.headers); st.rows.forEach(r => { if (String(r[H['ชั้นปี']]) === y) ids[normId_(r[0])] = 1; }); }
    const hit = r => !y || !!ids[normId_(r[0])];
    return { sheets: [{ name: SH.GRADCHK, t: readTable_(SH.GRADCHK), hit }, { name: SH.COURSES, t: readTable_(SH.COURSES), hit }],
      label: 'ใบตรวจสอบจบ (REG) + รายวิชา ' + (y ? 'ชั้นปี ' + y : 'ทุกชั้นปี') };
  }
  throw new Error('ประเภทข้อมูลไม่ถูกต้อง');
}
function adminGradeClearPreview(token, what, o) {
  authOwner_(token);
  const P = gradeClearPlan_(what, o);
  return { label: P.label, terms: P.terms || [], counts: P.sheets.map(x => [x.name, x.t.rows.filter(x.hit).length, x.t.rows.length]) };
}
function adminGradeClear(token, what, o, confirmText) {
  const s = authOwner_(token);
  if (String(confirmText || '').trim() !== 'ล้างข้อมูล') throw new Error('พิมพ์คำว่า "ล้างข้อมูล" เพื่อยืนยัน');
  return withLock_(() => {
    const P = gradeClearPlan_(what, o), stamp = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HHmm');
    const del = P.sheets.map(x => x.t.rows.filter(x.hit)), n = del.reduce((a, b) => a + b.length, 0);
    if (!n) throw new Error('ไม่มีข้อมูลให้ล้าง');
    // 1) สำรองแถวที่จะลบไว้ไฟล์แยกก่อน
    const bk = SpreadsheetApp.create('สำรองก่อนล้าง — ' + P.label + ' — ' + stamp);
    const fid = getSettings_().DRIVE_FOLDER_ID;
    if (fid) try { const f = DriveApp.getFileById(bk.getId()); DriveApp.getFolderById(fid).addFile(f); DriveApp.getRootFolder().removeFile(f); } catch (e) {}
    P.sheets.forEach((x, i) => { const sh = bk.insertSheet(x.name), rows = [x.t.headers].concat(del[i]);
      sh.getRange(1, 1, rows.length, x.t.headers.length).setNumberFormat('@').setValues(rows.map(r => x.t.headers.map((h, j) => r[j] === undefined ? '' : r[j]))); sh.setFrozenRows(1); });
    try { const d0 = bk.getSheetByName('Sheet1') || bk.getSheetByName('แผ่น1'); if (d0) bk.deleteSheet(d0); } catch (e) {}
    // 2) เขียนชีตใหม่เฉพาะแถวที่เก็บไว้
    P.sheets.forEach(x => { const keep = x.t.rows.filter(r => !x.hit(r)), sh = x.t.sh, nc = x.t.headers.length, last = sh.getLastRow();
      if (last > 1) sh.getRange(2, 1, last - 1, Math.max(nc, sh.getLastColumn())).clearContent();
      if (keep.length) sh.getRange(2, 1, keep.length, nc).setValues(keep.map(r => r.slice(0, nc)));
      if (last > keep.length + 1 + 500) try { sh.deleteRows(keep.length + 2, last - keep.length - 1); } catch (e) {} });
    clearGradeCache_(); clearCourseCache_(); clearDashCache_();
    const url = 'https://docs.google.com/spreadsheets/d/' + bk.getId();
    log_(s.u, 'ล้างข้อมูลผลการเรียน', '', P.label + ' · ' + P.sheets.map((x, i) => x.name + ' ' + del[i].length + ' แถว').join(', ') + ' · สำรอง ' + url);
    return { label: P.label, counts: P.sheets.map((x, i) => [x.name, del[i].length]), url };
  });
}
function adminDeleteGrade(token, id, year, term) {
  const s = authW_(token);
  return withLock_(() => {
    const t = readTable_(SH.GRADES);
    for (let i = t.rows.length - 1; i >= 0; i--) {
      const r = t.rows[i];
      if (normId_(r[0]) === normId_(id) && Number(r[1]) === Number(year) && Number(r[2]) === Number(term)) {
        t.sh.deleteRow(i + 2);
        log_(s.u, 'ลบผลการเรียน', id, term + '/' + year); clearGradeCache_();
        return true;
      }
    }
    throw new Error('ไม่พบรายการ');
  });
}

// ======================= FILES (GOOGLE DRIVE) =======================
const MAX_UPLOAD = 20 * 1024 * 1024;

/** อัปโหลดไฟล์ของนักศึกษาเข้า Drive: ไฟล์นักศึกษา/<รหัส> <ชื่อ>/ */
function adminUploadFile(token, p) {
  const s = authW_(token);
  const id = normId_(p.studentId);
  const bytes = Utilities.base64Decode(p.data);
  if (bytes.length > MAX_UPLOAD) throw new Error('ไฟล์ใหญ่เกิน 20 MB');
  return withLock_(() => {
    const sh = sheet_(SH.STUDENTS);
    const f = sh.getRange('A:A').createTextFinder(id).matchEntireCell(true).findNext();
    if (!f) throw new Error('ไม่พบรหัสนักศึกษา');
    const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    const row = sh.getRange(f.getRow(), 1, 1, headers.length).getValues()[0];
    const H = idx_(headers);
    const folderName = id + ' ' + row[H['ชื่อ']] + ' ' + row[H['นามสกุล']];
    const base = getSubFolder_(getRootFolder_(), 'ไฟล์นักศึกษา');
    const folder = getSubFolder_(base, folderName.trim());
    const cat = String(p.category || 'อื่นๆ');
    const name = cat + '_' + id + '_' + String(p.name).replace(/[\\/:*?"<>|]/g, '_');
    const file = folder.createFile(Utilities.newBlob(bytes, p.mime || 'application/octet-stream', name));
    sheet_(SH.FILES).appendRow([new Date(), id, cat, name, file.getId(), file.getUrl(), s.u]);
    if (cat === 'ใบตรวจสอบจบ' && H['ลิงก์ใบตรวจสอบจบ'] !== undefined) {
      sh.getRange(f.getRow(), H['ลิงก์ใบตรวจสอบจบ'] + 1).setValue(file.getUrl());
    }
    log_(s.u, 'อัปโหลดไฟล์', id, cat + ': ' + name);
    return { name, url: file.getUrl(), id: file.getId() };
  });
}

function adminListFiles(token, studentId) {
  tabGuard_(auth_(token), 'pFiles');
  const t = readTable_(SH.FILES), F = idx_(t.headers);
  const id = normId_(studentId);
  return t.rows.filter(r => !id || normId_(r[F['รหัสนักศึกษา']]) === id).reverse().slice(0, 300).map(r => ({
    time: r[0] instanceof Date ? Utilities.formatDate(r[0], 'Asia/Bangkok', 'd/M/yyyy HH:mm') : r[0],
    sid: r[F['รหัสนักศึกษา']], cat: r[F['ประเภท']], name: r[F['ชื่อไฟล์']], fileId: r[F['FileId']], url: r[F['URL']], by: r[F['ผู้อัปโหลด']]
  }));
}

function adminDeleteFile(token, fileId) {
  const s = auth_(token, true); tabGuard_(s, 'pFiles');
  return withLock_(() => {
    const t = readTable_(SH.FILES), F = idx_(t.headers);
    for (let i = t.rows.length - 1; i >= 0; i--) {
      if (t.rows[i][F['FileId']] === fileId) {
        try { DriveApp.getFileById(fileId).setTrashed(true); } catch (e) {}
        t.sh.deleteRow(i + 2);
        log_(s.u, 'ลบไฟล์', t.rows[i][F['รหัสนักศึกษา']], t.rows[i][F['ชื่อไฟล์']]);
        return true;
      }
    }
    throw new Error('ไม่พบไฟล์');
  });
}

/** เก็บไฟล์ต้นฉบับที่นำเข้า (xlsx/csv) ไว้ใน Drive: ไฟล์นำเข้า/ */
function adminSaveImportSource(token, name, mime, data, opt) {
  opt = opt || {};
  const s = opt.kind === 'mental' ? authMH_(token) : authW_(token);
  const bytes = Utilities.base64Decode(data);
  if (bytes.length > MAX_UPLOAD) return null;
  const folder = opt.kind === 'grades' ? termFolder_('ผลการเรียน', opt.year, opt.term) : opt.kind === 'students' ? termFolder_('ข้อมูลนักศึกษา', opt.year, opt.term) : opt.kind === 'mental' ? termFolder_('ข้อมูลสุขภาพจิต (ฝ่ายพัฒนานักศึกษา)', opt.year, opt.term) : getSubFolder_(getRootFolder_(), 'ไฟล์นำเข้า');
  const stamp = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyyMMdd_HHmm');
  const f = folder.createFile(Utilities.newBlob(bytes, mime || 'application/octet-stream', stamp + '_' + name));
  log_(s.u, 'เก็บไฟล์นำเข้า', '', f.getName());
  if (opt.batchId) setBatchFile_(opt.batchId, f.getUrl());
  return f.getUrl();
}

function adminBackup(token) {
  const s = auth_(token, true);
  return backupNow_(s.u);
}

// ======================= LOG / SETTINGS =======================
function adminGetLogs(token, limit) {
  tabGuard_(auth_(token), 'pLogs');
  const sh = sheet_(SH.LOG);
  const last = sh.getLastRow();
  if (last < 2) return [];
  const n = Math.min(limit || 300, last - 1);
  return sh.getRange(last - n + 1, 1, n, LOG_HEADERS.length).getValues().reverse().map(r => ({
    time: r[0] instanceof Date ? Utilities.formatDate(r[0], 'Asia/Bangkok', 'd/M/yyyy HH:mm:ss') : r[0],
    user: r[1], action: r[2], sid: r[3], detail: r[4]
  }));
}

function adminSaveSettings(token, obj) {
  const s = auth_(token, true);
  const th = Number(obj.GPAX_THRESHOLD), w = Number(obj.GPAX_WATCH);
  if (!(th > 0 && th <= 4) || !(w >= th && w <= 4)) throw new Error('เกณฑ์ GPAX ไม่ถูกต้อง (เฝ้าระวัง ≥ ต่ำกว่าเกณฑ์)');
  return withLock_(() => {
    setSetting_('GPAX_THRESHOLD', th.toFixed(2));
    setSetting_('GPAX_WATCH', w.toFixed(2));
    if (obj.FACULTY_NAME) setSetting_('FACULTY_NAME', String(obj.FACULTY_NAME));
    if (obj.REPORT_CC !== undefined) setSetting_('REPORT_CC', String(obj.REPORT_CC).trim());
    if (obj.PUBLIC_URL !== undefined) {
      const u = String(obj.PUBLIC_URL).trim().replace(/[?#].*$/, '');
      if (u && !/^https:\/\/[^\s]+$/.test(u)) throw new Error('ลิงก์หน้าทางเข้าต้องขึ้นต้นด้วย https://');
      setSetting_('PUBLIC_URL', u ? (u.endsWith('/') || /\.html?$/.test(u) ? u : u + '/') : '');
    }
    if (obj.APP_URL !== undefined) {
      const u = String(obj.APP_URL).trim().replace(/\?.*$/, '');
      if (u && !/^https:\/\/script\.google\.com\/.+\/(exec|dev)$/.test(u)) throw new Error('URL ของเว็บแอปต้องขึ้นต้นด้วย https://script.google.com/ และลงท้ายด้วย /exec');
      setSetting_('APP_URL', u);
    }
    if (obj.DRIVE_FOLDER_ID !== undefined && obj.DRIVE_FOLDER_ID !== getSettings_().DRIVE_FOLDER_ID) {
      DriveApp.getFolderById(obj.DRIVE_FOLDER_ID); // ตรวจว่าเข้าถึงได้
      setSetting_('DRIVE_FOLDER_ID', obj.DRIVE_FOLDER_ID);
    }
    log_(s.u, 'แก้ไขการตั้งค่า', '', JSON.stringify(obj));
    return getSettings_();
  });
}


// ======================= ไฟล์ตรวจสอบจบ (REG:F60-20-11) =======================
function gradCheckIndex_() { return memo_('gcidx', gradCheckIndex_Raw_); }
function gradCheckIndex_Raw_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.GRADCHK);
  if (!sh || sh.getLastRow() < 2) return {};
  const t = readTable_(SH.GRADCHK), G = idx_(t.headers), o = {};
  t.rows.forEach(r => { o[normId_(r[0])] = { date: String(r[G['วันที่รายงาน REG']] || ''), missing: r[G['ขาด']], pending: r[G['รอเกรด (วิชา)']], fail: r[G['หมวดไม่ผ่าน']] }; });
  return o;
}

const TH_PUA_ = { F700: 'ฐ', F701: 'ิ', F702: 'ี', F703: 'ึ', F704: 'ื', F705: '่', F706: '้', F707: '๊', F708: '๋', F709: '์', F70A: '่', F70B: '้', F70C: '๊', F70D: '๋', F70E: '์', F70F: 'ญ', F710: 'ั', F711: 'ํ', F712: '็', F713: '่', F714: '้', F715: '๊', F716: '๋', F717: '์', F718: 'ุ', F719: 'ู', F71A: 'ฺ' };
/** แก้อักษรไทยเพี้ยนจาก PDF: อักษรในช่วง Private Use (ฟอนต์ไทยเก่า) · ํ+า → ำ · วรรณยุกต์สลับที่สระบน · ช่องว่างหน้าสระ/วรรณยุกต์ */
function thFix_(s) {
  return String(s == null ? '' : s).replace(/[-]/g, c => TH_PUA_[c.charCodeAt(0).toString(16).toUpperCase()] || '')
    .replace(/ํ([่-๋]?)า/g, '$1ำ').replace(/([่-๋])ํา/g, '$1ำ')
    .replace(/([่-์])([ัิ-ื็])/g, '$2$1')
    .replace(/([ก-๎])\s+(?=[ะ-ฺๅ็-๎])/g, '$1').replace(/([ัเ-ไ])\s+(?=[ก-ฮ])/g, '$1')
    .replace(/\s+/g, ' ').trim();
}
function normName_(s) { return thFix_(s).replace(/^(นาย|นางสาว|นาง|น\.ส\.|Mr\.|Ms\.|Miss)\s*/i, '').replace(/\s+/g, '').trim(); }

/**
 * บันทึกผลอ่านไฟล์ตรวจสอบจบ 1 คน
 * rec: ผลจากตัวอ่าน PDF ฝั่งเบราว์เซอร์ (id, name, year, curCode, curName, required, cr, cp, missing, gpax, english, pendingCourses, reportDate, result, cats[], courses[], terms[])
 * pdf: {name, data(base64)} หรือ null · opt: {create: true} = เพิ่มนักศึกษาใหม่ถ้ายังไม่มี
 */
/** ยืนยันใช้ชื่อตามไฟล์ตรวจสอบจบ (REG) → ปรับคำนำหน้า/ชื่อ/นามสกุลในฐานข้อมูล */
function splitThName_(full) {
  const t = thFix_(full);
  const m = t.match(/^(นางสาว|นาย|นาง|เด็กชาย|เด็กหญิง|Mr\.?|Mrs\.?|Miss|Ms\.?)\s*(\S+)\s*(.*)$/i);
  if (m) return { pre: m[1], first: m[2], last: m[3].trim() };
  const p = t.split(' '); return { pre: '', first: p.shift() || '', last: p.join(' ') };
}
/** เทียบชื่อ-สกุลในฐานข้อมูลกับ "ชื่อในไฟล์" ของไฟล์ตรวจสอบจบล่าสุด (นักศึกษาทุกสถานะที่มีไฟล์) */
function adminNameCheck(token) {
  tabGuard_(auth_(token, true), 'pStudents');
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.GRADCHK); if (!sh || sh.getLastRow() < 2) return { rows: [], n: 0 };
  const g = readTable_(SH.GRADCHK), G = idx_(g.headers), fileOf = {};
  g.rows.forEach(r => { const id = normId_(r[0]); if (id) fileOf[id] = { name: thFix_(r[G['ชื่อในไฟล์']]), date: r[G['วันที่รายงาน REG']] instanceof Date ? Utilities.formatDate(r[G['วันที่รายงาน REG']], 'Asia/Bangkok', 'dd/MM/yyyy') : String(r[G['วันที่รายงาน REG']] || '') }; });
  const st = readTable_(SH.STUDENTS), H = idx_(st.headers), rows = []; let n = 0, bad = 0, noLast = 0;
  st.rows.forEach(r => {
    const id = normId_(r[0]), f = fileOf[id] || { name: '', date: '' }; if (!id) return;
    if (!String(r[H['นามสกุล']] || '').trim() && String(r[H['สถานะ']] || '') !== 'สำเร็จการศึกษา') { noLast++; if (!f.name || !splitThName_(f.name).last) { rows.push({ id, db: [r[H['คำนำหน้า']], r[H['ชื่อ']]].join('').trim(), file: f.name, date: f.date, year: r[H['ชั้นปี']], program: progLabel_(r, H), status: String(r[H['สถานะ']] || ''), short: true, noLast: true, same: 'last' }); return; } }
    if (!f.name) return; n++;
    const raw = [r[H['คำนำหน้า']], r[H['ชื่อ']], ' ', r[H['นามสกุล']]].join(''), db = raw.replace(/\s+/g, ' ').trim(), dbFix = thFix_(raw);
    const charBad = dbFix !== db && normName_(dbFix) === normName_(f.name);
    if (normName_(raw) === normName_(f.name) && !charBad) return;
    const N = splitThName_(f.name), short = !N.last || N.first.length < 2;
    if (charBad) bad++;
    rows.push({ id, db, file: f.name, date: f.date, year: r[H['ชั้นปี']], program: progLabel_(r, H), status: String(r[H['สถานะ']] || ''), short, charBad,
      same: normName_(String(r[H['ชื่อ']] || '')) === normName_(N.first) ? 'last' : normName_(String(r[H['นามสกุล']] || '')) === normName_(N.last) ? 'first' : 'both' });
  });
  return { rows, n, bad, noLast };
}
/** แก้อักษรไทยเพี้ยน (จาก PDF) ในคำนำหน้า/ชื่อ/นามสกุล ของฐานข้อมูลนักศึกษา — ไม่เปลี่ยนตัวสะกด */
function adminRepairThaiNames(token) {
  const s = authW_(token); tabGuard_(s, 'pStudents');
  return withLock_(() => {
    const st = sheet_(SH.STUDENTS), v = st.getDataRange().getValues(), H = idx_(v[0]), cols = ['คำนำหน้า', 'ชื่อ', 'นามสกุล'].filter(k => H[k] !== undefined); let n = 0; const ids = [];
    for (let i = 1; i < v.length; i++) { let ch = false; cols.forEach(k => { const a = String(v[i][H[k]] == null ? '' : v[i][H[k]]), b = thFix_(a); if (a && a !== b) { st.getRange(i + 1, H[k] + 1).setValue(b); ch = true; } }); if (ch) { n++; ids.push(normId_(v[i][0])); } }
    const g = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.GRADCHK);
    if (g && g.getLastRow() > 1) { const GH = idx_(g.getRange(1, 1, 1, g.getLastColumn()).getValues()[0]), c = GH['ชื่อในไฟล์']; if (c !== undefined) { const r = g.getRange(2, c + 1, g.getLastRow() - 1, 1), a = r.getValues(), b = a.map(x => [thFix_(x[0])]); if (a.some((x, i) => String(x[0]) !== b[i][0])) r.setValues(b); } }
    if (n) log_(s.u, 'ซ่อมอักษรไทยในชื่อ', '', n + ' คน: ' + ids.slice(0, 30).join(', '));
    return { n, ids };
  });
}
function adminFixName(token, items) {
  const s = authW_(token); tabGuard_(s, 'pStudents');
  items = (Array.isArray(items) ? items : [items]).filter(x => x && x.id && x.name).slice(0, 500);
  if (!items.length) return { n: 0 };
  return withLock_(() => {
    const st = sheet_(SH.STUDENTS), v = st.getDataRange().getValues(), H = idx_(v[0]), rowOf = {};
    for (let i = 1; i < v.length; i++) { const k = normId_(v[i][0]); if (k) rowOf[k] = i; }
    let n = 0; const done = [];
    items.forEach(x => { const id = normId_(x.id), i = rowOf[id]; if (i == null) return;
      const N = splitThName_(x.name); if (!N.first) return;
      const old = [v[i][H['คำนำหน้า']], v[i][H['ชื่อ']], ' ', v[i][H['นามสกุล']]].join('').replace(/\s+/g, ' ').trim();
      if (H['คำนำหน้า'] !== undefined && N.pre) st.getRange(i + 1, H['คำนำหน้า'] + 1).setValue(N.pre);
      st.getRange(i + 1, H['ชื่อ'] + 1).setValue(N.first); st.getRange(i + 1, H['นามสกุล'] + 1).setValue(N.last);
      if (H['อัปเดตล่าสุด'] !== undefined) st.getRange(i + 1, H['อัปเดตล่าสุด'] + 1).setValue(new Date());
      log_(s.u, 'แก้ชื่อตามไฟล์ตรวจสอบจบ', id, old + ' → ' + (N.pre + N.first + ' ' + N.last).trim()); n++; done.push({ id, pre: N.pre, first: N.first, last: N.last });
    });
    return { n, done };
  });
}
function adminIngestGradCheck(token, rec, pdf, opt) {
  const s = authW_(token); if (rec) rec.name = thFix_(rec.name);
  opt = opt || {};
  const id = normId_(rec.id);
  if (!/^\d{9}-\d$/.test(id)) throw new Error('อ่านรหัสนักศึกษาจากไฟล์ไม่ได้');
  return withLock_(() => {
    const now = new Date();
    const warn = [];
    // ---- นักศึกษา ----
    const st = sheet_(SH.STUDENTS);
    const hdr = st.getRange(1, 1, 1, st.getLastColumn()).getValues()[0];
    const H = idx_(hdr);
    let f = st.getRange('A:A').createTextFinder(id).matchEntireCell(true).findNext();
    if (!f) {
      if (!opt.create) return { ok: false, id, name: rec.name, reason: 'ไม่พบรหัสนี้ในฐานข้อมูล' };
      const m = String(rec.name).match(/^(นางสาว|นาย|นาง)?\s*(\S+)\s*(.*)$/) || [];
      const row = hdr.map(h => '');
      const set = (h, v) => { if (H[h] !== undefined) row[H[h]] = v; };
      set('รหัสนักศึกษา', id); set('คำนำหน้า', m[1] || ''); set('ชื่อ', m[2] || rec.name); set('นามสกุล', m[3] || '');
      set('ชั้นปี', Number(rec.year) || ''); set('หลักสูตร', /นานาชาติ/.test(rec.curName) ? 'นานาชาติ' : '');
      set('สถานะ', 'กำลังศึกษา'); set('สถานะการอนุมัติ', 'รออนุมัติ');
      st.appendRow(row);
      f = st.getRange('A:A').createTextFinder(id).matchEntireCell(true).findNext();
      warn.push('เพิ่มนักศึกษาใหม่');
    }
    const rIdx = f.getRow();
    const cur = st.getRange(rIdx, 1, 1, hdr.length).getValues()[0];
    let nameDiff = null;
    if (normName_(cur[H['คำนำหน้า']] + cur[H['ชื่อ']] + cur[H['นามสกุล']]) !== normName_(rec.name)) {
      warn.push('ชื่อในไฟล์ไม่ตรงกับฐานข้อมูล (' + rec.name + ')');
      nameDiff = { id, db: [cur[H['คำนำหน้า']], cur[H['ชื่อ']], ' ', cur[H['นามสกุล']]].join('').replace(/\s+/g, ' ').trim(), file: String(rec.name || '').replace(/\s+/g, ' ').trim() };
    }

    // ---- ไฟล์ PDF → Drive ----
    let url = '';
    const ty = Number(opt.year) || 0, tt = Number(opt.term) || 0;
    if (pdf && pdf.data) {
      const folder = ty && tt ? termFolder_('ไฟล์ตรวจสอบจบ', ty, tt)
        : getSubFolder_(getSubFolder_(getRootFolder_(), 'ไฟล์นักศึกษา'), (id + ' ' + cur[H['ชื่อ']] + ' ' + cur[H['นามสกุล']]).trim());
      const nm = ty && tt ? (id + ' ' + cur[H['ชื่อ']] + ' ' + cur[H['นามสกุล']]).trim() + '.pdf'
        : 'ใบตรวจสอบจบ_' + id + '_' + String(rec.reportDate || '').replace(/\//g, '-') + '.pdf';
      const old = folder.getFilesByName(nm); while (old.hasNext()) old.next().setTrashed(true);
      const file = folder.createFile(Utilities.newBlob(Utilities.base64Decode(pdf.data), 'application/pdf', nm));
      url = file.getUrl();
      sheet_(SH.FILES).appendRow([now, id, 'ใบตรวจสอบจบ', nm, file.getId(), url, s.u]);
    }
    if (url && H['ลิงก์ใบตรวจสอบจบ'] !== undefined) st.getRange(rIdx, H['ลิงก์ใบตรวจสอบจบ'] + 1).setValue(url);
    if (Number(rec.year) && H['ชั้นปี'] !== undefined) st.getRange(rIdx, H['ชั้นปี'] + 1).setValue(Number(rec.year));
    if (H['อัปเดตล่าสุด'] !== undefined) st.getRange(rIdx, H['อัปเดตล่าสุด'] + 1).setValue(now);

    // ---- รายวิชา: ลบของเดิมแล้วเขียนใหม่ ----
    const cs = sheet_(SH.COURSES);
    const found = cs.getRange('A:A').createTextFinder(id).matchEntireCell(true).findAll().map(r => r.getRow()).sort((a, b) => b - a);
    // ลบเป็นช่วงต่อเนื่อง
    let i = 0;
    while (i < found.length) {
      let j = i; while (j + 1 < found.length && found[j + 1] === found[j] - 1) j++;
      cs.deleteRows(found[j], found[i] - found[j] + 1); i = j + 1;
    }
    const rows = [];
    (rec.courses || []).forEach(c => (c.attempts.length ? c.attempts : [{ sem: '', year: '', grade: '--' }]).forEach((a, k, arr) => {
      rows.push([id, c.cat || '', safe_(c.code), safe_(c.name), Number(c.credit) || '', k + 1, a.sem, a.year, a.grade, k === arr.length - 1 ? 'Y' : '', now]);
    }));
    if (rows.length) cs.getRange(cs.getLastRow() + 1, 1, rows.length, COURSE_HEADERS.length).setNumberFormat('@').setValues(rows.map(r => r.map(String)));

    // ---- ผลการเรียนรายภาค ----
    const gt = readTable_(SH.GRADES), GI = idx_(gt.headers);
    const pos = {}; gt.rows.forEach((r, k) => pos[normId_(r[0]) + '|' + r[GI['ปีการศึกษา']] + '|' + r[GI['ภาคการศึกษา']]] = k);
    (rec.terms || []).forEach(t => {
      const row = [id, t.year, t.term, t.gpa, t.gpax, t.cumCredits, now];
      const k = id + '|' + t.year + '|' + t.term;
      if (pos[k] !== undefined) gt.rows[pos[k]] = row; else { gt.rows.push(row); pos[k] = gt.rows.length - 1; }
    });
    if (gt.rows.length) gt.sh.getRange(2, 1, gt.rows.length, GRADE_HEADERS.length).setValues(gt.rows.map(r => r.slice(0, GRADE_HEADERS.length)));

    // ---- สรุปตรวจสอบจบ ----
    const fails = (rec.cats || []).filter(c => c.status && c.status !== 'PASS').map(c => c.no + ' ' + c.name + ' (' + c.status + ')');
    const sum = [id, rec.name, rec.year, rec.curCode, rec.curName, rec.required, rec.cr, rec.cp, rec.missing, rec.gpax, rec.english, rec.pendingCourses,
      rec.result, fails.join('; '), JSON.stringify(rec.cats || []), rec.reportDate, url, now, s.u, ty && tt ? tt + '/' + ty : ''];
    const gs = sheet_(SH.GRADCHK);
    ensureHeaders_(gs, GRADCHK_HEADERS);
    const gf = gs.getRange('A:A').createTextFinder(id).matchEntireCell(true).findNext();
    if (gf) gs.getRange(gf.getRow(), 1, 1, sum.length).setValues([sum]); else gs.appendRow(sum);

    clearGradeCache_(); clearCourseCache_();
    log_(s.u, 'นำเข้าไฟล์ตรวจสอบจบ', id, (rec.courses || []).length + ' วิชา, ' + (rec.terms || []).length + ' ภาค, GPAX ' + rec.gpax);
    return { ok: true, id, name: rec.name, courses: (rec.courses || []).length, terms: (rec.terms || []).length, gpax: rec.gpax, url, warn, nameDiff };
  });
}

/** ข้อมูลรายวิชา + สรุปตรวจสอบจบ ของนักศึกษา 1 คน */
function adminGetAcademic(token, id) {
  auth_(token);
  id = normId_(id);
  const out = { courses: [], summary: null };
  const cs = sheet_(SH.COURSES);
  const hits = cs.getRange('A:A').createTextFinder(id).matchEntireCell(true).findAll().map(r => r.getRow()).sort((a, b) => a - b);
  if (hits.length) {
    const v = cs.getRange(hits[0], 1, hits[hits.length - 1] - hits[0] + 1, COURSE_HEADERS.length).getValues();
    out.courses = v.filter(r => normId_(r[0]) === id).map(r => ({ cat: r[1], code: r[2], name: r[3], credit: Number(r[4]), attempt: Number(r[5]), term: Number(r[6]) || '', year: Number(r[7]) || '', grade: r[8], last: r[9] === 'Y' }));
  }
  const gs = sheet_(SH.GRADCHK);
  const gf = gs.getRange('A:A').createTextFinder(id).matchEntireCell(true).findNext();
  if (gf) {
    const r = gs.getRange(gf.getRow(), 1, 1, GRADCHK_HEADERS.length).getValues()[0];
    out.summary = rowToObj_(GRADCHK_HEADERS, r);
    try { out.summary.cats = JSON.parse(out.summary['สถานะหมวด (JSON)'] || '[]'); } catch (e) { out.summary.cats = []; }
    delete out.summary['สถานะหมวด (JSON)'];
    try {
      const c = { reg: {}, final: {}, name: {}, hist: {}, cat: {} };
      out.courses.forEach(x => { const k = String(x.code).trim(); c.name[k] = x.name; if (x.grade !== 'W') c.reg[k] = true; if (x.last) { c.final[k] = String(x.grade).trim(); c.cat[k] = String(x.cat || ''); } else if (!c.cat[k]) c.cat[k] = String(x.cat || ''); });
      const gc = eligCfg_().grad.conds, kc = gc.find(x => x.type === 'computer'), km = gc.find(x => x.type === 'misCat');
      out.extra = gradExtra_(c, { english: out.summary['ภาษาอังกฤษ'] }, readPlan_()[String(out.summary['รหัสหลักสูตร'] || '')], kc && kc.p.codes, km && km.p.codes, id);
    } catch (e) {}
  }
  return out;
}

// ======================= รายงานสิ้นภาค → อาจารย์ที่ปรึกษา =======================
function normAdv_(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }

function adminListTerms(token) {
  auth_(token);
  const t = readTable_(SH.GRADES), G = idx_(t.headers), set = {};
  t.rows.forEach(r => { const y = Number(r[G['ปีการศึกษา']]), m = Number(r[G['ภาคการศึกษา']]); if (y && m) set[y * 10 + m] = (set[y * 10 + m] || 0) + 1; });
  return Object.keys(set).map(Number).sort((a, b) => b - a).map(k => ({ key: k, label: (k % 10) + '/' + Math.floor(k / 10), n: set[k] }));
}

function advisorMap_() { return memo_('advmap', advisorMap_Raw_); }
function advisorMap_Raw_() {
  const o = {};
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.ADVISORS);
  if (!sh || sh.getLastRow() < 2) return o;
  sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues().forEach(r => { if (r[0]) o[normAdv_(r[0])] = String(r[1] || '').trim(); });
  return o;
}

/** รายชื่อนักศึกษา (กำลังศึกษา) ที่ GPAX ณ ภาคที่เลือก ต่ำกว่าเกณฑ์เฝ้าระวัง จัดกลุ่มตามอาจารย์ที่ปรึกษา */
function reportRows_(termKey) {
  const set = getSettings_();
  const th = Number(set.GPAX_THRESHOLD || 2), w = Number(set.GPAX_WATCH || 2.5);
  const gt = readTable_(SH.GRADES), G = idx_(gt.headers);
  const byId = {};
  gt.rows.forEach(r => {
    const id = normId_(r[0]), k = Number(r[G['ปีการศึกษา']]) * 10 + Number(r[G['ภาคการศึกษา']]);
    if (!id || k > termKey) return;
    (byId[id] = byId[id] || []).push({ k, gpa: num_(r[G['GPA']]), gpax: num_(r[G['GPAX']]) });
  });
  const st = readTable_(SH.STUDENTS), H = idx_(st.headers);
  const rows = [];
  st.rows.forEach(r => {
    const id = normId_(r[0]);
    if (!id || String(r[H['สถานะ']]).trim() !== 'กำลังศึกษา') return;
    const L = (byId[id] || []).sort((a, b) => a.k - b.k);
    const cur = L.length && L[L.length - 1].k === termKey ? L[L.length - 1] : null;
    if (!cur || cur.gpax === '' || cur.gpax >= w) return;
    const prev = L.length > 1 ? L[L.length - 2] : null;
    const pb = probationOf_(L.map(x => ({ key: x.k, gpa: x.gpa, gpax: x.gpax })), probCfg_(), { studied: studiedOf_(id) });
    rows.push({ prob: pb.status,
      id, name: String(r[H['คำนำหน้า']] || '') + r[H['ชื่อ']] + ' ' + r[H['นามสกุล']], year: r[H['ชั้นปี']], program: progLabel_(r, H),
      advisor: normAdv_(r[H['อาจารย์ที่ปรึกษา']]) || '(ไม่ระบุอาจารย์ที่ปรึกษา)',
      gpa: cur.gpa, gpax: cur.gpax, prev: prev ? prev.gpax : '', level: cur.gpax < th ? 'crit' : 'watch',
      phone: String(r[H['เบอร์โทร']] || ''), email: String(r[H['อีเมล']] || '')
    });
  });
  rows.sort((a, b) => a.advisor.localeCompare(b.advisor, 'th') || a.gpax - b.gpax);
  return { rows, th, w };
}

function adminReportPreview(token, termKey) {
  tabGuard_(auth_(token), 'pReport');
  termKey = Number(termKey);
  const r = reportRows_(termKey);
  const log = readTable_(SH.REPORTLOG).rows.filter(x => String(x[1]) === termLabel_(termKey)).map(x => ({
    time: x[0] instanceof Date ? Utilities.formatDate(x[0], 'Asia/Bangkok', 'd/M/yyyy HH:mm') : x[0], advisor: x[2], email: x[3], status: x[6]
  }));
  let quota = null; try { quota = MailApp.getRemainingDailyQuota(); } catch (e) {}
  r.rows.forEach(x => x.phone = maskIf_('เบอร์โทร', x.phone));
  return { term: termLabel_(termKey), termKey, th: r.th, w: r.w, rows: r.rows, advisors: advisorMap_(), log, quota, cc: getSettings_().REPORT_CC || '' };
}

function termLabel_(k) { return (k % 10) + '/' + Math.floor(k / 10); }

function adminSaveAdvisors(token, list) {
  const s = authW_(token);
  return withLock_(() => {
    const sh = sheet_(SH.ADVISORS); ensureHeaders_(sh, ADVISOR_HEADERS);
    const v = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues() : [];
    const pos = {}; v.forEach((r, i) => pos[normAdv_(r[0])] = i);
    list.forEach(a => {
      const n = normAdv_(a.name); if (!n) return;
      const em = String(a.email || '').trim();
      if (em && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) throw new Error('อีเมลไม่ถูกต้อง: ' + em);
      if (pos[n] !== undefined) v[pos[n]][1] = em; else { v.push([n, em, '', String(a.dept || '')]); pos[n] = v.length - 1; }
    });
    if (v.length) sh.getRange(2, 1, v.length, 4).setValues(v);
    delete MEMO_.advinfo;
    log_(s.u, 'บันทึกอีเมลอาจารย์ที่ปรึกษา', '', list.length + ' รายการ');
    return advisorMap_();
  });
}

/** ดึงรายชื่ออาจารย์ที่ปรึกษาทั้งหมดจากข้อมูลนักศึกษาเข้าชีต (ครั้งแรก) */
function adminSyncAdvisors(token) {
  authW_(token);
  const st = readTable_(SH.STUDENTS), H = idx_(st.headers), names = {};
  st.rows.forEach(r => { const n = normAdv_(r[H['อาจารย์ที่ปรึกษา']]); if (n) names[n] = 1; });
  const map = advisorMap_();
  const add = Object.keys(names).filter(n => map[n] === undefined).map(n => ({ name: n, email: '' }));
  if (add.length) adminSaveAdvisors(token, add);
  return { added: add.length, advisors: advisorMap_() };
}

function reportHtml_(term, advisor, rows, th, w, faculty) {
  const esc = x => String(x == null ? '' : x).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const crit = rows.filter(r => r.level === 'crit'), watch = rows.filter(r => r.level === 'watch');
  const tbl = (list, color, title) => !list.length ? '' :
    `<h3 style="font-size:15px;margin:18px 0 6px;color:${color}">${title} (${list.length} คน)</h3>
     <table style="border-collapse:collapse;width:100%;font-size:14px">
     <tr style="background:#fff1e6"><th style="${td}">รหัสนักศึกษา</th><th style="${td}">ชื่อ-สกุล</th><th style="${td}">ชั้นปี</th><th style="${td}">หลักสูตร</th><th style="${td}">GPA ภาคนี้</th><th style="${td}">GPAX</th><th style="${td}">เทียบภาคก่อน</th><th style="${td}">สถานภาพ*</th><th style="${td}">เบอร์โทร</th><th style="${td}">อีเมล</th></tr>` +
    list.map(r => {
      const d = r.prev === '' ? '–' : ((r.gpax - r.prev) >= 0 ? '▲ +' : '▼ ') + (r.gpax - r.prev).toFixed(2);
      return `<tr><td style="${td}">${esc(r.id)}</td><td style="${td}">${esc(r.name)}</td><td style="${td};text-align:center">${esc(r.year)}</td><td style="${td}">${esc(r.program)}</td>
        <td style="${td};text-align:right">${r.gpa === '' ? '–' : Number(r.gpa).toFixed(2)}</td><td style="${td};text-align:right;font-weight:bold;color:${color}">${Number(r.gpax).toFixed(2)}</td>
        <td style="${td};text-align:right">${d}</td><td style="${td};${r.prob && r.prob !== 'ปกติ' ? 'color:#d03b3b;font-weight:bold' : ''}">${esc(r.prob || '')}</td><td style="${td}">${esc(r.phone)}</td><td style="${td}">${esc(r.email)}</td></tr>`;
    }).join('') + '</table>';
  const td = 'border:1px solid #e6cdb8;padding:6px 8px;text-align:left';
  return `<div style="font-family:Sarabun,Tahoma,sans-serif;color:#2a1a10;line-height:1.6">
    <p>เรียน ${esc(advisor)}</p>
    <p>งานบริการการศึกษา ${esc(faculty)} ขอรายงานรายชื่อนักศึกษาในความดูแลของท่าน ที่มีผลการเรียนเฉลี่ยสะสม (GPAX) ต่ำกว่าเกณฑ์ ณ สิ้นภาคการศึกษาที่ <b>${esc(term)}</b>
    เพื่อโปรดพิจารณาให้คำปรึกษาและติดตามผลการเรียนต่อไป</p>
    <p style="font-size:13px;color:#6b5546">เกณฑ์: <b style="color:#d03b3b">ต่ำกว่าเกณฑ์ = GPAX &lt; ${th.toFixed(2)}</b> · <b style="color:#8a5a1c">เฝ้าระวัง = GPAX ${th.toFixed(2)}–${(w - 0.01).toFixed(2)}</b></p>
    ${tbl(crit, '#d03b3b', 'กลุ่มต่ำกว่าเกณฑ์')}${tbl(watch, '#8a5a1c', 'กลุ่มเฝ้าระวัง')}
    <p style="font-size:12px;color:#9a8576">* สถานภาพคำนวณเบื้องต้นจาก GPAX รายภาคตามเกณฑ์ที่คณะตั้งไว้ในระบบ ผลทางการเป็นไปตามประกาศของมหาวิทยาลัย</p>
    <p style="margin-top:18px">จึงเรียนมาเพื่อโปรดทราบ</p>
    <p>งานบริการการศึกษา<br>${esc(faculty)}</p>
    <p style="font-size:12px;color:#9a8576">อีเมลนี้สร้างจากระบบฐานข้อมูลนักศึกษา · ข้อมูลส่วนบุคคลของนักศึกษา โปรดใช้เพื่อการให้คำปรึกษาเท่านั้น</p></div>`;
}

/** ส่งอีเมลรายงานถึงอาจารย์ที่ปรึกษา (เรียกทีละไม่เกิน ~15 ท่าน) */
function adminSendReports(token, termKey, advisors) {
  const s = authW_(token); tabGuard_(s, 'pReport');
  termKey = Number(termKey);
  const r = reportRows_(termKey), map = advisorMap_(), set = getSettings_();
  const faculty = set.FACULTY_NAME || DEFAULT_SETTINGS.FACULTY_NAME;
  const cc = set.REPORT_CC || '';
  const term = termLabel_(termKey);
  const logSh = sheet_(SH.REPORTLOG);
  const out = [];
  advisors.forEach(a => {
    const name = normAdv_(a), email = map[name] || '';
    const rows = r.rows.filter(x => x.advisor === name);
    const nC = rows.filter(x => x.level === 'crit').length, nW = rows.length - nC;
    let status;
    if (!rows.length) status = 'ไม่มีนักศึกษาในเกณฑ์';
    else if (!email) status = 'ไม่มีอีเมลอาจารย์';
    else {
      try {
        const opts = { to: email, subject: `[งานบริการการศึกษา] รายงานนักศึกษาในที่ปรึกษาที่มีผลการเรียนต่ำกว่าเกณฑ์ ภาคการศึกษาที่ ${term}`,
          htmlBody: reportHtml_(term, name, rows, r.th, r.w, faculty), name: 'งานบริการการศึกษา ' + faculty };
        if (cc) opts.cc = cc;
        MailApp.sendEmail(opts);
        status = 'ส่งแล้ว';
      } catch (e) { status = 'ส่งไม่สำเร็จ: ' + e.message; }
    }
    logSh.appendRow([new Date(), term, name, email, nC, nW, status, s.u]);
    out.push({ advisor: name, email, status });
  });
  log_(s.u, 'ส่งรายงานสิ้นภาค', '', term + ': ' + out.filter(x => x.status === 'ส่งแล้ว').length + '/' + out.length + ' ท่าน');
  return out;
}

/** ตัวอย่างอีเมล (HTML) สำหรับแสดงก่อนส่ง */
function adminReportEmailPreview(token, termKey, advisor) {
  tabGuard_(auth_(token), 'pReport');
  const r = reportRows_(Number(termKey)), name = normAdv_(advisor);
  return reportHtml_(termLabel_(Number(termKey)), name, r.rows.filter(x => x.advisor === name), r.th, r.w, getSettings_().FACULTY_NAME || DEFAULT_SETTINGS.FACULTY_NAME);
}

/** บันทึกรายงานสิ้นภาคเป็น Google Sheet ในโฟลเดอร์ รายงานสิ้นภาค/ */
function adminExportReportSheet(token, termKey) {
  const s = auth_(token); tabGuard_(s, 'pReport');
  termKey = Number(termKey);
  const r = reportRows_(termKey), term = termLabel_(termKey);
  const ss = SpreadsheetApp.create('รายงานผลการเรียนต่ำกว่าเกณฑ์ ภาค ' + term + ' (' + Utilities.formatDate(new Date(), 'Asia/Bangkok', 'd-M-yyyy') + ')');
  const sh = ss.getActiveSheet().setName('รายชื่อ');
  const head = ['อาจารย์ที่ปรึกษา', 'รหัสนักศึกษา', 'ชื่อ-สกุล', 'ชั้นปี', 'หลักสูตร', 'GPA ภาคนี้', 'GPAX', 'GPAX ภาคก่อน', 'ระดับ', 'เบอร์โทร', 'อีเมล'];
  const data = r.rows.map(x => [x.advisor, x.id, x.name, x.year, x.program, x.gpa, x.gpax, x.prev, x.level === 'crit' ? 'ต่ำกว่าเกณฑ์ (<' + r.th.toFixed(2) + ')' : 'เฝ้าระวัง (<' + r.w.toFixed(2) + ')', x.phone, x.email]);
  sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold').setBackground('#6b7b28').setFontColor('#fff');
  if (data.length) sh.getRange(2, 1, data.length, head.length).setValues(data);
  sh.setFrozenRows(1); sh.autoResizeColumns(1, head.length);
  // สรุปรายอาจารย์
  const sm = ss.insertSheet('สรุปรายอาจารย์');
  const agg = {}; r.rows.forEach(x => { agg[x.advisor] = agg[x.advisor] || [0, 0]; agg[x.advisor][x.level === 'crit' ? 0 : 1]++; });
  const sd = Object.keys(agg).map(k => [k, agg[k][0], agg[k][1], agg[k][0] + agg[k][1]]);
  sm.getRange(1, 1, 1, 4).setValues([['อาจารย์ที่ปรึกษา', 'ต่ำกว่าเกณฑ์', 'เฝ้าระวัง', 'รวม']]).setFontWeight('bold').setBackground('#6b7b28').setFontColor('#fff');
  if (sd.length) sm.getRange(2, 1, sd.length, 4).setValues(sd);
  sm.autoResizeColumns(1, 4);
  const file = DriveApp.getFileById(ss.getId());
  const folder = termFolder_('รายงานสิ้นภาค', Math.floor(termKey / 10), termKey % 10);
  file.moveTo(folder);
  log_(s.u, 'สร้างไฟล์รายงานสิ้นภาค', '', term + ' ' + ss.getUrl());
  return ss.getUrl();
}

// ======================= ส่งออกตารางจากชีต =======================
const EXPORT_TABLES = {
  grades: { sheet: SH.GRADES, title: 'ผลการเรียนรายภาค (GPA/GPAX)' },
  courses: { sheet: SH.COURSES, title: 'รายวิชาที่ลงทะเบียน (จากไฟล์ตรวจสอบจบ)' },
  gradchk: { sheet: SH.GRADCHK, title: 'สรุปผลตรวจสอบจบ', drop: ['สถานะหมวด (JSON)'] },
  advisors: { sheet: SH.ADVISORS, title: 'อาจารย์ที่ปรึกษาและอีเมล' },
  reportlog: { sheet: SH.REPORTLOG, title: 'ประวัติการส่งรายงานสิ้นภาค' },
  logs: { sheet: SH.LOG, title: 'บันทึกการแก้ไขข้อมูล' },
  plan: { sheet: SH.PLAN, title: 'แผนการศึกษา (รายวิชาตามชั้นปี)' },
  statushist: { sheet: SH.STATUSHIST, title: 'ประวัติการเปลี่ยนสถานะนักศึกษา', drop: ['HistId'] }
};
function adminExportTable(token, key) {
  const s = auth_(token);
  const cfg = EXPORT_TABLES[key];
  if (!cfg) throw new Error('ไม่รู้จักชุดข้อมูล');
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(cfg.sheet);
  if (!sh || sh.getLastRow() < 1) return { title: cfg.title, headers: [], rows: [] };
  const v = sh.getDataRange().getValues();
  const headers = v.shift().map(String);
  const keep = headers.map((h, i) => (cfg.drop || []).indexOf(h) < 0 ? i : -1).filter(i => i >= 0);
  const fmt = x => x instanceof Date ? Utilities.formatDate(x, 'Asia/Bangkok', 'd/M/yyyy HH:mm') : (x === null || x === undefined ? '' : String(x));
  log_(s.u, 'ส่งออกข้อมูล', '', cfg.title + ' (' + v.length + ' แถว)');
  return { title: cfg.title, headers: keep.map(i => headers[i]), rows: v.filter(r => r.some(c => c !== '')).map(r => keep.map(i => fmt(r[i]))) };
}


// ======================= บันทึกเพิ่มเติมรายนักศึกษา =======================
function noteVisible_(r, N, sess) {
  return r[N['การมองเห็น']] !== 'ส่วนตัว' || r[N['ผู้บันทึก']] === sess.u || ADMIN_ROLES.indexOf(sess.role) >= 0;
}
function noteObj_(r, N, sess) {
  const d = x => x instanceof Date ? Utilities.formatDate(x, 'Asia/Bangkok', 'yyyy-MM-dd') : String(x || '');
  const t = x => x instanceof Date ? Utilities.formatDate(x, 'Asia/Bangkok', 'd/M/yyyy HH:mm') : String(x || '');
  return {
    id: String(r[N.NoteId]), sid: String(r[N['รหัสนักศึกษา']]), cat: r[N['หมวด']], text: r[N['ข้อความ']], due: d(r[N['วันนัดติดตาม']]),
    status: r[N['สถานะ']] || 'เปิด', pin: r[N['ปักหมุด']] === true || String(r[N['ปักหมุด']]).toUpperCase() === 'TRUE',
    priv: r[N['การมองเห็น']] === 'ส่วนตัว', by: r[N['ผู้บันทึก']], byName: r[N['ชื่อผู้บันทึก']], at: t(r[N['บันทึกเมื่อ']]), edited: t(r[N['แก้ไขล่าสุด']]),
    mine: r[N['ผู้บันทึก']] === sess.u
  };
}
/** จำนวนบันทึกต่อคน + รายการที่ต้องติดตาม (สำหรับ bootstrap) */
function notesOverview_(sess) {
  const out = { count: {}, follow: [] }, only = sess.role === 'advisor' ? advIdSet_(sess.adv) : null;
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.NOTES);
  if (!sh || sh.getLastRow() < 2) return out;
  const t = readTable_(SH.NOTES), N = idx_(t.headers);
  t.rows.forEach(r => {
    if (!r[N.NoteId] || !noteVisible_(r, N, sess)) return;
    const sid = String(r[N['รหัสนักศึกษา']]);
    if (only && !only[sid]) return;
    out.count[sid] = (out.count[sid] || 0) + 1;
    if (r[N['วันนัดติดตาม']] && (r[N['สถานะ']] || 'เปิด') !== 'เสร็จแล้ว') out.follow.push(noteObj_(r, N, sess));
  });
  out.follow.sort((a, b) => a.due.localeCompare(b.due));
  return out;
}
function adminGetNotes(token, sid) {
  const sess = auth_(token, false, true);
  sid = normId_(sid); advGuard_(sess, sid);
  const t = readTable_(SH.NOTES), N = idx_(t.headers);
  return t.rows.filter(r => String(r[N['รหัสนักศึกษา']]) === sid && r[N.NoteId] && noteVisible_(r, N, sess)).map(r => noteObj_(r, N, sess))
    .sort((a, b) => (b.pin - a.pin) || (b.id > a.id ? 1 : -1));
}
function adminSaveNote(token, n) {
  const sess = auth_(token, false, true);   // ทุกสิทธิ์บันทึกโน้ตได้ (รวม viewer และอาจารย์ที่ปรึกษา — เฉพาะนักศึกษาในความดูแล)
  const sid = normId_(n.sid); advGuard_(sess, sid);
  const text = String(n.text || '').trim();
  if (!sid) throw new Error('ไม่ระบุนักศึกษา');
  if (!text) throw new Error('กรุณาพิมพ์ข้อความ');
  if (text.length > 5000) throw new Error('ข้อความยาวเกิน 5,000 ตัวอักษร');
  const cat = NOTE_CATS.indexOf(n.cat) >= 0 ? n.cat : 'ทั่วไป';
  const due = n.due && /^\d{4}-\d{2}-\d{2}$/.test(n.due) ? n.due : '';
  return withLock_(() => {
    const sh = sheet_(SH.NOTES), now = new Date();
    if (!n.id) {
      const id = Utilities.formatDate(now, 'Asia/Bangkok', 'yyyyMMddHHmmss') + '-' + Utilities.getUuid().slice(0, 6);
      sh.appendRow([id, sid, cat, safe_(text), due, 'เปิด', !!n.pin, n.priv ? 'ส่วนตัว' : 'ทุกคน', sess.u, sess.name, now, '']);
      log_(sess.u, 'เพิ่มบันทึกนักศึกษา', sid, cat + (n.priv ? ' (ส่วนตัว)' : ''));
    } else {
      const f = sh.getRange('A:A').createTextFinder(String(n.id)).matchEntireCell(true).findNext();
      if (!f) throw new Error('ไม่พบบันทึก');
      const row = sh.getRange(f.getRow(), 1, 1, NOTE_HEADERS.length).getValues()[0];
      const N = idx_(NOTE_HEADERS);
      const isOwnerOfNote = row[N['ผู้บันทึก']] === sess.u;
      if (!isOwnerOfNote && ADMIN_ROLES.indexOf(sess.role) < 0 && !(n.onlyStatus)) throw new Error('แก้ไขได้เฉพาะบันทึกของตัวเอง');
      if (n.onlyStatus) {
        row[N['สถานะ']] = n.status === 'เสร็จแล้ว' ? 'เสร็จแล้ว' : 'เปิด';
        if (n.pin !== undefined) row[N['ปักหมุด']] = !!n.pin;
      } else {
        row[N['หมวด']] = cat; row[N['ข้อความ']] = safe_(text); row[N['วันนัดติดตาม']] = due;
        row[N['ปักหมุด']] = !!n.pin; row[N['การมองเห็น']] = n.priv ? 'ส่วนตัว' : 'ทุกคน';
        if (n.status) row[N['สถานะ']] = n.status;
      }
      row[N['แก้ไขล่าสุด']] = now;
      sh.getRange(f.getRow(), 1, 1, NOTE_HEADERS.length).setValues([row]);
      log_(sess.u, 'แก้ไขบันทึกนักศึกษา', sid, n.onlyStatus ? 'สถานะ: ' + row[N['สถานะ']] : cat);
    }
    return { notes: adminGetNotes(token, sid), overview: notesOverview_(sess) };
  }, true);
}
function adminDeleteNote(token, noteId) {
  const sess = auth_(token, false, true);
  return withLock_(() => {
    const sh = sheet_(SH.NOTES);
    const f = sh.getRange('A:A').createTextFinder(String(noteId)).matchEntireCell(true).findNext();
    if (!f) throw new Error('ไม่พบบันทึก');
    const row = sh.getRange(f.getRow(), 1, 1, NOTE_HEADERS.length).getValues()[0], N = idx_(NOTE_HEADERS);
    if (row[N['ผู้บันทึก']] !== sess.u && ADMIN_ROLES.indexOf(sess.role) < 0) throw new Error('ลบได้เฉพาะบันทึกของตัวเอง');
    sh.deleteRow(f.getRow());
    log_(sess.u, 'ลบบันทึกนักศึกษา', row[N['รหัสนักศึกษา']], String(row[N['ข้อความ']]).slice(0, 200));
    return { notes: adminGetNotes(token, row[N['รหัสนักศึกษา']]), overview: notesOverview_(sess) };
  }, true);
}
/** ส่งออกบันทึก (เฉพาะที่ผู้ใช้มองเห็น) พร้อมชื่อนักศึกษา */
function adminExportNotes(token) {
  const sess = auth_(token);
  const st = readTable_(SH.STUDENTS), H = idx_(st.headers), nm = {};
  st.rows.forEach(r => nm[normId_(r[0])] = [String(r[H['คำนำหน้า']] || '') + r[H['ชื่อ']] + ' ' + r[H['นามสกุล']], r[H['ชั้นปี']], r[H['อาจารย์ที่ปรึกษา']]]);
  const t = readTable_(SH.NOTES), N = idx_(t.headers);
  const rows = t.rows.filter(r => r[N.NoteId] && noteVisible_(r, N, sess)).map(r => noteObj_(r, N, sess))
    .map(n => [n.at, n.sid, (nm[n.sid] || [''])[0], (nm[n.sid] || ['', ''])[1], n.cat, n.text, n.due, n.status, n.pin ? 'ใช่' : '', n.priv ? 'ส่วนตัว' : 'ทุกคน', n.byName || n.by]);
  log_(sess.u, 'ส่งออกข้อมูล', '', 'บันทึกนักศึกษา (' + rows.length + ')');
  return { title: 'บันทึกเพิ่มเติมรายนักศึกษา', headers: ['บันทึกเมื่อ', 'รหัสนักศึกษา', 'ชื่อ-สกุล', 'ชั้นปี', 'หมวด', 'ข้อความ', 'วันนัดติดตาม', 'สถานะ', 'ปักหมุด', 'การมองเห็น', 'ผู้บันทึก'], rows };
}


// ======================= แผนการศึกษา =======================
function readPlan_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.PLAN);
  const out = {};
  if (!sh || sh.getLastRow() < 2) return out;
  const t = readTable_(SH.PLAN), P = idx_(t.headers);
  t.rows.forEach(r => {
    const cur = String(r[P['รหัสหลักสูตร']] || '').trim(), code = String(r[P['รหัสวิชา']] || '').trim();
    if (!cur || !code) return;
    (out[cur] = out[cur] || { name: r[P['ชื่อหลักสูตร']], courses: [] }).courses.push({
      year: Number(r[P['ชั้นปี']]) || 0, term: r[P['ภาคการศึกษา']], code, name: r[P['ชื่อวิชา']], credit: Number(r[P['หน่วยกิต']]) || '',
      cat: r[P['หมวด']], alts: String(r[P['รหัสวิชาทดแทน']] || '').split(/[,\s]+/).filter(Boolean),
      maj: P['สาขาเน้น'] !== undefined ? String(r[P['สาขาเน้น']] || '').trim() : ''
    });
  });
  return out;
}
/** แผนที่ไม่ได้ระบุภาค → เดาภาคจากการลงทะเบียนจริงของนักศึกษาทุกคน (ภาคที่ลงมากที่สุด)
 *  ถ้ายังไม่มีใครลง และเป็นรายวิชาฝึกปฏิบัติวิชาชีพ → ภาค 3 (เช่น PS114600 / PS114601 ปี 4 ภาค 3) */
function planFillTerms_(plan, cs) {
  let cnt = null;
  const guess = codes => {
    if (!cnt) { cnt = {}; Object.keys(cs || {}).forEach(id => { const H = cs[id].hist; Object.keys(H).forEach(k => H[k].forEach(h => { const t = (String(h.t || '').match(/[123]/) || [''])[0]; if (t) { const o = cnt[k] = cnt[k] || {}; o[t] = (o[t] || 0) + 1; } })); }); }
    const o = {}; codes.forEach(k => Object.keys(cnt[k] || {}).forEach(t => o[t] = (o[t] || 0) + cnt[k][t]));
    return Object.keys(o).sort((a, b) => o[b] - o[a])[0] || '';
  };
  Object.keys(plan || {}).forEach(cur => (plan[cur].courses || []).forEach(x => {
    if ((String(x.term || '').match(/[123]/) || [''])[0]) return;
    const nm = thFix_(String(x.name || '') + ' ' + String(x.cat || '')).replace(/\s+/g, '');
    const t = guess([x.code].concat(x.alts || [])) || (/ฝึก/.test(nm) && /วิชาชีพ|ปฏิบัติงาน/.test(nm) ? '3' : '');
    if (t) { x.term = t; x.termGuess = true; }
  }));
  return plan;
}
function adminPlanSummary(token) {
  tabGuard_(auth_(token), 'pElig');
  const plan = readPlan_();
  // หลักสูตรที่พบในไฟล์ตรวจสอบจบ (เพื่อบอกว่ายังไม่มีแผน)
  const seen = {};
  const g = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.GRADCHK);
  if (g && g.getLastRow() > 1) {
    const t = readTable_(SH.GRADCHK), G = idx_(t.headers);
    const st = readTable_(SH.STUDENTS), H = idx_(st.headers), prog = {};
    st.rows.forEach(r => prog[normId_(r[0])] = String(r[H['หลักสูตร']] || ''));
    t.rows.forEach(r => { const c = String(r[G['รหัสหลักสูตร']] || ''); if (c) { seen[c] = seen[c] || { name: r[G['หลักสูตร']], n: 0, progs: {} }; seen[c].n++; const pg = prog[normId_(r[0])]; if (pg) seen[c].progs[pg] = (seen[c].progs[pg] || 0) + 1; } });
  }
  const codes = [...new Set(Object.keys(plan).concat(Object.keys(seen)))].sort();
  return codes.map(c => {
    const P = plan[c], by = {};
    (P ? P.courses : []).forEach(x => { by[x.year] = (by[x.year] || 0) + 1; });
    const pg = seen[c] ? Object.keys(seen[c].progs).sort((a, b) => seen[c].progs[b] - seen[c].progs[a]).join(', ') : '';
    return { code: c, name: (P && P.name) || (seen[c] && seen[c].name) || '', program: pg, students: seen[c] ? seen[c].n : 0, total: P ? P.courses.length : 0, byYear: by };
  });
}
/** สร้างแผนการศึกษาจากไฟล์ตรวจสอบจบของนักศึกษาต้นแบบ (เรียนตามแผน) — แทนที่แผนเดิมของหลักสูตรนั้น */
function adminPlanFromStudent(token, sid, maxYear) {
  const s = authW_(token); tabGuard_(s, 'pElig');
  sid = normId_(sid);
  const acad = adminGetAcademic(token, sid);
  if (!acad.summary || !acad.courses.length) throw new Error('นักศึกษาคนนี้ยังไม่มีข้อมูลจากไฟล์ตรวจสอบจบ');
  const cur = String(acad.summary['รหัสหลักสูตร'] || ''), curName = acad.summary['หลักสูตร'] || '';
  if (!cur) throw new Error('ไม่พบรหัสหลักสูตรในไฟล์ตรวจสอบจบ');
  const admit = 2500 + Number(sid.slice(0, 2));
  maxYear = Number(maxYear) || 6;
  const first = {};
  acad.courses.forEach(c => {
    if (!c.year || /เลือกเสรี/.test(c.cat)) return;          // วิชาเลือกเสรีไม่อยู่ในแผนบังคับ
    if (c.grade === 'W') return;
    const y = c.year - admit + 1;
    if (y < 1 || y > maxYear) return;
    if (!first[c.code] || first[c.code].attempt > c.attempt) first[c.code] = Object.assign({ y }, c);
  });
  const rows = Object.values(first).sort((a, b) => a.y - b.y || a.term - b.term || a.code.localeCompare(b.code))
    .map(c => [cur, curName, c.y, c.term, c.code, c.name, c.credit, c.cat, '', 'สร้างจาก ' + sid]);
  return withLock_(() => {
    replacePlan_(cur, rows);
    log_(s.u, 'สร้างแผนการศึกษา', sid, cur + ' ' + rows.length + ' วิชา');
    return { code: cur, count: rows.length, summary: adminPlanSummary(token) };
  });
}
function replacePlan_(cur, rows) {
  const sh = sheet_(SH.PLAN);
  const t = readTable_(SH.PLAN);
  const keep = t.rows.filter(r => String(r[0]) !== cur && r[0] !== '');
  sh.getRange(1, 1, 1, PLAN_HEADERS.length).setValues([PLAN_HEADERS]);   // เติมหัวคอลัมน์ใหม่ (สาขาเน้น) ให้ชีตเดิม
  const all = keep.concat(rows).map(r => PLAN_HEADERS.map((h, i) => r[i] === undefined ? '' : r[i]));
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, PLAN_HEADERS.length).clearContent();
  if (all.length) sh.getRange(2, 1, all.length, PLAN_HEADERS.length).setValues(all);
}
/** นำเข้าแผนการศึกษาจาก Excel (แทนที่เฉพาะหลักสูตรที่อยู่ในไฟล์) */
function adminPlanImport(token, rows) {
  const s = authW_(token); tabGuard_(s, 'pElig');
  const by = {};
  rows.forEach(o => {
    const cur = String(o['รหัสหลักสูตร'] || '').trim(), code = String(o['รหัสวิชา'] || '').trim();
    if (!cur || !code) return;
    (by[cur] = by[cur] || []).push(PLAN_HEADERS.map(h => h === 'ชั้นปี' || h === 'หน่วยกิต' ? num_(o[h]) : safe_(String(o[h] == null ? '' : o[h]))));
  });
  if (!Object.keys(by).length) throw new Error('ไม่พบข้อมูล (ต้องมีคอลัมน์ รหัสหลักสูตร และ รหัสวิชา)');
  return withLock_(() => {
    Object.keys(by).forEach(c => replacePlan_(c, by[c]));
    log_(s.u, 'นำเข้าแผนการศึกษา', '', Object.keys(by).map(c => c + ':' + by[c].length).join(', '));
    return adminPlanSummary(token);
  });
}

// ======================= ตรวจสิทธิ์ฝึกงาน / สำเร็จการศึกษา / ตกค้าง =======================
function coursesById_() {
  return memo_('cbyid', () => {
    const out = {};
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.COURSES);
    if (!sh || sh.getLastRow() < 2) return out;
    sh.getRange(2, 1, sh.getLastRow() - 1, COURSE_HEADERS.length).getValues().forEach(r => {
      const id = normId_(r[0]); if (!id) return;
      const o = out[id] = out[id] || { reg: {}, final: {}, name: {}, hist: {}, cat: {} };
      const code = String(r[2]).trim(), g = String(r[8]).trim();
      o.name[code] = r[3]; if (r[9] === 'Y' || !o.cat[code]) o.cat[code] = String(r[1] || '');
      if (g !== 'W') o.reg[code] = true;
      if (r[9] === 'Y') o.final[code] = g;
      (o.hist[code] = o.hist[code] || []).push({ g, n: Number(r[5]) || 0, t: r[6], y: r[7] });
    });
    Object.keys(out).forEach(id => Object.keys(out[id].hist).forEach(c => out[id].hist[c].sort((a, b) => (Number(a.y) * 10 + Number(a.t)) - (Number(b.y) * 10 + Number(b.t)) || a.n - b.n)));
    return out;
  });
}
function gradChkMap_() {
  const out = {};
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.GRADCHK);
  if (!sh || sh.getLastRow() < 2) return out;
  const t = readTable_(SH.GRADCHK), G = idx_(t.headers);
  t.rows.forEach(r => {
    let cats = []; try { cats = JSON.parse(r[G['สถานะหมวด (JSON)']] || '[]'); } catch (e) {}
    const d = r[G['วันที่รายงาน REG']];
    out[normId_(r[0])] = { cur: String(r[G['รหัสหลักสูตร']] || ''), curName: r[G['หลักสูตร']], missing: num_(r[G['ขาด']]), pending: num_(r[G['รอเกรด (วิชา)']]),
      gpax: num_(r[G['GPAX']]), english: String(r[G['ภาษาอังกฤษ']] || ''), cats, date: d instanceof Date ? Utilities.formatDate(d, 'Asia/Bangkok', 'dd/MM/yyyy') : String(d || ''), url: r[G['ไฟล์']],
      ts: d instanceof Date ? d.getTime() : 0, passed: num_(r[G['หน่วยกิตผ่าน']]), need: num_(r[G['หน่วยกิตต้องผ่าน']]) };
  });
  return out;
}
// ======================= ตรวจสิทธิ์ฝึกงาน / สำเร็จการศึกษา (เกณฑ์ตั้งค่าได้ + ตรวจทานด้วยช่องติ๊ก) =======================
/* ประเภทเงื่อนไข (เพิ่ม/ลบได้อิสระ) · p = พารามิเตอร์ · sev: block = ต้องผ่าน / warn = แจ้งเตือน */
const ELIG_TYPES = {
  planReg:    { label: 'ลงทะเบียน / สอบผ่านตามแผนการศึกษา', p: 'plan', pend: true, hint: 'แต่ละชั้นปี/ภาค เลือก ต้องผ่านครบ (ลงทะเบียน + เกรดผ่าน) · ต้องลงครบ (ลงทะเบียนครบ ไม่นับเกรด) · – (ไม่ตรวจ) · ภาค 3 = ภาคการศึกษาพิเศษ · วิชาสาขาเน้นที่แผนไม่ระบุภาค ใช้ภาคที่ลงทะเบียนจริง' },
  planPass:   { label: 'สอบผ่านรายวิชาบังคับตามแผนครบ', p: 'years', pend: true, hidden: true, hint: '(รวมเข้ากับ ลงทะเบียน / สอบผ่านตามแผน แล้ว)' },
  noF:        { label: 'ไม่ติด F / U ค้าง', p: 'max', hint: 'นับเฉพาะวิชาที่เกรดล่าสุดยังเป็น F/U · กำหนดจำนวนที่ยอมให้ค้างได้' },
  noI:        { label: 'ไม่ติด I ค้าง', p: 'max', hint: 'นับวิชาที่เกรดล่าสุดยังเป็น I' },
  noPending:  { label: 'มีผลการเรียนครบ (ไม่มีรอเกรด)', p: '' },
  mustPass:   { label: 'รายวิชาที่กำหนดต้องสอบผ่าน', p: 'codes', hint: 'ใส่รหัสวิชา คั่นด้วย , · วิชาที่เลือกเรียนได้อย่างใดอย่างหนึ่งใช้ / เช่น PS115774/PS115776' },
  mustReg:    { label: 'รายวิชาที่กำหนดต้องลงทะเบียน', p: 'codes', hint: 'ตรวจแค่ลงทะเบียนแล้ว (ไม่นับเกรด) · คั่นด้วย , · ใช้ / เมื่อเลือกได้หลายรหัส' },
  catCredit:  { label: 'หมวดวิชา (ผลตรวจ REG) ผ่านเกณฑ์', p: 'cat', hint: 'ชื่อหมวดหรือเลขหมวดตามใบตรวจสอบจบ เช่น 2.2.2 หรือ สาขาเน้น · หน่วยกิต 0 = ใช้เกณฑ์ของหมวดตามไฟล์ REG' },
  manual:     { label: 'ตรวจด้วยตนเอง (เจ้าหน้าที่ยืนยัน)', p: '', hint: 'ระบบไม่ตรวจให้ — ติ๊กยืนยันรายคนในหน้า "ดูรายละเอียด" ของนักศึกษา' },
  minGpax:    { label: 'GPAX ไม่ต่ำกว่า', p: 'gpa' },
  minCredits: { label: 'หน่วยกิตผ่านสะสมไม่น้อยกว่า', p: 'num', unit: 'หน่วยกิต' },
  regMissing: { label: 'หน่วยกิตขาด = 0 (ผลตรวจ REG)', p: '' },
  catPass:    { label: 'ทุกหมวดวิชา PASS (ผลตรวจ REG)', p: '' },
  english:    { label: 'สอบภาษาอังกฤษผ่าน (ผลคะแนนภาษาอังกฤษ)', p: '' },
  computer:   { label: 'สอบคอมพิวเตอร์ผ่าน (รายวิชา 000160)', p: 'codes', hint: 'รหัสวิชาสอบคอมพิวเตอร์ (ค่าเริ่มต้น 000160)' },
  misCat:     { label: 'รายวิชาบังคับไม่หล่นไปหมวดวิชาเลือกเสรี', p: 'codes', hint: 'ใช้รายวิชาบังคับตามแผนการศึกษา + รหัสที่ใส่เพิ่ม (ถ้ามี)' },
  regDate:    { label: 'ไฟล์ตรวจสอบจบ (REG) อายุไม่เกิน', p: 'num', unit: 'วัน' }
};
const ELIG_MODES = ['intern4', 'intern6', 'grad', 'overdue'];
const COMP_CODE = '000160', ELIG_VER = 7;
const isFreeElec_ = cat => /เลือก\s*เสร/.test(String(cat || ''));
/** รหัสวิชาบังคับตามแผน (รวมรหัสทดแทน) → รหัสหลักในแผน */
function planReqCodes_(P, extra) {
  const o = {};
  ((P && P.courses) || []).forEach(x => { if (/เลือก/.test(String(x.cat || ''))) return; [x.code].concat(x.alts || []).forEach(k => o[String(k).toUpperCase()] = { code: x.code, name: x.name || '', year: x.year }); });
  String(extra || '').split(/[\s,;]+/).filter(Boolean).forEach(k => { k = k.toUpperCase(); o[k] = o[k] || { code: k, name: '', year: '' }; });
  return o;
}
/** ตรวจเสริมของ 1 คน: สอบคอม (รหัสวิชา), อังกฤษ, รายวิชาบังคับที่หล่นไปหมวดเลือกเสรี */
function gradExtra_(c, g, P, compCodes, extraReq, id) {
  c = c || { reg: {}, final: {}, name: {}, hist: {}, cat: {} }; c.cat = c.cat || {};
  const ok = gr => gr && gr !== '--' && ['F', 'U', 'I', 'W'].indexOf(gr) < 0;
  const codes = String(compCodes || COMP_CODE).split(/[\s,;]+/).filter(Boolean);
  const k = codes.find(x => c.final[x] !== undefined || c.reg[x]);
  const gr = k ? c.final[k] || '' : '';
  const comp = { code: k || codes[0], name: k ? c.name[k] || '' : '', grade: gr, st: !k ? 'none' : ok(gr) ? 'pass' : gr === '--' || !gr ? 'pend' : 'fail' };
  const req = planReqCodes_(P, extraReq);
  const mis = Object.keys(c.cat).filter(x => isFreeElec_(c.cat[x]) && req[x.toUpperCase()]).map(x => { const h = (c.hist[x] || []).slice(-1)[0]; return { code: x, name: c.name[x] || req[x.toUpperCase()].name, grade: c.final[x] || '', planCode: req[x.toUpperCase()].code, planYear: req[x.toUpperCase()].year || '', cat: c.cat[x], term: h && h.t && h.y ? h.t + '/' + h.y : '' }; });
  return { comp, eng: engOf_(id, g), mis, hasPlan: !!(P && P.courses && P.courses.length) };
}
/** ระดับตรวจตามแผนรายปี/ภาค: { "1/1": "pass" | "reg" } · spec เช่น { pass: ['1','5/1'], reg: ['5/2'] } */
function planLv_(spec, extra) {
  const lv = {};
  ['reg', 'pass'].forEach(v => (spec[v] || []).forEach(s => { s = String(s); (s.indexOf('/') > 0 ? [s] : ['1', '2', '3'].map(t => s + '/' + t)).forEach(k => lv[k] = v); }));
  return planDerive_(Object.assign({ lv }, extra || {}));
}
/** เติม years / tx จาก lv (ให้โค้ดเดิมฝั่งหน้าเว็บใช้ต่อได้) */
function planDerive_(p) {
  const lv = {}; Object.keys(p.lv || {}).forEach(k => { if (/^[1-6]\/[123]$/.test(k) && (p.lv[k] === 'pass' || p.lv[k] === 'reg')) lv[k] = p.lv[k]; });
  const years = [...new Set(Object.keys(lv).map(k => Number(k[0])))].sort();
  const tx = []; years.forEach(y => ['1', '2', '3'].forEach(t => { if (!lv[y + '/' + t]) tx.push(y + '/' + t); }));
  const skip = String(p.skip || '').toUpperCase().split(/[\s,;]+/).filter(Boolean).filter((x, i, a) => a.indexOf(x) === i).join(', ').slice(0, 300);
  return { lv, years, tx, pend: p.pend === 'note' ? 'note' : 'fail', note: String(p.note || '').slice(0, 200), skip };
}
/** รวม planReg + planPass (รูปแบบเดิม) เป็นเงื่อนไขเดียวแบบรายปี/ภาค */
function eligMergePlan_(conds) {
  const r = conds.find(c => c.type === 'planReg'), ps = conds.find(c => c.type === 'planPass');
  if (r && r.p && r.p.lv) return conds.filter(c => c.type !== 'planPass');
  if (!r && !ps) return conds;
  const lv = {}, cells = (c, v) => (c.p.years || []).forEach(y => ['1', '2', '3'].forEach(t => { if ((c.p.tx || []).indexOf(y + '/' + t) < 0) lv[y + '/' + t] = v; }));
  if (r && (r.on || !(ps && ps.on))) cells(r, 'reg');
  if (ps && ps.on) cells(ps, 'pass');
  const base = r || ps;
  const m = { id: base.id === 'planPass' ? 'planReg' : base.id, type: 'planReg', on: !!((r && r.on) || (ps && ps.on)), sev: (r && r.on ? r : base).sev, name: '',
    p: planDerive_({ lv, pend: ps && ps.p ? ps.p.pend : 'fail', note: ps && ps.p ? ps.p.note : '' }) };
  const out = []; let put = false;
  conds.forEach(c => { if (c.type === 'planReg' || c.type === 'planPass') { if (!put) { out.push(m); put = true; } } else out.push(c); });
  return out;
}
function eligDefaults_() {
  const gg = Number(getSettings_().GRAD_GPAX || 2);
  const C = (type, on, sev, p) => ({ id: type, type, on, sev, p: p || {} });
  const grad = () => [C('noPending', true, 'block'), C('minGpax', true, 'block', { v: gg }), C('regMissing', true, 'block'), C('catPass', true, 'block'), C('noF', false, 'block', { v: 0 }), C('noI', false, 'block', { v: 0 }), C('english', true, 'block'), C('computer', true, 'block', { codes: COMP_CODE }), C('misCat', true, 'block', { codes: '' }), C('regDate', false, 'warn', { v: 90 })];
  return {
    intern4: { year: 4, conds: [C('planReg', true, 'block', planLv_({ reg: ['1', '2', '3', '4/1', '4/2'] }, { skip: 'PS114600, PS114601, PS124600, PS124601' })), C('noF', true, 'warn', { v: 0 }), C('noI', true, 'warn', { v: 0 }), C('noPending', true, 'warn'), C('minGpax', false, 'block', { v: 2 }), C('mustPass', false, 'block', { codes: '' })] },
    intern6: { year: 5, conds: [C('planReg', true, 'block', planLv_({ pass: ['1', '2', '3', '4', '5/1'], reg: ['5/2', '5/3'] }, { pend: 'fail', note: 'เกรดออกประมาณ มี.ค. — ต้องผ่านทุกวิชาก่อนออกฝึก' })), C('noF', true, 'block', { v: 0 }), C('noI', true, 'block', { v: 0 }), C('noPending', false, 'warn'), C('minGpax', false, 'block', { v: 2 }), C('mustPass', false, 'block', { codes: '' })] },
    grad: { year: 6, conds: grad() },
    overdue: { year: 6, years: 6, conds: grad() }
  };
}
/** แปลงค่าที่บันทึกรูปแบบเดิม ({rules:{k:{on,sev,v}}}) เป็นรายการเงื่อนไข */
function eligMigrate_(c) {
  if (!c || c.conds || !c.rules) return c;
  const L = [], R = c.rules, add = (type, x, p) => x && L.push({ id: type, type, on: !!x.on, sev: x.sev === 'warn' ? 'warn' : 'block', p });
  if (R.reg) add('planReg', R.reg, { years: Array.from({ length: Number(R.reg.v) || 4 }, (_, i) => i + 1) });
  if (R.maxF) { add('noF', R.maxF, { v: Number(R.maxF.v) || 0 }); add('noI', Object.assign({}, R.maxF, { id: 'noI' }), { v: Number(R.maxF.v) || 0 }); }
  [['noPending'], ['regMissing'], ['catPass'], ['english']].forEach(([k]) => add(k, R[k], {}));
  if (R.minGpax) add('minGpax', R.minGpax, { v: Number(R.minGpax.v) });
  if (R.minCredits) add('minCredits', R.minCredits, { v: Number(R.minCredits.v) });
  if (R.mustPass) add('mustPass', R.mustPass, { codes: String(R.mustPass.v || '') });
  if (R.regDate) add('regDate', R.regDate, { v: Number(R.regDate.v) });
  return { year: c.year, years: c.years, conds: L };
}
function eligCfg_() {
  const D = eligDefaults_();
  let C = {}; try { C = JSON.parse(getSettings_().ELIG_CFG || '{}'); } catch (e) {}
  ELIG_MODES.forEach(m => {
    const c = eligMigrate_(C[m]); if (!c) return;
    if (Number(c.year)) D[m].year = Number(c.year);
    if (m === 'overdue' && Number(c.years)) D[m].years = Number(c.years);
    if (Array.isArray(c.conds)) {
      D[m].conds = c.conds.filter(x => ELIG_TYPES[x.type]);
      // ค่าที่บันทึกก่อนมีเงื่อนไขใหม่ → เติมเงื่อนไขสอบคอม/หมวดเลือกเสรีให้อัตโนมัติ (ครั้งเดียว)
      // v3: ฝึกงานปี 4 ไม่นับภาค 4/3 (รายวิชาฝึกปฏิบัติวิชาชีพ PS114600/PS114601 ลงทะเบียนภาค 3 = ตัวการฝึกงานเอง)
      if (Number(c.v || 0) < 3 && m === 'intern4') D[m].conds.forEach(x => { if (x.type === 'planReg' && x.p && x.p.lv && x.p.lv['4/3']) { const lv = Object.assign({}, x.p.lv); delete lv['4/3']; x.p = Object.assign({}, x.p, planDerive_(Object.assign({}, x.p, { lv }))); } });
      // v6: ฝึกงานปี 4 ไม่ตรวจรายวิชาฝึกปฏิบัติวิชาชีพ (ตัวการฝึกงานเอง)
      if (Number(c.v || 0) < 7 && m === 'intern4') D[m].conds.forEach(x => { if (x.type === 'planReg' && x.p) { const sk = String(x.p.skip || '').toUpperCase().split(/[\s,;]+/).filter(Boolean); ['PS114600', 'PS114601', 'PS124600', 'PS124601'].forEach(k => { if (sk.indexOf(k) < 0) sk.push(k); }); x.p = Object.assign({}, x.p, { skip: sk.join(', ') }); } });
      if (Number(c.v || 0) < 2 && (m === 'grad' || m === 'overdue')) eligDefaults_()[m].conds.filter(x => (x.type === 'computer' || x.type === 'misCat') && !D[m].conds.some(y => y.type === x.type)).forEach(x => D[m].conds.push(x));
    }
  });
  ELIG_MODES.forEach(m => D[m].conds = eligMergePlan_(D[m].conds));
  return D;
}
function eligCleanCond_(x, i) {
  const T = ELIG_TYPES[x.type]; if (!T) throw new Error('ไม่รู้จักประเภทเงื่อนไข ' + x.type);
  const p = {}, q = x.p || {};
  if (T.p === 'years') { p.years = [...new Set([].concat(q.years || []).map(Number).filter(y => y >= 1 && y <= 6))].sort(); if (!p.years.length) throw new Error('"' + T.label + '" ต้องเลือกอย่างน้อย 1 ชั้นปี');
    // ภาคที่ไม่นับ เช่น ["5/2"] = ปี 5 ตรวจเฉพาะภาคต้น
    p.tx = [...new Set([].concat(q.tx || []).map(String).filter(x => /^[1-6]\/[123]$/.test(x) && p.years.indexOf(Number(x[0])) >= 0))].sort();
    if (p.years.some(y => ['1', '2', '3'].every(t => p.tx.indexOf(y + '/' + t) >= 0))) throw new Error('"' + T.label + '" แต่ละชั้นปีต้องเลือกอย่างน้อย 1 ภาค');
    if (T.pend) { p.pend = q.pend === 'note' ? 'note' : 'fail'; p.note = String(q.note || '').slice(0, 200); } }
  if (T.p === 'plan') { Object.assign(p, planDerive_(q)); if (!p.years.length) throw new Error('"' + T.label + '" ต้องเลือกอย่างน้อย 1 ชั้นปี/ภาค'); }
  if (T.p === 'max' || T.p === 'num') { p.v = Math.round(Number(q.v) || 0); if (!(p.v >= 0 && p.v <= 999)) throw new Error('ค่า "' + T.label + '" ไม่ถูกต้อง'); }
  if (T.p === 'gpa') { p.v = Number(q.v); if (!(p.v >= 0 && p.v <= 4)) throw new Error('GPAX ต้องอยู่ระหว่าง 0–4'); }
  if (T.p === 'codes') p.codes = String(q.codes || '').toUpperCase().split(/[\s,;]+/).filter(Boolean).join(', ').slice(0, 600);
  if (T.p === 'cat') { p.q = String(q.q || '').trim().slice(0, 60); p.v = Math.max(0, Math.round(Number(q.v) || 0)); if (!p.q) throw new Error('"' + (x.name || T.label) + '" ต้องใส่ชื่อหรือเลขหมวด'); }
  return { id: String(x.id || x.type + i).replace(/[^\w-]/g, '').slice(0, 30) || x.type + i, type: x.type, on: !!x.on, sev: x.sev === 'warn' ? 'warn' : 'block', p, name: String(x.name || '').slice(0, 80) };
}
function adminEligSaveCfg(token, mode, o) {
  const s = auth_(token, true); tabGuard_(s, 'pElig');
  if (ELIG_MODES.indexOf(mode) < 0) throw new Error('โหมดไม่ถูกต้อง');
  let C = {}; try { C = JSON.parse(getSettings_().ELIG_CFG || '{}'); } catch (e) {}
  const conds = [].concat(o.conds || []).slice(0, 30).map(eligCleanCond_);
  const seen = {}; conds.forEach((c, i) => { if (seen[c.id]) c.id = c.type + '_' + i; seen[c.id] = 1; });
  const y = Math.round(Number(o.year)); if (!(y >= 1 && y <= 8)) throw new Error('ชั้นปีไม่ถูกต้อง');
  C[mode] = { year: y, conds, v: ELIG_VER }; if (mode === 'overdue') C[mode].years = Math.max(1, Math.round(Number(o.years) || 6));
  return withLock_(() => {
    setSetting_('ELIG_CFG', JSON.stringify(C));
    const g = conds.find(c => c.type === 'minGpax' && c.on);
    if (mode === 'grad' && g) setSetting_('GRAD_GPAX', Number(g.p.v).toFixed(2));
    log_(s.u, 'แก้ไขเงื่อนไขตรวจสิทธิ์', '', mode + ' · เปิด ' + conds.filter(c => c.on).map(c => c.type).join(', '));
    return eligCfg_()[mode];
  });
}
function adminEligResetCfg(token, mode) {
  const s = auth_(token, true); tabGuard_(s, 'pElig');
  let C = {}; try { C = JSON.parse(getSettings_().ELIG_CFG || '{}'); } catch (e) {}
  delete C[mode];
  return withLock_(() => { setSetting_('ELIG_CFG', JSON.stringify(C)); log_(s.u, 'คืนค่าเงื่อนไขตรวจสิทธิ์เริ่มต้น', '', mode); return eligCfg_()[mode]; });
}

/**
 * ตรวจสิทธิ์อัตโนมัติจากไฟล์ตรวจสอบจบ (REG) + แผนการศึกษา ตามเงื่อนไขที่เปิดใช้
 * ต่อคน: checks (ผลรายเงื่อนไข), years (ไทม์ไลน์ชั้นปี 1–6 จากแผน), fl (รายวิชา F/U/I: แก้แล้ว/ยังไม่แก้), miss (วิชาที่ยังไม่ลงทะเบียน)
 */
function adminEligibility(token, mode, year) {
  tabGuard_(auth_(token), 'pElig');
  return eligCompute_(mode, year);
}
/** ผลตรวจสิทธิ์ (แคชตามเวอร์ชันข้อมูล — คำนวณใหม่เฉพาะเมื่อมีการนำเข้า/แก้ข้อมูล/แก้เงื่อนไข) · ผลตรวจทานรายคนอ่านสดทุกครั้ง */
function eligCompute_(mode, year) {
  const R = verCache_('elig' + ELIG_VER + ':' + mode + ':' + (Number(year) || ''), 3600, () => eligComputeRaw_(mode, year));
  try { const REV = eligReviews_(R.round); R.rows.forEach(r => r.rev = REV[r.id] || null); } catch (e) {}
  try { R.snaps = eligSnapList_(mode); const set = getSettings_(); R.notify = { emails: set.ELIG_NOTIFY_EMAILS || '', on: set.ELIG_NOTIFY_ON !== 'off' }; } catch (e) {}
  return R;
}
function eligComputeRaw_(mode, year) {
  const CFG = eligCfg_(), cfg = CFG[mode];
  if (!cfg) throw new Error('โหมดไม่ถูกต้อง');
  const target = Number(year) || cfg.year, CO = cfg.conds.filter(c => c.on);
  const needPlan = CO.some(c => c.type === 'planReg' || c.type === 'planPass');
  const st = readTable_(SH.STUDENTS), H = idx_(st.headers);
  const gc = gradChkMap_(), cs = coursesById_(), plan = planFillTerms_(readPlan_(), cs);
  const nowYear = acadYearNow_(), now = Date.now();
  const FAIL = ['F', 'U'], BAD = ['F', 'U', 'I'];
  const round = mode + '|' + target + '|' + nowYear, REV = eligReviews_(round);
  const passed = g => g && g !== '--' && BAD.indexOf(g) < 0 && g !== 'W';
  const rows = [];
  st.rows.forEach(r => {
    const id = normId_(r[0]);
    if (!id || String(r[H['สถานะ']]).trim() !== 'กำลังศึกษา') return;
    const y = Number(r[H['ชั้นปี']]);
    const studiedN = nowYear ? nowYear - (2500 + Number(id.slice(0, 2))) + 1 : 0;
    if (mode === 'overdue' ? (y < target && studiedN <= (cfg.years || 6)) : y !== target) return;
    const base = { id, name: String(r[H['คำนำหน้า']] || '') + r[H['ชื่อ']] + ' ' + r[H['นามสกุล']], year: y, program: progLabel_(r, H), major: H['สาขาเน้น'] !== undefined ? String(r[H['สาขาเน้น']] || '').trim() : '', advisor: normAdv_(r[H['อาจารย์ที่ปรึกษา']]),
      studied: nowYear ? studiedN : '', rev: REV[id] || null };
    const g = gc[id];
    if (!g) { rows.push(Object.assign(base, { status: 'nodata', checks: [], years: [], fl: [], miss: [], reasons: ['ยังไม่มีไฟล์ตรวจสอบจบในระบบ'], warn: [] })); return; }
    base.date = g.date; base.url = g.url; base.gpax = g.gpax; base.cur = g.cur; base.passedCr = g.passed;
    const c = cs[id] || { reg: {}, final: {}, name: {}, hist: {}, cat: {} };
    const P0 = plan[g.cur], nMaj = s => String(s || '').replace(/\s|สาขา(วิชา)?|\(.*?\)/g, '').toLowerCase(), sm = nMaj(base.major);
    // วิชาเฉพาะสาขาเน้น (คอลัมน์ "สาขาเน้น" ในแผน) ใช้ตรวจเฉพาะนักศึกษาสาขานั้น
    const majOk = x => { if (!x.maj) return true; if (!sm) return false; return String(x.maj).split(/[,/]+/).some(m => { const k = nMaj(m); return k && (sm.indexOf(k) >= 0 || k.indexOf(sm) >= 0); }); };
    const P = P0 && Object.assign({}, P0, { courses: P0.courses.filter(majOk) });
    const notes = []; if (P0 && !sm && P0.courses.some(x => x.maj)) notes.push('ยังไม่ระบุสาขาเน้น — ยังไม่ได้ตรวจรายวิชาเฉพาะสาขา');
    const kc = CO.find(x => x.type === 'computer'), km = CO.find(x => x.type === 'misCat');
    const X = gradExtra_(c, g, P, kc && kc.p.codes, km && km.p.codes, id);
    base.comp = X.comp; base.eng = X.eng; base.mis = X.mis;
    // รายวิชา F/U/I ที่เคยติด: แก้แล้ว (เกรดล่าสุดผ่าน) / ยังไม่แก้
    const fl = Object.keys(c.hist).filter(k => c.hist[k].some(h => BAD.indexOf(h.g) >= 0)).map(k => {
      const fin = c.final[k] || (c.hist[k].length ? c.hist[k][c.hist[k].length - 1].g : '');
      return { code: k, name: c.name[k] || '', tries: c.hist[k].map(h => h.g + (h.t && h.y ? ' (' + h.t + '/' + h.y + ')' : '')), now: fin, fixed: passed(fin), kind: c.hist[k].some(h => FAIL.indexOf(h.g) >= 0) ? 'F' : 'I' };
    }).sort((a, b) => a.fixed - b.fixed || a.code.localeCompare(b.code));
    const openF = fl.filter(x => !x.fixed && FAIL.indexOf(x.now) >= 0), openI = fl.filter(x => !x.fixed && x.now === 'I');
    const pend = Object.keys(c.final).filter(k => c.final[k] === '--');
    // ไทม์ไลน์ชั้นปีจากแผน
    const st1 = x => { const all = [x.code].concat(x.alts); const k = all.find(a => c.reg[a]); if (!k) return 'miss'; const gr = c.final[k]; return passed(gr) ? 'pass' : gr === '--' || !gr ? 'pend' : gr === 'I' ? 'inc' : 'fail'; };
    const years = [], miss = [];
    // สถานะรายวิชาตามแผน (ตารางติ๊ก / แผนเทียบจริง): p=ผ่าน d=รอเกรด i=I f=F m=ยังไม่ลง · [สถานะ, เกรด]
    const pc = {}; if (P && P.courses.length) P.courses.forEach(x => { const st = st1(x), all = [x.code].concat(x.alts), k = all.find(a => c.reg[a]); pc[x.code] = [{ pass: 'p', pend: 'd', inc: 'i', fail: 'f', miss: 'm' }[st], k ? String(c.final[k] || '') : '']; });
    base.pc = pc; base.cats = g.cats || [];
    if (P && P.courses.length) for (let yy = 1; yy <= 6; yy++) {
      const L = P.courses.filter(x => x.year === yy); if (!L.length) continue;
      const cnt = { pass: 0, pend: 0, inc: 0, fail: 0, miss: 0 };
      L.forEach(x => { const k = st1(x); cnt[k]++; if (k === 'miss') miss.push({ code: x.code, name: x.name || '', year: yy, term: (String(x.term || '').match(/[123]/) || [''])[0] }); });
      years.push(Object.assign({ y: yy, need: L.length, st: cnt.miss || cnt.fail ? 'bad' : cnt.pend || cnt.inc ? 'warn' : 'ok' }, cnt));
    }
    if (needPlan && !(P && P.courses.length)) { rows.push(Object.assign(base, { status: 'noplan', checks: [], years, fl, miss, reasons: ['ยังไม่มีแผนการศึกษาของหลักสูตร ' + g.cur], warn: [] })); return; }
    const checks = [];
    CO.forEach(k => {
      const T = ELIG_TYPES[k.type], push = (pass, detail, label) => checks.push({ id: k.id, type: k.type, label: label || k.name || T.label, pass, detail: detail || '', sev: k.sev });
      const ys = (k.p.years || []).slice().sort(), tx = k.p.tx || [], yl = ys.length ? 'ชั้นปี ' + (ys.length > 2 && ys[ys.length - 1] - ys[0] === ys.length - 1 ? ys[0] + '–' + ys[ys.length - 1] : ys.join(', ')) + [...new Set(tx.map(t => t[0]))].map(y => ' (ปี ' + y + ' ภาค ' + ['1', '2', '3'].filter(t => tx.indexOf(y + '/' + t) < 0).join(', ') + ')').join('') : '';
      // ภาคในแผนว่าง (เช่น วิชาสาขาเน้นปี 5) → ใช้ภาคที่นักศึกษาลงทะเบียนจริงจากไฟล์ REG
      const tOf = x => { const t0 = (String(x.term || '').match(/[123]/) || [''])[0]; if (t0) return t0; const kk = [x.code].concat(x.alts || []).find(a => c.hist[a] && c.hist[a].length); if (!kk) return ''; const h = c.hist[kk][c.hist[kk].length - 1]; return (String(h.t || '').match(/[123]/) || [''])[0]; }, inS = x => ys.indexOf(x.year) >= 0 && !(tx.indexOf(x.year + '/' + tOf(x)) >= 0);
      switch (k.type) {
        case 'planReg': {
          if (!k.p.lv) { const m = miss.filter(x => inS({ year: x.year, term: x.term })); m.forEach(x => x.inR = 1); push(!m.length, m.length ? 'ยังไม่ได้ลงทะเบียน ' + m.length + ' วิชา' : 'ลงทะเบียนครบ'); break; }
          const lv = k.p.lv, yLv = y => { const v = ['1', '2', '3'].map(t => lv[y + '/' + t]); return v.indexOf('pass') >= 0 ? 'pass' : v.indexOf('reg') >= 0 ? 'reg' : ''; };
          const SK = {}; String(k.p.skip || '').toUpperCase().split(/[\s,;]+/).filter(Boolean).forEach(q => SK[q] = 1);
          const cell = x => { if ([x.code].concat(x.alts || []).some(q => SK[String(q).toUpperCase()])) return ''; const t = tOf(x); return t ? lv[x.year + '/' + t] || '' : yLv(x.year); };
          const scope = v => { const ks = Object.keys(lv).filter(q => v === 'any' || lv[q] === v), byY = {}; ks.forEach(q => (byY[q[0]] = byY[q[0]] || []).push(q[2]));
            const full = Object.keys(byY).filter(y => byY[y].length === 3 || ['1', '2'].every(t => byY[y].indexOf(t) >= 0) && !P.courses.some(x => x.year === +y && tOf(x) === '3')).map(Number).sort();
            const rng = []; full.forEach(y => { const L = rng[rng.length - 1]; if (L && L[1] === y - 1) L[1] = y; else rng.push([y, y]); });
            return rng.map(a => 'ปี ' + (a[0] === a[1] ? a[0] : a[0] + '–' + a[1])).concat(Object.keys(byY).filter(y => full.indexOf(+y) < 0).sort().map(y => 'ปี ' + y + ' ภาค ' + byY[y].sort().join(','))).join(', '); };
          const regL = P.courses.filter(x => cell(x)), m = miss.filter(x => cell(x)); m.forEach(x => x.inR = 1);
          push(!m.length, m.length ? 'ยังไม่ได้ลงทะเบียน ' + m.length + ' วิชา: ' + m.map(x => x.code + ' ' + x.name + ' (ปี ' + x.year + (x.term ? '/' + x.term : '') + ')').join(', ') : 'ลงทะเบียนครบ ' + regL.length + ' วิชา', (k.name || 'ลงทะเบียนครบตามแผน') + ' ' + scope('any'));
          const passL = P.courses.filter(x => cell(x) === 'pass');
          if (passL.length) {
            let bad = passL.filter(x => { const s = st1(x); return s !== 'pass' && s !== 'miss'; });
            if (k.p.pend === 'note') { const pl = bad.filter(x => st1(x) === 'pend'); bad = bad.filter(x => st1(x) !== 'pend'); if (pl.length) notes.push('รอเกรด ' + pl.length + ' วิชา (' + pl.map(x => x.code).join(', ') + ')' + (k.p.note ? ' — ' + k.p.note : '')); }
            checks.push({ id: k.id + 'P', type: 'planPass', sev: k.sev, pass: !bad.length, label: 'สอบผ่านตามแผน ' + scope('pass'),
              detail: bad.length ? 'ยังไม่ผ่าน ' + bad.length + ' วิชา: ' + bad.map(x => { const s1 = st1(x), kk = [x.code].concat(x.alts).find(a => c.reg[a]); return x.code + ' (' + (s1 === 'pend' ? 'รอเกรด' : c.final[kk] || s1) + ')'; }).join(', ') : 'ผ่านครบ ' + passL.length + ' วิชา' });
          }
          const ex = regL.filter(x => cell(x) === 'reg' && st1(x) === 'pend');
          if (ex.length) notes.push('อยู่ระหว่างเรียน ' + ex.length + ' วิชา (' + ex.map(x => x.code).join(', ') + ') ไม่นับเกรดรอบนี้' + (k.p.note ? ' — ' + k.p.note : ''));
          break;
        }
        case 'planPass': {
          const L = P.courses.filter(inS); let bad = L.filter(x => st1(x) !== 'pass');
          // ภาคที่ไม่ติ๊ก = ตรวจเฉพาะการลงทะเบียน ไม่นับเกรด → แสดงเป็นหมายเหตุ "อยู่ระหว่างเรียน"
          const ex = P.courses.filter(x => ys.indexOf(x.year) >= 0 && !inS(x) && st1(x) === 'pend');
          if (ex.length) notes.push('อยู่ระหว่างเรียน ' + ex.length + ' วิชา (' + ex.map(x => x.code).join(', ') + ') ไม่นับเกรดรอบนี้' + (k.p.note ? ' — ' + k.p.note : ''));
          if (k.p.pend === 'note') { const pl = bad.filter(x => st1(x) === 'pend'); bad = bad.filter(x => st1(x) !== 'pend');
            if (pl.length) notes.push('รอเกรด ' + pl.length + ' วิชา (' + pl.map(x => x.code).join(', ') + ')' + (k.p.note ? ' — ' + k.p.note : '')); }
          push(!bad.length, bad.length ? 'ยังไม่ผ่าน ' + bad.length + ' วิชา: ' + bad.map(x => { const s1 = st1(x), kk = [x.code].concat(x.alts).find(a => c.reg[a]); return x.code + ' (' + (s1 === 'miss' ? 'ยังไม่ลงทะเบียน' : s1 === 'pend' ? 'รอเกรด' : c.final[kk]) + ')'; }).join(', ') : 'ผ่านครบ ' + L.length + ' วิชา', (k.name || T.label) + ' ' + yl); break; }
        case 'noF': { const v = k.p.v || 0; push(openF.length <= v, openF.length ? 'ติด F/U ค้าง ' + openF.length + ' วิชา: ' + openF.map(x => x.code + ' ' + x.name).join(', ') : 'ไม่มี F/U ค้าง' + (fl.some(x => x.kind === 'F') ? ' (เคยติดและแก้แล้ว ' + fl.filter(x => x.kind === 'F' && x.fixed).length + ' วิชา)' : ''), v ? (k.name || T.label) + ' (ค้างได้ไม่เกิน ' + v + ' วิชา)' : ''); break; }
        case 'noI': { const v = k.p.v || 0; push(openI.length <= v, openI.length ? 'ติด I ค้าง ' + openI.length + ' วิชา: ' + openI.map(x => x.code + ' ' + x.name).join(', ') : 'ไม่มี I ค้าง', v ? (k.name || T.label) + ' (ค้างได้ไม่เกิน ' + v + ' วิชา)' : ''); break; }
        case 'noPending': { const n = mode === 'grad' || mode === 'overdue' ? Math.max(Number(g.pending) || 0, pend.length) : pend.length; push(n === 0, n ? 'รอเกรด ' + n + ' วิชา' + (pend.length ? ': ' + pend.map(k2 => k2 + ' ' + (c.name[k2] || '')).join(', ') : '') : 'มีผลการเรียนครบ'); break; }
        case 'mustPass': case 'mustReg': {
          // "A/B" = ลง/ผ่านรหัสใดรหัสหนึ่งก็ได้
          const items = String(k.p.codes || '').split(/[\s,;]+/).filter(Boolean).map(s => s.split('/').filter(Boolean)); if (!items.length) return;
          const okR = a => a.some(k2 => c.reg[k2]), okP = a => a.some(k2 => passed(c.final[k2]));
          const bad = items.filter(a => k.type === 'mustReg' ? !okR(a) : !okP(a));
          const lbl = a => a.map(k2 => k2 + (c.name[k2] ? ' ' + c.name[k2] : '') + (c.final[k2] ? ' (' + c.final[k2] + ')' : '')).join(' / ');
          push(!bad.length, bad.length ? (k.type === 'mustReg' ? 'ยังไม่ลงทะเบียน: ' : 'ยังไม่ผ่าน: ') + bad.map(a => okR(a) ? lbl(a) : a.join(' / ') + ' (ยังไม่ลงทะเบียน)').join(', ') : (k.type === 'mustReg' ? 'ลงทะเบียนครบ ' : 'ผ่านครบ ') + items.length + ' วิชา'); break;
        }
        case 'catCredit': {
          const qq = String(k.p.q || '').toLowerCase(), cs = (g.cats || []).filter(x => String(x.no || '').toLowerCase() === qq || String(x.name || '').toLowerCase().indexOf(qq) >= 0 || (String(x.no || '') + ' ' + String(x.name || '')).toLowerCase().indexOf(qq) >= 0);
          if (!cs.length) { push(false, 'ไม่พบหมวด "' + k.p.q + '" ในไฟล์ REG'); break; }
          const x = cs[0], pass2 = Number(x.passed) || 0, need = k.p.v || Number(x.req) || 0;
          push(k.p.v ? pass2 >= k.p.v : (String(x.status).toUpperCase() === 'PASS' || pass2 >= need), (x.no ? x.no + ' ' : '') + (x.name || '') + ': ผ่าน ' + pass2 + ' / ต้องได้ ' + need + ' หน่วยกิต' + (x.status ? ' (' + x.status + ')' : ''), (k.name || T.label) + ' ' + k.p.q + (k.p.v ? ' ≥ ' + k.p.v : '')); break;
        }
        case 'manual': push(false, 'รอเจ้าหน้าที่ยืนยัน (ติ๊กในตรวจทานรายคน)'); break;
        case 'minGpax': push(g.gpax !== '' && Number(g.gpax) >= k.p.v, 'GPAX ' + (g.gpax === '' ? '–' : Number(g.gpax).toFixed(2)), (k.name || T.label) + ' ' + Number(k.p.v).toFixed(2)); break;
        case 'minCredits': push(g.passed !== '' && Number(g.passed) >= k.p.v, 'ผ่าน ' + (g.passed === '' ? '–' : g.passed) + ' หน่วยกิต', (k.name || T.label) + ' ' + k.p.v); break;
        case 'regMissing': push(!(Number(g.missing) > 0), Number(g.missing) > 0 ? 'หน่วยกิตขาด ' + g.missing : 'ไม่ขาดหน่วยกิต'); break;
        case 'catPass': { const bad = (g.cats || []).filter(x => x.status && x.status !== 'PASS'); push(!bad.length, bad.length ? 'หมวดยังไม่ผ่าน: ' + bad.map(x => x.no + ' ' + x.name + ' (' + x.status + ')').join(', ') : 'ผ่านทุกหมวด'); break; }
        case 'english': push(X.eng.st === 'pass', engTxt_(X.eng)); break;
        case 'computer': { const q = X.comp; push(q.st === 'pass', q.st === 'pass' ? 'สอบแล้ว · ' + q.code + ' เกรด ' + q.grade : q.st === 'none' ? 'ยังไม่มีรายวิชา ' + q.code + ' (ยังไม่สอบ)' : q.st === 'pend' ? q.code + ' รอผล' : q.code + ' เกรด ' + q.grade + ' (ยังไม่ผ่าน)', (k.name || 'สอบคอมพิวเตอร์ผ่าน') + ' (' + (k.p.codes || COMP_CODE) + ')'); break; }
        case 'misCat': {
          if (!X.hasPlan && !k.p.codes) { push(false, 'ยังไม่มีแผนการศึกษาของหลักสูตร ' + g.cur + ' (ตรวจรายวิชาบังคับไม่ได้)'); break; }
          push(!X.mis.length, X.mis.length ? 'หล่นไปหมวดเลือกเสรี ' + X.mis.length + ' วิชา: ' + X.mis.map(x => x.code + ' ' + x.name + (x.grade ? ' (' + (x.grade === '--' ? 'รอเกรด' : x.grade) + ')' : '')).join(', ') : 'รายวิชาบังคับอยู่ในหมวดถูกต้อง'); break; }
        case 'regDate': { const days = g.ts ? Math.floor((now - g.ts) / 86400000) : null; push(days != null && days <= k.p.v, days == null ? 'ไม่ทราบวันที่ในไฟล์' : 'ไฟล์ลงวันที่ ' + g.date + ' (' + days + ' วัน)', (k.name || T.label) + ' ' + k.p.v + ' วัน'); break; }
      }
    });
    const reasons = checks.filter(x => x.pass === false && x.sev === 'block').map(x => x.detail);
    const warn = checks.filter(x => x.pass === false && x.sev === 'warn').map(x => x.detail);
    if (mode === 'overdue' && !reasons.length) return;
    if (mode === 'overdue' && base.studied > (cfg.years || 6)) warn.unshift('ศึกษามาแล้ว ' + base.studied + ' ปีการศึกษา');
    rows.push(Object.assign(base, { status: reasons.length ? 'no' : 'ok', checks, years, fl, miss, reasons, warn, notes }));
  });
  const order = { no: 0, noplan: 1, nodata: 2, ok: 3 };
  rows.sort((a, b) => order[a.status] - order[b.status] || a.id.localeCompare(b.id));
  const types = {}; Object.keys(ELIG_TYPES).forEach(k => types[k] = ELIG_TYPES[k]);
  const set = getSettings_();
  const plans = {}; rows.forEach(r => { if (r.cur && plan[r.cur] && !plans[r.cur]) plans[r.cur] = plan[r.cur].courses.map(x => [x.code, x.name || '', x.year, (String(x.term || '').match(/[123]/) || [''])[0], x.credit || '', x.maj || '']); });
  return { mode, year: target, round, rows, plans, planCodes: Object.keys(plan), nowYear, cfg: { year: cfg.year, years: cfg.years, conds: cfg.conds }, types,
    snaps: eligSnapList_(mode), notify: { emails: set.ELIG_NOTIFY_EMAILS || '', on: set.ELIG_NOTIFY_ON !== 'off' } };
}

/** ผลตรวจทานของรอบ { id: {ov:{ruleId:bool}, done, note, final, sys, regDate, by, at} } */
function eligReviews_(round) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.ELIGREV); const out = {};
  if (!sh || sh.getLastRow() < 2) return out;
  sh.getDataRange().getValues().slice(1).forEach(r => {
    if (String(r[0]) !== round) return;
    let ov = {}; try { ov = JSON.parse(r[5] || '{}'); } catch (e) {}
    out[normId_(r[2])] = { sys: r[3], final: r[4], ov, done: r[6] === true || r[6] === 'TRUE' || r[6] === 'ใช่', note: String(r[7] || ''), regDate: String(r[8] || ''), by: String(r[9] || ''),
      at: r[10] instanceof Date ? Utilities.formatDate(r[10], 'Asia/Bangkok', 'd/M/yyyy HH:mm') : String(r[10] || '') };
  });
  return out;
}
/**
 * บันทึกการตรวจทาน (ช่องติ๊ก) · list: [{id, ov:{ruleId:true/false}, done, note, sys, final, regDate}]
 * ov = ผลรายข้อที่เจ้าหน้าที่แก้จากผลระบบ · done = ติ๊ก "ตรวจทานแล้ว"
 */
function adminEligSaveReview(token, round, list) {
  const s = authW_(token); tabGuard_(s, 'pElig');
  if (!/^(intern4|intern6|grad|overdue)\|\d\|\d{4}$/.test(String(round))) throw new Error('รอบการตรวจไม่ถูกต้อง');
  list = [].concat(list || []).slice(0, 2000);
  return withLock_(() => {
    const sh = ensureSheetLazy_(SH.ELIGREV, ELIGREV_HEADERS);
    const v = sh.getDataRange().getValues(), pos = {};
    for (let i = 1; i < v.length; i++) if (String(v[i][0]) === round) pos[normId_(v[i][2])] = i + 1;
    const now = new Date(), app = [], mode = round.split('|')[0];
    const LBL = { ok: 'ผ่าน', no: 'ไม่ผ่าน', nodata: 'ไม่มีไฟล์', noplan: 'ไม่มีแผน' };
    list.forEach(x => {
      const id = normId_(x.id); if (!/^\d{9}-\d$/.test(id)) return;
      const ov = {}; Object.keys(x.ov || {}).forEach(k => { if (/^[\w-]{1,30}$/.test(k)) ov[k] = !!x.ov[k]; });
      const row = [round, mode, id, LBL[x.sys] || String(x.sys || ''), LBL[x.final] || String(x.final || ''), JSON.stringify(ov), !!x.done, safe_(String(x.note || '').slice(0, 300)), String(x.regDate || ''), s.u, now];
      if (pos[id]) sh.getRange(pos[id], 1, 1, row.length).setValues([row]); else app.push(row);
    });
    if (app.length) sh.getRange(sh.getLastRow() + 1, 1, app.length, ELIGREV_HEADERS.length).setValues(app);
    log_(s.u, 'ตรวจทานผลตรวจสิทธิ์', list.length === 1 ? normId_(list[0].id) : '', round + ' · ' + list.length + ' คน');
    return eligReviews_(round);
  }, true);
}
/** ปีการศึกษาปัจจุบันโดยประมาณ = ค่ามากสุดของ (ปีในผลการเรียน, ปีที่รับเข้าจากรหัสนักศึกษารุ่นล่าสุด) */
function acadYearNow_() {
  let m = currentAcadYear_();
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.STUDENTS);
  if (sh && sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().forEach(r => { const c = Number(String(r[0]).slice(0, 2)); if (c && 2500 + c > m) m = 2500 + c; });
  return m;
}
function currentAcadYear_() { return memo_('acy', currentAcadYearRaw_); }
function currentAcadYearRaw_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.GRADES);
  let m = 0;
  if (sh && sh.getLastRow() > 1) sh.getRange(2, 2, sh.getLastRow() - 1, 1).getValues().forEach(r => { if (Number(r[0]) > m) m = Number(r[0]); });
  return m;
}

// ======================= สถานภาพ: รอพินิจ / เข้าเกณฑ์พ้นสภาพ =======================
function probCfg_() { return acadRules_(); }
/**
 * สถานภาพจากเกณฑ์ที่ตั้งไว้ (เพิ่ม/ลด/เปิด-ปิดได้) · list: [{key: ปี*10+ภาค, gpax, gpa}] · นับเฉพาะภาคปกติ
 * opt.studied = จำนวนปีการศึกษาที่ศึกษามาแล้ว (ใช้กับเกณฑ์ "ศึกษาเกิน n ปี")
 */
function probationOf_(list, c, opt) {
  const cfg = c && c.rules ? c : acadRules_(), R = cfg.rules.filter(r => r.on);
  const reg = list.filter(x => x.key % 10 !== 3 && x.gpax !== '' && x.gpax != null).sort((a, b) => a.key - b.key);
  const cnt = {}; let status = 'ปกติ', why = [], consec = 0;
  const hist = reg.map((x, i) => {
    let st = 'ปกติ'; const w = [];
    R.forEach(r => {
      if (i + 1 < (r.from || 1)) { if (r.type === 'consec') cnt[r.id] = 0; return; }
      const g = Number(x.gpax), gp = x.gpa === '' || x.gpa == null ? null : Number(x.gpa);
      if (r.type === 'dismissBelow' && g < r.v) { st = 'เข้าเกณฑ์พ้นสภาพ'; w.push('GPAX ' + g.toFixed(2) + ' < ' + r.v.toFixed(2)); }
      else if (r.type === 'consec') { cnt[r.id] = g < r.v ? (cnt[r.id] || 0) + 1 : 0; if (cnt[r.id] >= r.n) { st = 'เข้าเกณฑ์พ้นสภาพ'; w.push('GPAX < ' + r.v.toFixed(2) + ' ติดต่อกัน ' + cnt[r.id] + ' ภาค'); } }
    });
    if (st === 'ปกติ') R.forEach(r => {
      if (i + 1 < (r.from || 1)) return;
      const g = Number(x.gpax), gp = x.gpa === '' || x.gpa == null ? null : Number(x.gpa);
      if (r.type === 'probBelow' && g < r.v) { st = 'รอพินิจ'; w.push('GPAX < ' + r.v.toFixed(2)); }
      if (r.type === 'gpaBelow' && gp != null && gp < r.v) { st = 'รอพินิจ'; w.push('GPA ภาค ' + gp.toFixed(2) + ' < ' + r.v.toFixed(2)); }
    });
    consec = Math.max(0, ...R.filter(r => r.type === 'consec').map(r => cnt[r.id] || 0));
    status = st; why = w;
    return { term: (x.key % 10) + '/' + Math.floor(x.key / 10), gpax: x.gpax, st, consec, why: w };
  });
  const oy = R.find(r => r.type === 'overYears' && opt && opt.studied > r.n);
  if (oy) { status = 'เข้าเกณฑ์พ้นสภาพ'; why = why.concat('ศึกษามาแล้ว ' + opt.studied + ' ปี (เกิน ' + oy.n + ' ปี)'); }
  return { status, hist, consec, why };
}
function studiedOf_(id) { const y = memo_('acynow', acadYearNow_); return y ? y - (2500 + Number(String(id).slice(0, 2))) + 1 : 0; }

// ======================= เกณฑ์ผลการเรียนและสถานภาพ (ใช้ร่วมทั้งระบบ) =======================
/**
 * ACAD_RULES (JSON): { levels: [{label, below, color}] · rules: [{id, on, type, v, n, from}] · grad }
 * levels = ระดับ GPAX (เรียงจากสูงไปต่ำ) ใช้กับกลุ่มเสี่ยง/คัดกรอง/พอร์ทัลอาจารย์/แจ้งเตือน/ชีตผู้บริหาร
 * rules  = เกณฑ์สถานภาพ (รอพินิจ / พ้นสภาพ) ใช้กับหน้าสถานภาพ รายงาน คัดกรอง และทุกจุดที่ระบุ "พ้นสภาพ"
 */
const ACAD_TYPES = {
  dismissBelow: { label: 'พ้นสภาพ เมื่อ GPAX ต่ำกว่า', st: 'เข้าเกณฑ์พ้นสภาพ', v: true },
  consec: { label: 'พ้นสภาพ เมื่อ GPAX ต่ำกว่าเกณฑ์ ติดต่อกัน', st: 'เข้าเกณฑ์พ้นสภาพ', v: true, n: true, nLabel: 'ภาค' },
  overYears: { label: 'พ้นสภาพ เมื่อศึกษาเกิน', st: 'เข้าเกณฑ์พ้นสภาพ', n: true, nLabel: 'ปีการศึกษา' },
  probBelow: { label: 'รอพินิจ เมื่อ GPAX ต่ำกว่า', st: 'รอพินิจ', v: true },
  gpaBelow: { label: 'รอพินิจ เมื่อ GPA ภาคนั้นต่ำกว่า', st: 'รอพินิจ', v: true }
};
function acadDefaults_() {
  const s = getSettings_(), N = (k, d) => Number(s[k] || d);
  return { levels: [{ label: 'เฝ้าระวัง', below: N('WB_BAND1', 2.5), color: '#d99a06' }, { label: 'ต่ำกว่าเกณฑ์', below: N('WB_BAND2', 2), color: '#e03131' }, { label: 'เสี่ยงสูง', below: N('WB_BAND3', 1.75), color: '#8f1d1d' }],
    rules: [{ id: 'r1', on: true, type: 'dismissBelow', v: N('PROB_DISMISS', 1.5), n: 0, from: N('PROB_START_TERM', 2) },
      { id: 'r2', on: true, type: 'probBelow', v: N('PROB_LOW', 2), n: 0, from: N('PROB_START_TERM', 2) },
      { id: 'r3', on: true, type: 'consec', v: N('PROB_LOW', 2), n: N('PROB_CONSEC', 2), from: N('PROB_START_TERM', 2) },
      { id: 'r4', on: false, type: 'overYears', v: 0, n: 8, from: 1 }],
    grad: N('GRAD_GPAX', 2) };
}
function acadClean_(o) {
  o = o || {}; const hex = c => /^#[0-9a-f]{6}$/i.test(c) ? c : '#868e96';
  const lv = [].concat(o.levels || []).map(l => ({ label: String(l.label || '').trim().slice(0, 30), below: Math.round(Number(l.below) * 100) / 100, color: hex(l.color) }))
    .filter(l => l.label && l.below > 0 && l.below <= 4).sort((a, b) => b.below - a.below);
  if (!lv.length) throw new Error('ต้องมีระดับผลการเรียนอย่างน้อย 1 ระดับ');
  if (lv.length > 6) throw new Error('ระดับผลการเรียนได้ไม่เกิน 6 ระดับ');
  if (new Set(lv.map(l => l.below)).size !== lv.length) throw new Error('ค่า "ต่ำกว่า" ของแต่ละระดับต้องไม่ซ้ำกัน');
  const rules = [].concat(o.rules || []).slice(0, 12).map((r, i) => {
    const T = ACAD_TYPES[r.type]; if (!T) throw new Error('ประเภทเกณฑ์ไม่ถูกต้อง');
    const v = Math.round(Number(r.v) * 100) / 100, n = Math.round(Number(r.n)), from = Math.max(1, Math.min(12, Math.round(Number(r.from) || 1)));
    if (T.v && !(v > 0 && v <= 4)) throw new Error('เกณฑ์ข้อ ' + (i + 1) + ': GPAX ต้องอยู่ระหว่าง 0.01–4.00');
    if (T.n && !(n >= 1 && n <= 12)) throw new Error('เกณฑ์ข้อ ' + (i + 1) + ': จำนวน' + T.nLabel + 'ต้องอยู่ระหว่าง 1–12');
    return { id: /^[\w-]{1,20}$/.test(r.id || '') ? r.id : 'r' + (i + 1) + Math.random().toString(36).slice(2, 6), on: r.on !== false, type: r.type, v: T.v ? v : 0, n: T.n ? n : 0, from };
  });
  const grad = Math.round(Number(o.grad) * 100) / 100; if (!(grad > 0 && grad <= 4)) throw new Error('GPAX สำเร็จการศึกษาไม่ถูกต้อง');
  return { levels: lv, rules, grad };
}
function acadRules_() {
  return memo_('acad', () => { const raw = getSettings_().ACAD_RULES; if (raw) { try { return acadClean_(JSON.parse(raw)); } catch (e) {} } return acadDefaults_(); });
}
function acadLevels_() { return acadRules_().levels; }
/** ระดับ: 0 = ปกติ · 1..N = ต่ำกว่าระดับที่ 1..N (ยิ่งมากยิ่งต่ำ) · -1 = ไม่มีผล */
function acadLevelOf_(g) { if (g === '' || g == null || isNaN(g)) return -1; g = Number(g); return acadLevels_().filter(l => g < l.below).length; }
function acadLevelTxt_(b) { const L = acadLevels_(); return b < 0 ? 'ยังไม่มีผล' : b === 0 ? 'ปกติ' : L[b - 1].label + ' (< ' + L[b - 1].below.toFixed(2) + ')'; }
function acadSyncLegacy_(c) {
  const L = c.levels, b = i => L[Math.min(i, L.length - 1)].below.toFixed(2);
  setSetting_('WB_BAND1', b(0)); setSetting_('WB_BAND2', b(1)); setSetting_('WB_BAND3', b(2));
  setSetting_('GPAX_WATCH', b(0)); setSetting_('GPAX_THRESHOLD', b(L.length > 1 ? 1 : 0));
  const f = t => c.rules.find(r => r.on && r.type === t);
  if (f('dismissBelow')) setSetting_('PROB_DISMISS', f('dismissBelow').v.toFixed(2));
  if (f('probBelow')) setSetting_('PROB_LOW', f('probBelow').v.toFixed(2));
  if (f('consec')) setSetting_('PROB_CONSEC', String(f('consec').n));
  const st = c.rules.filter(r => r.on).map(r => r.from); if (st.length) setSetting_('PROB_START_TERM', String(Math.min(...st)));
  setSetting_('GRAD_GPAX', c.grad.toFixed(2));
}
/** จำนวนนักศึกษา (กำลังศึกษา) ในแต่ละระดับ/สถานภาพ ตามเกณฑ์ที่ระบุ */
function acadImpact_(c) {
  const st = readTable_(SH.STUDENTS), H = idx_(st.headers), sum = gradeSummary_(), out = { levels: c.levels.map(() => 0), normal: 0, none: 0, prob: 0, dis: 0, total: 0 };
  st.rows.forEach(r => { const id = normId_(r[0]); if (!id || String(r[H['สถานะ']]).trim() !== 'กำลังศึกษา') return; out.total++;
    const g = sum[id]; if (!g || g.gpax === '') { out.none++; return; }
    const b = c.levels.filter(l => Number(g.gpax) < l.below).length; if (b) out.levels[b - 1]++; else out.normal++;
    const p = probationOf_(g.h.map(x => ({ key: x[0], gpa: x[1], gpax: x[2] })), c, { studied: studiedOf_(id) });
    if (p.status === 'เข้าเกณฑ์พ้นสภาพ') out.dis++; else if (p.status === 'รอพินิจ') out.prob++; });
  return out;
}
function adminAcadRulesGet(token) {
  auth_(token); const c = acadRules_();
  return { cfg: c, types: ACAD_TYPES, defaults: acadDefaults_(), impact: acadImpact_(c), saved: !!getSettings_().ACAD_RULES, at: getSettings_().ACAD_AT || '', by: getSettings_().ACAD_BY || '' };
}
function adminAcadRulesPreview(token, o) { auth_(token, true); return acadImpact_(acadClean_(o)); }
function adminAcadRulesSave(token, o) {
  const s = auth_(token, true), c = acadClean_(o), before = acadRules_();
  return withLock_(() => {
    setSetting_('ACAD_RULES', JSON.stringify(c)); acadSyncLegacy_(c);
    setSetting_('ACAD_AT', Utilities.formatDate(new Date(), 'Asia/Bangkok', 'd/M/yyyy HH:mm')); setSetting_('ACAD_BY', s.name || s.u);
    delete MEMO_.acad; clearDashCache_();
    const desc = r => ACAD_TYPES[r.type].label + (ACAD_TYPES[r.type].v ? ' ' + r.v.toFixed(2) : '') + (ACAD_TYPES[r.type].n ? ' ' + r.n + ' ' + ACAD_TYPES[r.type].nLabel : '') + (r.on ? '' : ' (ปิด)');
    log_(s.u, 'แก้ไขเกณฑ์ผลการเรียนและสถานภาพ', '', 'ระดับ: ' + c.levels.map(l => l.label + '<' + l.below.toFixed(2)).join(', ') + ' · เกณฑ์: ' + c.rules.map(desc).join(', ') + ' · จบ ≥' + c.grad.toFixed(2) + ' · (เดิม ' + before.levels.map(l => l.below.toFixed(2)).join('/') + ')');
    return adminAcadRulesGet(token);
  });
}
function adminAcadRulesReset(token) {
  const s = auth_(token, true);
  return withLock_(() => { setSetting_('ACAD_RULES', ''); delete MEMO_.acad;
    const d = { levels: [{ label: 'เฝ้าระวัง', below: 2.5, color: '#d99a06' }, { label: 'ต่ำกว่าเกณฑ์', below: 2, color: '#e03131' }, { label: 'เสี่ยงสูง', below: 1.75, color: '#8f1d1d' }],
      rules: [{ id: 'r1', on: true, type: 'dismissBelow', v: 1.5, from: 2 }, { id: 'r2', on: true, type: 'probBelow', v: 2, from: 2 }, { id: 'r3', on: true, type: 'consec', v: 2, n: 2, from: 2 }, { id: 'r4', on: false, type: 'overYears', n: 8, from: 1 }], grad: 2 };
    const c = acadClean_(d); setSetting_('ACAD_RULES', JSON.stringify(c)); acadSyncLegacy_(c); delete MEMO_.acad; clearDashCache_();
    log_(s.u, 'คืนค่าเกณฑ์ผลการเรียนและสถานภาพเป็นค่าเริ่มต้น', '', ''); return adminAcadRulesGet(token); });
}

function adminProbation(token, termKey) {
  tabGuard_(auth_(token), 'pElig');
  termKey = Number(termKey) || 0;
  const c = probCfg_();
  const gt = readTable_(SH.GRADES), G = idx_(gt.headers), by = {};
  gt.rows.forEach(r => {
    const id = normId_(r[0]); if (!id) return;
    const key = Number(r[G['ปีการศึกษา']]) * 10 + Number(r[G['ภาคการศึกษา']]);
    if (termKey && key > termKey) return;
    (by[id] = by[id] || []).push({ key, gpa: num_(r[G['GPA']]), gpax: num_(r[G['GPAX']]) });
  });
  const st = readTable_(SH.STUDENTS), H = idx_(st.headers), rows = [];
  st.rows.forEach(r => {
    const id = normId_(r[0]);
    if (!id || String(r[H['สถานะ']]).trim() !== 'กำลังศึกษา' || !by[id]) return;
    const p = probationOf_(by[id], c, { studied: studiedOf_(id) });
    if (!p.hist.length) return;
    const last = p.hist[p.hist.length - 1];
    rows.push({ id, name: String(r[H['คำนำหน้า']] || '') + r[H['ชื่อ']] + ' ' + r[H['นามสกุล']], year: r[H['ชั้นปี']], program: progLabel_(r, H),
      advisor: normAdv_(r[H['อาจารย์ที่ปรึกษา']]), phone: maskIf_('เบอร์โทร', r[H['เบอร์โทร']]), email: String(r[H['อีเมล']] || ''),
      status: p.status, why: p.why, term: last.term, gpax: last.gpax, consec: p.consec, hist: p.hist.slice(-6) });
  });
  return { cfg: c, types: ACAD_TYPES, rows, term: termKey ? termLabel_(termKey) : '' };
}
// ======================= ผลสอบภาษาอังกฤษ / สอบคอมพิวเตอร์ =======================
/** สถานะภาษาอังกฤษของ 1 คน จากช่อง "ภาษาอังกฤษ" (ผลคะแนนภาษาอังกฤษ) ในใบตรวจสอบจบ REG
 *  PASS = สอบแล้ว/ผ่าน · FAIL หรือว่าง = ยังไม่สอบ · ไม่มีไฟล์ REG = ไม่มีข้อมูล */
function engOf_(id, g) {
  const v = String((g && g.english) || '').trim();
  return { st: !g ? 'nodata' : /^PASS$/i.test(v) ? 'pass' : 'none', v };
}
function engTxt_(e) {
  return e.st === 'pass' ? 'สอบแล้ว · ผลคะแนนภาษาอังกฤษ PASS' : e.st === 'nodata' ? 'ยังไม่มีไฟล์ตรวจสอบจบ' : 'ยังไม่สอบ' + (e.v ? ' (ผลคะแนนภาษาอังกฤษ: ' + e.v + ')' : '');
}
/** รหัสวิชาสอบคอมพิวเตอร์ (จากเงื่อนไข "สอบคอมพิวเตอร์ผ่าน" ที่ตั้งไว้ · ค่าเริ่มต้น 000160) */
function compCodes_() {
  let codes = []; try { const CFG = eligCfg_(); Object.keys(CFG).forEach(m => ((CFG[m] && CFG[m].conds) || []).forEach(c => { if (c.type === 'computer') codes = codes.concat(String((c.p && c.p.codes) || '').split(/[\s,;]+/)); })); } catch (e) {}
  codes = codes.filter(Boolean).filter((x, i, a) => a.indexOf(x) === i); return codes.length ? codes : [COMP_CODE];
}
/** รายชื่อนักศึกษา (กำลังศึกษา) + สถานะสอบภาษาอังกฤษ / สอบคอมพิวเตอร์ */
function adminTestStatus(token) {
  tabGuard_(auth_(token), 'pElig');
  return verCache_('tests', 3600, () => {
    const st = readTable_(SH.STUDENTS), H = idx_(st.headers), gc = gradChkMap_(), cs = coursesById_(), codes = compCodes_(), rows = [];
    st.rows.forEach(r => {
      const id = normId_(r[0]); if (!id || String(r[H['สถานะ']]).trim() !== 'กำลังศึกษา') return;
      const c = cs[id], g = gc[id], X = gradExtra_(c, g, null, codes.join(','), '', id), h = c && c.hist[X.comp.code], last = h && h.length ? h[h.length - 1] : null;
      const comp = Object.assign({}, X.comp, { term: last && last.t && last.y ? last.t + '/' + last.y : '', tries: h ? h.length : 0, hist: h ? h.map(x => x.g).join(' → ') : '' });
      if (!c && !g) comp.st = 'nodata';
      rows.push({ id, name: String(r[H['คำนำหน้า']] || '') + r[H['ชื่อ']] + ' ' + r[H['นามสกุล']], year: Number(r[H['ชั้นปี']]) || '', program: progLabel_(r, H),
        major: H['สาขาเน้น'] !== undefined ? String(r[H['สาขาเน้น']] || '').trim() : '', advisor: normAdv_(r[H['อาจารย์ที่ปรึกษา']]), reg: g ? g.date : '', eng: X.eng, comp });
    });
    return { rows, codes };
  });
}
// ======================= ตรวจสอบรายวิชาบังคับหล่น =======================
/** นักศึกษา (กำลังศึกษา) + รายวิชาบังคับตามแผนที่ไปอยู่หมวดเลือกเสรีในไฟล์ตรวจสอบจบ REG
 *  status: mis (มีวิชาหล่น) · ok (ไม่มี) · noplan (ยังไม่มีแผนหลักสูตร) · nodata (ยังไม่มีไฟล์ตรวจสอบจบ) */
function adminMisCheck(token) {
  tabGuard_(auth_(token), 'pMis');
  return verCache_('mis' + ELIG_VER, 3600, () => {
    const st = readTable_(SH.STUDENTS), H = idx_(st.headers), gc = gradChkMap_(), cs = coursesById_(), plan = planFillTerms_(readPlan_(), cs);
    const CFG = eligCfg_(); let extra = '';
    Object.keys(CFG).forEach(m => ((CFG[m] && CFG[m].conds) || []).forEach(c => { if (c.type === 'misCat' && c.p && c.p.codes) extra += ' ' + c.p.codes; }));
    const nMaj = s => String(s || '').replace(/\s|สาขา(วิชา)?|\(.*?\)/g, '').toLowerCase(), rows = [];
    st.rows.forEach(r => {
      const id = normId_(r[0]); if (!id || String(r[H['สถานะ']]).trim() !== 'กำลังศึกษา') return;
      const major = H['สาขาเน้น'] !== undefined ? String(r[H['สาขาเน้น']] || '').trim() : '', g = gc[id];
      const o = { id, name: String(r[H['คำนำหน้า']] || '') + r[H['ชื่อ']] + ' ' + r[H['นามสกุล']], year: Number(r[H['ชั้นปี']]) || '', program: progLabel_(r, H), major, advisor: normAdv_(r[H['อาจารย์ที่ปรึกษา']]), mis: [] };
      if (!g) { o.status = 'nodata'; rows.push(o); return; }
      o.reg = g.date; o.cur = g.cur; o.url = g.url;
      const P0 = plan[g.cur], sm = nMaj(major);
      const P = P0 && Object.assign({}, P0, { courses: P0.courses.filter(x => { if (!x.maj) return true; if (!sm) return false; return String(x.maj).split(/[,/]+/).some(m => { const k = nMaj(m); return k && (sm.indexOf(k) >= 0 || k.indexOf(sm) >= 0); }); }) });
      const X = gradExtra_(cs[id], g, P, '', extra, id);
      o.mis = X.mis; o.status = X.mis.length ? 'mis' : !X.hasPlan && !extra.trim() ? 'noplan' : 'ok'; o.hasPlan = X.hasPlan;
      rows.push(o);
    });
    return { rows, extra: extra.trim() };
  });
}
function adminSaveProbCfg(token, o) {   // รูปแบบเดิม (ยังรองรับ) → แปลงเป็นเกณฑ์รวม
  const c = JSON.parse(JSON.stringify(acadRules_())), set = (t, k, v) => { const r = c.rules.find(x => x.type === t); if (r) r[k] = v; };
  set('dismissBelow', 'v', Number(o.PROB_DISMISS)); set('probBelow', 'v', Number(o.PROB_LOW)); set('consec', 'v', Number(o.PROB_LOW)); set('consec', 'n', Number(o.PROB_CONSEC));
  c.rules.forEach(r => r.from = Number(o.PROB_START_TERM) || r.from); c.grad = Number(o.GRAD_GPAX) || c.grad;
  adminAcadRulesSave(token, c); return probCfg_();
}


// ======================= ความปลอดภัย: ปิดบังข้อมูลติดต่อ =======================
function maskVal_(h, v) {
  v = String(v == null ? '' : v).trim();
  if (!v) return '';
  if (h === 'เบอร์โทร') { const d = v.replace(/\D/g, ''); return d.length >= 6 ? d.slice(0, 3) + '-•••-••' + d.slice(-2) : '•••'; }
  return v.slice(0, 2) + '•••' + (v.length > 6 ? v.slice(-1) : '');
}
function maskIf_(h, v) { return getSettings_().MASK_CONTACT !== 'off' ? maskVal_(h, v) : String(v == null ? '' : v); }
/** ดูข้อมูลติดต่อจริง (บันทึกทุกครั้ง) · ids: รหัสนักศึกษา 1 คนหรือหลายคน · purpose: ดู/แก้ไข/ส่งออก */
function adminRevealContact(token, ids, purpose) {
  const s = auth_(token);
  ids = [].concat(ids).map(normId_).filter(Boolean);
  if (ids.length > 3000) throw new Error('จำนวนมากเกินไป');
  const want = {}; ids.forEach(i => want[i] = 1);
  const t = readTable_(SH.STUDENTS), H = idx_(t.headers), out = {};
  t.rows.forEach(r => { const id = normId_(r[0]); if (want[id]) { out[id] = {}; CONTACT_FIELDS.forEach(h => out[id][h] = H[h] !== undefined ? String(r[H[h]] || '') : ''); } });
  const what = (purpose || 'ดู') + 'ข้อมูลติดต่อ';
  access_(s.u, s.name, what, ids.length === 1 ? ids[0] : ids.length + ' คน', '');
  log_(s.u, what, ids.length === 1 ? ids[0] : '', ids.length > 1 ? ids.length + ' คน' : '');
  return out;
}
function adminSecurityStatus(token) {
  auth_(token, true);
  const set = getSettings_();
  const trig = ScriptApp.getProjectTriggers().some(t => ['backupNow_', 'dailyBackup'].indexOf(t.getHandlerFunction()) >= 0);
  const L = [];
  try {
    const it = getSubFolder_(getRootFolder_(), 'สำรองข้อมูล').getFiles();
    while (it.hasNext()) { const f = it.next(); if (/^สำรอง_/.test(f.getName())) L.push({ name: f.getName(), url: f.getUrl(), t: f.getDateCreated().getTime() }); }
  } catch (e) {}
  L.sort((a, b) => b.t - a.t);
  return { mask: set.MASK_CONTACT !== 'off', idle: Number(set.IDLE_MIN || 30), auto: trig, hour: Number(set.BACKUP_HOUR || 2), keep: Number(set.BACKUP_KEEP || 14),
    backups: L.slice(0, 20).map(x => ({ name: x.name, url: x.url, time: Utilities.formatDate(new Date(x.t), 'Asia/Bangkok', 'd/M/yyyy HH:mm') })) };
}
function adminSaveSecurity(token, o) {
  const s = authOwner_(token);
  const idle = Math.max(0, Math.min(480, Math.round(Number(o.idle) || 0))), hour = Math.max(0, Math.min(23, Math.round(Number(o.hour) || 0))), keep = Math.max(1, Math.min(90, Math.round(Number(o.keep) || 14)));
  setSetting_('MASK_CONTACT', o.mask ? 'on' : 'off');
  setSetting_('IDLE_MIN', String(idle)); setSetting_('BACKUP_HOUR', String(hour)); setSetting_('BACKUP_KEEP', String(keep));
  if (o.auto) installDailyBackup(hour); else removeDailyBackup_();
  log_(s.u, 'แก้ไขการตั้งค่าความปลอดภัย', '', JSON.stringify(o));
  access_(s.u, s.name, 'แก้ไขการตั้งค่าความปลอดภัย', 'ปิดบังข้อมูล: ' + (o.mask ? 'เปิด' : 'ปิด') + ' · สำรองอัตโนมัติ: ' + (o.auto ? 'เปิด ' + hour + ':00 น.' : 'ปิด'), '');
  return adminSecurityStatus(token);
}

// ======================= ประวัติการเปลี่ยนสถานะ =======================
/** rows: [รหัส, สถานะเดิม, สถานะใหม่, ภาคที่มีผล, เหตุผล, เลขที่คำสั่ง, ที่มา, ผู้บันทึก] */
function addStatusHist_(rows) {
  const sh = sheet_(SH.STATUSHIST), now = new Date();
  const data = rows.map((r, i) => [Utilities.formatDate(now, 'Asia/Bangkok', 'yyyyMMddHHmmss') + '-' + i + '-' + Utilities.getUuid().slice(0, 4)].concat(r.map(x => safe_(String(x == null ? '' : x)))).concat([now]));
  const r0 = sh.getLastRow() + 1; sh.getRange(r0, 5, data.length, 1).setNumberFormat('@');   // ภาคที่มีผล เป็นข้อความ (กัน Sheets แปลง 2/2569 เป็นวันที่)
  sh.getRange(r0, 1, data.length, STATUSHIST_HEADERS.length).setValues(data);
}
/** ภาคการศึกษา "2/2569" — ถ้า Sheets แปลงเป็นวันที่ (1 ก.พ. 2569) ให้แปลงกลับ */
function termStr_(v) { if (v instanceof Date && !isNaN(v)) return (v.getMonth() + 1) + '/' + v.getFullYear(); const m = String(v == null ? '' : v).match(/^(\d)\s*\/\s*(\d{4})$/); return m ? m[1] + '/' + m[2] : String(v == null ? '' : v); }
/** วันเวลาแบบระบบ REQ: 10/11/2026 22:02:41 (ค.ศ. เวลาไทย) */
function dtTH_(v) { if (!v) return ''; { const m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})$/); if (m) return m[3] + '/' + m[2] + '/' + m[1]; } const d = v instanceof Date ? v : new Date(v); return isNaN(d) ? String(v) : Utilities.formatDate(d, 'Asia/Bangkok', 'dd/MM/yyyy HH:mm:ss'); }
function termSortKey_(t) { t = termStr_(t); const m = String(t || '').match(/(\d)\s*\/\s*(\d{2,4})/); if (!m) return 0; let y = Number(m[2]); if (y < 100) y += 2500; return y * 10 + Number(m[1]); }
function adminGetStatusHist(token, sid) {
  auth_(token);
  sid = normId_(sid);
  const t = readTable_(SH.STATUSHIST), S = idx_(t.headers);
  return t.rows.filter(r => normId_(r[S['รหัสนักศึกษา']]) === sid && r[S.HistId]).map(r => ({
    id: String(r[S.HistId]), from: r[S['สถานะเดิม']], to: r[S['สถานะใหม่']], term: termStr_(r[S['ภาคที่มีผล']]), reason: r[S['เหตุผล/หมายเหตุ']], ref: r[S['เลขที่คำสั่ง/ประกาศ']],
    src: r[S['ที่มา']], by: r[S['ผู้บันทึก']], at: r[S['บันทึกเมื่อ']] instanceof Date ? Utilities.formatDate(r[S['บันทึกเมื่อ']], 'Asia/Bangkok', 'dd/MM/yyyy HH:mm:ss') : String(r[S['บันทึกเมื่อ']] || ''),
    ts: r[S['บันทึกเมื่อ']] instanceof Date ? r[S['บันทึกเมื่อ']].getTime() : 0
  })).sort((a, b) => (termSortKey_(a.term) || 0) - (termSortKey_(b.term) || 0) || a.ts - b.ts);
}
/** เพิ่มประวัติย้อนหลังด้วยตนเอง · apply=true จะเปลี่ยนสถานะปัจจุบันด้วย */
function adminAddStatusHist(token, e) {
  const s = authW_(token);
  const sid = normId_(e.sid);
  if (masterList_('สถานะ').indexOf(e.to) < 0) throw new Error('สถานะไม่ถูกต้อง');
  if (e.term && !/^\d\s*\/\s*\d{2,4}$/.test(String(e.term).trim())) throw new Error('ภาคที่มีผล ใช้รูปแบบ 1/2568');
  return withLock_(() => {
    const sh = sheet_(SH.STUDENTS), f = sh.getRange('A:A').createTextFinder(sid).matchEntireCell(true).findNext();
    if (!f) throw new Error('ไม่พบรหัสนักศึกษา');
    const hdr = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0], H = idx_(hdr);
    const cur = String(sh.getRange(f.getRow(), H['สถานะ'] + 1).getValue() || '');
    addStatusHist_([[sid, e.from || (e.apply ? cur : ''), e.to, String(e.term || '').trim(), e.reason || '', e.ref || '', e.apply ? 'แก้ไขข้อมูล' : 'บันทึกย้อนหลัง', s.u]]);
    if (e.apply && cur !== e.to) {
      sh.getRange(f.getRow(), H['สถานะ'] + 1).setValue(e.to);
      if (H['อัปเดตล่าสุด'] !== undefined) sh.getRange(f.getRow(), H['อัปเดตล่าสุด'] + 1).setValue(new Date());
    }
    log_(s.u, 'บันทึกประวัติสถานะ', sid, (e.from || '') + ' → ' + e.to + ' ' + (e.term || ''));
    return { hist: adminGetStatusHist(token, sid), status: e.apply ? e.to : cur };
  });
}
function adminDeleteStatusHist(token, histId) {
  const s = auth_(token, true);
  return withLock_(() => {
    const sh = sheet_(SH.STATUSHIST), f = sh.getRange('A:A').createTextFinder(String(histId)).matchEntireCell(true).findNext();
    if (!f) throw new Error('ไม่พบรายการ');
    const r = sh.getRange(f.getRow(), 1, 1, STATUSHIST_HEADERS.length).getValues()[0];
    sh.deleteRow(f.getRow());
    log_(s.u, 'ลบประวัติสถานะ', r[1], r[2] + ' → ' + r[3] + ' ' + r[4]);
    return adminGetStatusHist(token, r[1]);
  });
}
/** สร้างประวัติสถานะจากช่อง "หมายเหตุ" เดิม เช่น "ลาออก ภาค 2/67" (ทำครั้งเดียว ไม่สร้างซ้ำ) */
function adminBackfillStatusHist(token) {
  const s = authW_(token);
  return withLock_(() => {
    const st = readTable_(SH.STUDENTS), H = idx_(st.headers);
    const ex = readTable_(SH.STATUSHIST), S = idx_(ex.headers), have = {};
    ex.rows.forEach(r => have[normId_(r[S['รหัสนักศึกษา']]) + '|' + r[S['สถานะใหม่']] + '|' + r[S['ภาคที่มีผล']]] = 1);
    const re = /(ลาออก|ลาพัก|รักษาสภาพ|พ้นสภาพ|ย้ายคณะ|กลับเข้าศึกษา|คืนสภาพ)\s*(?:ภาค(?:การศึกษา)?(?:ที่)?)?\s*(\d)\s*\/\s*(\d{2,4})/g;
    const map = { 'รักษาสภาพ': 'ลาพัก', 'กลับเข้าศึกษา': 'กำลังศึกษา', 'คืนสภาพ': 'กำลังศึกษา' };
    const rows = [];
    st.rows.forEach(r => {
      const id = normId_(r[0]); if (!id) return;
      const note = String(r[H['หมายเหตุ']] || ''); let m;
      re.lastIndex = 0;
      while ((m = re.exec(note))) {
        let y = Number(m[3]); if (y < 100) y += 2500;
        const to = map[m[1]] || m[1], term = m[2] + '/' + y;
        if (have[id + '|' + to + '|' + term]) continue;
        have[id + '|' + to + '|' + term] = 1;
        rows.push([id, '', to, term, 'จากหมายเหตุ: ' + note.slice(0, 120), '', 'สร้างจากหมายเหตุ', s.u]);
      }
    });
    if (rows.length) addStatusHist_(rows);
    log_(s.u, 'สร้างประวัติสถานะจากหมายเหตุ', '', rows.length + ' รายการ');
    return rows.length;
  });
}


// ======================= ค้นหานักศึกษา (หน้า Dashboard / ไม่ต้องเข้าสู่ระบบ) =======================
function publicFields_() {
  const f = String(getSettings_().PUBLIC_FIELDS || DEFAULT_SETTINGS.PUBLIC_FIELDS).split(',').map(x => x.trim()).filter(x => PUBLIC_FIELD_OPTIONS.indexOf(x) >= 0);
  ['รหัสนักศึกษา', 'ชื่อ-สกุล'].forEach(x => { if (f.indexOf(x) < 0) f.unshift(x); });
  return PUBLIC_FIELD_OPTIONS.filter(x => f.indexOf(x) >= 0);
}
/** nameQ: ชื่อ-สกุล · idQ: รหัสนักศึกษา (ค้นแยกช่อง ใช้ร่วมกันได้) · คืนครั้งละ 10 รายการ เฉพาะช่องที่ผู้ดูแลอนุญาต */
function publicSearch(nameQ, idQ, year, program, page) {
  const set = getSettings_();
  if (set.PUBLIC_SEARCH === 'off') return { off: true };
  const X = publicIndex_(), fields = X.fields;
  const nq = String(nameQ || '').trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 60);
  const iq = String(idQ || '').replace(/[^\d]/g, '').slice(0, 10);
  const words = nq.split(' ').filter(Boolean);
  const L = X.rows.filter(x =>
    (!year || String(x.y) === String(year)) && (!program || x.p === String(program)) &&
    (!iq || x.id.replace('-', '').indexOf(iq) === 0) &&
    (!words.length || words.every(w => x.s.indexOf(w) >= 0)));
  const per = 10, pages = Math.max(1, Math.ceil(L.length / per));
  page = Math.min(Math.max(1, Number(page) || 1), pages);
  const rows = L.slice((page - 1) * per, page * per).map(x => {
    const o = {}; fields.forEach((f, i) => o[f] = PUBLIC_SECRET.indexOf(f) >= 0 ? '' : x.v[i]); o._init = x.i; return o;
  });
  return { fields, rows, total: L.length, page, pages, programs: X.programs, years: X.years, secret: PUBLIC_SECRET.filter(f => fields.indexOf(f) >= 0), auto: set.PUBLIC_REVEAL_AUTO !== 'off' };
}
/** ดัชนีค้นหาสาธารณะ (เฉพาะช่องที่อนุญาต ไม่รวมค่าที่ปิดบัง) เก็บในแคช ล้างอัตโนมัติเมื่อมีการแก้ไขข้อมูล */
function publicIndex_() {
  return memo_('psidx', () => {
    const hit = cacheGetBig_('psidx'); if (hit) { try { return JSON.parse(hit); } catch (e) {} }
    const fields = publicFields_();
    const t = readTable_(SH.STUDENTS), H = idx_(t.headers);
    const rows = [];
    t.rows.forEach(r => {
      const id = normId_(r[0]); if (!id) return;
      const name = String(r[H['คำนำหน้า']] || '') + r[H['ชื่อ']] + ' ' + r[H['นามสกุล']];
      const v = fields.map(f => f === 'ชื่อ-สกุล' ? name : f === 'หลักสูตร' ? progLabel_(r, H) : PUBLIC_SECRET.indexOf(f) >= 0 ? '' : H[f] !== undefined ? String(r[H[f]] == null ? '' : r[H[f]]) : '');
      rows.push({ id, y: r[H['ชั้นปี']], p: String(r[H['หลักสูตร']] || ''), s: (name + ' ' + r[H['ชื่อ']] + ' ' + r[H['นามสกุล']]).toLowerCase(), i: String(r[H['ชื่อ']] || '?').replace(/^[เแโใไ]/, '').charAt(0), v });
    });
    rows.sort((a, b) => a.id.localeCompare(b.id));
    const X = { fields, rows,
      programs: [...new Set(t.rows.map(r => String(r[H['หลักสูตร']] || '')).filter(Boolean))].sort(),
      years: [...new Set(t.rows.map(r => Number(r[H['ชั้นปี']])).filter(Boolean))].sort((a, b) => a - b) };
    try { cachePutBig_('psidx', JSON.stringify(X), 21600); } catch (e) {}
    return X;
  });
}
/** กดไอคอนดวงตาในการ์ดนักศึกษา: คืนค่าจริงของช่องที่ปิดบัง 1 ช่อง · จำกัดจำนวนครั้ง/ชั่วโมง · บันทึกในบันทึกการเข้าใช้ */
function publicReveal(id, field) {
  const set = getSettings_();
  if (set.PUBLIC_SEARCH === 'off') throw new Error('ปิดการค้นหาอยู่');
  if (PUBLIC_SECRET.indexOf(field) < 0 || publicFields_().indexOf(field) < 0) throw new Error('ไม่อนุญาตให้ดูช่องนี้');
  id = normId_(id); if (!id) throw new Error('ไม่พบนักศึกษา');
  const c = CacheService.getScriptCache(), k = 'prv_' + Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyyMMddHH');
  const n = Number(c.get(k) || 0), max = Number(set.PUBLIC_REVEAL_MAX || DEFAULT_SETTINGS.PUBLIC_REVEAL_MAX) || 120;
  if (n >= max) throw new Error('มีการเปิดดูข้อมูลจำนวนมากเกินไป กรุณาลองใหม่ภายหลัง หรือเข้าสู่ระบบผู้ดูแล');
  c.put(k, String(n + 1), 3700);
  let v = '';
  if (field === 'GPAX ล่าสุด') { const g = gradeSummary_()[id]; v = g && g.gpax !== '' && g.gpax != null ? Number(g.gpax).toFixed(2) : ''; }
  else {
    const t = readTable_(SH.STUDENTS), H = idx_(t.headers);
    const r = t.rows.find(x => normId_(x[0]) === id); if (!r) throw new Error('ไม่พบนักศึกษา');
    v = H[field] !== undefined ? String(r[H[field]] == null ? '' : r[H[field]]).trim() : '';
  }
  access_('(หน้า Dashboard)', 'ผู้ใช้ทั่วไป', 'เปิดดู' + field, id, '');
  return { id, field, value: v };
}
/** เปิดดูทุกช่องที่ปิดบังของนักศึกษา 1 คนในครั้งเดียว (ใช้เมื่อตั้งค่า "เปิดข้อมูลเป็นค่าเริ่มต้น") · นับ 1 ครั้งในโควตารายชั่วโมง */
function publicRevealAll(id) {
  const set = getSettings_();
  if (set.PUBLIC_SEARCH === 'off') throw new Error('ปิดการค้นหาอยู่');
  const F = PUBLIC_SECRET.filter(f => publicFields_().indexOf(f) >= 0); id = normId_(id); if (!id) throw new Error('ไม่พบนักศึกษา');
  const c = CacheService.getScriptCache(), k = 'prv_' + Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyyMMddHH');
  const n = Number(c.get(k) || 0), max = Number(set.PUBLIC_REVEAL_MAX || DEFAULT_SETTINGS.PUBLIC_REVEAL_MAX) || 120;
  if (n >= max) throw new Error('มีการเปิดดูข้อมูลจำนวนมากเกินไป กรุณาลองใหม่ภายหลัง');
  c.put(k, String(n + 1), 3700);
  const out = {}, t = readTable_(SH.STUDENTS), H = idx_(t.headers), r = t.rows.find(x => normId_(x[0]) === id); if (!r) throw new Error('ไม่พบนักศึกษา');
  F.forEach(f => { if (f === 'GPAX ล่าสุด') { const g = gradeSummary_()[id]; out[f] = g && g.gpax !== '' && g.gpax != null ? Number(g.gpax).toFixed(2) : ''; } else out[f] = H[f] !== undefined ? String(r[H[f]] == null ? '' : r[H[f]]).trim() : ''; });
  access_('(หน้า Dashboard)', 'ผู้ใช้ทั่วไป', 'เปิดดูข้อมูลอัตโนมัติ', id + ' · ' + F.join(', '), '');
  return { id, values: out };
}
function adminGetPublicCfg(token) {
  auth_(token, true);
  const s = getSettings_();
  return { on: s.PUBLIC_SEARCH !== 'off', auto: s.PUBLIC_REVEAL_AUTO !== 'off', fields: publicFields_(), options: PUBLIC_FIELD_OPTIONS };
}
function adminSavePublicCfg(token, o) {
  const s = auth_(token, true);
  const f = (o.fields || []).filter(x => PUBLIC_FIELD_OPTIONS.indexOf(x) >= 0);
  setSetting_('PUBLIC_SEARCH', o.on ? 'on' : 'off');
  setSetting_('PUBLIC_FIELDS', f.join(','));
  if (o.auto !== undefined) setSetting_('PUBLIC_REVEAL_AUTO', o.auto ? 'on' : 'off');
  clearDashCache_();
  log_(s.u, 'ตั้งค่าหน้าค้นหาสาธารณะ', '', (o.on ? 'เปิด' : 'ปิด') + ': ' + f.join(', ') + (o.auto !== undefined ? ' · แสดงข้อมูลที่ปิดบังทันที: ' + (o.auto ? 'เปิด' : 'ปิด') : ''));
  access_(s.u, s.name, 'ตั้งค่าหน้าค้นหาสาธารณะ', (o.on ? 'เปิด' : 'ปิด') + ' · ' + f.join(', '), '');
  return adminGetPublicCfg(token);
}


// ======================= ข้อมูลหลัก (ตัวเลือกต่าง ๆ) =======================
/** ประเภทข้อมูลหลัก → คอลัมน์ในชีตนักศึกษา · ค่าเริ่มต้น · ค่าที่ห้ามเปลี่ยนชื่อ/ลบ (ระบบใช้อ้างอิง) */
const MASTER_TYPES = {
  'หลักสูตร': { col: 'หลักสูตร', def: PROGRAM_LIST, lock: [PRIMARY_PROG], desc: 'กลุ่ม/หลักสูตรของนักศึกษา' },
  'สถานะ': { col: 'สถานะ', def: STATUS_LIST, lock: ['กำลังศึกษา', 'ลาพัก', 'ลาออก', 'พ้นสภาพ', 'สำเร็จการศึกษา'], desc: 'สถานะนักศึกษา' },
  'จังหวัดปฐมภูมิ': { col: 'จังหวัด', def: PRIMARY_PROVINCES, lock: [], desc: 'จังหวัดของโครงการพิเศษ ปฐมภูมิ' },
  'รอบการรับเข้า': { col: 'รอบการรับเข้า', def: ADMISSION_ROUNDS, lock: [], desc: 'รอบ TCAS ที่รับเข้า' },
  'สาขาเน้น': { col: 'สาขาเน้น', def: null, lock: [], desc: 'กลุ่มวิชาสาขาเน้น (ชั้นปี 5–6)' }
};
function masterRows_() { return memo_('master', masterRows_Raw_); }
function masterRows_Raw_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.MASTER);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, MASTER_HEADERS.length).getValues()
    .map((r, i) => ({ row: i + 2, type: String(r[0]).trim(), value: String(r[1]).trim(), order: Number(r[2]) || 0, active: isActive_(r[3]), note: String(r[4] || '') }))
    .filter(x => x.type && x.value);
}
/** ค่าเริ่มต้นของประเภท (สาขาเน้น = ค่าที่มีอยู่จริงในข้อมูลนักศึกษา) */
function masterDefault_(type) {
  const T = MASTER_TYPES[type]; if (!T) return [];
  if (T.def) return T.def.slice();
  const st = readTable_(SH.STUDENTS), H = idx_(st.headers), set = {};
  if (H[T.col] !== undefined) st.rows.forEach(r => { const v = String(r[H[T.col]] || '').trim(); if (v) set[v] = 1; });
  return Object.keys(set).sort((a, b) => a.localeCompare(b, 'th'));
}
/** รายการที่ใช้งานอยู่ของประเภท (ยังไม่เคยตั้ง = ค่าเริ่มต้น) */
function masterList_(type, all) {
  const R = masterRows_().filter(x => x.type === type);
  if (!R.length) return masterDefault_(type);
  return R.filter(x => all || x.active).sort((a, b) => a.order - b.order).map(x => x.value);
}
function provinces_() { return masterList_('จังหวัดปฐมภูมิ'); }

function usageCount_(col) {
  const st = readTable_(SH.STUDENTS), H = idx_(st.headers), c = {};
  if (H[col] === undefined) return c;
  st.rows.forEach(r => { if (!normId_(r[0])) return; const v = col === 'อาจารย์ที่ปรึกษา' ? normAdv_(r[H[col]]) : String(r[H[col]] || '').trim(); if (v) c[v] = (c[v] || 0) + 1; });
  return c;
}
function adminMasterGet(token) {
  tabGuard_(auth_(token), 'pMaster');
  const rows = masterRows_();
  const types = Object.keys(MASTER_TYPES).map(type => {
    const T = MASTER_TYPES[type], used = usageCount_(T.col);
    let R = rows.filter(x => x.type === type).sort((a, b) => a.order - b.order);
    const fromDefault = !R.length;
    if (fromDefault) R = masterDefault_(type).map((v, i) => ({ value: v, order: i + 1, active: true, note: '' }));
    const known = {}; R.forEach(x => known[x.value] = 1);
    return {
      type, col: T.col, desc: T.desc, lock: T.lock, fromDefault,
      items: R.map(x => ({ value: x.value, order: x.order, active: x.active, note: x.note, used: used[x.value] || 0 })),
      unknown: Object.keys(used).filter(v => !known[v]).map(v => ({ value: v, used: used[v] })).sort((a, b) => b.used - a.used)
    };
  });
  const am = advisorMap_(), au = usageCount_('อาจารย์ที่ปรึกษา');
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.ADVISORS);
  const AI = advisorInfo_();
  const advisors = {
    items: Object.keys(am).sort((a, b) => a.localeCompare(b, 'th')).map(n => ({ value: n, email: am[n], note: (AI[n] || {}).note || '', dept: (AI[n] || {}).dept || '', used: au[n] || 0 })),
    depts: advDepts_(),
    unknown: Object.keys(au).filter(n => am[n] === undefined).map(n => ({ value: n, used: au[n] })).sort((a, b) => b.used - a.used)
  };
  return { types, advisors };
}
/** สร้างรายการในชีตจากค่าเริ่มต้น (ครั้งแรกที่แก้ไขประเภทนั้น) */
function masterMaterialize_(type) {
  const sh = ensureSheetLazy_(SH.MASTER, MASTER_HEADERS);
  if (masterRows_().some(x => x.type === type)) return sh;
  const d = masterDefault_(type);
  if (d.length) sh.getRange(sh.getLastRow() + 1, 1, d.length, MASTER_HEADERS.length).setValues(d.map((v, i) => [type, v, i + 1, true, '']));
  delete MEMO_.master;
  return sh;
}
/** it: {old, value, active, note} · cascade: เปลี่ยนชื่อแล้วแก้ข้อมูลนักศึกษาที่ใช้ค่าเดิมด้วย */
function adminMasterSave(token, type, it, cascade) {
  const s = auth_(token, true); tabGuard_(s, 'pMaster');
  const T = MASTER_TYPES[type]; if (!T) throw new Error('ไม่รู้จักประเภทข้อมูล');
  const value = String(it.value || '').replace(/\s+/g, ' ').trim(), old = String(it.old || '').trim();
  if (!value) throw new Error('กรุณากรอกค่า');
  if (/^[=+\-@]/.test(value)) throw new Error('ค่าห้ามขึ้นต้นด้วย = + - @');
  return withLock_(() => {
    const sh = masterMaterialize_(type);
    const R = masterRows_().filter(x => x.type === type);
    if (old && T.lock.indexOf(old) >= 0 && (value !== old || it.active === false)) throw new Error('"' + old + '" ระบบใช้อ้างอิง เปลี่ยนชื่อหรือปิดใช้งานไม่ได้');
    if ((!old || old !== value) && R.some(x => x.value === value)) throw new Error('มี "' + value + '" อยู่แล้ว');
    let n = 0;
    if (old) {
      const x = R.find(y => y.value === old); if (!x) throw new Error('ไม่พบรายการเดิม');
      sh.getRange(x.row, 2, 1, 4).setValues([[value, x.order, it.active !== false, safe_(it.note || '')]]);
      if (cascade && old !== value) n = cascadeRename_(T.col, old, value, s.u);
      log_(s.u, 'แก้ไขข้อมูลหลัก', '', type + ': ' + old + (old !== value ? ' → ' + value : '') + (n ? ' (แก้ข้อมูลนักศึกษา ' + n + ' คน)' : ''));
    } else {
      sh.appendRow([type, value, R.reduce((m, x) => Math.max(m, x.order), 0) + 1, true, safe_(it.note || '')]);
      log_(s.u, 'เพิ่มข้อมูลหลัก', '', type + ': ' + value);
    }
    clearDashCache_();
    return { renamed: n };
  });
}
function adminMasterDelete(token, type, value) {
  const s = auth_(token, true); tabGuard_(s, 'pMaster');
  const T = MASTER_TYPES[type]; if (!T) throw new Error('ไม่รู้จักประเภทข้อมูล');
  if (T.lock.indexOf(value) >= 0) throw new Error('"' + value + '" ระบบใช้อ้างอิง ลบไม่ได้');
  const used = usageCount_(T.col)[value] || 0;
  if (used) throw new Error('ลบไม่ได้: มีนักศึกษาใช้ "' + value + '" อยู่ ' + used + ' คน — เปลี่ยนชื่อ/ย้ายนักศึกษาก่อน หรือปิดใช้งานแทน');
  return withLock_(() => {
    const sh = masterMaterialize_(type);
    const x = masterRows_().find(y => y.type === type && y.value === value); if (!x) throw new Error('ไม่พบรายการ');
    sh.deleteRow(x.row);
    log_(s.u, 'ลบข้อมูลหลัก', '', type + ': ' + value);
    return true;
  });
}
function adminMasterMove(token, type, value, dir) {
  tabGuard_(auth_(token, true), 'pMaster');
  return withLock_(() => {
    const sh = masterMaterialize_(type);
    const R = masterRows_().filter(x => x.type === type).sort((a, b) => a.order - b.order);
    const i = R.findIndex(x => x.value === value), j = i + (dir < 0 ? -1 : 1);
    if (i < 0 || j < 0 || j >= R.length) return false;
    const t = R[i]; R[i] = R[j]; R[j] = t;
    R.forEach((x, k) => sh.getRange(x.row, 3).setValue(k + 1));
    return true;
  });
}
function cascadeRename_(col, old, value, user) {
  const t = readTable_(SH.STUDENTS), H = idx_(t.headers);
  if (H[col] === undefined) return 0;
  let n = 0; const ids = [];
  const same = col === 'อาจารย์ที่ปรึกษา' ? v => normAdv_(v) === old : v => String(v || '').trim() === old;
  t.rows.forEach(r => { if (same(r[H[col]])) { r[H[col]] = value; n++; ids.push(normId_(r[0])); } });
  if (n) t.sh.getRange(2, H[col] + 1, t.rows.length, 1).setValues(t.rows.map(r => [r[H[col]]]));
  if (n) log_(user, 'เปลี่ยนค่าในข้อมูลนักศึกษา', '', col + ': ' + old + ' → ' + value + ' (' + n + ' คน) ' + ids.join(', ').slice(0, 2000));
  return n;
}
/** อาจารย์ที่ปรึกษา: a = {old, value(ชื่อ), email, note} */
function adminAdvisorSave(token, a, cascade) {
  const s = auth_(token, true); tabGuard_(s, 'pMaster');
  const name = normAdv_(a.value), old = normAdv_(a.old), em = String(a.email || '').trim();
  if (!name) throw new Error('กรุณากรอกชื่ออาจารย์');
  if (em && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) throw new Error('อีเมลไม่ถูกต้อง');
  return withLock_(() => {
    const sh = sheet_(SH.ADVISORS); ensureHeaders_(sh, ADVISOR_HEADERS);
    const v = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues() : [];
    const i = v.findIndex(r => normAdv_(r[0]) === (old || name)), dept = a.dept !== undefined ? safe_(String(a.dept || '').trim().slice(0, 80)) : (i >= 0 ? String(v[i][3] || '') : '');
    if ((!old || old !== name) && v.some(r => normAdv_(r[0]) === name)) throw new Error('มีอาจารย์ชื่อนี้อยู่แล้ว');
    let n = 0;
    if (old && i >= 0) {
      sh.getRange(i + 2, 1, 1, 4).setValues([[name, em, safe_(a.note || ''), dept]]);
      if (cascade && old !== name) n = cascadeRename_('อาจารย์ที่ปรึกษา', old, name, s.u);
    } else sh.appendRow([name, em, safe_(a.note || ''), dept]);
    delete MEMO_.advinfo;
    log_(s.u, old ? 'แก้ไขอาจารย์ที่ปรึกษา' : 'เพิ่มอาจารย์ที่ปรึกษา', '', (old && old !== name ? old + ' → ' : '') + name + (n ? ' (แก้ข้อมูลนักศึกษา ' + n + ' คน)' : ''));
    return { renamed: n };
  });
}
function adminAdvisorDelete(token, name) {
  const s = auth_(token, true); tabGuard_(s, 'pMaster');
  name = normAdv_(name);
  const used = usageCount_('อาจารย์ที่ปรึกษา')[name] || 0;
  if (used) throw new Error('ลบไม่ได้: เป็นอาจารย์ที่ปรึกษาของนักศึกษา ' + used + ' คน — เปลี่ยนชื่อ/ย้ายนักศึกษาก่อน');
  return withLock_(() => {
    const sh = sheet_(SH.ADVISORS);
    const v = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues() : [];
    const i = v.findIndex(r => normAdv_(r[0]) === name); if (i < 0) throw new Error('ไม่พบรายชื่อ');
    sh.deleteRow(i + 2);
    log_(s.u, 'ลบอาจารย์ที่ปรึกษา', '', name);
    return true;
  });
}


// ======================= ประวัติการนำเข้า + ย้อนกลับ =======================
const UNDO_KEEP = 20;          // เก็บข้อมูลสำหรับย้อนกลับเฉพาะ 20 ครั้งล่าสุด
/** บันทึก batch (เรียกได้หลายครั้งต่อ batch เมื่อแบ่งส่งเป็นช่วง) + เก็บค่าก่อนนำเข้า */
function importBatch_(batchId, user, type, term, cnt, sheetName, snap, file) {
  const id = String(batchId || Utilities.getUuid().slice(0, 8)).replace(/[^\w-]/g, '').slice(0, 40);
  const lg = ensureSheetLazy_(SH.IMPORTLOG, IMPORTLOG_HEADERS), un = ensureSheetLazy_(SH.UNDO, UNDO_HEADERS);
  const f = lg.getRange('A:A').createTextFinder(id).matchEntireCell(true).findNext();
  if (f) {
    const c = JSON.parse(lg.getRange(f.getRow(), 6).getValue() || '{}');
    ['added', 'updated', 'skipped'].forEach(k => c[k] = (c[k] || 0) + (cnt[k] || 0));
    lg.getRange(f.getRow(), 6).setValue(JSON.stringify(c));
  } else {
    lg.appendRow([id, new Date(), user, type, term, JSON.stringify(cnt), file || '', 'นำเข้าแล้ว']);
  }
  // แบ่ง JSON เป็นช่วง (เซลล์เก็บได้ ~50,000 ตัวอักษร)
  let part = [], len = 0;
  const flush = () => { if (part.length) un.appendRow([id, sheetName, JSON.stringify(part)]); part = []; len = 0; };
  snap.forEach(e => { const j = JSON.stringify(e, (k, v) => v instanceof Date ? v.toISOString() : v); if (len + j.length > 40000) flush(); part.push(e); len += j.length + 1; });
  flush();
  pruneUndo_();
  return id;
}
function setBatchFile_(id, url) {
  const lg = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.IMPORTLOG); if (!lg) return;
  const f = lg.getRange('A:A').createTextFinder(String(id)).matchEntireCell(true).findNext();
  if (f) lg.getRange(f.getRow(), 7).setValue(url);
}
function pruneUndo_() {
  const lg = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.IMPORTLOG), un = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.UNDO);
  if (!lg || !un || lg.getLastRow() - 1 <= UNDO_KEEP) return;
  const v = lg.getRange(2, 1, lg.getLastRow() - 1, 8).getValues();
  const keep = {}; v.slice(-UNDO_KEEP).forEach(r => keep[r[0]] = 1);
  v.forEach((r, i) => { if (!keep[r[0]] && r[7] === 'นำเข้าแล้ว') lg.getRange(i + 2, 8).setValue('ย้อนไม่ได้ (เก่าเกิน ' + UNDO_KEEP + ' ครั้ง)'); });
  const u = un.getLastRow() > 1 ? un.getRange(2, 1, un.getLastRow() - 1, 1).getValues() : [];
  for (let i = u.length - 1; i >= 0; i--) if (!keep[u[i][0]]) un.deleteRow(i + 2);
}
function adminImportHistory(token) {
  tabGuard_(auth_(token), 'pImport');
  const lg = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.IMPORTLOG);
  if (!lg || lg.getLastRow() < 2) return [];
  const v = lg.getRange(2, 1, lg.getLastRow() - 1, 8).getValues();
  const lastOpen = v.map(r => r[7]).lastIndexOf('นำเข้าแล้ว');
  return v.map((r, i) => {
    let c = {}; try { c = JSON.parse(r[5] || '{}'); } catch (e) {}
    return { id: String(r[0]), time: r[1] instanceof Date ? Utilities.formatDate(r[1], 'Asia/Bangkok', 'd/M/yyyy HH:mm') : String(r[1]), user: r[2], type: r[3], term: r[4],
      added: c.added || 0, updated: c.updated || 0, skipped: c.skipped || 0, file: r[6], status: r[7], canUndo: i === lastOpen };
  }).reverse().slice(0, 50);
}
/** ย้อนการนำเข้า: ทำได้เฉพาะครั้งล่าสุดที่ยังไม่ถูกย้อน (กันข้อมูลทับซ้อน) */
function adminUndoImport(token, batchId) {
  const s = auth_(token, true); tabGuard_(s, 'pImport');
  return withLock_(() => {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const lg = sheet_(SH.IMPORTLOG), un = sheet_(SH.UNDO);
    const v = lg.getRange(2, 1, lg.getLastRow() - 1, 8).getValues();
    const i = v.findIndex(r => String(r[0]) === String(batchId));
    if (i < 0) throw new Error('ไม่พบรายการนำเข้า');
    if (v[i][7] !== 'นำเข้าแล้ว' || v.map(r => r[7]).lastIndexOf('นำเข้าแล้ว') !== i) throw new Error('ย้อนได้เฉพาะการนำเข้าครั้งล่าสุดที่ยังไม่ถูกย้อน');
    const parts = un.getLastRow() > 1 ? un.getRange(2, 1, un.getLastRow() - 1, 3).getValues().filter(r => String(r[0]) === String(batchId)) : [];
    if (!parts.length) throw new Error('ไม่มีข้อมูลสำหรับย้อนกลับ');
    const sheetName = parts[0][1];
    const entries = [].concat(...parts.map(p => JSON.parse(p[2])));
    const first = {}; entries.forEach(e => { if (!(e[0] in first)) first[e[0]] = e[1]; });
    const t = readTable_(sheetName);
    const isG = sheetName === SH.GRADES, G = idx_(t.headers), width = isG ? GRADE_HEADERS.length : t.headers.length;
    const keyOf = r => isG ? normId_(r[0]) + '|' + Number(r[G['ปีการศึกษา']]) + '|' + Number(r[G['ภาคการศึกษา']]) : normId_(r[0]);
    let restored = 0, removed = 0;
    const done = {};
    const out = [];
    t.rows.forEach(r => {
      const k = keyOf(r);
      if (!(k in first)) { out.push(r.slice(0, width)); return; }
      if (done[k]) return;
      done[k] = 1;
      if (first[k] === null) { removed++; return; }
      out.push(first[k].map((x, j) => typeof x === 'string' && /^\d{4}-\d\d-\d\dT/.test(x) ? new Date(x) : x).concat(Array(Math.max(0, width - first[k].length)).fill('')).slice(0, width)); restored++;
    });
    Object.keys(first).forEach(k => { if (!done[k] && first[k] !== null) { out.push(first[k].slice(0, width)); restored++; } });
    const sh = ss.getSheetByName(sheetName);
    if (t.rows.length) sh.getRange(2, 1, t.rows.length, width).clearContent();
    if (out.length) sh.getRange(2, 1, out.length, width).setValues(out);
    lg.getRange(i + 2, 8).setValue('ย้อนแล้วโดย ' + s.u + ' ' + Utilities.formatDate(new Date(), 'Asia/Bangkok', 'd/M/yyyy HH:mm'));
    clearGradeCache_();
    log_(s.u, 'ย้อนการนำเข้า', '', v[i][3] + ' ' + (v[i][4] || '') + ' · คืนค่าเดิม ' + restored + ' · ลบที่เพิ่มใหม่ ' + removed);
    clearDashCache_();
    return { restored, removed };
  });
}


// ======================= ภาคการศึกษา: สถานะการปิดภาค =======================
function closedTerms_() { try { return JSON.parse(getSettings_().TERM_CLOSED || '{}'); } catch (e) { return {}; } }
function adminCloseTerm(token, termKey, close) {
  const s = auth_(token, true); tabGuard_(s, 'pTerm');
  termKey = Number(termKey); if (!termKey) throw new Error('ภาคไม่ถูกต้อง');
  return withLock_(() => {
    const c = closedTerms_();
    if (close) { c[termKey] = { by: s.name || s.u, time: Utilities.formatDate(new Date(), 'Asia/Bangkok', 'd/M/yyyy HH:mm') }; try { termSnapSave_(termKey, s.u, 'ปิดภาคการศึกษา'); } catch (e) {} } else delete c[termKey];
    setSetting_('TERM_CLOSED', JSON.stringify(c));
    log_(s.u, close ? 'ปิดภาคการศึกษา' : 'เปิดภาคการศึกษาอีกครั้ง', '', termLabel_(termKey));
    return c;
  });
}
/** สรุปความคืบหน้างานสิ้นภาค */
function adminTermStatus(token, termKey) {
  tabGuard_(auth_(token), 'pTerm');
  termKey = Number(termKey);
  const set = getSettings_(), th = Number(set.GPAX_THRESHOLD || 2), w = Number(set.GPAX_WATCH || 2.5);
  const st = readTable_(SH.STUDENTS), H = idx_(st.headers);
  const active = {}; st.rows.forEach(r => { const id = normId_(r[0]); if (id && String(r[H['สถานะ']]).trim() === 'กำลังศึกษา') active[id] = Number(r[H['ชั้นปี']]) || 0; });
  const sum = gradeSummary_();
  let withGrade = 0, crit = 0, watch = 0, newCrit = 0, better = 0; const missing = {};
  Object.keys(active).forEach(id => { if (2500 + Number(id.slice(0, 2)) > Math.floor(termKey / 10)) delete active[id]; });
  Object.keys(active).forEach(id => {
    const h = (sum[id] || { h: [] }).h, cur = h.find(x => x[0] === termKey);
    if (!cur) { if (2500 + Number(id.slice(0, 2)) <= Math.floor(termKey / 10)) missing[active[id]] = (missing[active[id]] || 0) + 1; return; }
    withGrade++;
    const g = cur[2]; if (g === '') return;
    const prev = h.filter(x => x[0] < termKey && x[2] !== '').pop();
    const lv = x => x < th ? 2 : x < w ? 1 : 0;
    if (lv(g) === 2) crit++; else if (lv(g) === 1) watch++;
    if (prev && lv(g) === 2 && lv(prev[2]) < 2) newCrit++;
    if (prev && lv(g) < lv(prev[2])) better++;
  });
  const lbl = termLabel_(termKey);
  // ไฟล์ตรวจสอบจบที่นำเข้าในภาคนี้
  let gc = 0; const gs = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.GRADCHK);
  if (gs && gs.getLastRow() > 1) { const t = readTable_(SH.GRADCHK), G = idx_(t.headers); if (G['ข้อมูล ณ ภาค'] !== undefined) t.rows.forEach(r => { if (String(r[G['ข้อมูล ณ ภาค']]) === lbl) gc++; }); }
  // รายงานอาจารย์ที่ปรึกษา
  const rr = reportRows_(termKey), advs = {}; rr.rows.forEach(x => advs[x.advisor] = 1);
  const sent = {}; readTable_(SH.REPORTLOG).rows.forEach(x => { if (String(x[1]) === lbl && x[6] === 'ส่งแล้ว') sent[x[2]] = 1; });
  // นำเข้า/สำรอง
  const imports = adminImportHistory(token).filter(x => x.type === 'ผลการเรียน' && x.term === lbl && x.status === 'นำเข้าแล้ว');
  let lastBackup = '';
  const lg = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.LOG);
  if (lg && lg.getLastRow() > 1) {
    const n = Math.min(2000, lg.getLastRow() - 1), v = lg.getRange(lg.getLastRow() - n + 1, 1, n, 3).getValues();
    for (let i = v.length - 1; i >= 0; i--) if (v[i][2] === 'สำรองข้อมูล') { lastBackup = v[i][0] instanceof Date ? Utilities.formatDate(v[i][0], 'Asia/Bangkok', 'd/M/yyyy HH:mm') : String(v[i][0]); break; }
  }
  const fs = fStats_().byId; let fOpen = 0; Object.keys(active).forEach(id => { if (fs[id] && fs[id].open) fOpen++; });
  const q = quality_(); 
  return {
    term: lbl, key: termKey, active: Object.keys(active).length, withGrade, missing, crit, watch, newCrit, better, gradChk: gc,
    advisors: Object.keys(advs).length, sent: Object.keys(advs).filter(a => sent[a]).length, imports: imports.length, lastImport: imports[0] || null,
    lastBackup, fOpen, quality: { bad: q.filter(x => x.level === 'bad').reduce((a, x) => a + x.items.length, 0), warn: q.filter(x => x.level === 'warn').reduce((a, x) => a + x.items.length, 0) },
    closed: closedTerms_()[termKey] || null
  };
}


// ======================= ตรวจคุณภาพข้อมูล =======================
function quality_() {
  const st = readTable_(SH.STUDENTS), H = idx_(st.headers);
  const nm = r => String(r[H['คำนำหน้า']] || '') + (r[H['ชื่อ']] || '') + ' ' + (r[H['นามสกุล']] || '');
  const G = (key, title, level, desc) => ({ key, title, level, desc, items: [] });
  const g = {
    dup: G('dup', 'รหัสนักศึกษาซ้ำ', 'bad', 'มีมากกว่า 1 แถวในชีตนักศึกษา'),
    badId: G('badId', 'รูปแบบรหัสนักศึกษาไม่ถูกต้อง', 'bad', 'ต้องเป็น 000000000-0'),
    noName: G('noName', 'ไม่มีชื่อหรือนามสกุล', 'bad', ''),
    advText: G('advText', 'ช่องอาจารย์ที่ปรึกษามีข้อความอื่นปน', 'bad', 'เช่น ข้อความสถานะ "61 : พ้นสภาพ…" ควรย้ายไปช่องสถานะ/หมายเหตุ'),
    prim: G('prim', 'ปฐมภูมิ แต่ไม่ระบุจังหวัด/จังหวัดไม่ถูกต้อง', 'bad', ''),
    phone: G('phone', 'เบอร์โทรรูปแบบไม่ถูกต้อง', 'warn', 'ควรเป็นตัวเลข 10 หลัก ขึ้นต้นด้วย 0'),
    email: G('email', 'อีเมลรูปแบบไม่ถูกต้อง', 'warn', ''),
    noAdv: G('noAdv', 'กำลังศึกษา แต่ไม่มีอาจารย์ที่ปรึกษา', 'warn', ''),
    advNoEmail: G('advNoEmail', 'อาจารย์ที่ปรึกษายังไม่มีอีเมล', 'warn', 'ส่งรายงานสิ้นภาคไม่ได้ · เพิ่มอีเมลที่เมนูข้อมูลหลัก'),
    master: G('master', 'ค่าไม่อยู่ในข้อมูลหลัก', 'warn', 'สะกดต่างจากรายการ หรือยังไม่ได้เพิ่มในข้อมูลหลัก'),
    year: G('year', 'ชั้นปีไม่สอดคล้องกับรหัสนักศึกษา', 'warn', 'ชั้นปีมากกว่าจำนวนปีที่ศึกษามา'),
    noGrade: G('noGrade', 'กำลังศึกษา แต่ไม่มีผลการเรียนภาคล่าสุด', 'warn', ''),
    noGc: G('noGc', 'ชั้นปี 4 ขึ้นไป ยังไม่มีไฟล์ตรวจสอบจบ', 'warn', 'ใช้ตรวจสิทธิ์ฝึกงาน/สำเร็จการศึกษา')
  };
  const seen = {}, PV = provinces_(), am = advisorMap_(), advUse = {};
  const lists = { 'หลักสูตร': masterList_('หลักสูตร', true), 'สถานะ': masterList_('สถานะ', true), 'รอบการรับเข้า': masterList_('รอบการรับเข้า', true) };
  const sum = gradeSummary_(), gci = gradCheckIndex_();
  let lastKey = 0; Object.keys(sum).forEach(id => sum[id].h.forEach(x => { if (x[0] % 10 !== 3 && x[0] > lastKey) lastKey = x[0]; }));
  const nowYear = acadYearNow_();
  st.rows.forEach((r, i) => {
    const id = normId_(r[0]); if (!id) return;
    const it = d => ({ id, name: nm(r), detail: d || '' });
    if (seen[id]) g.dup.items.push(it('แถว ' + (seen[id]) + ' และ ' + (i + 2))); else seen[id] = i + 2;
    if (!/^\d{9}-\d$/.test(id)) g.badId.items.push(it(id));
    if (!String(r[H['ชื่อ']] || '').trim() || !String(r[H['นามสกุล']] || '').trim()) g.noName.items.push(it());
    const active = String(r[H['สถานะ']]).trim() === 'กำลังศึกษา';
    const adv = String(r[H['อาจารย์ที่ปรึกษา']] || '').trim();
    if (adv && /\d+\s*:|พ้นสภาพ|รายงานตัว|ลาออก|ลาพัก|สำเร็จการศึกษา/.test(adv)) g.advText.items.push(it(adv.slice(0, 80)));
    else if (adv) { const a = normAdv_(adv); advUse[a] = (advUse[a] || 0) + (active ? 1 : 0); }
    if (active && !adv) g.noAdv.items.push(it());
    if (H['จังหวัด'] !== undefined && isPrimary_(r[H['หลักสูตร']]) && PV.indexOf(String(r[H['จังหวัด']] || '').trim()) < 0) g.prim.items.push(it(String(r[H['จังหวัด']] || '(ว่าง)')));
    const ph = String(r[H['เบอร์โทร']] || '').trim();
    if (ph && !/^0\d{9}$/.test(ph.replace(/[\s-]/g, ''))) g.phone.items.push(it(ph.replace(/\D/g, '').length + ' หลัก'));
    const em = String(r[H['อีเมล']] || '').trim();
    if (em && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) g.email.items.push(it('รูปแบบไม่ถูกต้อง'));
    Object.keys(lists).forEach(k => { const v = String(r[H[k]] || '').trim(); if (v && lists[k].indexOf(v) < 0) g.master.items.push(it(k + ': ' + v)); });
    const y = Number(r[H['ชั้นปี']]), coh = Number(id.slice(0, 2));
    if (active && nowYear && y && coh) { const exp = nowYear - (2500 + coh) + 1; if (y > exp) g.year.items.push(it('ชั้นปี ' + y + ' · ศึกษามา ' + exp + ' ปี')); }
    if (active && lastKey && 2500 + coh <= Math.floor(lastKey / 10) && !(sum[id] && sum[id].h.some(x => x[0] === lastKey))) g.noGrade.items.push(it('ภาค ' + termLabel_(lastKey)));
    if (active && y >= 4 && !gci[id]) g.noGc.items.push(it('ชั้นปี ' + y));
  });
  Object.keys(advUse).forEach(a => {
    if (!advUse[a] || am[a]) return;
    g.advNoEmail.items.push({ id: '', name: a, detail: 'นักศึกษากำลังศึกษา ' + advUse[a] + ' คน' + (am[a] === undefined ? ' · ยังไม่อยู่ในรายชื่ออาจารย์' : '') });
  });
  return Object.keys(g).map(k => g[k]);
}
function adminDataQuality(token) { tabGuard_(auth_(token), 'pQuality'); return quality_(); }


// ======================= สถิติ F (จากไฟล์ตรวจสอบจบ) =======================
/** byId[id] = {open: วิชาที่ยังค้าง F, ever: วิชาที่เคยติด F, times: จำนวนครั้งที่ได้ F} · byCourse[code] = {name, ever:[ids], open:[ids]} */
function fStats_() {
  return memo_('fst', () => {
    const hit = cacheGetBig_('fst'); if (hit) { try { return JSON.parse(hit); } catch (e) {} }
    const v = fStats_Raw_(); try { cachePutBig_('fst', JSON.stringify(v), 21600); } catch (e) {}
    return v;
  });
}
function fStats_Raw_() {
  const out = { byId: {}, byCourse: {} };
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.COURSES);
  if (!sh || sh.getLastRow() < 2) return out;
  const last = {}, ever = {};
  sh.getRange(2, 1, sh.getLastRow() - 1, 10).getValues().forEach(r => {
    const id = normId_(r[0]); if (!id) return;
    const code = String(r[2]).trim(), g = String(r[8]).trim(), k = id + '|' + code;
    const o = out.byId[id] = out.byId[id] || { open: 0, ever: 0, times: 0 };   // มีข้อมูลรายวิชา = มีไฟล์ตรวจสอบจบ
    if (g === 'F') {
      o.times++;
      if (!ever[k]) { ever[k] = 1; o.ever++; const c = out.byCourse[code] = out.byCourse[code] || { name: String(r[3] || ''), ever: [], open: [] }; c.ever.push(id); }
    }
    if (r[9] === 'Y') last[k] = g;
  });
  Object.keys(last).forEach(k => {
    if (last[k] !== 'F') return;
    const [id, code] = k.split('|');
    out.byId[id].open++;
    out.byCourse[code].open.push(id);
  });
  return out;
}
/** สำหรับ Dashboard: แนบ f=[ค้าง, เคย] ให้นักศึกษา (ไม่ระบุตัวตน) + รายวิชาที่มี F พร้อมดัชนีนักศึกษา */
function dashF_(map, students) {
  const f = fStats_(), ix = new Map(students.map((s, i) => [s, i]));
  students.forEach(s => s.f = null);   // null = ยังไม่มีไฟล์ตรวจสอบจบ
  Object.keys(f.byId).forEach(id => { if (map[id]) map[id].f = [f.byId[id].open, f.byId[id].ever]; });
  return Object.keys(f.byCourse).map(code => {
    const c = f.byCourse[code];
    return [code, c.name, c.ever.filter(id => map[id]).map(id => ix.get(map[id])), c.open.filter(id => map[id]).map(id => ix.get(map[id]))];
  }).filter(x => x[2].length).sort((a, b) => b[2].length - a[2].length).slice(0, 80);
}
/** เปลี่ยนค่าที่สะกดผิด/ไม่อยู่ในรายการ ให้เป็นค่าที่ถูกต้อง ในข้อมูลนักศึกษาทุกคน */
function adminMasterRemap(token, type, from, to) {
  const s = auth_(token, true); tabGuard_(s, 'pMaster');
  const col = type === 'อาจารย์ที่ปรึกษา' ? 'อาจารย์ที่ปรึกษา' : (MASTER_TYPES[type] || {}).col;
  if (!col) throw new Error('ไม่รู้จักประเภทข้อมูล');
  from = String(from || '').trim(); to = String(to || '').trim();
  if (!from || !to) throw new Error('ข้อมูลไม่ครบ');
  return withLock_(() => { const n = cascadeRename_(col, type === 'อาจารย์ที่ปรึกษา' ? normAdv_(from) : from, to, s.u); clearDashCache_(); return { renamed: n }; });
}

/** รันเองใน Apps Script หลังแก้ข้อมูลในชีตโดยตรง (ไม่ผ่านระบบ) เพื่อให้ Dashboard/ระบบเห็นข้อมูลใหม่ทันที */
function clearAllCache() {
  CacheService.getScriptCache().removeAll(['dash_n', 'gsum_n', 'fst_n', 'psidx_n']);
  dirty_();
  Logger.log('ล้างแคชแล้ว');
}


// ======================= สุขภาพจิตนักศึกษา (ข้อมูลจากฝ่ายพัฒนานักศึกษา) =======================
/* ข้อมูลอ่อนไหว: ไม่แสดงบนหน้า Dashboard สาธารณะ/ไม่อยู่ในไฟล์ส่งออกนักศึกษา
   เห็นได้เฉพาะ owner/admin และอีเมลที่ระบุใน "ผู้มีสิทธิ์ข้อมูลสุขภาพจิต" (MH_EMAILS) · การดูประวัติ/นำเข้า/ลบ ถูกบันทึกทุกครั้ง */
function canMH_(s) {
  if (ADMIN_ROLES.indexOf(s.role) >= 0) return true;
  const L = mhLink_(); if (!L.access) return false;   // ปิดการเชื่อมต่อ/ปิดสิทธิ์เข้าระบบ → ฝ่ายพัฒนานักศึกษาเข้าไม่ได้
  return mhEmails_().indexOf(String(s.u).toLowerCase()) >= 0;
}
function mhEmails_() { return String(getSettings_().MH_EMAILS || '').toLowerCase().split(/[\s,;]+/).filter(Boolean); }
function authMH_(token) { const s = auth_(token); if (!canMH_(s)) throw new Error('บัญชีนี้ไม่มีสิทธิ์เข้าถึงข้อมูลสุขภาพจิต'); return s; }
function mhSheet_() { const sh = ensureSheetLazy_(SH.MENTAL, MENTAL_HEADERS); if (!sh.isSheetHidden()) sh.hideSheet(); return sh; }
/** ระดับจากร้อยละ (100 = สุขภาพจิตดีที่สุด) */
function mhLevel_(p) { p = Number(p); return p >= 80 ? 'ดีมาก' : p >= 60 ? 'ดี' : p >= 40 ? 'ควรติดตาม' : 'ควรได้รับการดูแล'; }
function mhDate_(v) {
  if (v instanceof Date) return v;
  const t = String(v || '').trim(); if (!t) return null;
  let m = t.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
  if (m) { let y = Number(m[3]); if (y < 100) y += 2000; if (y > 2400) y -= 543; return new Date(y, Number(m[2]) - 1, Number(m[1])); }
  m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) { let y = Number(m[1]); if (y > 2400) y -= 543; return new Date(y, Number(m[2]) - 1, Number(m[3])); }
  const d = new Date(t); return isNaN(d) ? null : d;
}
function mhFmt_(d) { return d instanceof Date && !isNaN(d) ? d.getDate() + '/' + (d.getMonth() + 1) + '/' + (d.getFullYear() + 543) : String(d || ''); }
/* รายด้าน (ร้อยละความรุนแรง: สูง = เสี่ยงมาก) และสถานะความเสี่ยงรวม */
const MH_DIMS = [['dep', 'ซึมเศร้า'], ['str', 'เครียด'], ['prs', 'กดดัน']];
const MH_DLV = ['ปกติ', 'เล็กน้อย', 'ปานกลาง', 'รุนแรง', 'รุนแรงมาก'];
const MH_RISK = ['ปกติ', 'เฝ้าระวัง', 'เสี่ยง', 'เสี่ยงสูง'];
function mhDimLv_(txt, pct) {
  const t = String(txt || '').trim().toLowerCase();
  if (t) {
    if (/รุนแรงมาก|รุนแรงที่สุด|extreme|สูงมาก|มากที่สุด/.test(t)) return 4;
    if (/รุนแรง|severe|สูง|มาก/.test(t)) return 3;
    if (/ปานกลาง|moderate|กลาง/.test(t)) return 2;
    if (/เล็กน้อย|mild|น้อย|ต่ำ|เริ่ม/.test(t)) return 1;
    if (/ปกติ|normal|ไม่มี|ไม่พบ/.test(t)) return 0;
    const i = MH_DLV.indexOf(String(txt).trim()); if (i >= 0) return i;
  }
  const p = Number(pct);
  if (pct === '' || pct == null || isNaN(p)) return -1;
  return p < 20 ? 0 : p < 40 ? 1 : p < 60 ? 2 : p < 80 ? 3 : 4;
}
function mhRiskIdx_(txt) {
  const t = String(txt || '').trim().toLowerCase(); if (!t) return -1;
  if (/สูง|high|วิกฤต|เร่งด่วน|urgent/.test(t)) return 3;
  if (/เฝ้าระวัง|watch|ติดตาม/.test(t)) return 1;
  if (/เสี่ยง|risk/.test(t)) return 2;
  if (/ปกติ|normal|ไม่เสี่ยง|ไม่มี/.test(t)) return 0;
  return -1;
}
/** สถานะรวม = ระดับที่สูงกว่าระหว่าง (ที่ฝ่ายพัฒนานักศึกษาระบุ) กับ (คำนวณจากด้านที่รุนแรงที่สุด + ร้อยละสุขภาพจิต) — ไม่ให้กลุ่มเสี่ยงหลุด */
function mhRiskOf_(p, dims, given) {
  const g = mhRiskIdx_(given);
  const m = Math.max.apply(null, MH_DIMS.map(([k]) => dims[k] ? dims[k].l : -1).concat([-1]));
  p = p === '' || p == null ? 100 : Number(p);
  return Math.max(g, m >= 3 || p < 40 ? 3 : m === 2 || p < 60 ? 2 : m === 1 ? 1 : 0);
}
function mhRows_() {
  return memo_('mhrows', () => {
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.MENTAL);
    if (!sh || sh.getLastRow() < 2) return [];
    const v = sh.getDataRange().getValues(), H = idx_(v.shift());
    const g = (r, h) => H[h] === undefined ? '' : r[H[h]];
    return v.filter(r => normId_(r[H['รหัสนักศึกษา']])).map(r => {
      const d = mhDate_(r[H['วันที่ประเมิน']]), dims = {};
      MH_DIMS.forEach(([k, n]) => { const pc = num_(g(r, n + ' (%)')), l = mhDimLv_(g(r, n + ' (ระดับ)'), pc); if (l >= 0) dims[k] = { l, p: pc === '' ? '' : Math.round(pc) }; });
      const p = num_(r[H['คะแนน (%)']]);
      const hasRisk = p !== '' || Object.keys(dims).length || String(g(r, 'สถานะความเสี่ยง') || '').trim();
      return { id: normId_(r[H['รหัสนักศึกษา']]), ts: d ? d.getTime() : 0, d: mhFmt_(d), y: r[H['ปีการศึกษา']], t: r[H['ภาคการศึกษา']], p, dims, risk: hasRisk ? mhRiskOf_(p, dims, g(r, 'สถานะความเสี่ยง')) : -1,
        tool: String(r[H['แบบประเมิน']] || ''), note: String(r[H['หมายเหตุ']] || ''), src: String(r[H['แหล่งข้อมูล']] || ''), b: String(r[H['BatchId']] || '') };
    });
  });
}
/** ผลล่าสุดของแต่ละคน { id: {p, lvl, risk, rk, dims, d, tool, prev, n} } */
function mhLatest_() {
  const by = {};
  mhRows_().forEach(x => (by[x.id] = by[x.id] || []).push(x));
  const out = {};
  Object.keys(by).forEach(id => {
    const L = by[id].sort((a, b) => a.ts - b.ts), z = L[L.length - 1], pv = L.length > 1 ? L[L.length - 2] : null;
    out[id] = { p: z.p === '' ? '' : Math.round(z.p), lvl: z.p === '' ? '' : mhLevel_(z.p), rk: z.risk, risk: z.risk >= 0 ? MH_RISK[z.risk] : '', dims: z.dims, d: z.d, ts: z.ts, tool: z.tool, note: z.note, prev: pv && pv.p !== '' ? Math.round(pv.p) : '', prk: pv && pv.risk >= 0 ? pv.risk : '', n: L.length };
  });
  return out;
}

/** ภาพรวมสำหรับหน้า "สุขภาพจิตนักศึกษา" */
function adminMHOverview(token) {
  const s = authMH_(token);
  const latest = mhLatest_(), stu = readTable_(SH.STUDENTS), H = idx_(stu.headers);
  const active = {}; stu.rows.forEach(r => { const id = normId_(r[0]); if (id) active[id] = { n: String(r[H['คำนำหน้า']] || '') + r[H['ชื่อ']] + ' ' + r[H['นามสกุล']], y: r[H['ชั้นปี']], st: String(r[H['สถานะ']] || '') }; });
  const lv = { 'ดีมาก': 0, 'ดี': 0, 'ควรติดตาม': 0, 'ควรได้รับการดูแล': 0 }, rk = [0, 0, 0, 0], dimN = { dep: 0, str: 0, prs: 0 }, care = [];
  Object.keys(latest).forEach(id => {
    if (!active[id]) return; const x = latest[id]; if (x.lvl) lv[x.lvl]++; if (x.rk >= 0) rk[x.rk]++;
    MH_DIMS.forEach(([k]) => { if (x.dims[k] && x.dims[k].l >= 2) dimN[k]++; });
    if (x.rk >= 1 || (x.p !== '' && x.p < 60)) care.push({ id, name: active[id].n, year: active[id].y, p: x.p, lvl: x.lvl, rk: x.rk, prk: x.prk, dims: x.dims, d: x.d, prev: x.prev, tool: x.tool });
  });
  care.sort((a, b) => b.rk - a.rk || (a.p === '' ? 101 : a.p) - (b.p === '' ? 101 : b.p));
  const set = getSettings_();
  const lg = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.IMPORTLOG);
  let hist = [];
  if (lg && lg.getLastRow() > 1) hist = lg.getDataRange().getValues().slice(1).filter(r => r[3] === 'สุขภาพจิต').slice(-15).reverse()
    .map(r => ({ id: String(r[0]), time: r[1] instanceof Date ? Utilities.formatDate(r[1], 'Asia/Bangkok', 'd/M/yyyy HH:mm') : String(r[1]), user: r[2], term: r[4], sum: (() => { try { return JSON.parse(r[5]); } catch (e) { return {}; } })(), file: r[6], status: r[7] }));
  log_(s.u, 'ดูภาพรวมสุขภาพจิต', '', '');
  return { total: Object.keys(active).length, assessed: Object.keys(latest).filter(id => active[id]).length, levels: lv, risk: rk, dimN, care, hist,
    emails: set.MH_EMAILS || '', sheetUrl: set.MH_SHEET_URL || '', syncAt: set.MH_SYNC_AT || '', link: mhLinkInfo_() };
}

/** ประวัติการประเมินรายคน (บันทึกการเข้าดู) */
function adminMHHistory(token, id) {
  const s = authMH_(token); id = normId_(id);
  log_(s.u, 'ดูข้อมูลสุขภาพจิต', id, '');
  return mhRows_().filter(x => x.id === id).sort((a, b) => b.ts - a.ts).map(x => ({ d: x.d, term: x.t && x.y ? x.t + '/' + x.y : '', p: x.p === '' ? '' : Math.round(x.p), lvl: x.p === '' ? '' : mhLevel_(x.p), rk: x.risk, dims: x.dims, tool: x.tool, note: x.note }));
}

/**
 * นำเข้าผลประเมิน (จากไฟล์ที่อัปโหลด หรือจาก Google Sheet ที่เชื่อมโยง) — แปลงเป็นร้อยละฝั่งหน้าเว็บแล้ว
 * rows: [{id, date, p, raw, max, tool, note}] · meta: {year, term, source, file}
 */
function adminMHImport(token, rows, meta) {
  const s = authMH_(token); meta = meta || {};
  if (!Array.isArray(rows) || !rows.length) throw new Error('ไม่มีข้อมูลให้นำเข้า');
  if (rows.length > 5000) throw new Error('นำเข้าได้ครั้งละไม่เกิน 5,000 แถว');
  return withLock_(() => {
    const sh = mhSheet_(); ensureHeaders_(sh, MENTAL_HEADERS);
    const hd = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String), H = idx_(hd);
    const ids = {}; readTable_(SH.STUDENTS).rows.forEach(r => { const id = normId_(r[0]); if (id) ids[id] = 1; });
    const seen = {}; mhRows_().forEach(x => seen[x.id + '|' + x.d + '|' + x.tool] = 1);
    const batch = 'MH' + Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyyMMddHHmmss');
    const now = new Date(), out = [], unknown = [], bad = []; let dup = 0;
    rows.forEach((r, i) => {
      let id = normId_(r.id).replace(/^(\d{9})(\d)$/, '$1-$2');
      const dims = {}, D = r.dims || {};
      MH_DIMS.forEach(([k]) => { const x = D[k]; if (!x) return; const pc = x.p === '' || x.p == null ? '' : Number(x.p), l = mhDimLv_(x.t, pc); if (l >= 0 && (pc === '' || (pc >= 0 && pc <= 100))) dims[k] = { l, p: pc }; });
      let p = r.p === '' || r.p == null ? '' : Number(r.p);
      if (p === '' && Object.keys(dims).length) { const a = Object.keys(dims).map(k => dims[k].p === '' ? dims[k].l * 25 : dims[k].p); p = Math.round(100 - a.reduce((x, y) => x + y, 0) / a.length); }
      const given = String(r.risk || '').trim();
      if (!/^\d{9}-\d$/.test(id) || (p !== '' && !(p >= 0 && p <= 100))) { bad.push(i + 2); return; }
      if (!ids[id]) { unknown.push(id); return; }
      const d = mhDate_(r.date) || now, tool = String(r.tool || meta.tool || '').slice(0, 80);
      const key = id + '|' + mhFmt_(d) + '|' + tool;
      if (seen[key]) { dup++; return; } seen[key] = 1;
      const rk = p === '' && !Object.keys(dims).length && !given ? -1 : mhRiskOf_(p, dims, r.risk);
      const o = { 'รหัสนักศึกษา': id, 'วันที่ประเมิน': d, 'ปีการศึกษา': Number(meta.year) || '', 'ภาคการศึกษา': Number(meta.term) || '', 'คะแนน (%)': p === '' ? '' : Math.round(p * 10) / 10, 'ระดับ': p === '' ? '' : mhLevel_(p), 'สถานะความเสี่ยง': rk < 0 ? '' : MH_RISK[rk],
        'แบบประเมิน': tool, 'คะแนนดิบ': r.raw === '' || r.raw == null ? '' : Number(r.raw), 'คะแนนเต็ม': r.max === '' || r.max == null ? '' : Number(r.max), 'หมายเหตุ': safe_(String(r.note || '').slice(0, 300)),
        'แหล่งข้อมูล': meta.source === 'sheet' ? 'Google Sheet ฝ่ายพัฒนานักศึกษา' : 'อัปโหลดไฟล์' + (meta.fileName ? ': ' + meta.fileName : ''), 'BatchId': batch, 'นำเข้าโดย': s.u, 'นำเข้าเมื่อ': now };
      MH_DIMS.forEach(([k, n]) => { if (dims[k]) { o[n + ' (%)'] = dims[k].p === '' ? '' : Math.round(dims[k].p); o[n + ' (ระดับ)'] = MH_DLV[dims[k].l]; } });
      out.push(hd.map(h => o[h] === undefined ? '' : o[h]));
    });
    if (out.length) { sh.getRange(sh.getLastRow() + 1, 1, out.length, hd.length).setValues(out); sh.getRange(2, 1, sh.getLastRow() - 1, 1).setNumberFormat('@'); }
    // ทำแบบประเมินแล้ว → อัปเดตสถานะการดูแลอัตโนมัติ
    if (out.length) { const C = ensureSheetLazy_(SH.MHCARE, MHCARE_HEADERS); if (!C.isSheetHidden()) C.hideSheet();
      const v = C.getDataRange().getValues(), pos = {}; for (let i = 1; i < v.length; i++) pos[normId_(v[i][0])] = i + 1;
      const app = []; [...new Set(out.map(r => r[hd.indexOf('รหัสนักศึกษา')]))].forEach(id => { const row = [id, 'ทำแบบประเมินแล้ว', 'นำเข้าผลแบบประเมิน', s.u, now]; if (pos[id]) C.getRange(pos[id], 1, 1, 5).setValues([row]); else app.push(row); });
      if (app.length) C.getRange(C.getLastRow() + 1, 1, app.length, 5).setValues(app); delete MEMO_.mhcare; }
    const sum = { added: out.length, dup, unknown: unknown.length, bad: bad.length };
    const lg = ensureSheetLazy_(SH.IMPORTLOG, IMPORTLOG_HEADERS);
    lg.appendRow([batch, now, s.u, 'สุขภาพจิต', meta.term && meta.year ? meta.term + '/' + meta.year : '', JSON.stringify(sum), meta.file || '', out.length ? 'สำเร็จ' : 'ไม่มีแถวใหม่']);
    if (meta.source === 'sheet') setSetting_('MH_SYNC_AT', Utilities.formatDate(now, 'Asia/Bangkok', 'd/M/yyyy HH:mm'));
    log_(s.u, 'นำเข้าข้อมูลสุขภาพจิต', '', JSON.stringify(sum) + (meta.source === 'sheet' ? ' (Google Sheet)' : ''));
    delete MEMO_.mhrows;
    return Object.assign(sum, { batch, unknownIds: unknown.slice(0, 50), badRows: bad.slice(0, 50), latest: mhLatest_() });
  });
}

/** ย้อนการนำเข้า (ลบทุกแถวของ BatchId นั้น) */
function adminMHUndo(token, batch) {
  const s = authMH_(token);
  return withLock_(() => {
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.MENTAL); if (!sh) return 0;
    const v = sh.getDataRange().getValues(), bi = v[0].map(String).indexOf('BatchId'); let n = 0;
    for (let i = v.length - 1; i >= 1; i--) if (String(v[i][bi]) === String(batch)) { sh.deleteRow(i + 1); n++; }
    const lg = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.IMPORTLOG);
    if (lg) { const L = lg.getRange('A:A').createTextFinder(String(batch)).matchEntireCell(true).findNext(); if (L) lg.getRange(L.getRow(), 8).setValue('ย้อนกลับแล้ว'); }
    log_(s.u, 'ย้อนการนำเข้าสุขภาพจิต', '', batch + ' · ลบ ' + n + ' แถว');
    delete MEMO_.mhrows;
    return { n, latest: mhLatest_() };
  });
}

/** ตั้งค่า: อีเมลผู้มีสิทธิ์ (ฝ่ายพัฒนานักศึกษา) และลิงก์ Google Sheet ที่เชื่อมโยง — owner/admin */
function adminMHSettings(token, o) {
  const s = auth_(token, true); o = o || {};
  if (o.emails !== undefined) {
    const L = String(o.emails).toLowerCase().split(/[\s,;]+/).filter(x => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x));
    setSetting_('MH_EMAILS', [...new Set(L)].join(', '));
  }
  if (o.sheetUrl !== undefined) {
    const u = String(o.sheetUrl).trim();
    if (u && !/^https:\/\/docs\.google\.com\/spreadsheets\/d\//.test(u)) throw new Error('ลิงก์ต้องเป็น Google Sheets (https://docs.google.com/spreadsheets/d/...)');
    setSetting_('MH_SHEET_URL', u);
  }
  log_(s.u, 'ตั้งค่าข้อมูลสุขภาพจิต', '', JSON.stringify(o));
  const set = getSettings_(); return { emails: set.MH_EMAILS || '', sheetUrl: set.MH_SHEET_URL || '' };
}

/** ดึงข้อมูลจาก Google Sheet ของฝ่ายพัฒนานักศึกษา (ต้องแชร์สิทธิ์ "ผู้มีสิทธิ์อ่าน" ให้บัญชีเจ้าของสคริปต์) — ส่งกลับให้หน้าเว็บจับคู่คอลัมน์ก่อนนำเข้า */
function adminMHFetchSheet(token, tab) {
  const s = authMH_(token);
  if (!mhLink_().inb) throw new Error('ปิดการรับข้อมูลจาก Google Sheet ของฝ่ายพัฒนานักศึกษาอยู่ — เปิดได้ที่ "การเชื่อมต่อกับฝ่ายพัฒนานักศึกษา"');
  const url = getSettings_().MH_SHEET_URL;
  if (!url) throw new Error('ยังไม่ได้ตั้งค่าลิงก์ Google Sheet ของฝ่ายพัฒนานักศึกษา');
  let ss; try { ss = SpreadsheetApp.openByUrl(url); } catch (e) { throw new Error('เปิด Google Sheet ไม่ได้ — ให้ฝ่ายพัฒนานักศึกษาแชร์สิทธิ์ "ผู้มีสิทธิ์อ่าน" ให้บัญชี ' + Session.getEffectiveUser().getEmail()); }
  const tabs = ss.getSheets().map(x => x.getName());
  const sh = (tab && ss.getSheetByName(tab)) || ss.getSheets()[0];
  const v = sh.getDataRange().getDisplayValues().filter(r => r.some(c => String(c).trim()));
  log_(s.u, 'ดึงข้อมูลสุขภาพจิตจาก Google Sheet', '', sh.getName() + ' · ' + Math.max(0, v.length - 1) + ' แถว');
  return { name: ss.getName(), tab: sh.getName(), tabs, aoa: v.slice(0, 5001) };
}


// ======================= การเชื่อมต่อข้อมูลกับฝ่ายพัฒนานักศึกษา =======================
/**
 * สวิตช์หลัก MH_LINK_ON คุม 3 ช่องทาง (แต่ละช่องทางมีสวิตช์ของตัวเอง):
 *  1) MH_LINK_ACCESS — เจ้าหน้าที่ฝ่ายพัฒนาฯ (อีเมลใน MH_EMAILS) เข้าระบบดูหน้า "สุขภาพจิตนักศึกษา" ได้
 *  2) MH_LINK_IN     — รับผลแบบประเมินจาก Google Sheet ของฝ่ายพัฒนาฯ (ปุ่ม "ดึงข้อมูลล่าสุด")
 *  3) MH_LINK_OUT    — ส่งรายชื่อที่ควรเชิญไปยัง "ชีตร่วม" (ระบบสร้างและแชร์ให้) แบบสองทาง: ระบบเขียนรายชื่อ · ฝ่ายพัฒนาฯ กรอกผลการติดตามกลับ
 * ปิดสวิตช์หลัก = หยุดทุกช่องทาง + ยกเลิกการแชร์ชีตร่วมทันที
 * ข้อมูลที่ส่งออกเป็นข้อมูลขั้นต่ำเท่าที่จำเป็น (ไม่มีเบอร์โทร/Line/ที่อยู่/รายวิชา/เกรดรายวิชา/บันทึกอาจารย์)
 */
const MHL_DEF = { MH_LINK_ON: '1', MH_LINK_ACCESS: '1', MH_LINK_IN: '1', MH_LINK_OUT: '0', MH_LINK_AUTO: '0' };   // ค่าเริ่มต้น = พฤติกรรมเดิม (เข้าระบบ + ดึงชีต) · ส่งออกต้องเปิดเอง
const MHL_GPAX = ['none', 'band', 'exact'];
const MHL_OUT_SYS = ['รหัสนักศึกษา', 'ชื่อ-สกุล', 'ชั้นปี', 'หลักสูตร', 'อาจารย์ที่ปรึกษา', 'ระดับคัดกรอง', 'ประเด็นที่ควรพูดคุย', 'ผลการเรียน', 'สถานะการดูแล (ระบบ)', 'อัปเดตจากระบบ'];
const MHL_OUT_DIV = ['ผลการติดตาม (ฝ่ายพัฒนาฯ)', 'วันที่ดำเนินการ', 'หมายเหตุฝ่ายพัฒนาฯ'];
const MHL_DIV_ST = ['เชิญแล้ว', 'ทำแบบประเมินแล้ว', 'ติดตามต่อ', 'ปิดเรื่อง'];
// สัญญาณจากผลการเรียน → หัวข้อกว้าง ๆ (ไม่ส่งตัวเลขเกรด/ชื่อวิชา)
const MHL_TOPIC = { gpax: 'ผลการเรียนสะสมต่ำ', gpaxw: 'ผลการเรียนสะสมต่ำ', drop: 'ผลการเรียนภาคล่าสุดลดลง', trend: 'ผลการเรียนภาคล่าสุดลดลง', lowgpa: 'ผลการเรียนภาคล่าสุดลดลง',
  prob: 'สถานภาพทางวิชาการ', proj: 'แนวโน้มผลการเรียน', f: 'มีรายวิชาที่ต้องแก้ไข', fre: 'มีรายวิชาที่ต้องแก้ไข', over: 'ระยะเวลาศึกษาเกินกำหนด', mh: 'ผลแบบประเมินครั้งก่อน' };

function mhLink_() {
  const s = getSettings_(), b = k => (s[k] === undefined || s[k] === '' ? MHL_DEF[k] : s[k]) === '1', on = b('MH_LINK_ON');
  return { on, access: on && b('MH_LINK_ACCESS'), inb: on && b('MH_LINK_IN'), out: on && b('MH_LINK_OUT'), auto: on && b('MH_LINK_OUT') && b('MH_LINK_AUTO'),
    raw: { access: b('MH_LINK_ACCESS'), inb: b('MH_LINK_IN'), out: b('MH_LINK_OUT'), auto: b('MH_LINK_AUTO') },
    gpax: MHL_GPAX.indexOf(s.MH_LINK_GPAX) >= 0 ? s.MH_LINK_GPAX : 'band', scope: s.MH_LINK_SCOPE === '1' ? 1 : 2 };
}
function mhLinkInfo_() {
  const s = getSettings_(), L = mhLink_();
  return Object.assign(L, { outUrl: s.MH_OUT_URL || '', outAt: s.MH_OUT_AT || '', outN: Number(s.MH_OUT_N || 0), pullAt: s.MH_PULL_AT || '', pullN: Number(s.MH_PULL_N || 0),
    emails: mhEmails_(), sheetUrl: s.MH_SHEET_URL || '', syncAt: s.MH_SYNC_AT || '', changedAt: s.MH_LINK_AT || '', changedBy: s.MH_LINK_BY || '',
    shared: s.MH_OUT_SHARED || '', outCfg: mhOutCfg_(), outFields: MHL_FIELDS, outConds: MHL_CONDS, me: (() => { try { return Session.getEffectiveUser().getEmail(); } catch (e) { return ''; } })() });
}

/** เปิด/ปิดสวิตช์ (owner/admin เท่านั้น) · o = {on, access, inb, out, auto, gpax, scope} */
function adminMHLinkSet(token, o) {
  const s = auth_(token, true); o = o || {};
  return withLock_(() => {
    const before = mhLink_(), ch = [];
    const put = (k, v, label) => { if (v === undefined) return; const val = v ? '1' : '0'; setSetting_(k, val); ch.push(label + (v ? ' เปิด' : ' ปิด')); };
    put('MH_LINK_ON', o.on, 'สวิตช์หลัก'); put('MH_LINK_ACCESS', o.access, 'เข้าระบบ'); put('MH_LINK_IN', o.inb, 'รับข้อมูล'); put('MH_LINK_OUT', o.out, 'ส่งรายชื่อ'); put('MH_LINK_AUTO', o.auto, 'ซิงก์อัตโนมัติ');
    if (o.gpax !== undefined) { if (MHL_GPAX.indexOf(o.gpax) < 0) throw new Error('ตัวเลือกผลการเรียนไม่ถูกต้อง'); setSetting_('MH_LINK_GPAX', o.gpax); ch.push('ผลการเรียน=' + o.gpax); }
    if (o.scope !== undefined) { setSetting_('MH_LINK_SCOPE', String(Number(o.scope) === 1 ? 1 : 2)); ch.push('ขอบเขต=' + o.scope); }
    setSetting_('MH_LINK_AT', Utilities.formatDate(new Date(), 'Asia/Bangkok', 'd/M/yyyy HH:mm')); setSetting_('MH_LINK_BY', s.u);
    const L = mhLink_();
    // ตั้ง/ลบ trigger ซิงก์อัตโนมัติรายวัน
    ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'mhLinkDaily').forEach(t => ScriptApp.deleteTrigger(t));
    if (L.auto) ScriptApp.newTrigger('mhLinkDaily').timeBased().everyDays(1).atHour(6).create();
    // ปิดส่งออก/ปิดสวิตช์หลัก → ยกเลิกการแชร์ชีตร่วมทันที · เปิดกลับ → แชร์ใหม่
    let note = '';
    if (before.out && !L.out) note = mhLinkShare_(false);
    else if (L.out && getSettings_().MH_OUT_URL) note = mhLinkShare_(true);
    log_(s.u, 'ตั้งค่าการเชื่อมต่อฝ่ายพัฒนานักศึกษา', '', ch.join(' · ') + (note ? ' · ' + note : ''));
    return mhLinkInfo_();
  });
}

/** เปิดชีตร่วม (สร้างใหม่ถ้ายังไม่มี) */
function mhOutBook_(create) {
  const set = getSettings_();
  if (set.MH_OUT_URL) { try { return SpreadsheetApp.openByUrl(set.MH_OUT_URL); } catch (e) { if (!create) throw new Error('เปิดชีตร่วมไม่ได้ (อาจถูกลบ) — กด "สร้างชีตร่วมใหม่"'); } }
  if (!create) return null;
  const ss = SpreadsheetApp.create('รายชื่อเชิญทำแบบประเมินสุขภาวะ (ชีตร่วม ฝ่ายพัฒนานักศึกษา × ฐานข้อมูลนักศึกษา)');
  try { const f = DriveApp.getFileById(ss.getId()), root = getRootFolder_(); if (root && f.moveTo) f.moveTo(root); } catch (e) {}
  setSetting_('MH_OUT_URL', ss.getUrl()); setSetting_('MH_OUT_SHARED', '');
  return ss;
}
/** แชร์/ยกเลิกแชร์ชีตร่วมกับอีเมลใน MH_EMAILS (ให้สิทธิ์แก้ไข เพื่อกรอกผลการติดตาม · คอลัมน์ของระบบถูกล็อก) */
function mhLinkShare_(on) {
  const url = getSettings_().MH_OUT_URL; if (!url) return '';
  let f; try { f = DriveApp.getFileById(SpreadsheetApp.openByUrl(url).getId()); } catch (e) { return 'เปิดชีตร่วมไม่ได้'; }
  const want = on ? mhEmails_() : [], had = String(getSettings_().MH_OUT_SHARED || '').split(',').filter(Boolean);
  const rm = had.filter(e => want.indexOf(e) < 0), add = want.filter(e => had.indexOf(e) < 0);
  rm.forEach(e => { try { f.removeEditor(e); } catch (x) {} try { f.removeViewer(e); } catch (x) {} });
  add.forEach(e => { try { f.addEditor(e); } catch (x) {} });
  try { if (f.setSharing) f.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE); } catch (e) {}   // ไม่เปิดลิงก์สาธารณะ
  setSetting_('MH_OUT_SHARED', want.join(','));
  return (add.length ? 'แชร์ให้ ' + add.length + ' บัญชี' : '') + (rm.length ? (add.length ? ' · ' : '') + 'ยกเลิกแชร์ ' + rm.length + ' บัญชี' : '');
}

/** ช่วงผลการเรียนแบบหยาบ (ไม่ส่งตัวเลขจริงเมื่อเลือก "ช่วง") */
function mhLinkGpax_(g, mode) {
  if (mode === 'none' || g === '' || g == null) return '';
  if (mode === 'exact') return Number(g).toFixed(2);
  const b = acadLevelOf_(g), L = acadLevels_(); return b > 0 ? 'ต่ำกว่า ' + L[b - 1].below.toFixed(2) : L[0].below.toFixed(2) + ' ขึ้นไป';
}


// ---- ชีตร่วม: หัวข้อข้อมูลที่ส่ง (เปิด/ปิดได้ทีละหัวข้อ) และเงื่อนไขการส่งรายชื่อ (+/- ได้) ----
/** g: กลุ่ม · s: ระดับความอ่อนไหว (0 ทั่วไป · 1 ผลการเรียน · 2 ข้อมูลติดต่อ/ส่วนตัว) · lock: ปิดไม่ได้ (ใช้จับคู่ผลกลับ) */
const MHL_FIELDS = [
  { k: 'id', l: 'รหัสนักศึกษา', g: 'ข้อมูลพื้นฐาน', s: 0, lock: 1, d: 1 }, { k: 'name', l: 'ชื่อ-สกุล', g: 'ข้อมูลพื้นฐาน', s: 0, d: 1 },
  { k: 'year', l: 'ชั้นปี', g: 'ข้อมูลพื้นฐาน', s: 0, d: 1 }, { k: 'program', l: 'หลักสูตร', g: 'ข้อมูลพื้นฐาน', s: 0, d: 1 }, { k: 'major', l: 'สาขาเน้น', g: 'ข้อมูลพื้นฐาน', s: 0 },
  { k: 'status', l: 'สถานะนักศึกษา', g: 'ข้อมูลพื้นฐาน', s: 0 }, { k: 'advisor', l: 'อาจารย์ที่ปรึกษา', g: 'ข้อมูลพื้นฐาน', s: 0, d: 1 },
  { k: 'level', l: 'ระดับคัดกรอง', g: 'การคัดกรอง', s: 0, d: 1 }, { k: 'topics', l: 'ประเด็นที่ควรพูดคุย (หัวข้อกว้าง ๆ)', g: 'การคัดกรอง', s: 0, d: 1 },
  { k: 'reasons', l: 'สัญญาณจากผลการเรียน (มีตัวเลข)', g: 'การคัดกรอง', s: 1 }, { k: 'care', l: 'สถานะการดูแล', g: 'การคัดกรอง', s: 0, d: 1 },
  { k: 'gband', l: 'ระดับ GPAX (ช่วง)', g: 'ผลการเรียน', s: 1, d: 1 }, { k: 'gpax', l: 'GPAX (ตัวเลขจริง)', g: 'ผลการเรียน', s: 1 }, { k: 'gpa', l: 'GPA ภาคล่าสุด', g: 'ผลการเรียน', s: 1 },
  { k: 'ghist', l: 'GPA/GPAX รายภาค (ย้อนหลัง 4 ภาค)', g: 'ผลการเรียน', s: 1 }, { k: 'prob', l: 'สถานภาพ (รอพินิจ/พ้นสภาพ)', g: 'ผลการเรียน', s: 1 },
  { k: 'fcount', l: 'จำนวนวิชา F/U ค้าง', g: 'ผลการเรียน', s: 1 }, { k: 'flist', l: 'รายวิชาที่ติด F/U', g: 'ผลการเรียน', s: 1 },
  { k: 'phone', l: 'เบอร์โทร', g: 'ข้อมูลติดต่อ', s: 2 }, { k: 'email', l: 'อีเมลนักศึกษา', g: 'ข้อมูลติดต่อ', s: 2 }, { k: 'line', l: 'LINE ID', g: 'ข้อมูลติดต่อ', s: 2 }, { k: 'fb', l: 'Facebook', g: 'ข้อมูลติดต่อ', s: 2 },
  { k: 'province', l: 'จังหวัด (ปฐมภูมิ)', g: 'ข้อมูลส่วนตัว', s: 2 }, { k: 'school', l: 'โรงเรียนเดิม', g: 'ข้อมูลส่วนตัว', s: 2 }, { k: 'hsgpax', l: 'GPAX มัธยมปลาย', g: 'ข้อมูลส่วนตัว', s: 2 },
  { k: 'round', l: 'รอบการรับเข้า', g: 'ข้อมูลส่วนตัว', s: 2 }, { k: 'role', l: 'บทบาทชั้นปี', g: 'ข้อมูลส่วนตัว', s: 2 }
];
/** เงื่อนไขการส่งรายชื่อ · v = ค่าตัวเลข · list = รายการที่เลือก */
const MHL_CONDS = {
  lv: { l: 'ระดับคัดกรองอย่างน้อย', opts: ['เฝ้าระวัง', 'ควรเชิญทำแบบประเมิน'] },
  band: { l: 'ระดับ GPAX ตั้งแต่', levels: 1 },
  gpaxBelow: { l: 'GPAX ต่ำกว่า', v: 1 },
  prob: { l: 'สถานภาพเป็น', opts: ['รอพินิจ', 'เข้าเกณฑ์พ้นสภาพ'], multi: 1 },
  fopen: { l: 'ติด F/U ค้างอย่างน้อย (วิชา)', v: 1, int: 1 },
  gpaDrop: { l: 'GPA ภาคล่าสุดลดลงอย่างน้อย', v: 1 },
  year: { l: 'ชั้นปี', opts: ['1', '2', '3', '4', '5', '6', '7', '8'], multi: 1 },
  care: { l: 'สถานะการดูแลเป็น', opts: ['ควรเชิญ', 'เชิญแล้ว', 'ทำแบบประเมินแล้ว', 'ติดตามต่อ'], multi: 1 }
};
function mhOutDefaults_() {
  const s = getSettings_(), gx = s.MH_LINK_GPAX || 'band', f = MHL_FIELDS.filter(x => x.d).map(x => x.k).filter(k => !(k === 'gband' && gx !== 'band'));
  if (gx === 'exact') f.push('gpax');
  return { fields: f, mode: 'any', keepOpen: true, conds: [{ id: 'c1', on: true, type: 'lv', v: 0, list: [s.MH_LINK_SCOPE === '1' ? 'เฝ้าระวัง' : 'ควรเชิญทำแบบประเมิน'] }] };
}
function mhOutClean_(o) {
  o = o || {}; const K = {}; MHL_FIELDS.forEach(f => K[f.k] = f);
  const fields = ['id'].concat([].concat(o.fields || []).filter(k => K[k] && k !== 'id'));
  const conds = [].concat(o.conds || []).slice(0, 12).map((c, i) => { const T = MHL_CONDS[c.type]; if (!T) throw new Error('ประเภทเงื่อนไขไม่ถูกต้อง');
    const v = Number(c.v); if (T.v && !(v >= 0 && v <= (T.int ? 30 : 4))) throw new Error('เงื่อนไขข้อ ' + (i + 1) + ': ค่าไม่ถูกต้อง');
    const list = [].concat(c.list || []).map(String).filter(x => !T.opts || T.opts.indexOf(x) >= 0).slice(0, 10);
    if (T.opts && !list.length) throw new Error('เงื่อนไขข้อ ' + (i + 1) + ': ยังไม่ได้เลือกตัวเลือก');
    return { id: /^[\w-]{1,20}$/.test(c.id || '') ? c.id : 'c' + (i + 1), on: c.on !== false, type: c.type, v: T.v || T.levels ? (T.int ? Math.round(v) : Math.round(v * 100) / 100) : 0, list }; });
  return { fields: [...new Set(fields)], mode: o.mode === 'all' ? 'all' : 'any', keepOpen: o.keepOpen !== false, conds };
}
function mhOutCfg_() { const raw = getSettings_().MH_OUT_CFG; if (raw) { try { return mhOutClean_(JSON.parse(raw)); } catch (e) {} } return mhOutDefaults_(); }
/** ข้อมูลทุกคน (กำลังศึกษา) พร้อมค่าทุกหัวข้อ */
function mhOutPool_() {
  const t = readTable_(SH.STUDENTS), H = idx_(t.headers), byId = {}; t.rows.forEach(r => byId[normId_(r[0])] = r);
  const sum = gradeSummary_(), F = fStats_(), pc = probCfg_(), fl = {}, care = mhCare_(), LV = acadLevels_();
  Object.keys(F.byCourse).forEach(c => F.byCourse[c].open.forEach(id => (fl[id] = fl[id] || []).push(c)));
  const cell = (r, h) => H[h] !== undefined ? String(r[H[h]] == null ? '' : r[H[h]]) : '';
  return wbList_().map(x => { const r = byId[x.id], g = sum[x.id], reg = g ? g.h.filter(h => h[0] % 10 !== 3) : [], gp = reg.filter(h => h[1] !== '').map(h => Number(h[1]));
    const pr = g ? probationOf_(g.h.map(h => ({ key: h[0], gpa: h[1], gpax: h[2] })), pc, { studied: studiedOf_(x.id) }) : null, b = acadLevelOf_(x.gpax);
    return { x, st: (care[x.id] || {}).st || '', drop: gp.length > 1 ? Math.round((gp[gp.length - 2] - gp[gp.length - 1]) * 100) / 100 : 0, prob: pr ? pr.status : '', band: b,
      v: { id: x.id, name: x.name, year: x.year, program: x.program || '', major: cell(r, 'สาขาเน้น'), status: cell(r, 'สถานะ'), advisor: x.advisor || '', level: WB_LV[x.lv],
        topics: [...new Set(x.reasons.map(q => MHL_TOPIC[q.k]).filter(Boolean))].join(', '), reasons: x.reasons.filter(q => q.k !== 'mh').map(q => q.t).join(' · '),
        care: (care[x.id] || {}).st || (x.lv === 2 ? 'ควรเชิญ' : x.lv === 1 ? 'เฝ้าระวัง' : ''), gband: b > 0 ? LV[b - 1].label + ' (< ' + LV[b - 1].below.toFixed(2) + ')' : b === 0 ? 'ปกติ' : '',
        gpax: x.gpax === '' ? '' : Number(x.gpax).toFixed(2), gpa: gp.length ? gp[gp.length - 1].toFixed(2) : '',
        ghist: reg.slice(-4).map(h => termLabel_(h[0]) + ' ' + (h[1] === '' ? '–' : Number(h[1]).toFixed(2)) + '/' + (h[2] === '' ? '–' : Number(h[2]).toFixed(2))).join(', '),
        prob: pr ? pr.status : '', fcount: x.reasons.length >= 0 && F.byId[x.id] ? F.byId[x.id].open : 0, flist: (fl[x.id] || []).join(', '),
        phone: cell(r, 'เบอร์โทร'), email: cell(r, 'อีเมล'), line: cell(r, 'LineID'), fb: cell(r, 'Facebook'), province: cell(r, 'จังหวัด'), school: cell(r, 'โรงเรียนเดิม'),
        hsgpax: cell(r, 'GPAX มัธยมปลาย'), round: cell(r, 'รอบการรับเข้า'), role: cell(r, 'บทบาทชั้นปี') } }; });
}
function mhOutMatch_(p, c) {
  const one = q => { switch (q.type) {
    case 'lv': return p.x.lv >= (q.list.indexOf('เฝ้าระวัง') >= 0 ? 1 : 2);
    case 'band': return p.band >= q.v && p.band > 0;
    case 'gpaxBelow': return p.x.gpax !== '' && Number(p.x.gpax) < q.v;
    case 'prob': return q.list.indexOf(p.prob) >= 0;
    case 'fopen': return Number(p.v.fcount) >= q.v;
    case 'gpaDrop': return p.drop >= q.v;
    case 'year': return q.list.indexOf(String(p.x.year)) >= 0;
    case 'care': return q.list.indexOf(p.st) >= 0;
  } return false; };
  const C = c.conds.filter(q => q.on);
  const hit = !C.length ? false : c.mode === 'all' ? C.every(one) : C.some(one);
  return hit || (c.keepOpen && ['ควรเชิญ', 'เชิญแล้ว', 'ติดตามต่อ'].indexOf(p.st) >= 0);
}
function adminMHOutCfgGet(token) {
  auth_(token, true); const c = mhOutCfg_(), LV = acadLevels_();
  return { cfg: c, fields: MHL_FIELDS, conds: MHL_CONDS, levels: LV.map((l, i) => ({ i: i + 1, l: l.label + ' (< ' + l.below.toFixed(2) + ')' })), at: getSettings_().MH_OUT_CFG_AT || '' };
}
/** ตัวอย่างก่อนบันทึก: จำนวนที่จะส่ง + 3 แถวแรก (ปิดบังชื่อ/ติดต่อบางส่วน) */
function adminMHOutPreview(token, o) {
  auth_(token, true); const c = mhOutClean_(o), K = {}; MHL_FIELDS.forEach(f => K[f.k] = f);
  const L = mhOutPool_().filter(p => p.st !== 'ปิดเรื่อง' && mhOutMatch_(p, c));
  const mask = (k, v) => { v = String(v || ''); if (!v) return ''; if (k === 'name') { const m = v.match(/^(นางสาว|นาง|นาย)?\s*(\S{1,2})\S*\s*(\S?)/) || []; return (m[1] || '') + (m[2] || '') + '••• ' + (m[3] || '') + '•••'; } if (K[k].s === 2) return v.slice(0, 2) + '•••'; return v; };
  return { n: L.length, headers: c.fields.map(k => K[k].l), sample: L.slice(0, 3).map(p => c.fields.map(k => mask(k, p.v[k]))), sens: c.fields.filter(k => K[k].s === 2).length };
}
function adminMHOutCfgSave(token, o) {
  const s = auth_(token, true), c = mhOutClean_(o), K = {}; MHL_FIELDS.forEach(f => K[f.k] = f);
  return withLock_(() => { setSetting_('MH_OUT_CFG', JSON.stringify(c)); setSetting_('MH_OUT_CFG_AT', Utilities.formatDate(new Date(), 'Asia/Bangkok', 'd/M/yyyy HH:mm') + ' · ' + (s.name || s.u));
    const sens = c.fields.filter(k => K[k].s === 2).map(k => K[k].l);
    log_(s.u, 'ตั้งค่าข้อมูลที่ส่งให้ฝ่ายพัฒนานักศึกษา', '', 'หัวข้อ: ' + c.fields.map(k => K[k].l).join(', ') + ' · เงื่อนไข(' + (c.mode === 'all' ? 'ทุกข้อ' : 'ข้อใดข้อหนึ่ง') + '): ' + c.conds.filter(q => q.on).map(q => MHL_CONDS[q.type].l + ' ' + (q.list.length ? q.list.join('/') : q.v)).join(', ') + (sens.length ? ' · ข้อมูลติดต่อ/ส่วนตัว: ' + sens.join(', ') : ''));
    if (sens.length) access_(s.u, s.name, 'เปิดส่งข้อมูลติดต่อ/ส่วนตัวให้ฝ่ายพัฒนาฯ', sens.join(', '), '');
    return adminMHOutCfgGet(token); });
}
/**
 * ซิงก์สองทาง: (1) อ่าน "ผลการติดตาม" ที่ฝ่ายพัฒนาฯ กรอกในชีตร่วม → อัปเดตสถานะการดูแลในระบบ
 *              (2) เขียนรายชื่อปัจจุบันลงชีตร่วม (เก็บคอลัมน์ที่ฝ่ายพัฒนาฯ กรอกไว้)
 */
function mhLinkSync_(user) {
  const L = mhLink_(); if (!L.out) throw new Error('ปิดการส่งรายชื่อไปยังฝ่ายพัฒนานักศึกษาอยู่');
  const ss = mhOutBook_(true), now = new Date(), stamp = Utilities.formatDate(now, 'Asia/Bangkok', 'd/M/yyyy HH:mm');
  let sh = ss.getSheetByName('รายชื่อเชิญ'); if (!sh) { sh = ss.getSheets()[0]; try { sh.setName('รายชื่อเชิญ'); } catch (e) {} }
  const CF = mhOutCfg_(), FK = {}; MHL_FIELDS.forEach(f => FK[f.k] = f);
  const SYS = CF.fields.map(k => FK[k].l).concat(['อัปเดตจากระบบ']), HD = SYS.concat(MHL_OUT_DIV), nS = SYS.length;
  // (1) อ่านผลที่ฝ่ายพัฒนาฯ กรอก
  const prev = {}, v = sh.getLastRow() > 1 ? sh.getDataRange().getValues() : [];
  if (v.length) { const h = v[0].map(String), ci = k => h.indexOf(k);
    v.slice(1).forEach(r => { const id = normId_(r[ci('รหัสนักศึกษา')]); if (/^\d{9}-\d$/.test(id)) prev[id] = { st: String(r[ci(MHL_OUT_DIV[0])] || '').trim(), d: r[ci(MHL_OUT_DIV[1])], note: String(r[ci(MHL_OUT_DIV[2])] || '').trim() }; }); }
  const care = mhCare_(), upd = [];
  Object.keys(prev).forEach(id => { const p = prev[id]; if (MHL_DIV_ST.indexOf(p.st) < 0) return; const c = care[id];
    if (!c || c.st !== p.st || (p.note && c.note !== p.note)) upd.push([id, p.st, safe_(('ฝ่ายพัฒนาฯ' + (p.d ? ' ' + (p.d instanceof Date ? mhFmt_(p.d) : String(p.d)) : '') + (p.note ? ': ' + p.note : '')).slice(0, 300)), 'ฝ่ายพัฒนานักศึกษา (ชีตร่วม)', now]); });
  if (upd.length) { const C = ensureSheetLazy_(SH.MHCARE, MHCARE_HEADERS); if (!C.isSheetHidden()) C.hideSheet();
    const cv = C.getDataRange().getValues(), pos = {}; for (let i = 1; i < cv.length; i++) pos[normId_(cv[i][0])] = i + 1;
    const app = []; upd.forEach(r => { if (pos[r[0]]) C.getRange(pos[r[0]], 1, 1, 5).setValues([r]); else app.push(r); });
    if (app.length) C.getRange(C.getLastRow() + 1, 1, app.length, 5).setValues(app); delete MEMO_.mhcare; }
  // (2) เขียนรายชื่อ: เข้าเกณฑ์ตามขอบเขต หรือยังอยู่ระหว่างการดูแล (ยกเว้น "ปิดเรื่อง")
  delete MEMO_.mhcare;
  const list = mhOutPool_().filter(p => p.st !== 'ปิดเรื่อง' && (mhOutMatch_(p, CF) || !!prev[p.x.id]));
  const rows = list.map(p => { const q = prev[p.x.id] || {};
    return CF.fields.map(k => p.v[k]).concat([stamp, q.st || '', q.d || '', q.note || '']).map(c => c == null ? '' : c); });
  sh.clear();
  sh.getRange(1, 1, 1, HD.length).setValues([HD]).setFontWeight('bold');
  try { sh.getRange(1, 1, 1, nS).setBackground('#e7ebd5'); sh.getRange(1, nS + 1, 1, MHL_OUT_DIV.length).setBackground('#fde7c8'); sh.setFrozenRows(1); } catch (e) {}
  if (rows.length) { sh.getRange(2, 1, rows.length, HD.length).setValues(rows); sh.getRange(2, 1, rows.length, 1).setNumberFormat('@'); }
  try {   // dropdown ผลการติดตาม + ล็อกคอลัมน์ของระบบ
    const n = Math.max(rows.length, 1) + 200;
    sh.getRange(2, nS + 1, n, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(MHL_DIV_ST, true).setAllowInvalid(false).build());
    sh.getProtections(SpreadsheetApp.ProtectionType.RANGE).forEach(p => p.remove());
    const pr = sh.getRange(1, 1, n, nS).protect().setDescription('คอลัมน์ของระบบ — ฝ่ายพัฒนาฯ กรอกได้เฉพาะคอลัมน์สีส้ม');
    pr.removeEditors(pr.getEditors()); try { pr.addEditor(Session.getEffectiveUser()); } catch (e) {}
    let note = ss.getSheetByName('คำอธิบาย'); if (!note) note = ss.insertSheet('คำอธิบาย');
    const sensF = CF.fields.filter(k => FK[k].s === 2).map(k => FK[k].l);
    note.clear(); note.getRange(1, 1, 7, 1).setValues([['หัวข้อที่ส่ง: ' + CF.fields.map(k => FK[k].l).join(', ') + (sensF.length ? ' · มีข้อมูลติดต่อ/ส่วนตัว: ' + sensF.join(', ') + ' — ใช้เพื่อการดูแลนักศึกษาเท่านั้น' : '')], ['ชีตนี้ระบบฐานข้อมูลนักศึกษาสร้างและอัปเดตให้อัตโนมัติ (ห้ามแชร์ต่อ)'], ['คอลัมน์สีเขียว = ข้อมูลจากระบบ (แก้ไขไม่ได้)'], ['คอลัมน์สีส้ม = ฝ่ายพัฒนานักศึกษากรอกผลการติดตาม: ' + MHL_DIV_ST.join(' / ')],
      ['ระบบจะอ่านผลที่กรอกกลับไปเป็น "สถานะการดูแล" ทุกครั้งที่ซิงก์'], ['"ประเด็นที่ควรพูดคุย" เป็นหัวข้อกว้าง ๆ จากสถานการณ์ผลการเรียน ไม่ใช่การวินิจฉัย'], ['อัปเดตล่าสุด ' + stamp]]);
  } catch (e) {}
  setSetting_('MH_OUT_AT', stamp); setSetting_('MH_OUT_N', String(rows.length));
  setSetting_('MH_PULL_AT', stamp); setSetting_('MH_PULL_N', String(upd.length));
  mhLinkShare_(true);
  log_(user, 'ซิงก์ชีตร่วมฝ่ายพัฒนานักศึกษา', '', 'ส่ง ' + rows.length + ' คน · ' + CF.fields.length + ' หัวข้อ · รับผลการติดตาม ' + upd.length + ' คน');
  return { sent: rows.length, pulled: upd.length, url: getSettings_().MH_OUT_URL, at: stamp };
}
function adminMHLinkSync(token) {
  const s = authMH_(token);
  return withLock_(() => Object.assign(mhLinkSync_(s.u), { info: mhLinkInfo_(), care: mhCare_() }));
}
/** สร้างชีตร่วมใหม่ (กรณีถูกลบ/ต้องการเริ่มใหม่) — ยกเลิกแชร์ชีตเดิมก่อน */
function adminMHLinkNewSheet(token) {
  const s = auth_(token, true);
  return withLock_(() => { mhLinkShare_(false); setSetting_('MH_OUT_URL', ''); log_(s.u, 'สร้างชีตร่วมใหม่ (ฝ่ายพัฒนานักศึกษา)', '', ''); return Object.assign(mhLinkSync_(s.u), { info: mhLinkInfo_() }); });
}
/** trigger รายวัน 06:00 */
function mhLinkDaily() {
  if (!mhLink_().auto) return;
  const lock = LockService.getScriptLock(); lock.waitLock(30000); dirty_(); IN_LOCK_ = true;
  try { mhLinkSync_('ระบบ (อัตโนมัติ)'); } catch (e) { log_('ระบบ (อัตโนมัติ)', 'ซิงก์ชีตร่วมไม่สำเร็จ', '', String(e.message || e)); }
  finally { IN_LOCK_ = false; lock.releaseLock(); dirty_(); clearDashCache_(); }
}


// ======================= พอร์ทัลอาจารย์ที่ปรึกษา =======================
/**
 * อาจารย์ที่มีอีเมลในชีต "อาจารย์ที่ปรึกษา" เข้าสู่ระบบด้วย OTP ได้เลย (ไม่ต้องเพิ่มในผู้ใช้ระบบ) · ปิดได้ด้วย ADV_PORTAL=off
 * session role = 'advisor' · เห็นเฉพาะนักศึกษาที่ตนเป็นอาจารย์ที่ปรึกษา · ไม่เห็นข้อมูลแบบประเมินสุขภาพจิต
 * หากอีเมลนั้นมีบัญชีในผู้ใช้ระบบอยู่แล้ว จะเข้าตามสิทธิ์ของบัญชีนั้นแทน
 */
function advPortalOn_() { return getSettings_().ADV_PORTAL !== 'off'; }
function advNamesOf_(email) {
  if (!advPortalOn_()) return [];
  email = normEmail_(email); const m = advisorMap_();
  return Object.keys(m).filter(n => m[n] && m[n].split(/[\s,;]+/).map(normEmail_).indexOf(email) >= 0);
}
function startAdvSession_(email, names, ua) {
  const token = Utilities.getUuid() + Utilities.getUuid().slice(0, 8);
  const sess = { u: email, name: names[0], role: 'advisor', adv: names, t0: Date.now() };
  CacheService.getScriptCache().put('sess_' + token, JSON.stringify(sess), SESSION_HOURS * 3600);
  access_(email, sess.name, 'เข้าสู่ระบบสำเร็จ', 'อาจารย์ที่ปรึกษา', ua);
  log_(email, 'เข้าสู่ระบบ (อาจารย์ที่ปรึกษา)', '', names.join(', '));
  return { token, name: sess.name, role: 'advisor', u: email };
}
/** ชุดรหัสนักศึกษาในความดูแล */
function advIdSet_(names) {
  const want = {}; [].concat(names || []).forEach(n => want[normAdv_(n)] = 1);
  const t = readTable_(SH.STUDENTS), H = idx_(t.headers), out = {};
  t.rows.forEach(r => { const id = normId_(r[0]); if (id && want[normAdv_(r[H['อาจารย์ที่ปรึกษา']])]) out[id] = 1; });
  return out;
}
function advGuard_(sess, sid) { if (sess.role === 'advisor' && !advIdSet_(sess.adv)[normId_(sid)]) throw new Error('นักศึกษาคนนี้ไม่อยู่ในความดูแลของคุณ'); }
/** ผู้เรียก: อาจารย์ (ใช้ชื่อใน session) หรือผู้ดูแลระบบที่ "ดูในมุมอาจารย์" (ส่งชื่ออาจารย์มา) */
function advCtx_(token, asName) {
  const s = auth_(token, false, true);
  if (s.role === 'advisor') return { s, names: s.adv };
  if (ADMIN_ROLES.indexOf(s.role) >= 0 && asName) return { s, names: [normAdv_(asName)], preview: true };
  throw new Error('เฉพาะอาจารย์ที่ปรึกษา');
}

function advBootstrap(token, asName) {
  const { s, names, preview } = advCtx_(token, asName);
  const want = {}; names.forEach(n => want[normAdv_(n)] = 1);
  const t = readTable_(SH.STUDENTS), H = idx_(t.headers), sum = gradeSummary_(), F = fStats_(), pc = probCfg_();
  const fl = {}; Object.keys(F.byCourse).forEach(code => F.byCourse[code].open.forEach(id => (fl[id] = fl[id] || []).push(code + (F.byCourse[code].name ? ' ' + F.byCourse[code].name : ''))));
  const rows = t.rows.filter(r => normId_(r[0]) && want[normAdv_(r[H['อาจารย์ที่ปรึกษา']])]);
  // สิทธิ์ฝึกงาน/จบ ตามชั้นปีของนักศึกษาในความดูแล
  const elig = {}, CFG = eligCfg_(), years = {};
  rows.forEach(r => { if (String(r[H['สถานะ']]).trim() === 'กำลังศึกษา') years[Number(r[H['ชั้นปี']])] = 1; });
  const LBL = { intern4: 'ฝึกงานปี 4', intern6: 'ฝึกงานปี 6', grad: 'ตรวจสอบจบ' };
  ['intern4', 'intern6', 'grad'].forEach(m => {
    if (!CFG[m] || !years[CFG[m].year]) return;
    try { eligCompute_(m, CFG[m].year).rows.forEach(x => { if (!want[x.advisor]) return; (elig[x.id] = elig[x.id] || []).push({ m, l: LBL[m], st: x.status === 'nodata' ? 'nodata' : eligFinalSt_(x), why: (x.reasons || []).slice(0, 6) }); }); } catch (e) {}
  });
  const students = rows.map(r => {
    const id = normId_(r[0]), g = sum[id], f = F.byId[id];
    const w = wbOf_(id, g, f, null, null, r, H);
    const pr = g ? probationOf_(g.h.map(x => ({ key: x[0], gpa: x[1], gpax: x[2] === '' ? '' : Number(x[2]) })), pc, { studied: studiedOf_(id) }) : null;
    return { id, pre: String(r[H['คำนำหน้า']] || ''), name: String(r[H['คำนำหน้า']] || '') + r[H['ชื่อ']] + ' ' + r[H['นามสกุล']], year: r[H['ชั้นปี']], program: progLabel_(r, H), status: String(r[H['สถานะ']] || ''),
      email: String(r[H['อีเมล']] || ''), phone: maskIf_('เบอร์โทร', r[H['เบอร์โทร']]), line: maskIf_('LineID', r[H['LineID']]),
      gpax: g ? g.gpax : '', term: g ? g.term : '', prev: g ? g.prev : '', slope: g && g.slope != null ? Math.round(g.slope * 1000) / 1000 : '',
      h: g ? g.h.map(x => [x[0], x[1], x[2]]) : [], band: g ? wbBand_(g.gpax) : -1, prob: pr ? pr.status : '', probWhy: pr ? pr.why : [],
      fopen: f ? f.open : 0, ftimes: f ? f.times : 0, flist: (fl[id] || []).slice(0, 12),
      lv: w.lv, reasons: w.reasons.filter(x => x.k !== 'mh').map(x => x.t), proj: w.proj, elig: elig[id] || [] };
  }).sort((a, b) => (a.status === 'กำลังศึกษา' ? 0 : 1) - (b.status === 'กำลังศึกษา' ? 0 : 1) || b.lv - a.lv || a.id.localeCompare(b.id));
  const sess2 = preview ? { u: s.u, role: 'advisor', adv: names } : s;
  log_(s.u, preview ? 'ดูพอร์ทัลอาจารย์ (มุมมองผู้ดูแล)' : 'เปิดพอร์ทัลอาจารย์ที่ปรึกษา', '', names.join(', ') + ' · ' + students.length + ' คน');
  const set = getSettings_();
  return { me: { u: s.u, name: preview ? names[0] : s.name, role: 'advisor', adv: names }, preview: !!preview, students, notes: notesOverview_(sess2), noteCats: NOTE_CATS,
    bands: wbBands_(), levels: acadLevels_(), th: Number(set.GPAX_THRESHOLD || 2), faculty: set.FACULTY_NAME || DEFAULT_SETTINGS.FACULTY_NAME, curTerm: curTerm_(), mask: set.MASK_CONTACT !== 'off' };
}
/** ดูข้อมูลติดต่อจริงของนักศึกษาในความดูแล (บันทึกทุกครั้ง) */
function advRevealContact(token, sid) {
  const s = auth_(token, false, true); sid = normId_(sid); advGuard_(s, sid);
  if (s.role !== 'advisor') return adminRevealContact(token, [sid], 'ดู')[sid] || {};
  const t = readTable_(SH.STUDENTS), H = idx_(t.headers), r = t.rows.find(x => normId_(x[0]) === sid), out = {};
  CONTACT_FIELDS.forEach(h => out[h] = r && H[h] !== undefined ? String(r[H[h]] || '') : '');
  access_(s.u, s.name, 'ดูข้อมูลติดต่อ (อาจารย์ที่ปรึกษา)', sid, ''); log_(s.u, 'ดูข้อมูลติดต่อ', sid, 'อาจารย์ที่ปรึกษา');
  return out;
}
function adminAdvPortalSet(token, on) {
  const s = auth_(token, true); setSetting_('ADV_PORTAL', on ? 'on' : 'off'); log_(s.u, 'ตั้งค่าพอร์ทัลอาจารย์ที่ปรึกษา', '', on ? 'เปิด' : 'ปิด'); return on;
}

/**
 * ส่งรายชื่อให้อาจารย์ที่ปรึกษา (จัดกลุ่มตามอาจารย์ ส่งอีเมลคนละฉบับ) · items: [{id, why}] · topic: หัวข้อ
 * dry=true → คืนสรุปว่าจะส่งถึงใครบ้าง (ไม่ส่งจริง)
 */
function adminNotifyAdvisors(token, items, topic, msg, dry) {
  const s = authW_(token);
  items = [].concat(items || []).slice(0, 2000);
  topic = String(topic || 'นักศึกษาที่ควรติดตาม').slice(0, 120); msg = safe_(String(msg || '').slice(0, 1000));
  const t = readTable_(SH.STUDENTS), H = idx_(t.headers), by = {}, map = advisorMap_(), sum = gradeSummary_();
  const W = {}; items.forEach(x => W[normId_(x.id)] = String(x.why || '').slice(0, 300));
  t.rows.forEach(r => { const id = normId_(r[0]); if (W[id] === undefined) return; const a = normAdv_(r[H['อาจารย์ที่ปรึกษา']]) || '(ไม่ระบุอาจารย์)';
    (by[a] = by[a] || []).push([id, String(r[H['คำนำหน้า']] || '') + r[H['ชื่อ']] + ' ' + r[H['นามสกุล']], r[H['ชั้นปี']], sum[id] ? Number(sum[id].gpax).toFixed(2) : '–', W[id]]); });
  const groups = Object.keys(by).sort((a, b) => a.localeCompare(b, 'th')).map(a => ({ advisor: a, email: map[a] || '', n: by[a].length }));
  if (dry) return { groups, total: items.length };
  const faculty = getSettings_().FACULTY_NAME || DEFAULT_SETTINGS.FACULTY_NAME, url = pubLink_(true);
  let sent = 0; const skip = [];
  groups.forEach(g => {
    if (!g.email) { skip.push(g.advisor); return; }
    const rows = by[g.advisor].map(x => `<tr><td style="padding:6px 8px;border-bottom:1px solid #e7ebd5">${x[0]}</td><td style="padding:6px 8px;border-bottom:1px solid #e7ebd5">${x[1]}</td><td style="padding:6px 8px;border-bottom:1px solid #e7ebd5;text-align:center">${x[2]}</td><td style="padding:6px 8px;border-bottom:1px solid #e7ebd5;text-align:center">${x[3]}</td><td style="padding:6px 8px;border-bottom:1px solid #e7ebd5">${x[4] || ''}</td></tr>`).join('');
    try {
      MailApp.sendEmail({ to: g.email, name: 'ระบบฐานข้อมูลนักศึกษา ' + faculty, subject: topic + ' · นักศึกษาในความดูแล ' + g.n + ' คน',
        htmlBody: `<div style="font-family:Sarabun,Tahoma,sans-serif;color:#2a2a1a;line-height:1.6;max-width:720px">
        <p>เรียน ${g.advisor}</p><p>${s.name} ส่งรายชื่อนักศึกษาในความดูแลของท่านเรื่อง <b>${topic}</b> จำนวน ${g.n} คน${msg ? '<br>' + msg : ''}</p>
        <table style="border-collapse:collapse;width:100%;font-size:14px"><thead><tr style="background:#6b7b28;color:#fff"><th style="padding:6px 8px;text-align:left">รหัส</th><th style="padding:6px 8px;text-align:left">ชื่อ-สกุล</th><th style="padding:6px 8px">ปี</th><th style="padding:6px 8px">GPAX</th><th style="padding:6px 8px;text-align:left">ประเด็น</th></tr></thead><tbody>${rows}</tbody></table>
        <p style="margin-top:14px">ดูรายละเอียดและบันทึกการพบนักศึกษาได้ที่ <a href="${url}">พอร์ทัลอาจารย์ที่ปรึกษา</a> (เข้าสู่ระบบด้วยอีเมลนี้ ระบบจะส่งรหัส OTP ให้)</p>
        <p style="font-size:12px;color:#8a8a70">ข้อมูลนี้เป็นข้อมูลส่วนบุคคลของนักศึกษา โปรดใช้เพื่อการดูแลนักศึกษาเท่านั้น</p></div>` });
      sent++;
    } catch (e) { skip.push(g.advisor + ' (ส่งไม่สำเร็จ)'); }
  });
  log_(s.u, 'ส่งรายชื่อให้อาจารย์ที่ปรึกษา', '', topic + ' · ' + items.length + ' คน · ส่ง ' + sent + ' ฉบับ' + (skip.length ? ' · ไม่มีอีเมล ' + skip.length : ''));
  return { sent, skip, groups };
}

// ======================= ศูนย์แจ้งเตือน / งานของฉันวันนี้ =======================
/** ภาคการศึกษาโดยประมาณจากวันที่ (ภาค 1: มิ.ย.–ต.ค. · ภาค 2: พ.ย.–มี.ค. · ภาค 3: เม.ย.–พ.ค.) */
function termNowEst_() {
  const d = new Date(), m = d.getMonth() + 1, y = d.getFullYear() + 543;
  return m >= 6 && m <= 10 ? y * 10 + 1 : m >= 11 ? y * 10 + 2 : m <= 3 ? (y - 1) * 10 + 2 : (y - 1) * 10 + 3;
}
function prevRegTerm_(k) { const y = Math.floor(k / 10), t = k % 10; return t === 1 ? (y - 1) * 10 + 2 : t === 2 ? y * 10 + 1 : y * 10 + 2; }
/** เวอร์ชันแจ้งเตือน (เปลี่ยนเมื่อมีคำร้อง REQ ใหม่ โดยไม่ล้างแคชข้อมูลอื่น) */
function ntBump_() { try { CacheService.getScriptCache().put('ntver', String(Date.now()), 21600); } catch (e) {} }
function adminNotices(token, force) {
  const s0 = auth_(token), key = 'nt_' + Utilities.base64EncodeWebSafe(s0.u + '|' + s0.role + '|' + (s0.tabs || []).join(',')).slice(0, 60) + '@' + dataVer_() + '.' + (CacheService.getScriptCache().get('ntver') || '0');
  if (!force) { const hit = CacheService.getScriptCache().get(key); if (hit) { try { return JSON.parse(hit); } catch (e) {} } }
  const out = noticesRaw_(token, s0); try { CacheService.getScriptCache().put(key, JSON.stringify(out), 600); } catch (e) {}
  return out;
}
function noticesRaw_(token, s) {
  const adm = ADMIN_ROLES.indexOf(s.role) >= 0, set = getSettings_(), L = [];
  const add = (k, lv, ic, title, sub, go, n) => L.push({ k, lv, ic, title, sub: sub || '', go: go || '', n: n == null ? '' : n });
  const today = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd'), soon = Utilities.formatDate(new Date(Date.now() + 3 * 86400000), 'Asia/Bangkok', 'yyyy-MM-dd');
  // 1) นัดติดตามจากบันทึก
  try { const F = notesOverview_(s).follow, over = F.filter(n => n.due <= today), near = F.filter(n => n.due > today && n.due <= soon), mine = F.filter(n => n.mine && n.due <= soon);
    if (over.length) add('fover', 'high', 'alarm', 'นัดติดตามถึง/เลยกำหนด ' + over.length + ' รายการ', mine.length ? 'ของคุณเอง ' + mine.length + ' รายการ' : 'จากบันทึกนักศึกษา', 'follow', over.length);
    else if (near.length) add('fnear', 'mid', 'alarm', 'นัดติดตามภายใน 3 วัน ' + near.length + ' รายการ', '', 'follow', near.length); } catch (e) {}
  const t = readTable_(SH.STUDENTS), H = idx_(t.headers), active = t.rows.filter(r => normId_(r[0]) && String(r[H['สถานะ']]).trim() === 'กำลังศึกษา');
  // 2) รออนุมัติ
  if (H['สถานะการอนุมัติ'] !== undefined) { const n = t.rows.filter(r => normId_(r[0]) && String(r[H['สถานะการอนุมัติ']]) === 'รออนุมัติ').length;
    if (n) add('appr', adm ? 'mid' : 'info', 'clipboard', 'ข้อมูลนักศึกษารออนุมัติ ' + n + ' คน', adm ? 'ตรวจและอนุมัติที่หน้านักศึกษา' : 'รอผู้ดูแลระบบอนุมัติ', 'appr', n); }
  // 2.1) คำร้อง REQ: แจ้งรายคน (ชื่อ ชั้นปี โครงการ ภาค/ปีการศึกษา) · กดที่แจ้งเตือน = ซิงค์สถานะทันที
  try { if (SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.REQ) && (adm || !s.tabs || !s.tabs.length || s.tabs.indexOf('pReq') >= 0)) {
    const q = readTable_(SH.REQ), Q = idx_(q.headers), byId = {}; t.rows.forEach(r => { const k = normId_(r[0]); if (k) byId[k] = r; });
    const P = q.rows.filter(r => String(r[Q['ผลในระบบ']]) === 'รอยืนยัน').sort((a, b) => new Date(b[Q['วันที่อนุมัติเสร็จ']] || 0) - new Date(a[Q['วันที่อนุมัติเสร็จ']] || 0));
    P.slice(0, 12).forEach(r => { const sid = normId_(r[Q['รหัสนักศึกษา']]), st = byId[sid] || [], term = termStr_(r[Q['ภาคที่มีผล']]), m = term.match(/(\d)\/(\d{4})/);
      const nm = String(r[Q['ชื่อ-สกุล']] || sid), yr = st[H['ชั้นปี']] ? 'ชั้นปี ' + st[H['ชั้นปี']] : '', prog = String(st[H['หลักสูตร']] || '');
      add('req:' + r[Q['REQ ID']], 'mid', 'clipboard', nm + ' ' + r[Q['ประเภท']] + (m ? ' ภาคการศึกษาที่ ' + m[1] + ' ปีการศึกษา ' + m[2] : ''),
        [sid, yr, prog].filter(Boolean).join(' · ') + ' · อนุมัติเสร็จในระบบ REQ ' + dtTH_(r[Q['วันที่อนุมัติเสร็จ']]) + ' — กดเพื่อซิงค์สถานะ', 'reqapply:' + r[Q['REQ ID']]); });
    if (P.length > 12) add('req', 'mid', 'clipboard', 'คำร้อง REQ รอซิงค์อีก ' + (P.length - 12) + ' รายการ', 'ดูทั้งหมดที่เมนู คำร้อง REQ', 'pReq', P.length - 12);
    // ปรับสถานะอัตโนมัติแล้วภายใน 3 วัน (โหมดอัตโนมัติ)
    const lim = Date.now() - 3 * 86400000, D = q.rows.filter(r => String(r[Q['ผลในระบบ']]) === 'ปรับสถานะแล้ว' && String(r[Q['ผู้ยืนยัน']]) === 'อัตโนมัติ' && r[Q['ซิงค์เมื่อ']] && new Date(r[Q['ซิงค์เมื่อ']]).getTime() > lim);
    D.slice(0, 8).forEach(r => { const sid = normId_(r[Q['รหัสนักศึกษา']]), st = byId[sid] || [], m = termStr_(r[Q['ภาคที่มีผล']]).match(/(\d)\/(\d{4})/);
      add('reqd:' + r[Q['REQ ID']], 'mid', 'check-circle', String(r[Q['ชื่อ-สกุล']] || sid) + ' ' + r[Q['ประเภท']] + (m ? ' ภาคการศึกษาที่ ' + m[1] + ' ปีการศึกษา ' + m[2] : '') + ' (ซิงค์แล้ว)',
        [sid, st[H['ชั้นปี']] ? 'ชั้นปี ' + st[H['ชั้นปี']] : '', String(st[H['หลักสูตร']] || '')].filter(Boolean).join(' · ') + ' · ปรับสถานะตามระบบ REQ แล้ว', 'sid:' + sid); });
  } } catch (e) {}
  // 3) ภาคการศึกษา: ข้อมูลนักศึกษา / ผลการเรียน
  const est = termNowEst_(), cur = curTerm_(), sum = gradeSummary_();
  let gmax = 0; Object.keys(sum).forEach(id => { const k = Number(sum[id].term ? String(sum[id].term).replace(/^(\d)\/(\d{4})$/, '$2$1') : 0); if (k > gmax) gmax = k; });
  if (cur && cur < est) add('dterm', 'mid', 'calendar', 'ยังไม่ได้อัปเดตข้อมูลนักศึกษาภาค ' + termLabel_(est), 'ข้อมูลล่าสุดคือภาค ' + termLabel_(cur), 'pImport');
  const needG = prevRegTerm_(est);
  if (gmax && gmax < needG) add('gterm', 'mid', 'chart', 'ยังไม่ได้นำเข้าผลการเรียนภาค ' + termLabel_(needG), 'ผลการเรียนล่าสุดคือภาค ' + termLabel_(gmax), 'pImport');
  // 4) กลุ่มเสี่ยง
  const F = fStats_().byId, pc = probCfg_(), LV = acadLevels_(), thI = LV.length > 1 ? 2 : 1; let dis = 0, pro = 0, low = 0, fo = 0;
  active.forEach(r => { const id = normId_(r[0]), g = sum[id]; if (F[id] && F[id].open) fo++;
    if (!g) return; const p = probationOf_(g.h.map(x => ({ key: x[0], gpa: x[1], gpax: x[2] })), pc, { studied: studiedOf_(id) });
    if (p.status === 'เข้าเกณฑ์พ้นสภาพ') dis++; else { if (p.status === 'รอพินิจ') pro++; if (wbBand_(g.gpax) >= thI) low++; } });
  if (dis) add('dis', 'high', 'alert', 'เข้าเกณฑ์พ้นสภาพ ' + dis + ' คน', 'ตามเกณฑ์สถานภาพที่ตั้งไว้ · ควรแจ้งอาจารย์ที่ปรึกษา', 'pElig', dis);
  if (pro) add('pro', 'mid', 'hourglass', 'สถานภาพรอพินิจ ' + pro + ' คน', '', 'pElig', pro);
  if (low) add('low', 'mid', 'trend', 'GPAX ' + LV[thI - 1].label + ' (< ' + LV[thI - 1].below.toFixed(2) + ') ' + low + ' คน', 'ไม่รวมผู้เข้าเกณฑ์พ้นสภาพ', 'pRisk', low);
  if (fo) add('fo', 'info', 'flag', 'มี F/U ค้าง ' + fo + ' คน', '', 'pRisk', fo);
  // 5) สุขภาวะ (เฉพาะผู้มีสิทธิ์)
  if (canMH_(s)) { try { const W = wbList_(), inv = W.filter(x => x.lv === 2 && (!x.care || x.care === 'ควรเชิญ')).length, fu = W.filter(x => x.care === 'ติดตามต่อ').length;
    if (inv) add('wbinv', 'high', 'heart-pulse', 'ควรเชิญทำแบบประเมินสุขภาวะ ' + inv + ' คน', 'ยังไม่ได้บันทึกว่าเชิญแล้ว', 'pMental', inv);
    if (fu) add('wbfu', 'info', 'heart', 'อยู่ระหว่างติดตามสุขภาวะ ' + fu + ' คน', '', 'pMental', fu);
    if (Number(set.MH_PULL_N || 0) > 0) add('wbpull', 'info', 'link', 'ฝ่ายพัฒนาฯ อัปเดตผลการติดตาม ' + set.MH_PULL_N + ' คน', 'ซิงก์ล่าสุด ' + (set.MH_PULL_AT || ''), 'pMental'); } catch (e) {} }
  // 6) ระบบ (ผู้ดูแล)
  if (adm) {
    const noEmail = Object.keys(advisorMap_()).filter(a => !advisorMap_()[a]).length;
    if (noEmail) add('advmail', 'info', 'mail', 'อาจารย์ที่ปรึกษายังไม่มีอีเมล ' + noEmail + ' ท่าน', 'ส่งรายชื่อ/เข้าพอร์ทัลอาจารย์ไม่ได้ · เพิ่มที่ข้อมูลหลัก', 'pMaster', noEmail);
    try { const c = CacheService.getScriptCache(); let sec = null; try { sec = JSON.parse(c.get('bkst') || 'null'); } catch (e) {}
      if (!sec) { sec = adminSecurityStatus(token); c.put('bkst', JSON.stringify({ auto: sec.auto, backups: sec.backups.slice(0, 1) }), 21600); } const last = sec.backups[0];
      if (!sec.auto) add('bk', 'mid', 'shield', 'ยังไม่ได้ตั้งสำรองข้อมูลอัตโนมัติ', '', 'pSettings');
      else if (!last) add('bk', 'mid', 'shield', 'ยังไม่มีไฟล์สำรองข้อมูล', '', 'pSettings'); } catch (e) {}
  }
  try { calDue_().forEach(c => add('cal' + c.id, c.days <= 1 ? 'high' : 'mid', 'calendar', (c.days === 0 ? 'วันนี้: ' : c.days > 0 ? 'อีก ' + c.days + ' วัน: ' : 'กำลังดำเนินการ: ') + c.title, c.type + (c.note ? ' · ' + c.note : ''), c.tab || 'pCal')); } catch (e) {}
  if (s.role !== 'viewer' && (!s.tabs || s.tabs.indexOf('pImport') >= 0)) { try { const c = CacheService.getScriptCache(); let n = c.get('inbn'); if (n == null) { n = inboxScan_().length; c.put('inbn', String(n), 1800); } n = Number(n); if (n) add('inbox', 'mid', 'folder', 'ไฟล์ในกล่องรับไฟล์รอนำเข้า ' + n + ' ไฟล์', 'จาก Google Drive', 'inbox', n); } catch (e) {} }
  if (s.tabs && s.tabs.length) { const ok = it => !it.go || ['follow', 'appr', 'inbox', 'pHome', 'pSearch', 'pMental'].indexOf(it.go) >= 0 || s.tabs.indexOf(it.go) >= 0; for (let i = L.length - 1; i >= 0; i--) if (!ok(L[i])) L.splice(i, 1); }
  const ord = { high: 0, mid: 1, info: 2 }; L.sort((a, b) => ord[a.lv] - ord[b.lv]);
  return { items: L, at: Utilities.formatDate(new Date(), 'Asia/Bangkok', 'd/M/yyyy HH:mm'), est: termLabel_(est) };
}


// ======================= สิทธิ์รายเมนู =======================
/** เมนูที่กำหนดสิทธิ์ได้ (เจ้าหน้าที่/ดูอย่างเดียว) · ไม่ระบุ = ใช้ได้ทุกเมนูตามบทบาท · ผู้ดูแลระบบใช้ได้ทุกเมนูเสมอ */
const MENU_TABS = { pStudents: 'นักศึกษา', pRisk: 'กลุ่มเสี่ยง / ผลการเรียน', pElig: 'ตรวจสิทธิ์ฝึกงาน/จบ', pTerm: 'ปิดภาคการศึกษา', pReport: 'รายงานสิ้นภาค', pCal: 'ปฏิทินการศึกษา', pReq: 'คำร้อง REQ (ลาพัก/คืนสภาพ)', pMis: 'ตรวจสอบรายวิชาบังคับหล่น',
  pImport: 'นำเข้า/ส่งออก', pFiles: 'ไฟล์เอกสาร', pQuality: 'คุณภาพข้อมูล', pMaster: 'ข้อมูลหลัก', pLogs: 'บันทึกการแก้ไข' };
function tabGuard_(s, tab) {
  if (!s || !s.tabs || !s.tabs.length || ADMIN_ROLES.indexOf(s.role) >= 0) return s;
  if (s.tabs.indexOf(tab) < 0) throw new Error('บัญชีนี้ไม่มีสิทธิ์ใช้เมนู "' + (MENU_TABS[tab] || tab) + '"');
  return s;
}

// ======================= งานอัตโนมัติรายวัน =======================
/** trigger เดียว 07:00 ทุกวัน: แจ้งไฟล์ใหม่ในกล่องรับไฟล์ · เตือนกำหนดการในปฏิทิน · รายงานการเข้าถึงข้อมูลอ่อนไหว (วันที่ 1) · อัปเดตชีตสรุปผู้บริหาร */
function dailyJobs() {
  const R = [];
  const run = (n, fn) => { try { const x = fn(); R.push(n + ': ' + (x == null ? 'ok' : x)); } catch (e) { R.push(n + ': ผิดพลาด ' + (e.message || e)); } };
  run('กล่องรับไฟล์', () => inboxNotify_());
  run('ปฏิทิน', () => calRemind_());
  run('เก็บถาวรบันทึก', () => logArchive_(false));
  if (new Date().getDate() === 1 && getSettings_().ACCESS_REPORT !== 'off') run('รายงานการเข้าถึง', () => accessReportSend_('ระบบ (อัตโนมัติ)'));
  if (getSettings_().EXEC_AUTO === 'on' && getSettings_().EXEC_URL) run('สรุปผู้บริหาร', () => { execPublish_('ระบบ (อัตโนมัติ)'); return 'อัปเดตแล้ว'; });
  setSetting_('DAILY_LAST', Utilities.formatDate(new Date(), 'Asia/Bangkok', 'd/M/yyyy HH:mm') + ' · ' + R.join(' · '));
  log_('ระบบ (อัตโนมัติ)', 'งานอัตโนมัติรายวัน', '', R.join(' · '));
}
function adminDailySet(token, on) {
  const s = auth_(token, true);
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'dailyJobs').forEach(t => ScriptApp.deleteTrigger(t));
  if (on) ScriptApp.newTrigger('dailyJobs').timeBased().everyDays(1).atHour(7).create();
  log_(s.u, 'ตั้งงานอัตโนมัติรายวัน', '', on ? 'เปิด 07:00' : 'ปิด');
  return on;
}
function adminDailyRunNow(token) { const s = auth_(token, true); dailyJobs(); log_(s.u, 'สั่งรันงานอัตโนมัติรายวัน', '', ''); return getSettings_().DAILY_LAST || ''; }
function adminEmails_() {
  const t = readTable_(SH.USERS), U = idx_(t.headers);
  return t.rows.filter(r => ADMIN_ROLES.indexOf(String(r[U.role])) >= 0 && isActive_(r[U.active])).map(r => normEmail_(r[U.email])).filter(Boolean);
}
function emailsOf_(key) { const v = String(getSettings_()[key] || '').toLowerCase().split(/[\s,;]+/).filter(x => /@/.test(x)); return v.length ? v : adminEmails_(); }
function mailWrap_(title, body) {
  return `<div style="font-family:Sarabun,Tahoma,sans-serif;color:#2a2a1a;line-height:1.6;max-width:720px"><div style="background:#6b7b28;color:#fff;padding:12px 16px;border-radius:10px 10px 0 0;font-size:17px;font-weight:bold">${title}</div>
    <div style="border:1px solid #e7ebd5;border-top:0;padding:14px 16px;border-radius:0 0 10px 10px">${body}<p style="font-size:12px;color:#8a8a70;margin-top:16px">ระบบฐานข้อมูลนักศึกษา · <a href="${appUrl_()}?page=admin">เปิดระบบ</a></p></div></div>`;
}

// ======================= 7) กล่องรับไฟล์ REG (Google Drive) =======================
const INBOX_KINDS = { stu: 'ข้อมูลนักศึกษา', grade: 'ผลการเรียน (GPA-GPAX)', gc: 'ใบตรวจสอบจบ (PDF)' };
function inboxRoot_() { return getSubFolder_(getRootFolder_(), 'กล่องรับไฟล์ REG'); }
function inboxFolders_() { const r = inboxRoot_(), o = {}; Object.keys(INBOX_KINDS).forEach(k => o[k] = getSubFolder_(r, INBOX_KINDS[k])); return o; }
function inboxScan_() {
  const F = inboxFolders_(), out = [];
  Object.keys(F).forEach(k => { const it = F[k].getFiles(); while (it.hasNext()) { const f = it.next(); if (f.isTrashed && f.isTrashed()) continue;
    out.push({ id: f.getId(), name: f.getName(), kind: k, kindName: INBOX_KINDS[k], size: f.getSize ? f.getSize() : 0, t: f.getDateCreated().getTime(), at: Utilities.formatDate(f.getDateCreated(), 'Asia/Bangkok', 'd/M/yyyy HH:mm'), url: f.getUrl() }); } });
  try { CacheService.getScriptCache().put('inbn', String(out.length), 1800); } catch (e) {}
  return out.sort((a, b) => b.t - a.t);
}
function adminInboxList(token) {
  const s = tabGuard_(authW_(token), 'pImport');
  const r = inboxRoot_(), F = inboxFolders_(), set = getSettings_();
  return { url: r.getUrl(), folders: Object.keys(F).map(k => ({ k, name: INBOX_KINDS[k], url: F[k].getUrl() })), files: inboxScan_(), emails: set.INBOX_EMAILS || '', notify: set.INBOX_NOTIFY !== 'off' };
}
/** ส่งไฟล์ให้หน้าเว็บอ่านด้วยตัวอ่านเดิม (ต้องอยู่ในกล่องรับไฟล์เท่านั้น) */
function adminInboxGet(token, id) {
  const s = tabGuard_(authW_(token), 'pImport');
  const f = inboxScan_().find(x => x.id === id); if (!f) throw new Error('ไม่พบไฟล์ในกล่องรับไฟล์');
  const file = DriveApp.getFileById(id); if (f.size > 15 * 1024 * 1024) throw new Error('ไฟล์ใหญ่เกิน 15MB');
  const b = file.getBlob();
  log_(s.u, 'เปิดไฟล์จากกล่องรับไฟล์', '', f.kindName + ' · ' + f.name);
  return { name: f.name, kind: f.kind, mime: b.getContentType(), b64: Utilities.base64Encode(b.getBytes()) };
}
/** ย้ายไฟล์ที่นำเข้าแล้วไป <กล่องรับไฟล์>/นำเข้าแล้ว/yyyy-MM */
function adminInboxDone(token, ids) {
  const s = tabGuard_(authW_(token), 'pImport');
  const known = {}; inboxScan_().forEach(x => known[x.id] = x);
  const dest = getSubFolder_(getSubFolder_(inboxRoot_(), 'นำเข้าแล้ว'), Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM'));
  let n = 0; [].concat(ids || []).forEach(id => { if (!known[id]) return; try { DriveApp.getFileById(id).moveTo(dest); n++; } catch (e) {} });
  log_(s.u, 'ย้ายไฟล์ที่นำเข้าแล้ว (กล่องรับไฟล์)', '', n + ' ไฟล์');
  return inboxScan_();
}
function adminInboxSet(token, o) {
  const s = auth_(token, true); o = o || {};
  if (o.emails !== undefined) setSetting_('INBOX_EMAILS', String(o.emails).toLowerCase().split(/[\s,;]+/).filter(x => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x)).join(', '));
  if (o.notify !== undefined) setSetting_('INBOX_NOTIFY', o.notify ? 'on' : 'off');
  log_(s.u, 'ตั้งค่ากล่องรับไฟล์', '', JSON.stringify(o)); return true;
}
function inboxNotify_() {
  if (getSettings_().INBOX_NOTIFY === 'off') return 'ปิดการแจ้ง';
  const L = inboxScan_(), seen = String(getSettings_().INBOX_SEEN || '').split(','), fresh = L.filter(f => seen.indexOf(f.id) < 0);
  setSetting_('INBOX_SEEN', L.map(f => f.id).join(','));
  if (!fresh.length) return 'ไม่มีไฟล์ใหม่';
  const to = emailsOf_('INBOX_EMAILS'); if (!to.length) return 'ไม่มีผู้รับ';
  MailApp.sendEmail({ to: to.join(','), subject: 'มีไฟล์ใหม่รอนำเข้า ' + fresh.length + ' ไฟล์ (กล่องรับไฟล์ REG)',
    htmlBody: mailWrap_('ไฟล์ใหม่รอนำเข้า ' + fresh.length + ' ไฟล์', '<ul>' + fresh.map(f => `<li><b>${f.kindName}</b> · ${f.name} <span style="color:#8a8a70">(${f.at})</span></li>`).join('') + '</ul><p>เปิดเมนู <b>นำเข้า/ส่งออก → กล่องรับไฟล์</b> แล้วกด "นำเข้า" ระบบจะให้ตรวจตัวอย่างก่อนบันทึกทุกครั้ง</p>') });
  return 'แจ้ง ' + fresh.length + ' ไฟล์';
}

// ======================= 8) ชีตสรุปสำหรับผู้บริหาร (ไม่ระบุตัวตน · ใช้กับ Looker Studio) =======================
const EXEC_MIN = 5;   // กลุ่มที่มีน้อยกว่า 5 คน ไม่แสดงค่าเฉลี่ย (กันการระบุตัวตน)
function execPublish_(by) {
  const set = getSettings_(), st = readTable_(SH.STUDENTS), H = idx_(st.headers), sum = gradeSummary_(), F = fStats_().byId, LV = acadLevels_(), pc = probCfg_();
  const avg = a => a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length * 100) / 100 : '';
  const groups = {};
  st.rows.forEach(r => { const id = normId_(r[0]); if (!id) return; const k = [2500 + Number(id.slice(0, 2)), r[H['ชั้นปี']], String(r[H['หลักสูตร']] || ''), String(r[H['สถานะ']] || '')].join('|');
    const g = groups[k] = groups[k] || { n: 0, gx: [], lv: LV.map(() => 0), dis: 0, f: 0 }; g.n++;
    const s = sum[id]; if (s && s.gpax !== '') { const v = Number(s.gpax); g.gx.push(v); LV.forEach((l, i) => { if (v < l.below) g.lv[i]++; });
      if (probationOf_(s.h.map(x => ({ key: x[0], gpa: x[1], gpax: x[2] })), pc, { studied: studiedOf_(id) }).status === 'เข้าเกณฑ์พ้นสภาพ') g.dis++; }
    if (F[id] && F[id].open) g.f++; });
  const A = [['ปีที่เข้าศึกษา', 'ชั้นปี', 'หลักสูตร', 'สถานะ', 'จำนวน', 'มีผลการเรียน', 'GPAX เฉลี่ย'].concat(LV.map(l => 'GPAX ต่ำกว่า ' + l.below.toFixed(2) + ' (' + l.label + ')'), ['เข้าเกณฑ์พ้นสภาพ', 'มี F/U ค้าง', 'อัปเดต'])];
  const now = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm');
  Object.keys(groups).sort().forEach(k => { const [y, yr, pg, ss] = k.split('|'), g = groups[k], small = g.n < EXEC_MIN;
    A.push([Number(y), Number(yr) || yr, pg, ss, g.n, g.gx.length, small ? '' : avg(g.gx)].concat(g.lv.map(v => small ? '' : v), [small ? '' : g.dis, small ? '' : g.f, now])); });
  // แนวโน้มรายภาค
  const T = {}; Object.keys(sum).forEach(id => sum[id].h.forEach(x => { if (x[0] % 10 === 3) return; const t = T[x[0]] = T[x[0]] || { gpa: [], gpax: [] }; if (x[1] !== '') t.gpa.push(Number(x[1])); if (x[2] !== '') t.gpax.push(Number(x[2])); }));
  const B = [['ภาคการศึกษา', 'ปีการศึกษา', 'ภาค', 'จำนวนที่มีผล', 'GPA เฉลี่ย', 'GPAX เฉลี่ย'].concat(LV.map(l => 'GPAX ต่ำกว่า ' + l.below.toFixed(2)))];
  Object.keys(T).map(Number).sort().forEach(k => { const t = T[k]; B.push([termLabel_(k), Math.floor(k / 10), k % 10, t.gpax.length, avg(t.gpa), avg(t.gpax)].concat(LV.map(l => t.gpax.filter(v => v < l.below).length))); });
  let ss; if (set.EXEC_URL) { try { ss = SpreadsheetApp.openByUrl(set.EXEC_URL); } catch (e) {} }
  if (!ss) { ss = SpreadsheetApp.create('สรุปสำหรับผู้บริหาร · ฐานข้อมูลนักศึกษา (ไม่ระบุตัวตน)'); try { DriveApp.getFileById(ss.getId()).moveTo(getRootFolder_()); } catch (e) {} setSetting_('EXEC_URL', ss.getUrl()); }
  const put = (name, aoa) => { let sh = ss.getSheetByName(name); if (!sh) { sh = ss.getSheets().length === 1 && ss.getSheets()[0].getLastRow() === 0 ? ss.getSheets()[0] : ss.insertSheet(name); try { sh.setName(name); } catch (e) {} }
    sh.clear(); sh.getRange(1, 1, aoa.length, aoa[0].length).setValues(aoa); try { sh.getRange(1, 1, 1, aoa[0].length).setFontWeight('bold').setBackground('#e7ebd5'); sh.setFrozenRows(1); } catch (e) {} };
  put('ภาพรวมนักศึกษา', A); put('แนวโน้มรายภาค', B);
  put('คำอธิบาย', [['ข้อมูลสรุปแบบไม่ระบุตัวตน สร้างจากระบบฐานข้อมูลนักศึกษาอัตโนมัติ'], ['กลุ่มที่มีน้อยกว่า ' + EXEC_MIN + ' คน จะไม่แสดงค่าเฉลี่ยและจำนวนย่อย เพื่อป้องกันการระบุตัวบุคคล'], ['ไม่มีรหัส ชื่อ หรือข้อมูลติดต่อนักศึกษา และไม่มีข้อมูลสุขภาพจิต'], ['เชื่อม Looker Studio: Add data → Google Sheets → เลือกไฟล์นี้'], ['อัปเดตล่าสุด ' + now]]);
  // แชร์แบบอ่านอย่างเดียว
  const want = String(set.EXEC_EMAILS || '').toLowerCase().split(/[\s,;]+/).filter(x => /@/.test(x)), had = String(set.EXEC_SHARED || '').split(',').filter(Boolean);
  try { const f = DriveApp.getFileById(ss.getId()); had.filter(e => want.indexOf(e) < 0).forEach(e => { try { f.removeViewer(e); } catch (x) {} }); want.filter(e => had.indexOf(e) < 0).forEach(e => { try { f.addViewer(e); } catch (x) {} }); } catch (e) {}
  setSetting_('EXEC_SHARED', want.join(',')); setSetting_('EXEC_AT', Utilities.formatDate(new Date(), 'Asia/Bangkok', 'd/M/yyyy HH:mm'));
  log_(by, 'อัปเดตชีตสรุปผู้บริหาร', '', (A.length - 1) + ' กลุ่ม · ' + (B.length - 1) + ' ภาค');
  return { url: ss.getUrl(), at: getSettings_().EXEC_AT, groups: A.length - 1, terms: B.length - 1 };
}
function adminExecPublish(token) { const s = auth_(token, true); return withLock_(() => execPublish_(s.u), true); }
function adminExecSet(token, o) {
  const s = auth_(token, true); o = o || {};
  if (o.emails !== undefined) setSetting_('EXEC_EMAILS', String(o.emails).toLowerCase().split(/[\s,;]+/).filter(x => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x)).join(', '));
  if (o.auto !== undefined) setSetting_('EXEC_AUTO', o.auto ? 'on' : 'off');
  log_(s.u, 'ตั้งค่าชีตสรุปผู้บริหาร', '', JSON.stringify(o));
  const set = getSettings_(); return { url: set.EXEC_URL || '', at: set.EXEC_AT || '', emails: set.EXEC_EMAILS || '', auto: set.EXEC_AUTO === 'on' };
}
function adminExecInfo(token) { auth_(token, true); const set = getSettings_(); return { url: set.EXEC_URL || '', at: set.EXEC_AT || '', emails: set.EXEC_EMAILS || '', auto: set.EXEC_AUTO === 'on' }; }

// ======================= 11) ปฏิทินการศึกษา =======================
const CAL_TYPES = ['ลงทะเบียน', 'สอบ', 'ส่งเกรด', 'ตรวจสิทธิ์', 'ฝึกงาน', 'ประชุม', 'อื่นๆ'];
function calRows_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.CAL); if (!sh || sh.getLastRow() < 2) return [];
  const d = x => x instanceof Date ? Utilities.formatDate(x, 'Asia/Bangkok', 'yyyy-MM-dd') : String(x || '').slice(0, 10);
  return sh.getDataRange().getValues().slice(1).filter(r => r[0]).map(r => ({ id: String(r[0]), d: d(r[1]), d2: d(r[2]), title: String(r[3]), type: String(r[4] || 'อื่นๆ'), remind: Number(r[5]) || 0, tab: String(r[6] || ''), note: String(r[7] || ''), by: String(r[8] || '') }))
    .sort((a, b) => a.d.localeCompare(b.d));
}
function adminCalList(token) { tabGuard_(auth_(token), 'pCal'); return { items: calRows_(), types: CAL_TYPES }; }
function adminCalSave(token, o) {
  const s = tabGuard_(authW_(token), 'pCal'); o = o || {};
  if (!/^\d{4}-\d{2}-\d{2}$/.test(o.d || '')) throw new Error('กรุณาระบุวันที่');
  const title = safe_(String(o.title || '').trim().slice(0, 150)); if (!title) throw new Error('กรุณาระบุหัวข้อ');
  const d2 = /^\d{4}-\d{2}-\d{2}$/.test(o.d2 || '') && o.d2 >= o.d ? o.d2 : '';
  return withLock_(() => {
    const sh = ensureSheetLazy_(SH.CAL, CAL_HEADERS), now = new Date();
    const row = [o.id || 'C' + Utilities.formatDate(now, 'Asia/Bangkok', 'yyyyMMddHHmmss') + Math.floor(Math.random() * 90 + 10), o.d, d2, title, CAL_TYPES.indexOf(o.type) >= 0 ? o.type : 'อื่นๆ',
      Math.max(0, Math.min(60, Number(o.remind) || 0)), MENU_TABS[o.tab] || ['pMental', 'pHome'].indexOf(o.tab) >= 0 ? o.tab : '', safe_(String(o.note || '').slice(0, 500)), s.u, now];
    const v = sh.getDataRange().getValues(); let at = -1; if (o.id) for (let i = 1; i < v.length; i++) if (String(v[i][0]) === String(o.id)) at = i + 1;
    if (at > 0) sh.getRange(at, 1, 1, row.length).setValues([row]); else sh.appendRow(row);
    sh.getRange(2, 2, Math.max(1, sh.getLastRow() - 1), 2).setNumberFormat('@');
    log_(s.u, o.id ? 'แก้ไขกำหนดการ' : 'เพิ่มกำหนดการ', '', o.d + ' ' + title);
    return calRows_();
  }, true);
}
function adminCalDelete(token, id) {
  const s = tabGuard_(authW_(token), 'pCal');
  return withLock_(() => { const sh = ensureSheetLazy_(SH.CAL, CAL_HEADERS), v = sh.getDataRange().getValues();
    for (let i = v.length - 1; i >= 1; i--) if (String(v[i][0]) === String(id)) { sh.deleteRow(i + 1); log_(s.u, 'ลบกำหนดการ', '', v[i][3]); }
    return calRows_(); }, true);
}
/** กำหนดการที่ควรเตือน: วันนี้อยู่ในช่วง [วันเริ่ม − เตือนล่วงหน้า, วันสิ้นสุด] */
function calDue_() {
  const today = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd');
  return calRows_().filter(c => { const start = Utilities.formatDate(new Date(new Date(c.d + 'T00:00:00+07:00').getTime() - c.remind * 86400000), 'Asia/Bangkok', 'yyyy-MM-dd');
    return today >= start && today <= (c.d2 || c.d); }).map(c => Object.assign(c, { days: Math.round((new Date(c.d + 'T00:00:00+07:00') - new Date(today + 'T00:00:00+07:00')) / 86400000) }));
}
function calRemind_() {
  const today = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd');
  const L = calDue_();   // สรุปรายวัน: ทุกกำหนดการที่อยู่ในช่วงเตือนจนถึงวันสิ้นสุด
  if (!L.length) return 'ไม่มีกำหนดการ';
  const to = emailsOf_('CAL_EMAILS'); if (!to.length) return 'ไม่มีผู้รับ';
  MailApp.sendEmail({ to: to.join(','), subject: 'แจ้งเตือนกำหนดการ: ' + L.map(c => c.title).join(', ').slice(0, 120),
    htmlBody: mailWrap_('กำหนดการที่ใกล้ถึง', '<ul>' + L.map(c => `<li><b>${c.title}</b> (${c.type}) · ${c.days === 0 ? '<b style="color:#c92a2a">วันนี้</b>' : c.days > 0 ? 'อีก ' + c.days + ' วัน' : 'กำลังดำเนินการ'} · ${c.d}${c.d2 ? ' ถึง ' + c.d2 : ''}${c.note ? '<br><span style="color:#6b6b55">' + c.note + '</span>' : ''}</li>`).join('') + '</ul>') });
  return 'เตือน ' + L.length + ' รายการ';
}
function adminCalSet(token, emails) { const s = auth_(token, true); setSetting_('CAL_EMAILS', String(emails || '').toLowerCase().split(/[\s,;]+/).filter(x => /@/.test(x)).join(', ')); log_(s.u, 'ตั้งผู้รับเตือนปฏิทิน', '', emails); return getSettings_().CAL_EMAILS; }

// ======================= 12) ไทม์ไลน์นักศึกษารายคน =======================
function adminTimeline(token, sid) {
  const s = auth_(token, false, true); sid = normId_(sid); advGuard_(s, sid);
  const ss = SpreadsheetApp.getActiveSpreadsheet(), E = [], LV = acadLevels_();
  const add = (k, ic, lv, date, title, sub) => E.push({ k, ic, lv, date: String(date || ''), title, sub: sub || '' });
  const keyDate = k => { const y = Math.floor(k / 10) - 543, t = k % 10; return (t === 1 ? y + '-10-31' : t === 2 ? (y + 1) + '-03-31' : (y + 1) + '-05-31'); };
  // ผลการเรียน + การเปลี่ยนช่วง GPAX
  const g = gradeSummary_()[sid]; let prevBand = null;
  if (g) g.h.forEach(x => { const band = x[2] === '' ? null : wbBand_(x[2]);
    add('grade', 'chart', band >= 2 ? 'bad' : band === 1 ? 'warn' : 'ok', keyDate(x[0]), 'ผลการเรียนภาค ' + termLabel_(x[0]), 'GPA ' + (x[1] === '' ? '–' : Number(x[1]).toFixed(2)) + ' · GPAX ' + (x[2] === '' ? '–' : Number(x[2]).toFixed(2)));
    if (band != null && prevBand != null && band !== prevBand) add('band', band > prevBand ? 'alert' : 'trend', band > prevBand ? 'bad' : 'ok', keyDate(x[0]), band > prevBand ? 'GPAX ลดลงเข้าระดับ ' + LV[band - 1].label + ' (< ' + LV[band - 1].below.toFixed(2) + ')' : band === 0 ? 'GPAX ดีขึ้นกลับสู่ระดับปกติ' : 'GPAX ดีขึ้นเป็นระดับ ' + LV[band - 1].label, '');
    if (band != null) prevBand = band; });
  // F/U และการแก้
  const cs = ss.getSheetByName(SH.COURSES);
  if (cs && cs.getLastRow() > 1) { const by = {};
    cs.getDataRange().getValues().slice(1).filter(r => normId_(r[0]) === sid).forEach(r => { const code = String(r[2]); (by[code] = by[code] || []).push({ name: String(r[3] || ''), t: Number(r[6]) || 0, y: Number(r[7]) || 0, gr: String(r[8] || '') }); });
    Object.keys(by).forEach(code => { const L = by[code].sort((a, b) => a.y * 10 + a.t - (b.y * 10 + b.t)); let failed = false;
      L.forEach(a => { const k = a.y * 10 + a.t, d = a.y ? keyDate(k) : '';
        if (['F', 'U', 'I'].indexOf(a.gr) >= 0) { failed = true; add('f', 'flag', 'bad', d, 'ได้ ' + a.gr + ' วิชา ' + code, a.name + (a.y ? ' · ภาค ' + termLabel_(k) : '')); }
        else if (failed && a.gr && a.gr !== 'W' && a.gr !== '--') { failed = false; add('fix', 'check-circle', 'ok', d, 'แก้ไขวิชา ' + code + ' ผ่านแล้ว (' + a.gr + ')', a.name); } }); }); }
  // สถานะ
  const sh = ss.getSheetByName(SH.STATUSHIST);
  if (sh && sh.getLastRow() > 1) sh.getDataRange().getValues().slice(1).filter(r => normId_(r[1]) === sid).forEach(r => add('status', 'swap', /พ้น|ลาออก|ไล่ออก/.test(r[3]) ? 'bad' : 'info', r[9] instanceof Date ? Utilities.formatDate(r[9], 'Asia/Bangkok', 'yyyy-MM-dd') : '', 'สถานะ: ' + (r[2] || '–') + ' → ' + r[3], [r[4] ? 'มีผลภาค ' + r[4] : '', r[5], r[6] ? 'คำสั่ง ' + r[6] : ''].filter(Boolean).join(' · ')));
  // สถานะ/ชั้นปี ณ แต่ละภาค (จากข้อมูลรายภาค)
  try { const S = termSnaps_(); let prev = null; Object.keys(S).map(Number).sort((a, b) => a - b).forEach(k => { const x = S[k].m[sid]; if (!x) return;
    if (prev && prev[1] !== x[1]) add('status', 'swap', /พ้น|ลาออก|ไล่ออก/.test(x[1]) ? 'bad' : 'info', keyDate(k), 'ภาค ' + termLabel_(k) + ': สถานะ ' + prev[1] + ' → ' + x[1], 'จากข้อมูลนักศึกษารายภาค');
    if (prev && String(prev[0]) !== String(x[0])) add('year', 'arrow-up', 'info', keyDate(k), 'ภาค ' + termLabel_(k) + ': ชั้นปี ' + prev[0] + ' → ' + x[0], '');
    prev = x; }); } catch (e) {}
  // บันทึก/การพบ
  const nt = readTable_(SH.NOTES), N = idx_(nt.headers);
  nt.rows.filter(r => String(r[N['รหัสนักศึกษา']]) === sid && r[N.NoteId] && noteVisible_(r, N, s)).forEach(r => { const at = r[N['บันทึกเมื่อ']];
    add('note', 'note', 'info', at instanceof Date ? Utilities.formatDate(at, 'Asia/Bangkok', 'yyyy-MM-dd') : '', 'บันทึก: ' + r[N['หมวด']] + ' · ' + (r[N['ชื่อผู้บันทึก']] || r[N['ผู้บันทึก']]), String(r[N['ข้อความ']] || '').slice(0, 160)); });
  // ไฟล์เอกสาร (เจ้าหน้าที่)
  if (s.role !== 'advisor') { const fs = ss.getSheetByName(SH.FILES);
    if (fs && fs.getLastRow() > 1) fs.getDataRange().getValues().slice(1).filter(r => normId_(r[1]) === sid).forEach(r => add('file', 'file', 'info', r[0] instanceof Date ? Utilities.formatDate(r[0], 'Asia/Bangkok', 'yyyy-MM-dd') : '', 'เอกสาร: ' + r[2], String(r[3] || ''))); }
  // การดูแลสุขภาวะ (เฉพาะผู้มีสิทธิ์ · สถานะล่าสุดเท่านั้น)
  if (s.role !== 'advisor' && canMH_(s)) { const c = mhCare_()[sid]; if (c && c.st) add('care', 'heart', 'info', c.at ? Utilities.formatDate(new Date(c.at), 'Asia/Bangkok', 'yyyy-MM-dd') : '', 'สุขภาวะ: ' + c.st, c.by ? 'โดย ' + c.by : ''); }
  E.sort((a, b) => b.date.localeCompare(a.date));
  log_(s.u, 'ดูไทม์ไลน์นักศึกษา', sid, E.length + ' เหตุการณ์');
  return E;
}

// ======================= 15) รายงานการเข้าถึงข้อมูลอ่อนไหวรายเดือน =======================
const SENS_ACT = /ดูข้อมูลติดต่อ|ส่งออกข้อมูลติดต่อ|ส่งออกข้อมูล|สุขภาพจิต|สุขภาวะ|ประเมินสุขภาวะ|ชีตร่วม|ไทม์ไลน์/;
function accessReport_(y, m) {
  const from = new Date(y, m - 1, 1), to = new Date(y, m, 1);
  const lg = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.LOG), ac = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.ACCESS);
  const users = {}, acts = {}, top = [];
  if (lg && lg.getLastRow() > 1) lg.getDataRange().getValues().slice(1).forEach(r => { if (!(r[0] instanceof Date) || r[0] < from || r[0] >= to || !SENS_ACT.test(String(r[2]))) return;
    const u = String(r[1]), a = String(r[2]); (users[u] = users[u] || { n: 0, a: {} }).n++; users[u].a[a] = (users[u].a[a] || 0) + 1; acts[a] = (acts[a] || 0) + 1; });
  let ok = 0, bad = 0; const badBy = {};
  if (ac && ac.getLastRow() > 1) ac.getDataRange().getValues().slice(1).forEach(r => { if (!(r[0] instanceof Date) || r[0] < from || r[0] >= to) return;
    if (r[3] === 'เข้าสู่ระบบสำเร็จ') ok++; else if (/ไม่ถูกต้อง|ปฏิเสธ|เกิน|หมดอายุ/.test(r[3])) { bad++; badBy[r[1]] = (badBy[r[1]] || 0) + 1; } });
  Object.keys(users).forEach(u => top.push({ u, n: users[u].n, a: Object.keys(users[u].a).map(k => k + ' ' + users[u].a[k]).join(', ') }));
  top.sort((a, b) => b.n - a.n);
  return { label: ['', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'][m] + ' ' + (y + 543),
    total: top.reduce((a, x) => a + x.n, 0), users: top, acts: Object.keys(acts).map(k => ({ a: k, n: acts[k] })).sort((a, b) => b.n - a.n), login: ok, bad, badBy: Object.keys(badBy).map(e => ({ e, n: badBy[e] })).sort((a, b) => b.n - a.n).slice(0, 10) };
}
function accessReportSend_(by, prev) {
  const d = new Date(), y = prev === false ? d.getFullYear() : (d.getMonth() === 0 ? d.getFullYear() - 1 : d.getFullYear()), m = prev === false ? d.getMonth() + 1 : (d.getMonth() === 0 ? 12 : d.getMonth());
  const R = accessReport_(y, m), to = emailsOf_('ACCESS_REPORT_EMAILS');
  if (!to.length) return 'ไม่มีผู้รับ';
  const tr = (a, b) => `<tr><td style="padding:5px 8px;border-bottom:1px solid #e7ebd5">${a}</td><td style="padding:5px 8px;border-bottom:1px solid #e7ebd5;text-align:right">${b}</td></tr>`;
  MailApp.sendEmail({ to: to.join(','), subject: 'รายงานการเข้าถึงข้อมูลอ่อนไหว เดือน' + R.label,
    htmlBody: mailWrap_('รายงานการเข้าถึงข้อมูลอ่อนไหว · ' + R.label, `<p>เข้าสู่ระบบสำเร็จ <b>${R.login}</b> ครั้ง · ผิดพลาด/ถูกปฏิเสธ <b style="color:${R.bad ? '#c92a2a' : 'inherit'}">${R.bad}</b> ครั้ง · การเข้าถึงข้อมูลอ่อนไหว <b>${R.total}</b> ครั้ง</p>
      <h4>แยกตามผู้ใช้</h4><table style="border-collapse:collapse;width:100%;font-size:14px">${R.users.map(x => tr(x.u + '<br><span style="color:#8a8a70;font-size:12px">' + x.a + '</span>', x.n)).join('') || tr('ไม่มี', '')}</table>
      <h4>แยกตามประเภท</h4><table style="border-collapse:collapse;width:100%;font-size:14px">${R.acts.map(x => tr(x.a, x.n)).join('') || tr('ไม่มี', '')}</table>
      ${R.badBy.length ? `<h4>อีเมลที่เข้าสู่ระบบไม่สำเร็จบ่อย</h4><table style="border-collapse:collapse;width:100%;font-size:14px">${R.badBy.map(x => tr(x.e, x.n)).join('')}</table>` : ''}`) });
  log_(by, 'ส่งรายงานการเข้าถึงข้อมูลอ่อนไหว', '', R.label + ' · ' + R.total + ' ครั้ง');
  return 'ส่งรายงาน ' + R.label;
}
function adminAccessReport(token, send, ym) {
  const s = authOwner_(token);
  if (send) return accessReportSend_(s.u, ym === 'cur' ? false : undefined);
  const d = new Date(); return ym === 'cur' ? accessReport_(d.getFullYear(), d.getMonth() + 1) : accessReport_(d.getMonth() === 0 ? d.getFullYear() - 1 : d.getFullYear(), d.getMonth() === 0 ? 12 : d.getMonth());
}
function adminAccessReportSet(token, o) {
  const s = authOwner_(token); o = o || {};
  if (o.emails !== undefined) setSetting_('ACCESS_REPORT_EMAILS', String(o.emails).toLowerCase().split(/[\s,;]+/).filter(x => /@/.test(x)).join(', '));
  if (o.on !== undefined) setSetting_('ACCESS_REPORT', o.on ? 'on' : 'off');
  log_(s.u, 'ตั้งค่ารายงานการเข้าถึง', '', JSON.stringify(o)); return true;
}

// ======================= 16) สุขภาพระบบ =======================
// ======================= เก็บถาวรบันทึกเก่า (ลดขนาดชีต) =======================
/** ย้ายแถวบันทึกที่เก่ากว่า LOG_KEEP_M เดือน (ค่าเริ่มต้น 12) ไปไฟล์ "เก็บถาวรบันทึก" แยก — ไม่ลบทิ้ง */
const LOGARC_SHEETS = () => [SH.LOG, SH.ACCESS];
function logArcFile_() {
  const P = PropertiesService.getScriptProperties(); let id = P.getProperty('LOGARC_ID'), f = null;
  if (id) try { f = SpreadsheetApp.openById(id); } catch (e) { f = null; }
  if (!f) {
    f = SpreadsheetApp.create('เก็บถาวรบันทึก — ฐานข้อมูลนักศึกษา');
    const fid = getSettings_().DRIVE_FOLDER_ID;
    if (fid) try { const file = DriveApp.getFileById(f.getId()); DriveApp.getFolderById(fid).addFile(file); DriveApp.getRootFolder().removeFile(file); } catch (e) {}
    P.setProperty('LOGARC_ID', f.getId());
  }
  return f;
}
function logArchive_(force) {
  const keep = Math.max(3, Number(getSettings_().LOG_KEEP_M || 12)), cut = new Date(); cut.setMonth(cut.getMonth() - keep);
  const ss = SpreadsheetApp.getActiveSpreadsheet(), out = [];
  LOGARC_SHEETS().forEach(name => {
    const sh = ss.getSheetByName(name); if (!sh) return; const last = sh.getLastRow(); if (last < 2) return;
    const N = Math.min(last - 1, 20000), col = sh.getRange(2, 1, N, 1).getValues();
    let k = 0; while (k < col.length && col[k][0] instanceof Date && col[k][0] < cut) k++;
    if (!k || (!force && k < 200)) return;           // เก็บเป็นก้อน ไม่ต้องทำทุกวัน
    const nc = sh.getLastColumn(), vals = sh.getRange(2, 1, k, nc).getValues(), hdr = sh.getRange(1, 1, 1, nc).getValues();
    const A = logArcFile_(); let t = A.getSheetByName(name);
    if (!t) { t = A.insertSheet(name); t.getRange(1, 1, 1, nc).setValues(hdr).setFontWeight('bold'); t.setFrozenRows(1); const d = A.getSheetByName('Sheet1') || A.getSheetByName('แผ่น1'); if (d && A.getSheets().length > 1) A.deleteSheet(d); }
    t.getRange(t.getLastRow() + 1, 1, k, nc).setValues(vals);
    sh.deleteRows(2, k); out.push(name + ' ' + k + ' แถว');
  });
  return out.length ? 'ย้ายไปเก็บถาวร ' + out.join(', ') : 'ไม่มีบันทึกเก่ากว่า ' + keep + ' เดือน';
}
function adminLogArchive(token, months) {
  const s = auth_(token, true);
  if (months) setSetting_('LOG_KEEP_M', String(Math.max(3, Number(months) || 12)));
  const r = withLock_(() => logArchive_(true), true);
  log_(s.u, 'เก็บถาวรบันทึกเก่า', '', r);
  let url = ''; try { const id = PropertiesService.getScriptProperties().getProperty('LOGARC_ID'); if (id) url = 'https://docs.google.com/spreadsheets/d/' + id; } catch (e) {}
  return { msg: r, url };
}
function adminHealth(token) {
  const s = auth_(token, true), set = getSettings_(), ss = SpreadsheetApp.getActiveSpreadsheet(), C = [];
  const add = (k, st, title, detail, act) => C.push({ k, st, title, detail: detail || '', act: act || '' });
  // สำรองข้อมูล
  try { const sec = adminSecurityStatus(token), last = sec.backups[0];
    const age = last ? (Date.now() - new Date(last.time.replace(/^(\d+)\/(\d+)\/(\d+) (\d+):(\d+)$/, (m, d, mo, y, h, mi) => (Number(y) - 543) + '-' + mo.padStart(2, '0') + '-' + d.padStart(2, '0') + 'T' + h.padStart(2, '0') + ':' + mi + ':00+07:00'))) / 86400000 : null;
    add('backup', !sec.auto ? 'bad' : !last ? 'warn' : age > 2 ? 'warn' : 'ok', 'สำรองข้อมูล', (sec.auto ? 'อัตโนมัติทุกวัน ~' + sec.hour + ':00' : 'ยังไม่ได้ตั้งอัตโนมัติ') + (last ? ' · ล่าสุด ' + last.time : ' · ยังไม่มีไฟล์สำรอง') + ' · เก็บ ' + sec.keep + ' ชุด', 'pSettings'); } catch (e) { add('backup', 'bad', 'สำรองข้อมูล', 'ตรวจไม่ได้: ' + e.message); }
  // งานอัตโนมัติ
  const H = ScriptApp.getProjectTriggers().map(t => t.getHandlerFunction()), NAME = { dailyBackup: 'สำรองข้อมูลรายวัน', dailyJobs: 'งานอัตโนมัติรายวัน 07:00', mhLinkDaily: 'ซิงก์ชีตร่วมฝ่ายพัฒนาฯ' };
  add('daily', H.indexOf('dailyJobs') >= 0 ? 'ok' : 'warn', 'งานอัตโนมัติรายวัน', H.indexOf('dailyJobs') >= 0 ? 'ทำงานล่าสุด: ' + (set.DAILY_LAST || 'ยังไม่เคย') : 'ยังไม่ได้เปิด (แจ้งไฟล์ใหม่ เตือนปฏิทิน รายงานการเข้าถึง)', 'daily');
  // อีเมล
  let q = null; try { q = MailApp.getRemainingDailyQuota(); } catch (e) {}
  add('mail', q == null ? 'warn' : q < 20 ? 'bad' : q < 60 ? 'warn' : 'ok', 'โควตาอีเมลวันนี้', q == null ? 'ตรวจไม่ได้' : 'ส่งได้อีก ' + q + ' ฉบับ (รีเซ็ตทุก 24 ชม.)');
  // ขนาดชีต
  let cells = 0; const sheets = ss.getSheets().map(sh => { const r = sh.getLastRow(), c = sh.getLastColumn(), n = (sh.getMaxRows ? sh.getMaxRows() : r) * (sh.getMaxColumns ? sh.getMaxColumns() : c); cells += n; return { name: sh.getName(), rows: Math.max(0, r - 1), cols: c, cells: n, hidden: sh.isSheetHidden ? sh.isSheetHidden() : false }; }).sort((a, b) => b.cells - a.cells);
  const pct = Math.round(cells / 10000000 * 1000) / 10;
  add('size', pct > 80 ? 'bad' : pct > 50 ? 'warn' : 'ok', 'ขนาด Google Sheet', 'ใช้ ' + cells.toLocaleString() + ' เซลล์ จาก 10,000,000 (' + pct + '%)');
  // บันทึกการแก้ไขขนาดใหญ่
  const lg = ss.getSheetByName(SH.LOG); const ln = lg ? lg.getLastRow() : 0;
  add('log', ln > 150000 ? 'warn' : 'ok', 'บันทึกการแก้ไข', ln.toLocaleString() + ' แถว' + (ln > 150000 ? ' · ควรย้ายบันทึกเก่าไปไฟล์เก็บถาวร' : ''), 'pLogs');
  // การตั้งค่า
  const miss = []; if (!set.APP_URL) miss.push('ลิงก์เว็บแอป (APP_URL)'); if (!set.DRIVE_FOLDER_ID) miss.push('โฟลเดอร์ Drive');
  add('cfg', miss.length ? 'warn' : 'ok', 'การตั้งค่าพื้นฐาน', miss.length ? 'ยังไม่ได้ตั้ง: ' + miss.join(', ') : 'ครบ', 'pSettings');
  const am = advisorMap_(), noMail = Object.keys(am).filter(a => !am[a]).length;
  add('adv', noMail ? 'warn' : 'ok', 'อีเมลอาจารย์ที่ปรึกษา', noMail ? 'ยังไม่มีอีเมล ' + noMail + ' ท่าน (เข้าพอร์ทัล/รับรายชื่อไม่ได้)' : 'ครบทุกท่าน', 'pMaster');
  // ข้อผิดพลาดล่าสุดจากงานอัตโนมัติ
  const errs = []; if (lg && ln > 1) { const n = Math.min(ln - 1, 3000); lg.getRange(ln - n + 1, 1, n, 5).getValues().forEach(r => { if (/ไม่สำเร็จ|ผิดพลาด/.test(String(r[2]) + String(r[4])) && r[0] instanceof Date && Date.now() - r[0].getTime() < 14 * 86400000) errs.push({ t: Utilities.formatDate(r[0], 'Asia/Bangkok', 'd/M/yyyy HH:mm'), a: String(r[2]), d: String(r[4]).slice(0, 200) }); }); }
  add('err', errs.length ? 'warn' : 'ok', 'ข้อผิดพลาด 14 วันล่าสุด', errs.length ? errs.length + ' รายการ' : 'ไม่พบ');
  let ver = ''; try { ver = Session.getScriptTimeZone(); } catch (e) {}
  log_(s.u, 'ตรวจสุขภาพระบบ', '', C.filter(c => c.st !== 'ok').length + ' รายการที่ควรดู');
  return { checks: C, triggers: H.map(h => NAME[h] || h), sheets: sheets.slice(0, 40), cells, pct, errors: errs.slice(-20).reverse(), at: Utilities.formatDate(new Date(), 'Asia/Bangkok', 'd/M/yyyy HH:mm'), tz: ver,
    daily: H.indexOf('dailyJobs') >= 0, inbox: { emails: set.INBOX_EMAILS || '', notify: set.INBOX_NOTIFY !== 'off' }, cal: set.CAL_EMAILS || '', access: { on: set.ACCESS_REPORT !== 'off', emails: set.ACCESS_REPORT_EMAILS || '' }, owner: s.role === 'owner',
    logArc: { keep: Number(set.LOG_KEEP_M || 12), url: (() => { try { const id = PropertiesService.getScriptProperties().getProperty('LOGARC_ID'); return id ? 'https://docs.google.com/spreadsheets/d/' + id : ''; } catch (e) { return ''; } })() } };
}

// ======================= ข้อมูลนักศึกษารายภาค (ภาพข้อมูล ณ แต่ละภาค) =======================
/** บันทึกชั้นปี/สถานะ/หลักสูตร/อาจารย์ ของนักศึกษาทุกคน ณ ภาค k (แทนที่ของเดิมของภาคนั้น) */
function termSnapSave_(k, by, src) {
  const t = readTable_(SH.STUDENTS), H = idx_(t.headers), now = new Date();
  const sh = ensureSheetLazy_(SH.TERMSNAP, TERMSNAP_HEADERS); if (!sh.isSheetHidden()) sh.hideSheet();
  const keep = sh.getLastRow() > 1 ? sh.getDataRange().getValues().slice(1).filter(r => Number(r[0]) !== k) : [];
  const add = t.rows.filter(r => normId_(r[0])).map(r => [k, normId_(r[0]), r[H['ชั้นปี']], String(r[H['สถานะ']] || ''), String(r[H['หลักสูตร']] || ''), normAdv_(r[H['อาจารย์ที่ปรึกษา']]), now, src || '']);
  const all = keep.concat(add);
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, TERMSNAP_HEADERS.length).clearContent();
  if (all.length) { sh.getRange(2, 1, all.length, TERMSNAP_HEADERS.length).setValues(all); sh.getRange(2, 2, all.length, 1).setNumberFormat('@'); }
  if (sh.getLastRow() > all.length + 1) try { sh.deleteRows(all.length + 2, sh.getLastRow() - all.length - 1); } catch (e) {}
  delete MEMO_.tsnap; log_(by, 'บันทึกข้อมูลนักศึกษา ณ ภาค', '', termLabel_(k) + ' · ' + add.length + ' คน · ' + (src || ''));
  return add.length;
}
function termSnaps_() {
  return memo_('tsnap', () => { const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.TERMSNAP), o = {};
    if (!sh || sh.getLastRow() < 2) return o;
    sh.getDataRange().getValues().slice(1).forEach(r => { const k = Number(r[0]); if (!k) return; const S = o[k] = o[k] || { at: r[6] instanceof Date ? Utilities.formatDate(r[6], 'Asia/Bangkok', 'd/M/yyyy HH:mm') : '', src: String(r[7] || ''), m: {} };
      S.m[normId_(r[1])] = [r[2], String(r[3]), String(r[4]), String(r[5])]; });
    return o; });
}
function adminTermSnapList(token) {
  auth_(token); const S = termSnaps_();
  return Object.keys(S).map(Number).sort((a, b) => b - a).map(k => { const m = S[k].m, ids = Object.keys(m), st = {};
    ids.forEach(id => st[m[id][1]] = (st[m[id][1]] || 0) + 1); return { key: k, label: termLabel_(k), n: ids.length, at: S[k].at, src: S[k].src, status: st }; });
}
/** {id: [ชั้นปี, สถานะ, หลักสูตร, อาจารย์]} ของภาค k (ใช้แสดงสถานะ/ชั้นปี ณ ภาคนั้น) */
function adminTermSnapGet(token, k) { const s = auth_(token); k = Number(k); const S = termSnaps_()[k]; log_(s.u, 'ดูข้อมูลนักศึกษา ณ ภาค', '', termLabel_(k)); return S ? { key: k, label: termLabel_(k), at: S.at, m: S.m } : null; }
function adminTermSnapSave(token, k) {
  const s = tabGuard_(auth_(token, true), 'pTerm'); k = Number(k) || curTerm_(); if (!(k > 25000)) throw new Error('ยังไม่ได้ตั้งภาคปัจจุบัน');
  return withLock_(() => { termSnapSave_(k, s.u, 'บันทึกด้วยตนเอง'); return adminTermSnapList(token); });
}
/** เปรียบเทียบ 2 ภาค: เปลี่ยนสถานะ / เข้าใหม่ / หายไป / เลื่อนชั้นปี / เปลี่ยนอาจารย์ */
function adminTermCompare(token, a, b) {
  const s = auth_(token); a = Number(a); b = Number(b); const S = termSnaps_(), A = S[a], Bb = S[b];
  if (!A || !Bb) throw new Error('ยังไม่มีข้อมูลของภาคที่เลือก');
  const t = readTable_(SH.STUDENTS), H = idx_(t.headers), nm = {}; t.rows.forEach(r => nm[normId_(r[0])] = String(r[H['คำนำหน้า']] || '') + r[H['ชื่อ']] + ' ' + r[H['นามสกุล']]);
  const out = { a: termLabel_(a), b: termLabel_(b), status: [], added: [], gone: [], year: 0, adv: [], flow: {} };
  Object.keys(Bb.m).forEach(id => { const y = Bb.m[id], x = A.m[id];
    if (!x) { out.added.push({ id, name: nm[id] || '', year: y[0], st: y[1] }); return; }
    if (x[1] !== y[1]) { out.status.push({ id, name: nm[id] || '', year: y[0], from: x[1], to: y[1] }); const f = x[1] + ' → ' + y[1]; out.flow[f] = (out.flow[f] || 0) + 1; }
    if (String(x[0]) !== String(y[0])) out.year++;
    if (x[3] !== y[3]) out.adv.push({ id, name: nm[id] || '', from: x[3], to: y[3] }); });
  Object.keys(A.m).forEach(id => { if (!Bb.m[id]) out.gone.push({ id, name: nm[id] || '', year: A.m[id][0], st: A.m[id][1] }); });
  log_(s.u, 'เปรียบเทียบข้อมูลนักศึกษารายภาค', '', out.a + ' → ' + out.b);
  return out;
}

// ======================= อาจารย์ที่ปรึกษา: สาขาวิชา (กลุ่ม) =======================
/** { ชื่ออาจารย์: {email, note, dept} } */
function advisorInfo_() {
  return memo_('advinfo', () => { const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.ADVISORS), o = {};
    if (!sh || sh.getLastRow() < 2) return o;
    sh.getRange(2, 1, sh.getLastRow() - 1, Math.max(4, sh.getLastColumn())).getValues().forEach(r => { const n = normAdv_(r[0]); if (n) o[n] = { email: String(r[1] || '').trim(), note: String(r[2] || ''), dept: String(r[3] || '').trim() }; });
    return o; });
}
/** รายชื่อสาขาวิชา (ตามลำดับที่ตั้งไว้ใน ADV_DEPTS แล้วตามด้วยที่พบในรายชื่อ) */
function advDepts_() {
  const saved = String(getSettings_().ADV_DEPTS || '').split('|').map(x => x.trim()).filter(Boolean), AI = advisorInfo_();
  const used = [...new Set(Object.keys(AI).map(n => AI[n].dept).filter(Boolean))];
  return [...new Set(saved.concat(used.sort((a, b) => a.localeCompare(b, 'th'))))];
}
/** ย้ายอาจารย์หลายท่านเข้าสาขาวิชา (dept = '' คือนำออกจากกลุ่ม) */
function adminAdvisorSetDept(token, names, dept) {
  const s = auth_(token, true); tabGuard_(s, 'pMaster');
  dept = safe_(String(dept || '').trim().slice(0, 80)); const want = {}; [].concat(names || []).forEach(n => want[normAdv_(n)] = 1);
  return withLock_(() => {
    const sh = sheet_(SH.ADVISORS); ensureHeaders_(sh, ADVISOR_HEADERS);
    const v = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues() : []; let n = 0;
    v.forEach(r => { if (want[normAdv_(r[0])]) { r[3] = dept; n++; } });
    // ชื่อที่อยู่ในข้อมูลนักศึกษาแต่ยังไม่มีในชีต → เพิ่มให้
    Object.keys(want).filter(k => k && !v.some(r => normAdv_(r[0]) === k)).forEach(k => { v.push([k, '', '', dept]); n++; });
    if (v.length) sh.getRange(2, 1, v.length, 4).setValues(v);
    if (dept) { const L = advDepts_(); if (L.indexOf(dept) < 0) L.push(dept); setSetting_('ADV_DEPTS', L.join('|')); }
    delete MEMO_.advinfo; delete MEMO_.advmap;
    log_(s.u, dept ? 'จัดอาจารย์เข้าสาขาวิชา' : 'นำอาจารย์ออกจากสาขาวิชา', '', (dept || '-') + ' · ' + n + ' ท่าน');
    return n;
  });
}
/** จัดการรายชื่อสาขาวิชา: op = add | rename | delete | order */
function adminAdvDeptSave(token, op, a, b) {
  const s = auth_(token, true); tabGuard_(s, 'pMaster');
  return withLock_(() => {
    let L = advDepts_(); a = safe_(String(a || '').trim().slice(0, 80)); b = safe_(String(b || '').trim().slice(0, 80));
    if (op === 'add') { if (!a) throw new Error('กรุณากรอกชื่อสาขาวิชา'); if (L.indexOf(a) >= 0) throw new Error('มีสาขาวิชานี้แล้ว'); L.push(a); }
    else if (op === 'rename') { if (!b) throw new Error('กรุณากรอกชื่อใหม่'); if (L.indexOf(b) >= 0 && a !== b) throw new Error('มีสาขาวิชานี้แล้ว'); L = L.map(x => x === a ? b : x);
      const sh = sheet_(SH.ADVISORS), v = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues() : []; v.forEach(r => { if (String(r[3]).trim() === a) r[3] = b; }); if (v.length) sh.getRange(2, 1, v.length, 4).setValues(v); }
    else if (op === 'delete') { L = L.filter(x => x !== a);
      const sh = sheet_(SH.ADVISORS), v = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues() : []; v.forEach(r => { if (String(r[3]).trim() === a) r[3] = ''; }); if (v.length) sh.getRange(2, 1, v.length, 4).setValues(v); }
    else if (op === 'order') { const i = L.indexOf(a), j = i + Number(b); if (i >= 0 && j >= 0 && j < L.length) { L.splice(i, 1); L.splice(j, 0, a); } }
    setSetting_('ADV_DEPTS', L.join('|')); delete MEMO_.advinfo;
    log_(s.u, 'จัดการสาขาวิชา (อาจารย์ที่ปรึกษา)', '', op + ' ' + a + (op === 'rename' ? ' → ' + b : ''));
    return advDepts_();
  });
}

// ======================= ภาคการศึกษาของข้อมูลนักศึกษา (ผู้ดูแลกำหนด ไม่อิงภาคของเกรด) =======================
/** รายการภาคที่อัปเดตข้อมูลนักศึกษาแล้ว (ปี*10+ภาค) เรียงจากเก่าไปใหม่ */
function dataTerms_() {
  return memo_('dterms', () => String(getSettings_().DATA_TERMS || '').split(',').map(x => Number(x.trim())).filter(k => k > 25000 && k % 10 >= 1 && k % 10 <= 3).sort((a, b) => a - b));
}
/** ภาคปัจจุบันของฐานข้อมูลนักศึกษา = ค่าที่ผู้ดูแลตั้ง (CUR_TERM) หรือภาคล่าสุดที่อัปเดต · ไม่มี = 0 (ระบบจะใช้ภาคล่าสุดของเกรดแทน) */
function curTerm_() {
  const c = Number(getSettings_().CUR_TERM) || 0, L = dataTerms_();
  return c && L.indexOf(c) >= 0 ? c : (L.length ? L[L.length - 1] : 0);
}
function addDataTerm_(k, makeCur) {
  const L = dataTerms_(); if (L.indexOf(k) < 0) L.push(k);
  setSetting_('DATA_TERMS', L.sort((a, b) => a - b).join(','));
  delete MEMO_.dterms;
  if (makeCur && k >= curTerm_()) setSetting_('CUR_TERM', String(k));
  clearDashCache_();
}
/** เพิ่ม/เลือกภาคการศึกษาปัจจุบันของข้อมูลนักศึกษา (owner/admin) */
function adminSetDataTerm(token, year, term) {
  const s = auth_(token, true); tabGuard_(s, 'pTerm');
  const y = Number(year), t = Number(term);
  if (!(y >= 2500 && y <= 2700) || [1, 2, 3].indexOf(t) < 0) throw new Error('ปี/ภาคการศึกษาไม่ถูกต้อง');
  const k = y * 10 + t;
  return withLock_(() => {
    addDataTerm_(k, false); setSetting_('CUR_TERM', String(k)); clearDashCache_();
    if (!termSnaps_()[k]) try { termSnapSave_(k, s.u, 'ตั้งภาคปัจจุบัน'); } catch (e) {}
    log_(s.u, 'ตั้งภาคการศึกษาปัจจุบัน', '', termLabel_(k));
    return { curTerm: k, dataTerms: dataTerms_() };
  });
}
function adminRemoveDataTerm(token, key) {
  const s = auth_(token, true); tabGuard_(s, 'pTerm'); key = Number(key);
  return withLock_(() => {
    const L = dataTerms_().filter(k => k !== key);
    setSetting_('DATA_TERMS', L.join(',')); delete MEMO_.dterms;
    if (Number(getSettings_().CUR_TERM) === key) setSetting_('CUR_TERM', String(L.length ? L[L.length - 1] : ''));
    clearDashCache_();
    log_(s.u, 'ลบภาคการศึกษาออกจากรายการ', '', termLabel_(key));
    return { curTerm: curTerm_(), dataTerms: dataTerms_() };
  });
}


// ======================= รอบผลตรวจสิทธิ์ (บันทึกผลเป็นรอบ · เทียบการเปลี่ยนแปลง · แจ้งเตือนอัตโนมัติ) =======================
const ELIG_MODE_TH = { intern4: 'ฝึกงานปี 4', intern6: 'ฝึกงานปี 6', grad: 'สำเร็จการศึกษา', overdue: 'ตกค้าง' };
/** ผลหลังตรวจทาน (ใช้ค่าที่เจ้าหน้าที่ติ๊กแก้) */
function eligFinalSt_(r) {
  if (!r.checks || !r.checks.length) return r.status;
  const ov = (r.rev && r.rev.ov) || {};
  return r.checks.some(c => c.sev === 'block' && (Object.prototype.hasOwnProperty.call(ov, c.id) ? ov[c.id] : c.pass) === false) ? 'no' : 'ok';
}
/** ข้อมูลย่อของผลตรวจ: { id: [ผล, 'F ค้าง (รหัสวิชา|...)', 'เงื่อนไขที่ไม่ผ่าน (id|...)', ชื่อ] } */
function eligSnapData_(res) {
  const o = {};
  res.rows.forEach(r => {
    const ov = (r.rev && r.rev.ov) || {};
    const fails = (r.checks || []).filter(c => (Object.prototype.hasOwnProperty.call(ov, c.id) ? ov[c.id] : c.pass) === false).map(c => c.id);
    o[r.id] = [eligFinalSt_(r), (r.fl || []).filter(x => !x.fixed).map(x => x.code).join('|'), fails.join('|'), r.name];
  });
  return o;
}
function eligSnapSum_(D) { const n = { ok: 0, no: 0, nodata: 0, noplan: 0 }; Object.keys(D).forEach(k => n[D[k][0]] = (n[D[k][0]] || 0) + 1); n.total = Object.keys(D).length; return n; }
function eligSnapWrite_(mode, round, label, type, user, D) {
  const sh = ensureSheetLazy_(SH.ELIGSNAP, ELIGSNAP_HEADERS); if (!sh.isSheetHidden()) sh.hideSheet();
  const js = JSON.stringify(D), parts = []; for (let i = 0; i < js.length; i += 45000) parts.push(js.slice(i, i + 45000));
  if (parts.length > 6) throw new Error('ข้อมูลมากเกินกว่าจะบันทึกเป็นรอบได้');
  const id = 'SN' + Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyyMMddHHmmss') + Math.floor(Math.random() * 90 + 10);
  const row = [id, mode, round, label, type, new Date(), user, Object.keys(D).length, JSON.stringify(eligSnapSum_(D))].concat(parts);
  while (row.length < ELIGSNAP_HEADERS.length) row.push('');
  sh.appendRow(row);
  return id;
}
function eligSnapRows_(mode) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.ELIGSNAP);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, 9).getValues().map((r, i) => ({ row: i + 2, id: String(r[0]), mode: r[1], round: r[2], label: String(r[3]), type: r[4],
    ts: r[5] instanceof Date ? r[5].getTime() : 0, time: r[5] instanceof Date ? Utilities.formatDate(r[5], 'Asia/Bangkok', 'd/M/yyyy HH:mm') : String(r[5]), by: r[6], n: r[7], sum: (() => { try { return JSON.parse(r[8]); } catch (e) { return {}; } })() }))
    .filter(x => !mode || x.mode === mode).sort((a, b) => b.ts - a.ts);
}
function eligSnapLoad_(snapId) {
  const x = eligSnapRows_('').find(r => r.id === snapId); if (!x) return null;
  const sh = sheet_(SH.ELIGSNAP), v = sh.getRange(x.row, 10, 1, 6).getValues()[0].join('');
  try { return { meta: x, data: JSON.parse(v) }; } catch (e) { return null; }
}
/** บันทึกผลตรวจรอบนี้ (ผู้ใช้กด) */
function adminEligSnapSave(token, mode, year, label) {
  const s = authW_(token); tabGuard_(s, 'pElig');
  const res = eligCompute_(mode, year), D = eligSnapData_(res);
  return withLock_(() => {
    const id = eligSnapWrite_(mode, res.round, String(label || '').slice(0, 80) || 'รอบ ' + Utilities.formatDate(new Date(), 'Asia/Bangkok', 'd/M/') + (Number(Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy')) + 543), 'manual', s.u, D);
    log_(s.u, 'บันทึกรอบผลตรวจสิทธิ์', '', ELIG_MODE_TH[mode] + ' · ' + label);
    return { id, list: eligSnapList_(mode) };
  }, true);
}
function eligSnapList_(mode) { return eligSnapRows_(mode).slice(0, 30).map(x => ({ id: x.id, label: x.label, type: x.type, time: x.time, by: x.by, n: x.n, sum: x.sum, round: x.round })); }
function adminEligSnapList(token, mode) { tabGuard_(auth_(token), 'pElig'); return eligSnapList_(mode); }
function adminEligSnapGet(token, snapId) { tabGuard_(auth_(token), 'pElig'); const x = eligSnapLoad_(snapId); if (!x) throw new Error('ไม่พบรอบที่เลือก'); return { meta: { id: x.meta.id, label: x.meta.label, time: x.meta.time, type: x.meta.type }, data: x.data }; }
function adminEligSnapDelete(token, snapId) {
  const s = auth_(token, true); tabGuard_(s, 'pElig');
  return withLock_(() => { const x = eligSnapRows_('').find(r => r.id === snapId); if (x) sheet_(SH.ELIGSNAP).deleteRow(x.row); log_(s.u, 'ลบรอบผลตรวจสิทธิ์', '', snapId); return x ? eligSnapList_(x.mode) : []; }, true);
}
/** เปรียบเทียบผล 2 ชุด → รายการคนที่ผลเปลี่ยน / F เปลี่ยน */
function eligDiff_(oldD, newD, only) {
  const out = [];
  Object.keys(newD).forEach(id => {
    if (only && !only[id]) return;
    const n = newD[id], o = oldD[id]; if (!o) return;
    const fo = o[1] ? o[1].split('|') : [], fn = n[1] ? n[1].split('|') : [];
    const fixed = fo.filter(c => fn.indexOf(c) < 0), added = fn.filter(c => fo.indexOf(c) < 0);
    if (o[0] !== n[0] || fixed.length || added.length) out.push({ id, name: n[3], from: o[0], to: n[0], fixed, added });
  });
  return out;
}
/**
 * แจ้งเตือนอัตโนมัติหลังอัปโหลดไฟล์ตรวจสอบจบ (REG): ตรวจทุกหัวข้อใหม่ เทียบกับผลครั้งก่อน (รอบอัตโนมัติ)
 * แล้วส่งอีเมลถึงผู้รับที่ตั้งไว้ · ids = รหัสนักศึกษาที่เพิ่งอัปโหลด (ว่าง = ทุกคน)
 */
function adminEligNotify(token, ids) {
  const s = authW_(token); tabGuard_(s, 'pElig');
  const only = {}; [].concat(ids || []).forEach(i => only[normId_(i)] = 1);
  const set = getSettings_(), result = { modes: [], emailed: '' };
  const RES = ['intern4', 'intern6', 'grad'].map(m => [m, eligCompute_(m, '')]);   // คำนวณก่อนเข้า lock (ใช้แคชในคำขอได้)
  return withLock_(() => {
    RES.forEach(([mode, res]) => {
      const D = eligSnapData_(res);
      const prev = eligSnapRows_(mode).find(x => x.type === 'auto' && x.round === res.round);
      let diff = [], baseline = false;
      if (prev) { const L = eligSnapLoad_(prev.id); diff = L ? eligDiff_(L.data, D, Object.keys(only).length ? only : null) : []; sheet_(SH.ELIGSNAP).deleteRow(prev.row); }
      else baseline = true;
      eligSnapWrite_(mode, res.round, 'อัตโนมัติ (หลังอัปโหลด REG)', 'auto', s.u, D);
      result.modes.push({ mode, label: ELIG_MODE_TH[mode] + ' (ชั้นปี ' + res.year + ')', baseline, total: res.rows.length, ok: res.rows.filter(r => eligFinalSt_(r) === 'ok').length, diff: diff.slice(0, 200) });
    });
    const changes = result.modes.reduce((a, m) => a + m.diff.length, 0);
    const to = String(set.ELIG_NOTIFY_EMAILS || '').split(/[\s,;]+/).filter(x => /@/.test(x));
    if (changes && set.ELIG_NOTIFY_ON !== 'off' && to.length) {
      const L = { ok: 'ครบ', no: 'ไม่ครบ', nodata: 'ไม่มีไฟล์', noplan: 'ไม่มีแผน' };
      const html = '<div style="font-family:Sarabun,Tahoma,sans-serif;font-size:14px;color:#1e2a1b"><h3 style="color:#465216;margin:0 0 6px">ผลตรวจสิทธิ์เปลี่ยนแปลงหลังอัปโหลดไฟล์ตรวจสอบจบ</h3><p style="color:#56614d;margin:0 0 12px">อัปโหลดโดย ' + s.u + ' · ' + Utilities.formatDate(new Date(), 'Asia/Bangkok', 'd/M/yyyy HH:mm') + '</p>' +
        result.modes.filter(m => m.diff.length).map(m => '<h4 style="margin:14px 0 6px;color:#6b7b28">' + m.label + ' · เปลี่ยน ' + m.diff.length + ' คน</h4><table cellpadding="6" style="border-collapse:collapse;font-size:13px">' +
          m.diff.map(d => '<tr style="border-bottom:1px solid #dfe2d3"><td>' + d.id + '</td><td>' + d.name + '</td><td>' + (d.from !== d.to ? '<b style="color:' + (d.to === 'ok' ? '#3d8b3d' : '#b5413a') + '">' + L[d.from] + ' → ' + L[d.to] + '</b>' : '') + (d.fixed.length ? ' <span style="color:#3d8b3d">แก้ F แล้ว: ' + d.fixed.join(', ') + '</span>' : '') + (d.added.length ? ' <span style="color:#b5413a">F ใหม่: ' + d.added.join(', ') + '</span>' : '') + '</td></tr>').join('') + '</table>').join('') +
        '<p style="margin-top:16px"><a href="' + pubLink_(true) + '" style="background:#6b7b28;color:#fff;padding:8px 16px;border-radius:8px;text-decoration:none">เปิดระบบตรวจสิทธิ์</a></p></div>';
      try { MailApp.sendEmail({ to: to.join(','), subject: '[ฐานข้อมูลนักศึกษา] ผลตรวจสิทธิ์เปลี่ยน ' + changes + ' รายการ', htmlBody: html, name: 'ฐานข้อมูลนักศึกษา เภสัชฯ มข.' }); result.emailed = to.join(', '); } catch (e) { result.emailError = e.message; }
    }
    log_(s.u, 'ตรวจการเปลี่ยนแปลงผลตรวจสิทธิ์', '', 'เปลี่ยน ' + changes + ' รายการ' + (result.emailed ? ' · แจ้ง ' + result.emailed : ''));
    return result;
  }, true);
}
function adminEligNotifySet(token, o) {
  const s = auth_(token, true); tabGuard_(s, 'pElig');
  const L = String(o.emails || '').toLowerCase().split(/[\s,;]+/).filter(x => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x));
  return withLock_(() => { setSetting_('ELIG_NOTIFY_EMAILS', [...new Set(L)].join(', ')); setSetting_('ELIG_NOTIFY_ON', o.on ? 'on' : 'off'); log_(s.u, 'ตั้งค่าแจ้งเตือนผลตรวจสิทธิ์', '', L.join(', ') + ' · ' + (o.on ? 'เปิด' : 'ปิด'));
    return { emails: getSettings_().ELIG_NOTIFY_EMAILS || '', on: getSettings_().ELIG_NOTIFY_ON !== 'off' }; });
}


// ======================= ประเมินสุขภาวะเบื้องต้นจากผลการเรียน (คัดกรอง ไม่ใช่การวินิจฉัย) =======================
/*
 * ฝ่ายพัฒนานักศึกษาไม่มีเกณฑ์คะแนน → ระบบประเมินเบื้องต้นจาก "สัญญาณจากผลการเรียน" + "การคาดการณ์ภาคหน้า" + "ผลแบบประเมิน (ถ้ามี)"
 * ผลลัพธ์ใช้ตัดสินว่า "ควรเชิญมาทำแบบประเมิน/พูดคุย" เท่านั้น
 */
const WB_LV = ['ปกติ', 'เฝ้าระวัง', 'ควรเชิญทำแบบประเมิน'];
const WB_CARE = ['ควรเชิญ', 'เชิญแล้ว', 'ทำแบบประเมินแล้ว', 'ติดตามต่อ', 'ปิดเรื่อง'];
function mhCare_() {
  return memo_('mhcare', () => {
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH.MHCARE), out = {};
    if (!sh || sh.getLastRow() < 2) return out;
    sh.getDataRange().getValues().slice(1).forEach(r => { const id = normId_(r[0]); if (id) out[id] = { st: String(r[1] || ''), note: String(r[2] || ''), by: String(r[3] || ''), at: r[4] instanceof Date ? r[4].getTime() : 0, atTxt: r[4] instanceof Date ? mhFmt_(r[4]) : '' }; });
    return out;
  });
}
/**
 * id, g = gradeSummary_ ของคนนั้น, f = fStats_ byId, mh = ผลแบบประเมินล่าสุด, care = สถานะการดูแล
 * คืน { score, lv(0-2), idx(0-100 ดัชนีสุขภาวะเบื้องต้น), src, reasons:[{t, w, k}], proj, care }
 */
function wbOf_(id, g, f, mh, care, r, H) {
  const set = getSettings_(), th = Number(set.GPAX_THRESHOLD || 2), wt = Number(set.GPAX_WATCH || 2.25);
  const LV = acadLevels_();
  const R = [], add = (k, w, t) => R.push({ k, w, t }), AX = { gpax: null, gpa: null, trend: null, prob: null, f: 0, proj: null, mh: null };
  let proj = '', band = -1, dis = false;
  if (g && g.h && g.h.length) {
    const reg = g.h.filter(x => x[0] % 10 !== 3);
    const gx = reg.filter(x => x[2] !== '' && x[2] != null).map(x => Number(x[2]));
    const gp = reg.filter(x => x[1] !== '' && x[1] != null).map(x => Number(x[1]));
    const cur = gx.length ? gx[gx.length - 1] : null, lastGpa = gp.length ? gp[gp.length - 1] : null, prevGpa = gp.length > 1 ? gp[gp.length - 2] : null;
    if (cur != null) { band = wbBand_(cur);
      if (band > 0) add(band === 1 ? 'gpaxw' : 'gpax', band >= 3 ? 4 : band === 2 ? 3 : 1, 'GPAX ' + cur.toFixed(2) + ' ต่ำกว่า ' + LV[band - 1].below.toFixed(2) + ' (' + LV[band - 1].label + ')'); }
    AX.gpax = wbRisk_(cur); AX.gpa = wbRisk_(lastGpa);
    if (gp.length >= 2) { const L3 = gp.slice(-3), n3 = L3.length, xm3 = (n3 - 1) / 2, ym3 = L3.reduce((a, b) => a + b, 0) / n3; let nu = 0, de = 0; L3.forEach((v, i) => { nu += (i - xm3) * (v - ym3); de += (i - xm3) * (i - xm3); }); const sl3 = de ? nu / de : 0; AX.trend = Math.round(Math.max(0, Math.min(100, -sl3 / 0.5 * 100))); }
    if (lastGpa != null && prevGpa != null && prevGpa - lastGpa >= 0.5) add('drop', 2, 'GPA ภาคล่าสุดลดลง ' + (prevGpa - lastGpa).toFixed(2) + ' (' + prevGpa.toFixed(2) + ' → ' + lastGpa.toFixed(2) + ')');
    else if (lastGpa != null && prevGpa != null && prevGpa - lastGpa >= 0.3) add('drop', 1, 'GPA ภาคล่าสุดลดลง ' + (prevGpa - lastGpa).toFixed(2));
    if (gp.length >= 3 && gp[gp.length - 1] < gp[gp.length - 2] && gp[gp.length - 2] < gp[gp.length - 3]) add('trend', 1, 'GPA ลดลงต่อเนื่อง 3 ภาค');
    if (lastGpa != null && lastGpa < 1.5) add('lowgpa', 2, 'GPA ภาคล่าสุด ' + lastGpa.toFixed(2) + ' (ต่ำมาก)');
    // สถานภาพ (รอพินิจ/พ้นสภาพ)
    const pr = probationOf_(g.h.map(x => ({ key: x[0], gpa: x[1], gpax: x[2] === '' ? '' : Number(x[2]) })), probCfg_(), { studied: studiedOf_(id) }); dis = pr.status === 'เข้าเกณฑ์พ้นสภาพ';
    AX.prob = pr.status === 'เข้าเกณฑ์พ้นสภาพ' ? 100 : pr.status === 'รอพินิจ' ? Math.min(90, 55 + pr.consec * 15) : pr.hist.length ? 0 : null;
    if (pr.status === 'เข้าเกณฑ์พ้นสภาพ') add('prob', 3, 'สถานภาพ: เข้าเกณฑ์พ้นสภาพ (เบื้องต้น)' + (pr.why.length ? ' · ' + pr.why.join(', ') : ''));
    else if (pr.status === 'รอพินิจ') add('prob', 2, 'สถานภาพ: รอพินิจ' + (pr.consec > 1 ? ' ติดต่อกัน ' + pr.consec + ' ภาค' : ''));
    // คาดการณ์ GPAX ภาคหน้า: คาด GPA ภาคหน้าจากแนวโน้ม GPA 3 ภาคล่าสุด แล้วเฉลี่ยเข้ากับ GPAX สะสม (ถือว่าหน่วยกิตแต่ละภาคใกล้เคียงกัน)
    if (gp.length >= 2 && cur != null) {
      const L = gp.slice(-3), n = L.length, xm = (n - 1) / 2, ym = L.reduce((a, b) => a + b, 0) / n;
      let num = 0, den = 0; L.forEach((v, i) => { num += (i - xm) * (v - ym); den += (i - xm) * (i - xm); });
      const sl = den ? num / den : 0, nextGpa = Math.max(0, Math.min(4, L[n - 1] + sl * 0.7));
      proj = (cur * gp.length + nextGpa) / (gp.length + 1); AX.proj = wbRisk_(proj);
      if (cur >= th && proj < th) add('proj', 2, 'คาดการณ์: GPAX ภาคหน้าอาจต่ำกว่าเกณฑ์ (~' + proj.toFixed(2) + ')');
      else if (cur >= th && sl < -0.2 && proj < wt) add('proj', 1, 'คาดการณ์: GPAX มีแนวโน้มลดลงเข้าช่วงเฝ้าระวัง (~' + proj.toFixed(2) + ')');
    }
  }
  if (f && f.open >= 2) add('f', 2, 'ติด F/U ค้าง ' + f.open + ' วิชา');
  else if (f && f.open === 1) add('f', 1, 'ติด F/U ค้าง 1 วิชา');
  if (f && f.times >= 3) add('fre', 1, 'เคยติด F รวม ' + f.times + ' ครั้ง');
  AX.f = f ? Math.min(100, (f.open || 0) * 35 + Math.max(0, (f.times || 0) - (f.open || 0)) * 10) : (g && g.h && g.h.length ? 0 : null);   // ยังไม่มีผลการเรียน → ไม่มีข้อมูล (ไม่ใช่ 0)
  if (mh && mh.rk >= 0) AX.mh = [5, 40, 70, 100][mh.rk];
  const y = Number(r[H['ชั้นปี']]), studied = memo_('acynow', acadYearNow_) - (2500 + Number(String(id).slice(0, 2))) + 1;
  if (studied > 6 || y > 6) add('over', 2, 'ศึกษามาแล้ว ' + studied + ' ปี (ตกค้าง)');
  // ผลแบบประเมินจากฝ่ายพัฒนานักศึกษา (ถ้ามีสถานะ/รายด้าน)
  if (mh && mh.rk >= 2) add('mh', mh.rk === 3 ? 4 : 2, 'ผลแบบประเมิน: ' + mh.risk);
  else if (mh && mh.rk === 1) add('mh', 1, 'ผลแบบประเมิน: เฝ้าระวัง');
  const score = R.reduce((a, x) => a + x.w, 0);
  let lv = score >= 4 ? 2 : score >= 2 ? 1 : 0;
  // ดัชนีสุขภาวะเบื้องต้น (0–100): ใช้ร้อยละจากแบบประเมินถ้ามี มิฉะนั้นคำนวณจากสัญญาณผลการเรียน
  const idx = mh && mh.p !== '' && mh.p != null ? mh.p : Math.max(5, 100 - score * 11);
  const c = care || null;
  if (dis) lv = 2;   // เข้าเกณฑ์พ้นสภาพตามเกณฑ์สถานภาพ → ควรเชิญเสมอ
  return { score, lv, idx, src: mh && mh.p !== '' && mh.p != null ? 'mh' : 'acad', reasons: R.sort((a, b) => b.w - a.w), proj: proj === '' ? '' : Math.round(proj * 100) / 100, band, dis, ax: AX,
    care: c ? c.st : '', careAt: c ? c.atTxt : '', careNote: c ? c.note : '', careBy: c ? c.by : '', mhAt: mh ? mh.d : '', mhTs: mh ? mh.ts : 0 };
}
/** รายชื่อทั้งหมดพร้อมสัญญาณ (หน้า "สุขภาพจิตนักศึกษา") */
function adminWBList(token) {
  const s = authMH_(token), out = wbList_();
  log_(s.u, 'ดูรายชื่อประเมินสุขภาวะเบื้องต้น', '', out.filter(x => x.lv === 2).length + ' คนควรเชิญ');
  return out;
}
function wbList_() { return verCache_('wbl', 3600, wbListRaw_); }
function wbListRaw_() {
  const t = readTable_(SH.STUDENTS), H = idx_(t.headers), sum = gradeSummary_(), fs = fStats_().byId, mh = mhLatest_(), care = mhCare_();
  const out = [];
  t.rows.forEach(r => {
    const id = normId_(r[0]); if (!id || String(r[H['สถานะ']]).trim() !== 'กำลังศึกษา') return;
    const w = wbOf_(id, sum[id], fs[id], mh[id], care[id], r, H);
    out.push(Object.assign({ id, name: String(r[H['คำนำหน้า']] || '') + r[H['ชื่อ']] + ' ' + r[H['นามสกุล']], year: r[H['ชั้นปี']], program: progLabel_(r, H), advisor: normAdv_(r[H['อาจารย์ที่ปรึกษา']]),
      gpax: sum[id] ? sum[id].gpax : '' }, w));
  });
  return out.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}
/** บันทึกสถานะการดูแล (ควรเชิญ/เชิญแล้ว/ทำแบบประเมินแล้ว/ติดตามต่อ/ปิดเรื่อง) ทีละหลายคน */
function adminWBCareSet(token, ids, st, note) {
  const s = authMH_(token);
  if (WB_CARE.indexOf(st) < 0 && st !== '') throw new Error('สถานะไม่ถูกต้อง');
  ids = [].concat(ids || []).map(normId_).filter(x => /^\d{9}-\d$/.test(x)).slice(0, 1000);
  return withLock_(() => {
    const sh = ensureSheetLazy_(SH.MHCARE, MHCARE_HEADERS); if (!sh.isSheetHidden()) sh.hideSheet();
    const v = sh.getDataRange().getValues(), pos = {}; for (let i = 1; i < v.length; i++) pos[normId_(v[i][0])] = i + 1;
    const now = new Date(), app = [];
    ids.forEach(id => { const row = [id, st, safe_(String(note || '').slice(0, 300)), s.u, now]; if (pos[id]) sh.getRange(pos[id], 1, 1, 5).setValues([row]); else app.push(row); });
    if (app.length) sh.getRange(sh.getLastRow() + 1, 1, app.length, 5).setValues(app);
    log_(s.u, 'บันทึกสถานะการดูแลสุขภาวะ', ids.length === 1 ? ids[0] : '', st + ' · ' + ids.length + ' คน');
    delete MEMO_.mhcare;
    return mhCare_();
  });
}

/** ช่วงระดับผลการเรียน (ตั้งค่าได้): ต่ำกว่า B1 = เฝ้าระวัง · ต่ำกว่า B2 = ต่ำกว่าเกณฑ์ · ต่ำกว่า B3 = เข้าเกณฑ์ตกออก */
function wbBands_() { return acadLevels_().map(l => l.below); }
function wbBand_(g) { return acadLevelOf_(g); }
/** แปลง GPA/GPAX เป็นคะแนนความน่ากังวล 0–100 ตามระดับที่ตั้งไว้ (≥3.00 = 0 · ระดับแรก = 30 · ระดับสุดท้าย = 85 · ≤1.50 = 100) */
function wbRisk_(g) {
  if (g === '' || g == null || isNaN(g)) return null; g = Number(g);
  const L = wbBands_().filter(v => v < 3 && v > 1.5), n = L.length, P = [[3, 0]].concat(L.map((v, i) => [v, n === 1 ? 50 : 30 + i * 55 / (n - 1)])).concat([[1.5, 100]]);
  if (g >= P[0][0]) return 0; if (g <= 1.5) return 100;
  for (let i = 1; i < P.length; i++) if (g >= P[i][0]) { const [x0, y0] = P[i - 1], [x1, y1] = P[i]; return Math.round(y1 + (g - x1) / (x0 - x1) * (y0 - y1)); }
  return 100;
}
function adminWBBandsSet(token, b) {
  const s = auth_(token, true);
  const c = JSON.parse(JSON.stringify(acadRules_())); [].concat(b || []).forEach((v, i) => { if (c.levels[i]) c.levels[i].below = Number(v); });
  adminAcadRulesSave(token, c); return wbBands_();
  const v = [Number(b[0]), Number(b[1]), Number(b[2])];
  if (!(v[0] > v[1] && v[1] > v[2] && v[2] > 0 && v[0] <= 4)) throw new Error('ต้องเรียงจากมากไปน้อย เช่น 2.50 > 2.00 > 1.75');
  return withLock_(() => { setSetting_('WB_BAND1', v[0].toFixed(2)); setSetting_('WB_BAND2', v[1].toFixed(2)); setSetting_('WB_BAND3', v[2].toFixed(2)); log_(s.u, 'ตั้งช่วงระดับผลการเรียน (คัดกรองสุขภาวะ)', '', v.join(' / ')); return wbBands_(); });
}

// ======================= เชื่อมโยงคำร้อง REQ (req.kku.ac.th) =======================
/*
 * วิธีทำงาน: เจ้าหน้าที่ล็อกอินระบบ REQ ตามปกติ แล้วกดบุ๊กมาร์ก "ซิงค์คำร้อง REQ"
 *  → สคริปต์อ่านคำร้องที่ "ดำเนินการเสร็จสิ้น" ของคณะ ผ่าน API ของ REQ ด้วยสิทธิ์ของเจ้าหน้าที่คนนั้น (ไม่เก็บรหัสผ่าน/โทเคน)
 *  → ส่งเฉพาะ เลขคำร้อง/ประเภท/รหัสนักศึกษา/ภาค/วันที่ มาที่ doPost พร้อมรหัสเชื่อมต่อ (REQ_SYNC_KEY)
 *  → ระบบบันทึกในชีต "คำร้อง REQ" และปรับสถานะ (อัตโนมัติ หรือรอผู้ดูแลยืนยัน)
 */
const REQ_HEADERS = ['REQ ID', 'ประเภท', 'รหัสนักศึกษา', 'ชื่อ-สกุล', 'ภาคที่มีผล', 'วันที่ยื่น', 'วันที่อนุมัติเสร็จ', 'ผลในระบบ', 'รายละเอียด', 'ซิงค์เมื่อ', 'ผู้ยืนยัน', 'ยืนยันเมื่อ', 'รหัสฟอร์ม'];
/** ค่าเริ่มต้น: หัวข้อคำร้องที่เชื่อมโยง (ปรับได้ที่เมนู คำร้อง REQ) · act = สถานะใหม่ หรือ '' = บันทึกข้อมูลอย่างเดียว */
const REQ_DEF_FORMS = { req11: { on: true, title: 'ลาพักการศึกษา', act: 'ลาพัก' }, req13: { on: true, title: 'คืนสภาพนักศึกษา', act: 'กำลังศึกษา' } };
const REQ_ACTS = ['ลาพัก', 'กำลังศึกษา', 'ลาออก', 'พ้นสภาพ', 'ย้ายคณะ', 'สำเร็จการศึกษา'];
/** หัวข้อคำร้องทั้งหมด (จาก REQ) + การตั้งค่าแต่ละหัวข้อ */
function reqForms_() {
  const S = getSettings_(); let cfg = {}, list = [];
  try { cfg = JSON.parse(S.REQ_FORMS || '{}') || {}; } catch (e) {}
  try { list = JSON.parse(S.REQ_FORM_LIST || '[]') || []; } catch (e) {}
  const out = {};
  Object.keys(REQ_DEF_FORMS).forEach(k => out[k] = Object.assign({ code: k }, REQ_DEF_FORMS[k]));
  list.forEach(f => { if (f && f.code) out[f.code] = Object.assign({ code: f.code, on: false, act: '' }, out[f.code] || {}, { title: f.title || (out[f.code] || {}).title || f.code }); });
  Object.keys(cfg).forEach(k => { if (out[k]) { out[k].on = !!cfg[k].on; out[k].act = REQ_ACTS.indexOf(cfg[k].act) >= 0 ? cfg[k].act : ''; } });
  return out;
}
/** รูปแบบเดิม (label/to) ของหัวข้อที่เปิดใช้ */
function reqTypes_() { const F = reqForms_(), o = {}; Object.keys(F).forEach(k => { if (F[k].on) o[k] = { label: F[k].title, to: F[k].act }; }); return o; }
const REQ_FAC = 15;   // รหัสคณะเภสัชศาสตร์ในระบบ REQ
function reqCfg_() {
  const S = getSettings_();
  let key = String(S.REQ_SYNC_KEY || '');
  if (!key) { key = Utilities.getUuid().replace(/-/g, ''); setSetting_('REQ_SYNC_KEY', key); }
  const def = Utilities.formatDate(new Date(Date.now() - 120 * 86400000), 'Asia/Bangkok', 'yyyy-MM-dd');
  let last = ''; try { last = PropertiesService.getScriptProperties().getProperty('REQ_LAST') || ''; } catch (e) {}
  return { on: S.REQ_ON !== 'off', auto: S.REQ_AUTO === 'on', since: String(S.REQ_SINCE || def).slice(0, 10), key, last: last || String(S.REQ_LAST || '') };
}
function reqSheet_() {
  const sh = ensureSheet_(SH.REQ, REQ_HEADERS);
  if (sh.getLastColumn() < REQ_HEADERS.length) sh.getRange(1, 1, 1, REQ_HEADERS.length).setValues([REQ_HEADERS]).setFontWeight('bold').setBackground('#6b7b28').setFontColor('#ffffff');
  return sh;
}
function reqBookmarklet_(c) {
  const url = appUrl_();
  const js = "(async()=>{try{if(!/req\\.kku\\.ac\\.th$/.test(location.host)){alert('กรุณาเปิดหน้าเว็บ REQ (req.kku.ac.th) และล็อกอินก่อน แล้วกดบุ๊กมาร์กนี้อีกครั้ง');return}"
    + "const H={Authorization:'Bearer '+localStorage.getItem('access_token')};const fr=await fetch('/api/forms',{headers:H});if(!fr.ok){alert('ยังไม่ได้ล็อกอินระบบ REQ');return}"
    + "const C=" + JSON.stringify(Object.keys(reqTypes_())) + ";const F=(await fr.json()).filter(f=>C.indexOf(f.code)>=0);const out=[];"
    + "for(const f of F){for(let p=1;p<=30;p++){const r=await(await fetch('/api/requests?form='+f.id+'&status=success&faculty_id=" + REQ_FAC + "&paginate=true&size=100&page='+p+'&sort=-request_date',{headers:H})).json();"
    + "(r.docs||[]).forEach(d=>{const st=d.steps||[];if(!d.is_finished||d.status!=='success'||st.some(s=>s.is_approved===false))return;const ad=st.map(s=>s.approver_date).filter(Boolean).sort();"
    + "out.push([d.id,f.code,(d.student||{}).student_code,(d.form_data||{}).semester,(d.form_data||{}).acadyear,d.request_date,d.finished_date||ad[ad.length-1]||d.updated_at])});if(!r.hasNextPage)break}}"
    + "const m=document.createElement('form');m.method='POST';m.action=" + JSON.stringify(url) + ";m.target='_blank';"
    + "[['act','reqsync'],['key'," + JSON.stringify(c.key) + "],['payload',JSON.stringify(out)]].forEach(([n,v])=>{const i=document.createElement('input');i.type='hidden';i.name=n;i.value=v;m.appendChild(i)});"
    + "document.body.appendChild(m);m.submit();m.remove()}catch(e){alert('ซิงค์ไม่สำเร็จ: '+e.message)}})()";
  return 'javascript:' + encodeURIComponent(js);
}
/** สคริปต์ Tampermonkey: ทำงานเองทุกครั้งที่เปิด/กดอนุมัติในระบบ REQ (ไม่ต้องกดบุ๊กมาร์ก) */
function reqUserscript_(c) {
  return ['// ==UserScript==',
    '// @name         ซิงค์คำร้อง REQ → ฐานข้อมูลนักศึกษา เภสัชฯ มข.',
    '// @namespace    pharm-kku-studentdb',
    '// @version      1.1',
    '// @description  ส่งคำร้องลาพัก/คืนสภาพที่ดำเนินการเสร็จสิ้น ไปยังระบบฐานข้อมูลนักศึกษาอัตโนมัติ',
    '// @match        https://req.kku.ac.th/*',
    '// @grant        GM_xmlhttpRequest',
    '// @connect      script.google.com',
    '// @connect      script.googleusercontent.com',
    '// @run-at       document-idle',
    '// ==/UserScript==',
    '(function () {',
    "  const APP = " + JSON.stringify(appUrl_()) + ", KEY = " + JSON.stringify(c.key) + ", FAC = " + REQ_FAC + ";",
    "  let busy = false, last = 0;",
    "  const toast = t => { const d = document.createElement('div'); d.textContent = t; d.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:99999;background:#5b6b1a;color:#fff;padding:10px 16px;border-radius:10px;font:14px sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.25)'; document.body.appendChild(d); setTimeout(() => d.remove(), 6000); };",
    "  const post = d => new Promise(ok => GM_xmlhttpRequest({ method: 'POST', url: APP, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, data: JSON.stringify(Object.assign({ key: KEY }, d)), onload: x => { try { ok(JSON.parse(x.responseText)); } catch (e) { ok(null); } }, onerror: () => ok(null) }));",
    "  async function run(force) {",
    "    const tk = localStorage.getItem('access_token'); if (!tk || busy || (!force && Date.now() - last < 60000)) return;",
    "    busy = true; last = Date.now();",
    "    try {",
    "      const H = { Authorization: 'Bearer ' + tk }, fr = await fetch('/api/forms', { headers: H }); if (!fr.ok) return;",
    "      const all = await fr.json(), cf = await post({ act: 'reqforms', forms: all.map(f => ({ code: f.code, title: f.title_th })) });",
    "      if (!cf || !cf.ok) { if (cf && cf.error === 'BAD_KEY') toast('ซิงค์ REQ: รหัสเชื่อมต่อไม่ถูกต้อง กรุณาติดตั้งสคริปต์ใหม่'); return; }",
    "      const F = all.filter(f => cf.codes.indexOf(f.code) >= 0), out = [];",
    "      for (const f of F) for (let p = 1; p <= 3; p++) {",
    "        const r = await (await fetch('/api/requests?form=' + f.id + '&status=success&faculty_id=' + (cf.fac || FAC) + '&paginate=true&size=100&page=' + p + '&sort=-request_date', { headers: H })).json();",
    "        (r.docs || []).forEach(d => { const st = d.steps || []; if (!d.is_finished || d.status !== 'success' || st.some(s => s.is_approved === false)) return; const ad = st.map(s => s.approver_date).filter(Boolean).sort();",
    "          out.push([d.id, f.code, (d.student || {}).student_code, (d.form_data || {}).semester, (d.form_data || {}).acadyear, d.request_date, d.finished_date || ad[ad.length - 1] || d.updated_at]); });",
    "        if (!r.hasNextPage) break; }",
    "      const j = await post({ act: 'reqsync', items: out });",
    "      if (j && j.ok && j.added) toast('ฐานข้อมูลนักศึกษา: คำร้องใหม่ ' + j.added + ' รายการ' + (j.applied ? ' · ปรับสถานะแล้ว ' + j.applied : '') + (j.pending ? ' · แจ้งเตือนรอยืนยัน ' + j.pending : '')); else if (j && !j.ok) toast('ซิงค์ REQ ไม่สำเร็จ: ' + j.error);",
    "    } catch (e) { console.warn('REQ sync', e); } finally { busy = false; }",
    "  }",
    "  setTimeout(() => run(true), 3000); setInterval(() => run(false), 5 * 60000);",
    "  // หลังกดปุ่มอนุมัติ/ดำเนินการในระบบ REQ → ซิงค์อีกครั้ง",
    "  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('button'); if (b && /อนุมัติ|ดำเนินการ|ผ่านการตรวจสอบ|เห็นชอบ|ยืนยัน|บันทึก/.test(b.textContent || '')) setTimeout(() => run(true), 5000); }, true);",
    '})();'].join('\n');
}
/** รับข้อมูลจาก bookmarklet → บันทึก/ปรับสถานะ → คืนหน้าเว็บสรุปผล */
function reqSyncPage_(P) {
  const page = (title, body, ok) => HtmlService.createHtmlOutput('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:Sarabun,Tahoma,sans-serif;background:#f4f6ec;color:#222;margin:0;padding:24px}main{max-width:720px;margin:0 auto;background:#fff;border-radius:16px;padding:24px 28px;box-shadow:0 6px 24px rgba(0,0,0,.08)}h1{font-size:22px;margin:0 0 6px;color:' + (ok ? '#4b5a12' : '#b3261e') + '}table{border-collapse:collapse;width:100%;margin-top:12px;font-size:14px}td,th{border-bottom:1px solid #e5e8d8;padding:6px 8px;text-align:left}th{background:#f2f5e6}.k{display:inline-block;padding:2px 10px;border-radius:999px;background:#eef3d6;margin:2px 4px 2px 0;font-size:14px}a.b{display:inline-block;margin-top:16px;padding:10px 18px;border-radius:10px;background:#6b7d20;color:#fff;text-decoration:none}</style><main><h1>' + title + '</h1>' + body + '</main>').setTitle('ซิงค์คำร้อง REQ').addMetaTag('viewport', 'width=device-width, initial-scale=1');
  try {
    let R;
    try { R = reqSyncCore_(P.key, (() => { try { return JSON.parse(P.payload || '[]'); } catch (e) { return []; } })(), 'REQ (bookmarklet)'); }
    catch (x) { return page(x.message === 'REQ_OFF' ? 'ปิดการเชื่อมต่อ REQ อยู่' : 'รหัสเชื่อมต่อไม่ถูกต้อง', x.message === 'REQ_OFF' ? '<p>เปิดได้ที่เมนู คำร้อง REQ ในระบบฐานข้อมูลนักศึกษา</p>' : '<p>บุ๊กมาร์ก/สคริปต์นี้อาจเป็นรุ่นเก่า กรุณานำใหม่จากเมนู คำร้อง REQ</p>'); }
    const items = { length: R.read };
    const k = (t, n) => '<span class="k">' + t + ' <b>' + n + '</b></span>';
    const rows = R.rows.filter(r => r.res !== 'ซิงค์แล้วก่อนหน้า').slice(0, 200).map(r => '<tr><td>' + r.sid + '</td><td>' + esch_(r.name) + '</td><td>' + esch_(r.label) + '</td><td>' + r.term + '</td><td>' + r.res + '</td></tr>').join('');
    return page('ซิงค์คำร้อง REQ สำเร็จ', '<div>' + k('อ่านจาก REQ', items.length) + k('รายการใหม่', R.added) + k('ปรับสถานะแล้ว', R.applied) + k('รอยืนยัน', R.pending) + k('ไม่พบรหัสในระบบ', R.notFound) + '</div>'
      + (rows ? '<table><tr><th>รหัส</th><th>ชื่อ</th><th>คำร้อง</th><th>ภาค</th><th>ผล</th></tr>' + rows + '</table>' : '<p>ไม่มีคำร้องใหม่</p>')
      + '<a class="b" href="' + pubLink_(true, 'tab=req') + '" target="_top">เปิดระบบฐานข้อมูลนักศึกษา</a>', true);
  } catch (err) { return page('เกิดข้อผิดพลาด', '<p>' + esch_(err.message || err) + '</p>'); }
}
/** แกนกลาง: ตรวจรหัส → ทำความสะอาดข้อมูล → บันทึก/ปรับสถานะ */
function reqSyncCore_(key, raw, by) {
  const c = reqCfg_();
  if (!c.on) throw new Error('REQ_OFF');
  if (!key || String(key) !== c.key) throw new Error('BAD_KEY');
  let items = Array.isArray(raw) ? raw : []; const TY = reqTypes_();
  items = items.slice(0, 5000).map(a => ({ id: String(a[0] || '').replace(/[^\w-]/g, '').slice(0, 40), form: String(a[1] || ''), sid: normId_(a[2]), sem: String(a[3] || '').replace(/\D/g, '').slice(0, 1), yr: String(a[4] || '').replace(/\D/g, '').slice(0, 4), req: String(a[5] || '').slice(0, 30), fin: String(a[6] || '').slice(0, 30) }))
    .filter(x => x.id && TY[x.form] && /^\d{9}-\d$/.test(x.sid));
  const R = reqIngest_(items, c, by || 'REQ (อัตโนมัติ)', TY);
  R.read = items.length;
  try { PropertiesService.getScriptProperties().setProperty('REQ_LAST', dtTH_(new Date())); } catch (e) {}   // ไม่เขียนชีตตั้งค่า (เดิมล้างแคชทั้งระบบทุก 5 นาที)
  if (R.added) access_('(ระบบ REQ)', 'เชื่อมต่อ', 'ซิงค์คำร้อง REQ', items.length + ' รายการ · ใหม่ ' + R.added + ' · ปรับสถานะ ' + R.applied + ' · รอยืนยัน ' + R.pending);
  return R;
}
function esch_(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }
/** บันทึกคำร้องใหม่ (ไม่ซ้ำเลขคำร้อง) + ปรับสถานะตามคำร้องล่าสุดของแต่ละคน */
function reqIngest_(items, c, by, TY) {
  return withLock_(() => {
    const sh = reqSheet_(), ex = readTable_(SH.REQ), E = idx_(ex.headers), have = {};
    ex.rows.forEach(r => have[String(r[E['REQ ID']])] = 1);
    const st = sheet_(SH.STUDENTS), sv = st.getDataRange().getValues(), SHd = idx_(sv[0]), rowOf = {};
    for (let i = 1; i < sv.length; i++) { const k = normId_(sv[i][0]); if (k) rowOf[k] = i; }
    const fresh = items.filter(x => !have[x.id]);
    // คำร้องล่าสุดของแต่ละคน (ใช้ตัดสินสถานะ) — คำร้องเก่ากว่านั้นบันทึกเป็นประวัติ
    const latest = {}; fresh.filter(x => TY[x.form] && TY[x.form].to).forEach(x => { const k = x.sid; if (!latest[k] || String(x.fin) > String(latest[k].fin)) latest[k] = x; });
    const now = new Date(), out = [], hist = [], R = { added: 0, applied: 0, pending: 0, notFound: 0, rows: [] };
    fresh.sort((a, b) => String(a.fin).localeCompare(String(b.fin))).forEach(x => {
      const T = TY[x.form], term = (x.sem && x.yr) ? x.sem + '/' + x.yr : '', i = rowOf[x.sid];
      const name = i ? [sv[i][SHd['คำนำหน้า']], sv[i][SHd['ชื่อ']], ' ', sv[i][SHd['นามสกุล']]].join('').replace(/\s+/g, ' ').trim() : '';
      const finDt = x.fin ? new Date(x.fin) : null, finD = finDt && !isNaN(finDt) ? Utilities.formatDate(finDt, 'Asia/Bangkok', 'yyyy-MM-dd') : '';
      let res, det = '';
      if (i == null) { res = 'ไม่พบรหัสในระบบ'; R.notFound++; }
      else if (!T.to) { res = 'บันทึกข้อมูล'; }
      else if (latest[x.sid] !== x) { res = 'ประวัติ (มีคำร้องใหม่กว่า)'; }
      else if (finD && finD < c.since) { res = 'ประวัติ (ก่อนวันที่เริ่มนับ)'; }
      else if (String(sv[i][SHd['สถานะ']] || '').trim() === T.to) { res = 'สถานะตรงแล้ว'; }
      else if (c.auto) {
        const old = String(sv[i][SHd['สถานะ']] || ''); st.getRange(i + 1, SHd['สถานะ'] + 1).setValue(T.to); sv[i][SHd['สถานะ']] = T.to;
        hist.push([x.sid, old, T.to, term, 'คำร้อง REQ: ' + T.label, x.id, 'REQ (อัตโนมัติ)', by]); res = 'ปรับสถานะแล้ว'; det = old + ' → ' + T.to; R.applied++;
      } else { res = 'รอยืนยัน'; det = String(sv[i][SHd['สถานะ']] || '') + ' → ' + T.to; R.pending++; }
      out.push([x.id, T.label, x.sid, name, term, x.req && !isNaN(new Date(x.req)) ? new Date(x.req) : '', finDt && !isNaN(finDt) ? finDt : '', res, det, now, res === 'ปรับสถานะแล้ว' ? 'อัตโนมัติ' : '', res === 'ปรับสถานะแล้ว' ? now : '', x.form]);
      R.rows.push({ sid: x.sid, name, form: x.form, label: T.label, term, res }); R.added++;
    });
    // รายการรอยืนยันเดิมของคนที่มีคำร้องใหม่กว่า → เป็นประวัติ (กันยืนยันย้อนลำดับ)
    ex.rows.forEach((r, j) => { const k = normId_(r[E['รหัสนักศึกษา']]); if (String(r[E['ผลในระบบ']]) === 'รอยืนยัน' && latest[k] && String(latest[k].fin).slice(0, 10) >= fmtD_(r[E['วันที่อนุมัติเสร็จ']])) sh.getRange(j + 2, E['ผลในระบบ'] + 1).setValue('ประวัติ (มีคำร้องใหม่กว่า)'); });
    if (out.length) { const r0 = sh.getLastRow() + 1; sh.getRange(r0, 3, out.length, 1).setNumberFormat('@'); sh.getRange(r0, 5, out.length, 1).setNumberFormat('@'); sh.getRange(r0, 6, out.length, 2).setNumberFormat('dd/MM/yyyy HH:mm:ss');
      sh.getRange(r0, 1, out.length, REQ_HEADERS.length).setValues(out); }
    if (hist.length) addStatusHist_(hist);
    if (out.length) log_(by, 'ซิงค์คำร้อง REQ', '', out.length + ' รายการ · ปรับสถานะ ' + R.applied + ' · รอยืนยัน ' + R.pending);
    if (R.applied) clearDashCache_(); else if (out.length) ntBump_();   // ล้างแคชรวมเฉพาะเมื่อสถานะนักศึกษาเปลี่ยน
    return R;
  }, true);
}
/** หน้าเมนู: ตั้งค่า + รายการ */
function adminReqList(token) {
  const s = auth_(token); tabGuard_(s, 'pReq');
  const c = reqCfg_(), adm = ADMIN_ROLES.indexOf(s.role) >= 0;
  reqSheet_();   // สร้างชีต "คำร้อง REQ" อัตโนมัติถ้ายังไม่มี (ไม่ต้องรัน setup)
  const t = readTable_(SH.REQ), H = idx_(t.headers);
  const rows = t.rows.map(r => ({ id: String(r[H['REQ ID']]), type: r[H['ประเภท']], sid: normId_(r[H['รหัสนักศึกษา']]), name: r[H['ชื่อ-สกุล']], term: termStr_(r[H['ภาคที่มีผล']]), req: dtTH_(r[H['วันที่ยื่น']]), fin: dtTH_(r[H['วันที่อนุมัติเสร็จ']]), finK: r[H['วันที่อนุมัติเสร็จ']] instanceof Date ? r[H['วันที่อนุมัติเสร็จ']].getTime() : (Date.parse(r[H['วันที่อนุมัติเสร็จ']]) || 0), res: r[H['ผลในระบบ']], det: r[H['รายละเอียด']], at: r[H['ซิงค์เมื่อ']] ? dtTH_(r[H['ซิงค์เมื่อ']]) : '', by: r[H['ผู้ยืนยัน']] }))
    .sort((a, b) => b.finK - a.finK);
  const F = reqForms_();
  return { on: c.on, auto: c.auto, since: c.since, last: c.last, adm, bm: adm ? reqBookmarklet_(c) : '', us: adm ? reqUserscript_(c) : '', rows,
    forms: Object.keys(F).map(k => F[k]).sort((a, b) => (b.on - a.on) || String(a.code).localeCompare(String(b.code), undefined, { numeric: true })), acts: REQ_ACTS, formsSeen: !!getSettings_().REQ_FORM_LIST };
}
function fmtD_(v) { if (!v) return ''; if (v instanceof Date) return Utilities.formatDate(v, 'Asia/Bangkok', 'yyyy-MM-dd'); return String(v).slice(0, 10); }
function adminReqCfgSave(token, o) {
  const s = auth_(token, true);
  if (o.on != null) setSetting_('REQ_ON', o.on ? 'on' : 'off');
  if (o.auto != null) setSetting_('REQ_AUTO', o.auto ? 'on' : 'off');
  if (o.since && /^\d{4}-\d{2}-\d{2}$/.test(o.since)) setSetting_('REQ_SINCE', o.since);
  if (o.newKey) setSetting_('REQ_SYNC_KEY', Utilities.getUuid().replace(/-/g, ''));
  if (o.forms && typeof o.forms === 'object') { const cur = (() => { try { return JSON.parse(getSettings_().REQ_FORMS || '{}') || {}; } catch (e) { return {}; } })();
    Object.keys(o.forms).forEach(k => { if (/^[\w-]{1,20}$/.test(k)) cur[k] = { on: !!o.forms[k].on, act: REQ_ACTS.indexOf(o.forms[k].act) >= 0 ? o.forms[k].act : '' }; });
    setSetting_('REQ_FORMS', JSON.stringify(cur)); }
  log_(s.u, 'ตั้งค่าเชื่อมต่อ REQ', '', JSON.stringify({ on: o.on, auto: o.auto, since: o.since, newKey: !!o.newKey, forms: o.forms || undefined }).slice(0, 500));
  return adminReqList(token);
}
/** กดจากกระดิ่งแจ้งเตือน: ซิงค์สถานะลาพัก/คืนสภาพของคำร้องนั้นทันที */
function adminReqApplyOne(token, id) {
  const r = adminReqResolve(token, [String(id)], 'apply');
  const x = r.rows.find(y => y.id === String(id)) || {};
  return { res: x.res || '', name: x.name || '', sid: x.sid || '', det: x.det || '', type: x.type || '', term: x.term || '' };
}
/** ยืนยัน/ข้าม รายการที่รอยืนยัน · ids = [] → ทั้งหมดที่รอยืนยัน */
function adminReqResolve(token, ids, act) {
  const s = authW_(token); tabGuard_(s, 'pReq');
  withLock_(() => {
    const sh = reqSheet_(), v = sh.getDataRange().getValues(), H = idx_(v[0]);
    const st = sheet_(SH.STUDENTS), sv = st.getDataRange().getValues(), S = idx_(sv[0]), rowOf = {};
    for (let i = 1; i < sv.length; i++) { const k = normId_(sv[i][0]); if (k) rowOf[k] = i; }
    const want = ids && ids.length ? new Set(ids.map(String)) : null, now = new Date(), hist = [];
    const FM = reqForms_(), toOf = (lbl, code) => (code && FM[code] ? FM[code].act : (Object.values(FM).find(t => t.title === lbl) || {}).act);
    for (let j = 1; j < v.length; j++) {
      if (String(v[j][H['ผลในระบบ']]) !== 'รอยืนยัน' || (want && !want.has(String(v[j][H['REQ ID']])))) continue;
      let res = 'ข้าม', det = v[j][H['รายละเอียด']];
      if (act === 'apply') {
        const sid = normId_(v[j][H['รหัสนักศึกษา']]), i = rowOf[sid], to = toOf(v[j][H['ประเภท']], H['รหัสฟอร์ม'] != null ? String(v[j][H['รหัสฟอร์ม']] || '') : '');
        if (i == null || !to) res = 'ไม่พบรหัสในระบบ';
        else { const old = String(sv[i][S['สถานะ']] || ''); if (old !== to) { st.getRange(i + 1, S['สถานะ'] + 1).setValue(to); sv[i][S['สถานะ']] = to;
            hist.push([sid, old, to, termStr_(v[j][H['ภาคที่มีผล']]), 'คำร้อง REQ: ' + v[j][H['ประเภท']], v[j][H['REQ ID']], 'REQ (ยืนยันโดยผู้ดูแล)', s.u]); }
          res = 'ปรับสถานะแล้ว'; det = old + ' → ' + to; }
      }
      sh.getRange(j + 1, H['ผลในระบบ'] + 1, 1, 1).setValue(res); sh.getRange(j + 1, H['รายละเอียด'] + 1).setValue(det);
      sh.getRange(j + 1, H['ผู้ยืนยัน'] + 1, 1, 2).setValues([[s.u, now]]);
    }
    if (hist.length) addStatusHist_(hist);
    log_(s.u, act === 'apply' ? 'ยืนยันคำร้อง REQ' : 'ข้ามคำร้อง REQ', '', (ids && ids.length ? ids.length : 'ทั้งหมด') + ' รายการ');
  });
  return adminReqList(token);
}
