# Notification Troubleshooting Guide

If you're not receiving glucose notifications, follow these steps to diagnose and fix the issue.

---

## Quick Checklist

- [ ] Notifications enabled in extension settings
- [ ] Chrome has notification permission in OS settings
- [ ] Focus/Do Not Disturb is OFF
- [ ] Extension is logged in and fetching data

---

## Step 1: Enable Notifications in Extension

1. Click the extension icon in Chrome toolbar
2. Click the **⚙️ Settings** button (or press `Ctrl+S` / `Cmd+S`)
3. Toggle **"Enable notifications for high/low glucose"** ON
4. Click **Save Settings**

---

## Step 2: Check Chrome Notification Permission

### 🪟 Windows

1. Open **Settings** (Win + I)
2. Go to **System** → **Notifications**
3. Ensure **Notifications** is turned ON at the top
4. Scroll down to **Get notifications from these senders**
5. Find **Google Chrome** and ensure it's toggled ON
6. Click on **Google Chrome** for more options:
   - ✅ **Show notifications from apps and other senders**: ON
   - ✅ **Play a sound**: ON (optional)
   - ✅ **Show notification banners**: ON

```
Settings → System → Notifications
└── Google Chrome
    ├── Show notifications: [ON]  ← Must be ON
    ├── Play a sound: [ON/OFF]    ← Optional
    └── Show notification banners: [ON]  ← Must be ON
```

### 🍎 macOS

1. Open **System Settings** ( Apple menu → System Settings)
2. Go to **Notifications**
3. Find **Google Chrome** in the app list
4. Ensure these are enabled:
   - ✅ **Allow Notifications** (toggle ON)
   - ✅ **Banners** or **Alerts** (select one)
   - ✅ **Show in Notification Center** (toggle ON)

```
System Settings → Notifications → Google Chrome
├── Allow Notifications: [ON]  ← Must be ON
├── Lock Screen: [ON/OFF]      ← Optional
├── Notification Center: [ON]  ← Recommended
└── Banners: [ON]              ← Shows pop-up banner
```

---

## Step 3: Check Chrome's Site Permissions

1. In Chrome, go to: `chrome://settings/content/notifications`
2. Find **Glucose At A Glance** or the extension in the list
3. Ensure it's set to **Allow** (not "Block" or "Ask")

If you don't see it listed:
1. Click the **🔒 lock icon** or **⚙️ settings icon** in the address bar when the popup is open
2. Find **Notifications** and set to **Allow**

---

## Step 4: Disable Focus / Do Not Disturb

### 🪟 Windows (Focus Assist)

1. Click the **Action Center** icon (bottom-right, near clock) OR press `Win + A`
2. Check if **Focus Assist** is ON
3. If ON, either:
   - Turn it **OFF**, OR
   - Click **Focus Assist settings** → Add Chrome to **Priority list**

### 🍎 macOS (Focus / Do Not Disturb)

1. Click the **Control Center** icon (top-right, looks like two toggle switches)
2. Check if **Focus** or **Do Not Disturb** is ON
3. If ON, either:
   - Turn it **OFF**, OR
   - Click **Focus** → **Options** → Add Chrome to allowed apps

---

## Step 5: Test the Notification

### Option A: Use the Test Button (Recommended)

1. Open the extension popup
2. Click **⚙️ Settings**
3. Click **"⚠️ Test Low Alert"** or **"🔴 Test High Alert"**
4. You should see a notification appear:
   - **Windows**: Bottom-right corner of screen
   - **macOS**: Top-right corner of screen

### Option B: Wait for Automatic Check

1. Ensure notifications are enabled in settings
2. **Close the popup** (notifications work in the background)
3. Wait for the refresh interval (default: 5 minutes)
4. A notification will appear if glucose is outside your target range

---

## Step 6: Check Extension Logs (Advanced)

If notifications still don't work, check the extension's internal logs:

### Check Background Service Worker

1. Go to `chrome://extensions/`
2. Find **Glucose At A Glance**
3. Click **"service worker"** under "Inspect views"
4. A DevTools window opens - click the **Console** tab
5. Click the test notification button in the popup
6. Look for these messages:

