# 🌐 Deployment URLs Tracker

Use this document to track all your deployment URLs for easy reference during demos and submission.

---

## 📋 Active Deployment URLs

### Primary Deployment
| Platform | URL | Status | Notes |
|----------|-----|--------|-------|
| GitHub Spark | `https://your-app.github.app` | 🟢 Active | Primary hosting |

### Backup Deployments
| Platform | URL | Status | Last Updated | Notes |
|----------|-----|--------|--------------|-------|
| Netlify | `https://your-app.netlify.app` | ⚪ Not Set | - | Fastest backup option |
| Vercel | `https://your-app.vercel.app` | ⚪ Not Set | - | Auto-deploy from GitHub |
| Cloudflare | `https://your-app.pages.dev` | ⚪ Not Set | - | Global CDN |
| GitHub Pages | `https://username.github.io/repo` | ⚪ Not Set | - | Free .github.io domain |

### Emergency Options
| Method | URL/Access | When to Use |
|--------|------------|-------------|
| Local + ngrok | Run `./emergency-demo.sh` | All hosted versions down |
| Local dev | `http://localhost:5173` | Screen share only |
| Video Demo | YouTube/Vimeo URL | Ultimate fallback |

---

## 🚀 Quick Deploy Commands

### Netlify Drop (Fastest)
```bash
npm run build
# Then drag 'dist' folder to: https://app.netlify.com/drop
```

### Netlify CLI
```bash
npm install -g netlify-cli
./quick-deploy.sh
# Or manually:
npm run build
netlify deploy --prod --dir=dist
```

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### GitHub Pages
```bash
npm install --save-dev gh-pages
npm run build
npx gh-pages -d dist
```

---

## ✅ Pre-Demo Checklist

**24 Hours Before:**
- [ ] Test primary URL in incognito window
- [ ] Deploy to at least 2 backup platforms
- [ ] Test all backup URLs
- [ ] Upload video demo to YouTube/Vimeo
- [ ] Take screenshots of all major features
- [ ] Update this document with actual URLs

**1 Hour Before:**
- [ ] Re-test primary URL
- [ ] Re-test backup URLs
- [ ] Verify local dev environment works
- [ ] Have ngrok installed: `npm install -g ngrok`
- [ ] Have video demo link ready
- [ ] Have GitHub repository link ready

**During Demo:**
- [ ] Start with primary URL
- [ ] Have backup URL tabs open
- [ ] Have local dev server ready to start
- [ ] Have video demo queued up

---

## 📊 Deployment Status Tracking

### Current Status
- **Primary URL Working:** ✅ / ❌
- **Backup #1 Working:** ✅ / ❌
- **Backup #2 Working:** ✅ / ❌
- **Local Build Working:** ✅ / ❌
- **Video Demo Ready:** ✅ / ❌

### Last Verified
- **Primary:** [Date/Time]
- **Backups:** [Date/Time]
- **Local:** [Date/Time]

---

## 🔗 Related Links

### Repository & Code
- **GitHub Repository:** `https://github.com/username/repository`
- **Repository Branch:** `main`
- **Last Commit:** [Commit hash]

### Documentation
- **Devpost Submission:** `https://devpost.com/software/your-project`
- **Video Demo:** `https://youtube.com/watch?v=xxxxx`
- **Documentation:** [Link to docs]

### Accounts & Access
- **Netlify Dashboard:** `https://app.netlify.com`
- **Vercel Dashboard:** `https://vercel.com/dashboard`
- **GitHub Actions:** `https://github.com/username/repo/actions`

---

## 🐛 Known Issues & Workarounds

### Issue: 429 Rate Limit Error
**Problem:** GitHub API rate limiting on github.app  
**Workaround:** Use Netlify or Vercel backup URLs  
**Status:** Known limitation

### Issue: Tableau Embeds
**Problem:** Require actual Tableau Cloud credentials  
**Workaround:** Using mock/placeholder integration examples  
**Status:** Documented feature

---

## 📝 For Devpost Submission

When submitting to Devpost, include:

**Project URL (Required):**
```
Primary: [Your primary URL]
Backup: [Your backup URL]
```

**Repository URL (Required):**
```
https://github.com/username/repository
```

**Video Demo (Required):**
```
https://youtube.com/watch?v=xxxxx
```

**Additional URLs:**
```
Documentation: [Link to deployed docs]
Live Demo: [Additional demo URL if any]
```

---

## 💡 Deployment Strategy

### Recommended Approach

**For Maximum Reliability:**

1. **Primary:** Keep Spark github.app as main URL
2. **Backup 1:** Deploy to Netlify (fastest to set up)
3. **Backup 2:** Deploy to Vercel (automatic updates)
4. **Emergency:** Have local dev + ngrok ready
5. **Ultimate Fallback:** Video demo

**Priority Matrix:**

| Situation | Use This |
|-----------|----------|
| Everything normal | Primary URL (github.app) |
| Primary URL slow | Backup URL #1 (Netlify) |
| Primary URL down | Backup URL #2 (Vercel) |
| All URLs down | Local + ngrok |
| Internet issues | Video demo + screenshots |

---

## 🎯 Platform Comparison

| Platform | Setup Time | Cost | Custom Domain | Auto Deploy | SSL |
|----------|------------|------|---------------|-------------|-----|
| Spark (github.app) | ✅ Instant | Free | ❌ No | ✅ Yes | ✅ Yes |
| Netlify | ⚡ 2 min | Free | ✅ Yes | ✅ Yes | ✅ Yes |
| Vercel | ⚡ 5 min | Free | ✅ Yes | ✅ Yes | ✅ Yes |
| Cloudflare Pages | ⚡ 5 min | Free | ✅ Yes | ✅ Yes | ✅ Yes |
| GitHub Pages | 🐌 15 min | Free | ✅ Yes | ✅ Yes | ✅ Yes |

---

## 📞 Emergency Contacts

**If you need help during the demo:**

- **Spark Documentation:** [Link]
- **Netlify Status:** https://netlifystatus.com
- **Vercel Status:** https://vercel-status.com
- **GitHub Status:** https://githubstatus.com

---

## 🔄 Update History

Keep track of deployments and updates:

```
[Date] - Initial deployment to github.app
[Date] - Backup deployed to Netlify
[Date] - Backup deployed to Vercel
[Date] - Updated with latest features
[Date] - Pre-demo verification complete
```

---

## 📋 Quick Reference Card

**Print this or keep it handy during your demo:**

```
PRIMARY URL: ___________________________________________

BACKUP #1:   ___________________________________________

BACKUP #2:   ___________________________________________

VIDEO DEMO:  ___________________________________________

GITHUB REPO: ___________________________________________

EMERGENCY:   Run: ./emergency-demo.sh
             Or:  npm run dev (local only)

NOTES:
_______________________________________________________
_______________________________________________________
_______________________________________________________
```

---

**Last Updated:** [Date]  
**Verified By:** [Your Name]  
**Ready for Demo:** ✅ / ❌

---

## 🎉 You're Prepared!

With multiple deployment options tracked and tested, you're ready for any scenario during your demo or interview. Good luck! 🚀
