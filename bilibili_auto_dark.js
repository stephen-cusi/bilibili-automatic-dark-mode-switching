// ==UserScript==
// @name         B站原生深色模式自动切换 (悬浮窗版)
// @namespace    http://tampermonkey.net/
// @version      7.0
// @description  自动切换B站原生深色模式，使用悬浮按钮配置，彻底解决多重弹窗问题
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

    // --- 核心配置 ---
    const getCfg = () => ({
        mode: GM_getValue('auto_mode', 'system'), // system, time, off
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

        window.dispatchEvent(new StorageEvent('storage', {
            key: 'theme_style',
            newValue: themeValue,
            storageArea: localStorage
        }));

        const htmlEl = document.documentElement;
        if (isDark) {
            htmlEl.classList.add('dark');
            htmlEl.setAttribute('data-dark-theme', 'dark');
        } else {
            htmlEl.classList.remove('dark');
            htmlEl.removeAttribute('data-dark-theme');
        }
    }

    // --- 悬浮 UI 逻辑 ---
    function createUI() {
        if (document.getElementById('bili-dark-mode-ctrl')) return;

        const container = document.createElement('div');
        container.id = 'bili-dark-mode-ctrl';
        container.style = `
            position: fixed; bottom: 100px; right: 20px; z-index: 10000;
            background: var(--graph_bg_regular, #fff); border: 1px solid var(--line_regular, #ccc);
            border-radius: 8px; padding: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            display: flex; flex-direction: column; gap: 5px; opacity: 0.3; transition: opacity 0.3s;
        `;
        container.onmouseenter = () => container.style.opacity = '1';
        container.onmouseleave = () => container.style.opacity = '0.3';

        const modes = [
            { id: 'system', name: '自动', icon: '🌗' },
            { id: 'time', name: '定时', icon: '⏰' },
            { id: 'off', name: '关闭', icon: '🔌' }
        ];

        modes.forEach(m => {
            const btn = document.createElement('button');
            btn.innerText = `${m.icon} ${m.name}`;
            btn.style = `
                padding: 4px 8px; border: none; background: none; cursor: pointer;
                font-size: 12px; color: var(--text1, #333); border-radius: 4px;
            `;
            const updateBtnStyle = () => {
                btn.style.background = GM_getValue('auto_mode', 'system') === m.id ? 'var(--brand_blue, #00aeec)' : 'transparent';
                btn.style.color = GM_getValue('auto_mode', 'system') === m.id ? '#fff' : 'var(--text1, #333)';
            };
            updateBtnStyle();
            btn.onclick = () => {
                GM_setValue('auto_mode', m.id);
                if (m.id === 'time' && m.id === GM_getValue('auto_mode')) {
                    const start = prompt("开始时间:", GM_getValue('start_time', '22:00'));
                    const end = prompt("结束时间:", GM_getValue('end_time', '06:00'));
                    if (start && end) { GM_setValue('start_time', start); GM_setValue('end_time', end); }
                }
                userIntervened = false;
                applyTheme(shouldBeDark());
                location.reload(); // 这里的重载是为了刷新 UI 选中状态，如果你不嫌弃 UI 不变可以去掉
            };
            container.appendChild(btn);
        });

        document.body.appendChild(container);
    }

    // --- 初始化流程 ---
    const initialTarget = shouldBeDark();
    if (initialTarget) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-dark-theme', 'dark');
    }

    window.addEventListener('DOMContentLoaded', () => {
        createUI();
        applyTheme(shouldBeDark());

        // 监听手动干预
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            if (key === 'theme_style') {
                const scriptWants = (shouldBeDark() ? 'dark' : 'light');
                if (value !== scriptWants) userIntervened = true;
            }
            originalSetItem.apply(this, arguments);
        };
    });

    setInterval(() => {
        if (getCfg().mode === 'time') applyTheme(shouldBeDark());
    }, 30000);
})();