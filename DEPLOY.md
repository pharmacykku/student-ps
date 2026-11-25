# เชื่อมโปรเจกต์กับ GitHub

## 1) เก็บโค้ดบน GitHub
1. สร้าง repository ใหม่แบบ **Private** (เช่น `student-db`)
2. อัปโหลดไฟล์ทั้งหมดในโฟลเดอร์นี้ (หรือ `git push`)
3. ไฟล์ข้อมูลนักศึกษา (.xlsx/.csv/.pdf) ถูกกันไว้ใน `.gitignore` — อย่าอัปข้อมูลจริงขึ้น GitHub

## 2) (ไม่บังคับ) อัปขึ้น Apps Script อัตโนมัติเมื่อแก้โค้ด
1. ที่ https://script.google.com/home/usersettings เปิด **Google Apps Script API**
2. บนเครื่องตัวเอง: `npm i -g @google/clasp` → `clasp login` → คัดลอกเนื้อหาไฟล์ `~/.clasprc.json`
3. ใน Apps Script editor → Project Settings → เปิด "Show appsscript.json" → คัดลอกไฟล์ `appsscript.json` มาไว้ใน repo
4. GitHub repo → Settings → Secrets and variables → Actions → เพิ่ม
   - `CLASPRC_JSON` = เนื้อหา `.clasprc.json`
   - `SCRIPT_ID` = Project Settings → Script ID
   - `DEPLOYMENT_ID` = Deploy → Manage deployments → Deployment ID ของ Web app ที่ใช้อยู่
5. push เข้า branch `main` → GitHub Actions อัปโค้ดและอัปเดต Web app เดิม (ลิงก์ /exec เดิม)

หมายเหตุ: `CLASPRC_JSON` คือสิทธิ์เข้าบัญชี Google ของผู้ login — เก็บใน Secrets เท่านั้น ห้ามใส่ในไฟล์
