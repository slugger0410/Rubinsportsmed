(function () {
  if (window.__rubinChatLoaded) return; // guard against double injection
  window.__rubinChatLoaded = true;

  const CHAT_API_URL = 'https://rubinsportsmed.vercel.app/api/chat';
  const PHONE = '239-325-1135';
  const STORE_KEY = 'rubinChat.v2';
  const TEASER_KEY = 'rubinChat.teaserShown';
  const MAX_CHARS = 1000;

  const QUICK_REPLIES = [
    'Are you open right now?',
    'Do you take my insurance?',
    'What should I bring to a walk-in?',
    'What is PRP?',
    'How do I request an appointment?',
  ];

  const GREETING =
    "Hi! 👋 I'm the online assistant for Dr. Rubin's walk-in sports medicine clinic.\n\n" +
    "Ask me about hours, walk-ins, insurance, or what we treat. For anything personal or urgent, call " + PHONE + ".";

  const C = {
    primary: '#5B8DB8',
    primaryDark: '#4A7AA3',
    light: '#f4f6f8',
    border: '#e0e4e8',
    text: '#1a1a1a',
    mid: '#5a6470',
  };

  const css = `
    #rubin-chat-widget, #rubin-chat-widget * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    #rubin-chat-toggle {
      position: fixed; bottom: 20px; right: 20px; z-index: 99999;
      height: 52px; border-radius: 26px; padding: 0 20px 0 16px;
      background: ${C.primary}; color: #fff; border: none; cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.22);
      display: flex; align-items: center; gap: 8px;
      font-size: 15px; font-weight: 600; transition: background .2s, transform .2s;
    }
    #rubin-chat-toggle:hover { background: ${C.primaryDark}; transform: translateY(-1px); }
    #rubin-chat-toggle:focus-visible { outline: 3px solid #fff; outline-offset: 2px; box-shadow: 0 0 0 5px ${C.primary}; }
    #rubin-chat-toggle .rubin-ico { font-size: 20px; line-height: 1; }

    #rubin-chat-teaser {
      position: fixed; bottom: 82px; right: 20px; z-index: 99999;
      max-width: 250px; background: #fff; color: ${C.text};
      padding: 12px 34px 12px 14px; border-radius: 14px 14px 4px 14px;
      box-shadow: 0 6px 24px rgba(0,0,0,0.18); font-size: 14px; line-height: 1.4;
      cursor: pointer; animation: rubinPop .25s ease-out;
    }
    #rubin-chat-teaser button {
      position: absolute; top: 6px; right: 8px; background: none; border: none;
      color: ${C.mid}; font-size: 16px; cursor: pointer; padding: 2px;
    }
    @keyframes rubinPop { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

    #rubin-chat-window {
      position: fixed; bottom: 84px; right: 20px; z-index: 99998;
      width: 370px; height: 560px; max-height: calc(100vh - 110px);
      background: #fff; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      display: flex; flex-direction: column; overflow: hidden;
      transition: opacity .2s, transform .2s;
    }
    #rubin-chat-window.rubin-hidden { opacity: 0; pointer-events: none; transform: translateY(12px); visibility: hidden; }

    #rubin-chat-header {
      background: ${C.primary}; color: #fff; padding: 12px 14px;
      display: flex; align-items: center; gap: 8px;
    }
    #rubin-chat-header .rubin-info { flex: 1; min-width: 0; }
    #rubin-chat-header .rubin-name { font-weight: 700; font-size: 15px; }
    #rubin-chat-header .rubin-sub { font-size: 12px; opacity: .9; margin-top: 2px; }
    #rubin-chat-header button {
      background: rgba(255,255,255,0.18); border: none; color: #fff; cursor: pointer;
      border-radius: 6px; padding: 4px 8px; font-size: 12px; font-weight: 700;
    }
    #rubin-chat-header button:hover { background: rgba(255,255,255,0.32); }
    #rubin-chat-header #rubin-chat-close { font-size: 16px; padding: 2px 8px; }

    #rubin-chat-messages {
      flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px;
      background: ${C.light}; --rubin-fs: 15px;
    }
    .rubin-msg {
      max-width: 86%; padding: 10px 13px; border-radius: 14px; font-size: var(--rubin-fs);
      line-height: 1.5; white-space: pre-wrap; overflow-wrap: anywhere; min-width: 0;
    }
    .rubin-msg a { color: ${C.primaryDark}; text-decoration: underline; }
    .rubin-msg.bot { background: #fff; color: ${C.text}; align-self: flex-start; border-bottom-left-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .rubin-msg.user { background: ${C.primary}; color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; }
    .rubin-msg.user a { color: #fff; }
    .rubin-typing { display: inline-flex; gap: 4px; padding: 14px 16px; }
    .rubin-typing span { width: 7px; height: 7px; border-radius: 50%; background: #9aa5b1; animation: rubinDot 1.2s infinite; }
    .rubin-typing span:nth-child(2) { animation-delay: .15s; }
    .rubin-typing span:nth-child(3) { animation-delay: .3s; }
    @keyframes rubinDot { 0%, 60%, 100% { opacity: .3; transform: none; } 30% { opacity: 1; transform: translateY(-3px); } }

    #rubin-chat-chips { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 14px 10px; background: ${C.light}; }
    #rubin-chat-chips button {
      border: 1px solid ${C.primary}; background: #fff; color: ${C.primaryDark};
      border-radius: 16px; padding: 6px 11px; font-size: 13px; cursor: pointer;
    }
    #rubin-chat-chips button:hover { background: ${C.primary}; color: #fff; }

    #rubin-chat-actions { display: flex; gap: 8px; padding: 8px 12px 0; background: #fff; border-top: 1px solid ${C.border}; }
    #rubin-chat-actions a {
      flex: 1; text-align: center; text-decoration: none; font-size: 13px; font-weight: 600;
      padding: 7px 6px; border-radius: 8px; border: 1px solid ${C.border}; color: ${C.primaryDark};
    }
    #rubin-chat-actions a:hover { background: ${C.light}; }

    #rubin-chat-input-row { display: flex; gap: 8px; padding: 10px 12px; background: #fff; align-items: flex-end; }
    #rubin-chat-input {
      flex: 1; border: 1px solid ${C.border}; border-radius: 10px; padding: 10px 12px;
      font-size: 16px; /* 16px prevents iOS zoom on focus */ outline: none; resize: none;
      min-height: 42px; max-height: 110px; line-height: 1.35;
    }
    #rubin-chat-input:focus { border-color: ${C.primary}; }
    #rubin-chat-send {
      background: ${C.primary}; color: #fff; border: none; border-radius: 10px;
      width: 44px; height: 42px; cursor: pointer; font-size: 18px; flex-shrink: 0;
    }
    #rubin-chat-send:hover { background: ${C.primaryDark}; }
    #rubin-chat-send:disabled { opacity: .5; cursor: default; }
    #rubin-chat-footer { text-align: center; font-size: 11px; color: #8a949e; padding: 0 0 8px; background: #fff; }

    @media (max-width: 480px) {
      #rubin-chat-toggle { height: 48px; padding: 0 16px 0 14px; bottom: 14px; right: 14px; }
      #rubin-chat-teaser { right: 14px; bottom: 72px; }
      #rubin-chat-window { width: calc(100vw - 16px); right: 8px; bottom: 72px; height: calc(100vh - 90px); max-height: none; }
    }
    @media (prefers-reduced-motion: reduce) {
      #rubin-chat-window, #rubin-chat-toggle, #rubin-chat-teaser, .rubin-typing span { transition: none; animation: none; }
    }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const wrapper = document.createElement('div');
  wrapper.id = 'rubin-chat-widget';
  wrapper.innerHTML = `
    <button id="rubin-chat-toggle" aria-expanded="false" aria-controls="rubin-chat-window">
      <span class="rubin-ico" aria-hidden="true">💬</span><span class="rubin-label">Questions? Chat with us</span>
    </button>
    <div id="rubin-chat-window" class="rubin-hidden" role="dialog" aria-label="Chat with Dr. Rubin's office">
      <div id="rubin-chat-header">
        <div class="rubin-info">
          <div class="rubin-name">Naples Ortho Walk-In</div>
          <div class="rubin-sub">Dr. Rubin's front desk · AI assistant</div>
        </div>
        <button id="rubin-font-decrease" aria-label="Smaller text">A−</button>
        <button id="rubin-font-increase" aria-label="Larger text">A+</button>
        <button id="rubin-chat-close" aria-label="Close chat">✕</button>
      </div>
      <div id="rubin-chat-messages" aria-live="polite"></div>
      <div id="rubin-chat-chips"></div>
      <div id="rubin-chat-actions">
        <a href="tel:+12393251135">📞 Call</a>
        <a href="https://trk-health.com/appointment/rubin" target="_blank" rel="noopener noreferrer">📅 Request appointment</a>
      </div>
      <div id="rubin-chat-input-row">
        <textarea id="rubin-chat-input" rows="1" maxlength="${MAX_CHARS}" placeholder="Ask about hours, walk-ins, insurance…" aria-label="Type your question"></textarea>
        <button id="rubin-chat-send" aria-label="Send">➤</button>
      </div>
      <div id="rubin-chat-footer">AI assistant · Not medical advice · Please don't share personal health info</div>
    </div>
  `;
  document.body.appendChild(wrapper);

  const $ = (id) => document.getElementById(id);
  const toggle = $('rubin-chat-toggle');
  const win = $('rubin-chat-window');
  const messagesEl = $('rubin-chat-messages');
  const chipsEl = $('rubin-chat-chips');
  const input = $('rubin-chat-input');
  const sendBtn = $('rubin-chat-send');

  // ── state (persisted per browser tab so it survives page navigation) ──
  let state = { messages: [], open: false, fontSize: 15 };
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORE_KEY) || 'null');
    if (saved && Array.isArray(saved.messages)) state = Object.assign(state, saved);
  } catch (e) { /* storage unavailable: fine, stay in memory */ }
  function save() {
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  let busy = false;

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function linkify(text) {
    return escapeHtml(text)
      .replace(/(https?:\/\/[^\s<]+[^\s<.,:;"')\]])/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\b(?:\(?239\)?[-.\s]?)325[-.\s]?1135\b/g, '<a href="tel:+12393251135">$&</a>');
  }

  function addBubble(role, text) {
    const div = document.createElement('div');
    div.className = 'rubin-msg ' + role;
    if (role === 'user') div.textContent = text;
    else div.innerHTML = linkify(text);
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'rubin-msg bot rubin-typing';
    div.setAttribute('aria-label', 'Assistant is typing');
    div.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function renderChips() {
    chipsEl.innerHTML = '';
    // Show quick replies only until the patient has asked something
    if (state.messages.some(m => m.role === 'user')) { chipsEl.style.display = 'none'; return; }
    chipsEl.style.display = 'flex';
    QUICK_REPLIES.forEach(q => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = q;
      b.addEventListener('click', () => sendMessage(q));
      chipsEl.appendChild(b);
    });
  }

  function renderAll() {
    messagesEl.innerHTML = '';
    addBubble('bot', GREETING);
    state.messages.forEach(m => addBubble(m.role === 'user' ? 'user' : 'bot', m.content));
    messagesEl.style.setProperty('--rubin-fs', state.fontSize + 'px');
    renderChips();
  }

  function setOpen(open) {
    state.open = open;
    save();
    win.classList.toggle('rubin-hidden', !open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.rubin-ico').textContent = open ? '✕' : '💬';
    toggle.querySelector('.rubin-label').textContent = open ? 'Close' : 'Questions? Chat with us';
    if (open) {
      hideTeaser();
      messagesEl.scrollTop = messagesEl.scrollHeight;
      // don't pop the keyboard on phones
      if (window.matchMedia('(min-width: 481px)').matches) input.focus();
    }
  }

  // ── gentle teaser (desktop, once per tab session, never auto-opens) ──
  let teaserEl = null;
  function hideTeaser() { if (teaserEl) { teaserEl.remove(); teaserEl = null; } }
  function maybeShowTeaser() {
    try { if (sessionStorage.getItem(TEASER_KEY)) return; sessionStorage.setItem(TEASER_KEY, '1'); } catch (e) {}
    if (state.open || state.messages.length) return;
    if (!window.matchMedia('(min-width: 768px)').matches) return;
    teaserEl = document.createElement('div');
    teaserEl.id = 'rubin-chat-teaser';
    teaserEl.innerHTML = 'Hurt today? Walk-ins welcome, no appointment needed. Ask me anything 👋<button aria-label="Dismiss">✕</button>';
    teaserEl.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') { hideTeaser(); return; }
      setOpen(true);
    });
    wrapper.appendChild(teaserEl);
    setTimeout(hideTeaser, 15000);
  }

  async function sendMessage(preset) {
    if (busy) return;
    const text = (typeof preset === 'string' ? preset : input.value).trim().slice(0, MAX_CHARS);
    if (!text) return;
    input.value = '';
    autoGrow();
    busy = true;
    sendBtn.disabled = true;

    state.messages.push({ role: 'user', content: text });
    save();
    addBubble('user', text);
    renderChips();
    const typing = showTyping();

    let reply;
    try {
      const res = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: state.messages.slice(-20) }),
      });
      const data = await res.json().catch(() => ({}));
      reply = data.response || data.error || ("Sorry, I couldn't get an answer just now. Please call us at " + PHONE + ".");
      if (data.response) state.messages.push({ role: 'assistant', content: reply });
    } catch (e) {
      reply = "Sorry, something went wrong on my end. Please call us at " + PHONE + ".";
    }
    typing.remove();
    addBubble('bot', reply);
    save();

    busy = false;
    sendBtn.disabled = false;
    if (window.matchMedia('(min-width: 481px)').matches) input.focus();
  }

  function autoGrow() {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 110) + 'px';
  }

  // ── events ──
  toggle.addEventListener('click', () => setOpen(!state.open));
  $('rubin-chat-close').addEventListener('click', () => setOpen(false));
  $('rubin-font-increase').addEventListener('click', () => {
    state.fontSize = Math.min(21, state.fontSize + 2);
    messagesEl.style.setProperty('--rubin-fs', state.fontSize + 'px'); save();
  });
  $('rubin-font-decrease').addEventListener('click', () => {
    state.fontSize = Math.max(13, state.fontSize - 2);
    messagesEl.style.setProperty('--rubin-fs', state.fontSize + 'px'); save();
  });
  sendBtn.addEventListener('click', () => sendMessage());
  input.addEventListener('input', autoGrow);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.open) { setOpen(false); toggle.focus(); }
  });

  // ── init ──
  renderAll();
  setOpen(!!state.open);  // starts closed on first visit; stays open across pages if the patient left it open
  setTimeout(maybeShowTeaser, 8000);
})();
