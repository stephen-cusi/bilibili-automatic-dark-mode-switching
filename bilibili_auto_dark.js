// ==UserScript==
// @name         B站原生深色模式 (拖拽悬浮+一键关闭版)
// @namespace    http://tampermonkey.net/
// @version      8.0
// @description  自动切换B站原生深色模式，支持拖拽、热更新、一键隐藏
// @author       Gemini
// @match        *://*.bilibili.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    if (window.BiliDarkModeScriptLoaded) return;
    window.BiliDarkModeScriptLoaded = true;

    let userIntervened = false;
    let isHiddenSession = false; // 记录本次会话是否点击了关闭

    // --- 核心逻辑 ---
    const getCfg = () => ({
        mode: GM_getValue('auto_mode', 'system'),
        startTime: GM_getValue('start_time', '22:00'),
        endTime: GM_getValue('end_time', '06:00')
    });

    function shouldBeDark() {
        const cfg = getCfg();
        if (cfg.mode === 'off') return null;
        if (cfg.mode === 'system') return window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (cfg.mode === 'time') {
            const now = new Date();
            const current = now.getHours() * 60 + now.getMinutes();
            const [sH, sM] = cfg.startTime.split(':').map(Number);
            const [eH, eM] = cfg.endTime.split(':').map(Number);
            const start = sH * 60 + sM, end = eH * 60 + eM;
            return start < end ? (current >= start && current < end) : (current >= start || current < end);
        }
        return null;
    }

    function applyTheme(isDark) {
        if (isDark === null) return;
        const themeValue = isDark ? 'dark' : 'light';
        localStorage.setItem('theme_style', themeValue);
        document.cookie = `theme_style=${themeValue}; path=/; domain=.bilibili.com; max-age=31536000`;
        window.dispatchEvent(new StorageEvent('storage', { key: 'theme_style', newValue: themeValue, storageArea: localStorage }));
        const htmlEl = document.documentElement;
        if (isDark) { htmlEl.classList.add('dark'); htmlEl.setAttribute('data-dark-theme', 'dark'); }
        else { htmlEl.classList.remove('dark'); htmlEl.removeAttribute('data-dark-theme'); }
    }

    // --- 悬浮窗 UI 与 拖拽逻辑 ---
    function createUI() {
        if (document.getElementById('bili-dark-ctrl') || isHiddenSession) return;

        const container = document.createElement('div');
        container.id = 'bili-dark-ctrl';
        // 读取保存的位置
        const savedPos = GM_getValue('ui_pos', { bottom: '100px', right: '20px' });
        
        container.style = `
            position: fixed; bottom: ${savedPos.bottom}; right: ${savedPos.right}; z-index: 20000;
            background: var(--graph_bg_regular, #fff); border: 1px solid var(--line_regular, #ccc);
            border-radius: 10px; padding: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex; flex-direction: column; gap: 6px; cursor: move; user-select: none;
            opacity: 0.5; transition: opacity 0.3s, transform 0.2s;
        `;
        container.onmouseenter = () => container.style.opacity = '1';
        container.onmouseleave = () => container.style.opacity = '0.5';

        // 右上角关闭按钮
        const closeBtn = document.createElement('div');
        closeBtn.innerText = '×';
        closeBtn.style = 'position:absolute; top:-5px; right:2px; cursor:pointer; font-size:16px; color:#999; font-weight:bold;';
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            container.remove();
            isHiddenSession = true;
        };
        container.appendChild(closeBtn);

        const modes = [
            { id: 'system', name: '跟随系统', icon: '🌗' },
            { id: 'time', name: '定时', icon: '⏰' },
            { id: 'off', name: '关闭自动', icon: '🔌' }
        ];

        const btnNodes = {};
        modes.forEach(m => {
            const btn = document.createElement('button');
            btn.innerText = `${m.icon} ${m.name}`;
            btn.style = `padding: 5px 10px; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; transition: 0.2s;`;
            
            const refreshBtnUI = () => {
                const isCurrent = GM_getValue('auto_mode', 'system') === m.id;
                btn.style.background = isCurrent ? '#00aeec' : 'transparent';
                btn.style.color = isCurrent ? '#fff' : 'var(--text1, #333)';
            };
            btnNodes[m.id] = refreshBtnUI;
            refreshBtnUI();

            btn.onclick = (e) => {
                e.stopPropagation();
                GM_setValue('auto_mode', m.id);
                if (m.id === 'time') {
                    const start = prompt("开始时间 (如 22:00):", GM_getValue('start_time', '22:00'));
                    const end = prompt("结束时间 (如 06:00):", GM_getValue('end_time', '06:00'));
                    if (start && end) { GM_setValue('start_time', start); GM_setValue('end_time', end); }
                }
                userIntervened = false;
                applyTheme(shouldBeDark());
                Object.values(btnNodes).forEach(fn => fn()); // 热更新按钮颜色
            };
            container.appendChild(btn);
        });

        // --- 拖拽实现 ---
        let isDragging = false, startX, startY, startBottom, startRight;
        container.onmousedown = (e) => {
            isDragging = true;
            startX = e.clientX; startY = e.clientY;
            startBottom = parseInt(container.style.bottom);
            startRight = parseInt(container.style.right);
            container.style.transition = 'none';
        };
        document.onmousemove = (e) => {
            if (!isDragging) return;
            const diffX = startX - e.clientX;
            const diffY = startY - e.clientY;
            const newBottom = startBottom + diffY;
            const newRight = startRight + diffX;
            container.style.bottom = newBottom + 'px';
            container.style.right = newRight + 'px';
        };
        document.onmouseup = () => {
            if (isDragging) {
                isDragging = false;
                container.style.transition = 'opacity 0.3s, transform 0.2s';
                GM_setValue('ui_pos', { bottom: container.style.bottom, right: container.style.right });
            }
        };

        document.body.appendChild(container);
    }

    // --- 执行流程 ---
    if (shouldBeDark()) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-dark-theme', 'dark');
    }

    window.addEventListener('DOMContentLoaded', () => {
        createUI();
        applyTheme(shouldBeDark());
        
        // 拦截手动干预
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            if (key === 'theme_style') {
                const scriptWants = (shouldBeDark() ? 'dark' : 'light');
                if (value !== scriptWants) userIntervened = true;
            }
            originalSetItem.apply(this, arguments);
        };
    });

    setInterval(() => { if (getCfg().mode === 'time') applyTheme(shouldBeDark()); }, 30000);
})();
