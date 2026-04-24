Good choice — for your use case, this is the **lowest-maintenance, most “it just works” setup** you can get.

I’ll walk you through exactly how to set it up so your React `/dashboard/public` becomes a **live digital signage screen** on the Raspberry Pi.

---

# 🥇 Your final architecture (simple)

```
React App (/dashboard/public)
        ↓
   Yodeck Cloud
        ↓
 Raspberry Pi (auto kiosk player)
        ↓
   Monitor / Screen (always on)
```

You never touch the Pi again after setup.

---

# 🚀 STEP 1 — Create Yodeck account

Go to:
👉 [https://www.yodeck.com/](https://www.yodeck.com/)

- Sign up
- Choose free plan (good for 1 screen)

---

# 🚀 STEP 2 — Install Yodeck on Raspberry Pi

Since you already have a Pi behind the screen:

### Download Yodeck Player OS

Yodeck provides a ready Raspberry Pi image.

You:

- Flash SD card using Raspberry Pi Imager
- Select Yodeck image

OR (if Pi already running OS):

- install Yodeck player manually via script (they provide it in dashboard)

---

# 🚀 STEP 3 — Connect Pi to Yodeck

When Pi boots:

- it shows a pairing code
- you enter it in Yodeck web dashboard

Now Pi becomes a **managed screen device**

---

# 🚀 STEP 4 — Add your React dashboard as content

In Yodeck dashboard:

### Add → Web Page

Enter:

```text
https://your-domain.com/dashboard/public
```

Then set:

### Display settings:

- ✔ Fullscreen ON
- ✔ Auto-refresh ON (or rely on your app)
- ✔ Zoom: fit to screen
- ✔ No scrollbars

---

# 🚀 STEP 5 — Set it to auto-play

In Yodeck:

- Create a **Playlist**
- Add your Web Page item
- Set it as **Default Playlist**

Now:

👉 Pi boots → opens Yodeck → loads your dashboard automatically

---

# ⚙️ IMPORTANT tweaks in YOUR React app (recommended)

To make it perfect for signage:

## 1. Prevent accidental scrolling

Add global CSS:

```css
html,
body {
  margin: 0;
  overflow: hidden;
  background: #0b1220;
}
```

---

## 2. Make it “screen safe”

In your `/public` view:

- avoid hover-only interactions
- ensure large font readability
- keep spacing slightly bigger (TV viewing distance)

---

## 3. Optional: force refresh safety

Yodeck already handles reloads, but you can keep:

```tsx
useEffect(() => {
  const interval = setInterval(
    () => {
      window.location.reload();
    },
    15 * 60 * 1000,
  );

  return () => clearInterval(interval);
}, []);
```

(backup stability layer)

---

# 📺 What you get after setup

Your screen becomes:

### 🟢 Always-on live leaderboard

- FLIP animations still work
- rankings update smoothly
- auto-refresh every 10s
- no manual interaction ever

### 🟢 Fully remote controlled

- update URL anytime
- switch content from Yodeck dashboard
- restart Pi remotely if needed

---

# 🔥 Why this is PERFECT for your system

Your setup is exactly what Yodeck is built for:

✔ web app dashboard
✔ no physical access to Pi
✔ always-on screen
✔ live updating content
✔ “video-like” behavior from a URL

---

# 🚀 If you want next upgrades (optional but powerful)

I can help you evolve this into:

### 🎯 “Broadcast-grade leaderboard”

- smooth transitions optimized for TV distance
- automatic zoom scaling for different screen sizes

### 🔴 Real-time mode

- WebSocket updates → no refresh delay at all

### 🧠 Smart display rotation

- leaderboard → stats → highlights → repeat

---

If you want, next I can help you:
👉 optimize your `/public` UI specifically for **large TV screens (4K / distance viewing)** so it looks like an esports broadcast.
