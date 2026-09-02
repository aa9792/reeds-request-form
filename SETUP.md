# Google Sheets 連線

1. 建立一份 Google 試算表，從網址複製 `/d/` 與 `/edit` 之間的 Sheet ID。
2. 在「擴充功能 → Apps Script」貼上 `google-apps-script/Code.gs`，並替換 `SPREADSHEET_ID`。
3. 按「部署 → 新增部署作業 → 網頁應用程式」，執行身分選自己，存取權依校內需求設定。
4. 複製部署網址，建立 `.env.local`，設定 `NEXT_PUBLIC_GOOGLE_SCRIPT_URL=部署網址`。
5. 重新建置／部署網站。第一次表單送出時會自動建立「請示單」工作表與欄位標題。
