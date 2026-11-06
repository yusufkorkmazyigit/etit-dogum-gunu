/**
 * ETİT Üyeleri Doğum Günü İşaretleme Sistemi — Google Apps Script arka ucu
 *
 * Kurulum: README.md'deki adımları izle.
 * E-tabloda "Kayitlar" adlı sayfa otomatik oluşturulur:
 *   A: id | B: ad | C: gun | D: ay | E: token | F: guncelleme
 * token sütunu dışarıya hiç gönderilmez; kişinin kendi kaydını
 * sadece kendi tarayıcısından düzenleyip silebilmesini sağlar.
 */

const SHEET_NAME = 'Kayitlar';
const HEADERS = ['id', 'ad', 'gun', 'ay', 'token', 'guncelleme'];
const MAX_NAME = 60;
const MAX_ROWS = 2000;

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function readAll_() {
  const sh = getSheet_();
  const last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, HEADERS.length).getValues()
    .map((r, i) => ({ row: i + 2, id: String(r[0]), name: String(r[1]), day: Number(r[2]), month: Number(r[3]), token: String(r[4]) }))
    .filter(e => e.id && e.name && e.month >= 1 && e.month <= 12 && e.day >= 1 && e.day <= 31);
}

function publicList_() {
  return readAll_().map(e => ({ id: e.id, name: e.name, day: e.day, month: e.month }));
}

function validDate_(day, month) {
  if (!(month >= 1 && month <= 12)) return false;
  const max = new Date(2024, month, 0).getDate(); // 2024 artık yıl → 29 Şubat geçerli
  return day >= 1 && day <= max;
}

function cleanName_(s) {
  return String(s || '').replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, MAX_NAME);
}

function doGet() {
  return json_({ ok: true, entries: publicList_() });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    let body;
    try { body = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'Geçersiz istek' }); }
    const token = String(body.token || '');
    if (token.length < 16 || token.length > 100) return json_({ ok: false, error: 'Geçersiz anahtar' });

    const sh = getSheet_();
    const all = readAll_();
    const mine = all.find(r => r.token === token);

    if (body.action === 'save') {
      const name = cleanName_(body.name);
      const day = Number(body.day), month = Number(body.month);
      if (!name) return json_({ ok: false, error: 'İsim boş olamaz' });
      if (!validDate_(day, month)) return json_({ ok: false, error: 'Geçersiz tarih' });
      const now = new Date();
      if (mine) {
        sh.getRange(mine.row, 2, 1, 3).setValues([[name, day, month]]);
        sh.getRange(mine.row, 6).setValue(now);
      } else {
        if (all.length >= MAX_ROWS) return json_({ ok: false, error: 'Kayıt sınırı doldu' });
        sh.appendRow([Utilities.getUuid(), name, day, month, token, now]);
      }
      return json_({ ok: true, entries: publicList_(), myId: (mine ? mine.id : readAll_().find(r => r.token === token).id) });
    }

    if (body.action === 'delete') {
      if (mine) sh.deleteRow(mine.row);
      return json_({ ok: true, entries: publicList_(), myId: null });
    }

    if (body.action === 'whoami') {
      return json_({ ok: true, myId: mine ? mine.id : null });
    }

    return json_({ ok: false, error: 'Bilinmeyen işlem' });
  } finally {
    lock.releaseLock();
  }
}
