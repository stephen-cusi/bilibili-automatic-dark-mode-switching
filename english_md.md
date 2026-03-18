Great idea. Adding an **AIGC (Artificial Intelligence Generated Content) Disclosure** is becoming a standard best practice on GitHub to maintain transparency. 

Here is the English version of your README, followed by the AIGC disclosure section.

---

# Bilibili Automatic Dark Mode Switching

> **Automate the native dark mode on Bilibili Web. No more manual toggling, no more blinding white flashes.**

---

## ✨ Key Advantages

* **🛡️ 100% Native Support**: Instead of injecting brute-force CSS, this script triggers Bilibili's official dark theme logic. This ensures all UI elements (comments, danmaku, moments) remain perfectly compatible and aesthetically consistent with official designs.
* **🚫 Anti-Flicker Technology**: Theme configurations are injected at `document-start`, before the first frame is rendered. Even on slow connections, you'll get a dark screen immediately—no more white flashes to strain your eyes.
* **🖱️ Seamless Interaction**:
    * **Hot-Switching**: Change modes without refreshing the page. Changes take effect instantly.
    * **Draggable Panel**: A floating window in the bottom-right corner that can be moved freely; it remembers your preferred position.
    * **One-Click Hide**: Click the `×` on the panel to hide it for the current session, keeping your interface clean.
* **🤖 Smart Conflict Detection**: If you manually switch the theme via Bilibili's native menu, the script recognizes your intent and temporarily stops overriding your choice until the next refresh.
* **⏰ Flexible Modes**:
    * **Follow System**: Syncs in real-time with your Windows/macOS/Linux system color scheme.
    * **Scheduled Mode**: Set custom start/end times (e.g., 10:00 PM to 6:00 AM).
    * **Manual Off**: Completely disable script intervention.

---

## ⚠️ Known Limitations

* **Light Mode Toggle**: If the script is actively forcing Dark Mode, switching back to Light Mode via Bilibili's native menu may require a page refresh or temporary disabling of the script.
* **SPA Navigation Delay**: On some Single Page Application (SPA) components, color updates might lag slightly due to internal state delays. A refresh usually fixes this.
* **Environment Dependency**: Requires `GM_setValue` and other advanced APIs. Recommended for use with **Tampermonkey** or **ScriptCat**.
* **Hide Mechanism**: After clicking `×`, the floating window stays hidden for the duration of the current tab's life. It reappears upon refresh or opening a new link.

---

## 🚀 Installation

You can install the script using either of the following methods:

### Method A: Drag and Drop (Recommended)
1.  Download the `.js` file from this repository.
2.  Open your browser's extension dashboard (Tampermonkey or ScriptCat).
3.  **Drag and drop** the downloaded file into the dashboard and click "Install".

### Method B: Copy and Paste
1.  Open the script code from this repository.
2.  In your script manager, click "Create a new script".
3.  Delete the default template and **paste** the entire code from this project. Save with `Ctrl + S`.

---

## 🛠️ Technical Principles
The script communicates with Bilibili's React/Vue framework by intercepting and simulating `StorageEvent`. By locking the `theme_style` field in `Cookie` and `LocalStorage` during the `document-start` phase, it achieves a smarter, more integrated automation than the official toggle.

---

## 🤖 AIGC Disclosure

This project was developed with the assistance of **AI (Gemini / Large Language Models)**.

* **Code Generation**: The core logic for theme switching, DOM manipulation, and the draggable UI was co-authored by human and AI to ensure modern JavaScript standards and efficient event handling.
* **Documentation**: This README and technical explanations were refined by AI to ensure clarity in both Chinese and English.
* **Maintenance**: While AI assisted in the creation, the logic is verified to work within the specific architecture of Bilibili's current web frontend.

---

### 💡 Pro-tip for your Repo:
In the "AIGC Disclosure" section, you've shown great integrity. Most developers really appreciate knowing when a tool was built with AI, as it shows you're leveraging the latest tech to solve problems! 

Would you like me to help you set up a **`LICENSE`** file (like MIT) to make it an official Open Source project?