```
✅ Expected logs:
[Background] Alarm triggered: glucose-check
[Background] Starting glucose check...
[Background] Notifications enabled: true
[Background] Glucose check: {...}
[Background] Triggering HIGH glucose notification
[Background] Notification created: glucose-alert

❌ Error logs to watch for:
[Background] Chrome Notifications API not available
[Background] Notification error: <error message>
[Background] No patient ID - user not authenticated
```

### Check Popup Console

1. Right-click anywhere inside the extension popup
2. Select **Inspect**
3. Click the **Console** tab
4. Click the test notification button
5. Look for any red error messages

---

## Common Issues & Solutions

### ❌ "Notifications are not supported in this browser"

**Cause:** You're not using Chrome or notifications are blocked at the browser level.

**Solution:**
- Use Google Chrome (recommended) or Microsoft Edge
- Update Chrome to the latest version
- Check `chrome://settings/content/notifications`

---

### ❌ "Notification permission denied"

**Cause:** You previously blocked notifications for Chrome.

**Solution:**

**Windows:**
1. Go to `chrome://settings/content/notifications`
2. Find the extension in the "Not allowed" list
3. Click the trash icon 🗑️ to remove it
4. Test the notification again and click **Allow** when prompted

**macOS:**
1. Go to `chrome://settings/content/notifications`
2. Find the extension in the "Not allowed" list
3. Click the trash icon 🗑️ to remove it
4. Test the notification again and click **Allow** when prompted

---

### ❌ No notification appears, but no errors in console

**Cause:** Glucose is within target range, so no alert is triggered.

**Solution:**
- Use the **Test Notification** buttons in Settings to verify the system works
- Check your target range in Settings (default: 4.0 - 10.0 mmol/L)
- Notifications only trigger when glucose goes **outside** the target range

---

### ❌ Notification appeared once, but not again

**Cause:** The extension only notifies on **state changes** (e.g., normal → high), not repeatedly for the same condition.

**Solution:**
- This is intentional to avoid notification spam
- Notifications will trigger again when:
  - Glucose returns to normal, then goes high/low again
  - You reload the extension or restart Chrome
- To reset: Open the popup (this resets the alert state)

---

### ❌ Notifications work with popup open, but not when closed

**Cause:** The background service worker may have stopped.

**Solution:**
1. Go to `chrome://extensions/`
2. Find **Glucose At A Glance**
3. Click the **refresh icon** 🔄 on the extension card
4. Ensure the alarm is registered (check background console for `[Background] Alarm initialized`)

---

### ❌ "Check your system notifications!" message appears, but no notification

**Cause:** Chrome sent the notification, but your OS blocked it.

**Solution:**

**Windows:**
1. Go to **Settings → System → Notifications**
2. Ensure **Notifications** is ON
3. Ensure **Google Chrome** is allowed
4. Check **Focus Assist** is OFF

**macOS:**
1. Go to **System Settings → Notifications → Google Chrome**
2. Ensure **Allow Notifications** is ON
3. Check **Focus/Do Not Disturb** is OFF
4. Check **Notification Center** for missed notifications (click date/time in menu bar)

---

## Notification Behavior

| Scenario | Notification Sent? |
|----------|-------------------|
| Glucose goes from normal → low | ✅ Yes |
| Glucose goes from normal → high | ✅ Yes |
| Glucose stays low (multiple checks) | ❌ No (already alerted) |
| Glucose goes low → normal → low | ✅ Yes (state changed) |
| Popup is closed | ✅ Yes (background service) |
| Notifications disabled in settings | ❌ No |
| Not authenticated/logged out | ❌ No |

---

## Platform-Specific Notes

### 🪟 Windows

- Notifications appear in the **bottom-right corner**
- Check **Action Center** (Win + A) for missed notifications
- **Focus Assist** can block notifications during certain hours

### 🍎 macOS

- Notifications appear in the **top-right corner**
- Click the **date/time** in menu bar to open Notification Center
- **Do Not Disturb** / **Focus** modes can suppress notifications

---

## Need More Help?

- Check the [README.md](README.md) for general usage
- Open an issue on [GitHub](https://github.com/yourusername/GlucoseAtAGlance/issues)
- Include logs from the background service worker console