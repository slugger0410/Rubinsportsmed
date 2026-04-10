(function () {
  const CHAT_API_URL = 'https://rubinsportsmed.vercel.app/api/chat';

  const COLORS = {
    primary: '#5B8DB8',
    primaryDark: '#4A7AA3',
    white: '#ffffff',
    lightGray: '#f4f4f4',
    midGray: '#e0e0e0',
    textDark: '#1a1a1a',
    textMid: '#555',
    bubble: '#f9f9f9',
  };

  const css = `
    #rubin-chat-widget * { box-sizing: border-box; font-family: 'Georgia', serif; }
   #rubin-chat-toggle {
      position: fixed; bottom: 24px; right: 24px; z-index: 99999;
      height: 54px; border-radius: 30px;
      padding: 0 20px 0 16px;
      background: ${COLORS.primary}; color: white; border: none;
      cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,0.25);
      display: flex; align-items: center; justify-content: center; gap: 10px;
      transition: background 0.2s, transform 0.2s;
      font-size: 14px; font-weight: bold; white-space: nowrap;
    }
    #rubin-chat-toggle:hover { background: ${COLORS.primaryDark}; transform: scale(1.07); }
    #rubin-chat-window {
      position: fixed; bottom: 96px; right: 24px; z-index: 99998;
      width: 360px; max-height: 520px;
      background: white; border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.18);
      display: flex; flex-direction: column; overflow: hidden;
      transition: opacity 0.2s, transform 0.2s;
    }
    #rubin-chat-window.hidden { opacity: 0; pointer-events: none; transform: translateY(12px); }
    #rubin-chat-header {
      background: ${COLORS.primary}; color: white;
      padding: 14px 18px; display: flex; align-items: center; gap: 10px;
    }
    #rubin-chat-header .avatar {
      width: 38px; height: 38px; border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; flex-shrink: 0;
    }
    #rubin-chat-header .info { flex: 1; }
    #rubin-chat-header .info .name { font-weight: bold; font-size: 15px; font-family: 'Trebuchet MS', sans-serif; letter-spacing: 0.5px; }
    #rubin-chat-header .info .sub { font-size: 11px; opacity: 0.8; margin-top: 1px; font-family: 'Trebuchet MS', sans-serif; }
    #rubin-chat-close {
      background: none; border: none; color: white; cursor: pointer;
      font-size: 20px; padding: 0; opacity: 0.8; line-height: 1;
    }
    #rubin-chat-close:hover { opacity: 1; }
    #rubin-chat-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 10px;
      background: ${COLORS.lightGray};
    }
    .rubin-msg {
      max-width: 85%; padding: 10px 13px; border-radius: 12px;
      font-size: 14px; line-height: 1.5;
    }
    .rubin-msg.bot {
      background: white; color: ${COLORS.textDark};
      align-self: flex-start;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    .rubin-msg.user {
      background: ${COLORS.primary}; color: white;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .rubin-msg.typing { opacity: 0.6; font-style: italic; color: ${COLORS.textMid}; }
    #rubin-chat-input-row {
      display: flex; gap: 8px; padding: 12px;
      background: white; border-top: 1px solid ${COLORS.midGray};
    }
    #rubin-chat-input {
      flex: 1; border: 1px solid ${COLORS.midGray}; border-radius: 8px;
      padding: 9px 12px; font-size: 14px; outline: none;
      font-family: 'Georgia', serif; resize: none; height: 40px;
      transition: border-color 0.2s;
    }
    #rubin-chat-input:focus { border-color: ${COLORS.primary}; }
    #rubin-chat-send {
      background: ${COLORS.primary}; color: white; border: none;
      border-radius: 8px; padding: 0 14px; cursor: pointer;
      font-size: 18px; transition: background 0.2s;
    }
    #rubin-chat-send:hover { background: ${COLORS.primaryDark}; }
    #rubin-chat-send:disabled { opacity: 0.5; cursor: default; }
    #rubin-chat-footer {
      text-align: center; font-size: 10px; color: #aaa;
      padding: 4px 0 8px; background: white;
    }
    @media (max-width: 420px) {
      #rubin-chat-window { width: calc(100vw - 20px); right: 10px; bottom: 80px; }
    }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const wrapper = document.createElement('div');
  wrapper.id = 'rubin-chat-widget';
  wrapper.innerHTML = `
    <button id="rubin-chat-toggle" aria-label="Chat with us">💬 Hi! I'm Dr. Rubin's Assistant</button>
    <div id="rubin-chat-window" class="hidden">
      <div id="rubin-chat-header">
        <div class="avatar" style="display:none"></div>
        <div class="info">
          <div class="name">Dr. Rubin's Office</div>
          <div class="sub">OrthoCollier Sports Medicine</div>
        </div>
        <button id="rubin-chat-close" aria-label="Close">✕</button>
      </div>
      <div id="rubin-chat-messages"></div>
      <div id="rubin-chat-input-row">
        <textarea id="rubin-chat-input" placeholder="Ask about hours, location, services..." rows="1"></textarea>
        <button id="rubin-chat-send" aria-label="Send">➤</button>
      </div>
      <div id="rubin-chat-footer">Powered by AI · Not medical advice</div>
    </div>
  `;
  document.body.appendChild(wrapper);

  const toggle = document.getElementById('rubin-chat-toggle');
  const win = document.getElementById('rubin-chat-window');
  const closeBtn = document.getElementById('rubin-chat-close');
  const messagesEl = document.getElementById('rubin-chat-messages');
  const input = document.getElementById('rubin-chat-input');
  const sendBtn = document.getElementById('rubin-chat-send');

  let messages = [];
  let isOpen = false;

  function addMessage(role, text) {
    const div = document.createElement('div')
    div.className = 'rubin-msg ' + role
    div.style.whiteSpace = 'pre-wrap'
    div.textContent = text
    messagesEl.appendChild(div)
    div.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return div
  }

  function showGreeting() {
    if (messagesEl.children.length === 0) {
     addMessage('bot', "Hi! 👋 Welcome to Dr. Rubin's sports medicine clinic at OrthoCollier.\n\nWe specialize in the non-surgical advantage, combining advanced diagnostics, targeted treatments, and personalized care to help you recover and stay active.\n\nHow can I help you today?");
    }
  }

  toggle.addEventListener('click', () => {
    isOpen = !isOpen;
    win.classList.toggle('hidden', !isOpen);
    toggle.textContent = isOpen ? '✕' : '💬';
    if (isOpen) { showGreeting(); input.focus(); }
  });

  closeBtn.addEventListener('click', () => {
    isOpen = false;
    win.classList.add('hidden');
    toggle.textContent = '💬';
  });

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    sendBtn.disabled = true;

    addMessage('user', text);
    messages.push({ role: 'user', content: text });

    const typing = addMessage('bot typing', 'Typing...');

    try {
      const res = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      });
      const data = await res.json();
      typing.remove();
      const reply = data.response || "I'm sorry, I couldn't get a response. Please call us at 239-325-1135.";
      addMessage('bot', reply);
      messages.push({ role: 'assistant', content: reply });
    } catch (e) {
      typing.remove();
      addMessage('bot', "Sorry, something went wrong. Please call us at 239-325-1135.");
    }

    sendBtn.disabled = false;
    input.focus();
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
})();
