# 🚀 COPY-PASTE COMMANDS PHASE 1 & 2

Just copy and paste one of these commands. That's it!

---

## WINDOWS (PowerShell)

```powershell
cd "c:\Users\henry\Desktop\SPOFE-APP VERS 1.0\cascade" && powershell -ExecutionPolicy Bypass -File deploy-phase-1-2.ps1
```

**How:**
1. Open PowerShell
2. Copy the command above
3. Paste in PowerShell
4. Press Enter
5. Wait 15 minutes ✅

---

## MAC (Terminal)

```bash
cd ~/SPOFE-APP\ VERS\ 1.0/cascade && bash deploy-phase-1-2.sh
```

**How:**
1. Open Terminal
2. Copy the command above
3. Paste in Terminal
4. Press Enter
5. Wait 15 minutes ✅

---

## LINUX (Terminal)

```bash
cd ~/SPOFE-APP\ VERS\ 1.0/cascade && bash deploy-phase-1-2.sh
```

**How:**
1. Open Terminal
2. Copy the command above
3. Paste in Terminal
4. Press Enter
5. Wait 15 minutes ✅

---

## MANUAL OPTION (If scripts don't work)

**Terminal 1:**
```bash
cd cascade
npm run load:setup
npm run load:check
```

**Terminal 2:**
```bash
npm run dev
```

**Terminal 3 (after server is ready):**
```bash
npm run load:k6
```

**Terminal 4:**
```bash
npm run load:artillery
```

**Then:**
```bash
npm run load:report
```

---

## WHAT HAPPENS

✅ Installs K6 + Artillery (2 min)
✅ Starts dev server (5 min to warmup)
✅ Runs K6 baseline tests (5 min)
✅ Runs Artillery tests (3 min)
✅ Generates HTML reports (1 min)
✅ Shows summary (1 min)

**Total: ~15 minutes**

---

## EXPECTED OUTPUT

When done, you'll see:
- ✅ PHASE 1 COMPLETED
- ✅ PHASE 2 COMPLETED  
- ✅ PHASE 3 COMPLETED
- ✅ PHASE 4 COMPLETED
- ✅ Reports generated

Then navigate to: `load-test-reports/artillery-report.html` to see graphs!

---

## IF ANYTHING FAILS

1. Check port 3001 is free: `netstat -ano | findstr 3001`
2. Check Node.js: `node -v` (should be v18+)
3. Check npm: `npm -v`
4. Try manual option above
5. Check QUICK_START_PHASE_1_2.md troubleshooting

---

Done! That's all you need. Pick one command above and run it! 🚀

