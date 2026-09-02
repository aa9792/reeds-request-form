const SPREADSHEET_ID = '請貼上你的 Google Sheet ID';
const SHEET_NAME = '請示單';

function doPost(e) {
  try {
    const data = JSON.parse((e.postData && e.postData.contents) || '{}');
    if (data.action !== 'createRequest') throw new Error('Unsupported action');
    const sheet = getSheet_();
    const requestId = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
    (data.items || []).filter(item => item.name).forEach((item, index) => {
      sheet.appendRow([
        requestId, new Date(), data.date || '', data.applicant || '', data.department || '',
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
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['請示單編號','送出時間','請購日期','申請人','申請單位','用途說明','預算科目','項次','品名','規格','單位','數量','單價','小計','備註','總額','交貨日期','交貨地點','支付方式']);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 19).setBackground('#205e49').setFontColor('#ffffff').setFontWeight('bold');
  }
  return sheet;
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
