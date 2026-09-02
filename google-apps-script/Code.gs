const SPREADSHEET_ID = '1k6H3tHQT3nQyCASPB-dlFhg9CiYIC36F8egwofCGxVo';
const SHEET_NAME = '請示單';
const GOOGLE_CLIENT_ID = '773024892542-2rns6uushetnnlssmoar33qighomtl0j.apps.googleusercontent.com';

function doPost(e) {
  try {
    const data = JSON.parse((e.postData && e.postData.contents) || '{}');
    if (data.action !== 'createRequest') throw new Error('Unsupported action');
    const user = verifyGoogleCredential_(data.googleCredential);
    const sheet = getSheet_();
    const requestId = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
    (data.items || []).filter(item => item.name).forEach((item, index) => {
      sheet.appendRow([
        requestId, new Date(), user.email, data.date || '', data.applicant || '', data.department || '',
        data.purpose || '', data.budgetCode || '', index + 1, item.name || '', item.spec || '',
        item.unit || '', Number(item.qty || 0), Number(item.price || 0), Number(item.qty || 0) * Number(item.price || 0),
        item.note || '', Number(data.total || 0), data.deliveryDate || '', data.deliveryPlace || '', data.payment || ''
      ]);
    });
    return json_({ ok: true, requestId: requestId });
  } catch (error) { return json_({ ok: false, error: String(error) }); }
}

function getSheet_() {
  const book = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = book.insertSheet(SHEET_NAME);
  const headers = ['請示單編號','送出時間','登入Email','請購日期','申請人','申請單位','用途說明','預算科目','項次','品名','規格','單位','數量','單價','小計','備註','總額','交貨日期','交貨地點','支付方式'];
  if (sheet.getLastRow() > 0 && sheet.getRange(1, 3).getDisplayValue() !== '登入Email') sheet.insertColumnBefore(3);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, headers.length).setBackground('#205e49').setFontColor('#ffffff').setFontWeight('bold');
  return sheet;
}

function verifyGoogleCredential_(credential) {
  if (!credential) throw new Error('請先登入 Google 帳號');
  const url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(credential);
  const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (response.getResponseCode() !== 200) throw new Error('Google 登入憑證無效或已過期');
  const payload = JSON.parse(response.getContentText());
  if (payload.aud !== GOOGLE_CLIENT_ID || payload.email_verified !== 'true') throw new Error('Google 帳號驗證失敗');
  return { email: payload.email, name: payload.name || '' };
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
