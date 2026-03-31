(function () {
  const script = document.currentScript;

  const cfg = {
    server:      script?.dataset.server      || 'http://localhost:3001',
    name:        script?.dataset.name        || 'Assistant',
    color:       script?.dataset.color       || '#0a84ff',
    textColor:   script?.dataset.textColor   || '#ffffff',
    prompt:      script?.dataset.prompt      || 'You are a helpful assistant. Be friendly and concise.',
    greeting:    script?.dataset.greeting    || 'Hey! How can I help you today?',
    placeholder: script?.dataset.placeholder || 'iMessage',
    position:    script?.dataset.position    || 'right',
  };

  // ── Styles ──────────────────────────────────────────────────────────────────
  const css = `
    #_cb-root * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif; }
    #_cb-root h1, #_cb-root h2, #_cb-root h3, #_cb-root p { margin: 0; padding: 0; }

    #_cb-btn {
      position: fixed;
      bottom: 28px;
      ${cfg.position === 'left' ? 'left: 28px' : 'right: 28px'};
      width: 56px; height: 56px;
      border-radius: 50%;
      background: ${cfg.color};
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 16px ${cfg.color}66, 0 2px 6px rgba(0,0,0,0.3);
      transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease;
      z-index: 999998;
    }
    #_cb-btn:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 24px ${cfg.color}88, 0 2px 8px rgba(0,0,0,0.3);
    }
    #_cb-btn:active { transform: scale(0.93); }
    #_cb-btn svg { transition: transform 0.3s ease, opacity 0.3s ease; }
    #_cb-btn._open .icon-chat { transform: scale(0) rotate(90deg); opacity: 0; position: absolute; }
    #_cb-btn._open .icon-close { transform: scale(1) rotate(0deg); opacity: 1; }
    #_cb-btn:not(._open) .icon-close { transform: scale(0) rotate(-90deg); opacity: 0; position: absolute; }

    #_cb-window {
      position: fixed;
      bottom: 96px;
      ${cfg.position === 'left' ? 'left: 28px' : 'right: 28px'};
      width: 340px;
      height: 560px;
      background: #000000;
      border-radius: 24px;
      overflow: hidden;
      display: flex; flex-direction: column;
      box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.12);
      z-index: 999997;
      transform: translateY(16px) scale(0.96);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.35s cubic-bezier(0.34,1.2,0.64,1), opacity 0.25s ease;
    }
    #_cb-window._open {
      transform: translateY(0) scale(1);
      opacity: 1;
      pointer-events: all;
    }

    /* iOS-style header */
    #_cb-header {
      background: #1c1c1e;
      padding: 14px 16px 12px;
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      border-bottom: 0.5px solid rgba(255,255,255,0.1);
      flex-shrink: 0;
      position: relative;
    }
    #_cb-avatar {
      width: 52px; height: 52px; border-radius: 50%;
      background: ${cfg.color};
      display: flex; align-items: center; justify-content: center;
      font-size: 22px;
      box-shadow: 0 2px 8px ${cfg.color}55;
    }
    #_cb-header-name {
      font-size: 13px; font-weight: 600; color: #fff;
      letter-spacing: -0.01em;
    }
    #_cb-header-status {
      font-size: 11px; color: rgba(255,255,255,0.45);
      display: flex; align-items: center; gap: 4px;
    }
    #_cb-header-status::before {
      content: ''; display: inline-block;
      width: 5px; height: 5px; border-radius: 50%;
      background: #30d158;
    }
    #_cb-header-close {
      position: absolute; top: 14px; right: 14px;
      width: 28px; height: 28px; border-radius: 50%;
      background: rgba(255,255,255,0.12);
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s ease;
    }
    #_cb-header-close:hover { background: rgba(255,255,255,0.2); }

    /* Messages */
    #_cb-messages {
      flex: 1; overflow-y: auto; padding: 12px 6px;
      display: flex; flex-direction: column; gap: 2px;
      scroll-behavior: smooth; overflow-x: hidden;
    }
    #_cb-messages::-webkit-scrollbar { width: 0px; }

    .cb-msg-wrap {
      display: flex;
      padding: 1px 6px;
    }
    .cb-msg-wrap.bot { justify-content: flex-start; }
    .cb-msg-wrap.user { justify-content: flex-end; }

    .cb-msg {
      max-width: 65%;
      width: fit-content;
      padding: 10px 14px;
      font-size: 16px;
      line-height: 1.4;
      letter-spacing: -0.01em;
      animation: cbFadeUp 0.18s cubic-bezier(0.22,1,0.36,1) both;
      overflow-wrap: break-word; word-break: break-word;
      position: relative;
    }
    @keyframes cbFadeUp {
      from { opacity: 0; transform: translateY(8px) scale(0.95); }
      to   { opacity: 1; transform: translateY(0)  scale(1); }
    }

    /* Bot bubble — gray, tail bottom-left */
    .cb-msg.bot {
      background: #3a3a3c;
      color: #ffffff;
      border-radius: 20px;
      border-bottom-left-radius: 5px;
    }

    /* User bubble — brand color, tail bottom-right */
    .cb-msg.user {
      background: ${cfg.color};
      color: #ffffff;
      border-radius: 20px;
      border-bottom-right-radius: 5px;
    }

    /* Group spacing — consecutive same-sender messages */
    .cb-msg-wrap.bot + .cb-msg-wrap.bot { margin-top: 2px; }
    .cb-msg-wrap.user + .cb-msg-wrap.user { margin-top: 2px; }
    .cb-msg-wrap.bot + .cb-msg-wrap.user,
    .cb-msg-wrap.user + .cb-msg-wrap.bot { margin-top: 10px; }

    /* Typing indicator */
    #_cb-typing {
      display: none; align-items: center; gap: 3px;
      padding: 12px 16px; background: #3a3a3c;
      border-radius: 20px; border-bottom-left-radius: 5px;
      align-self: flex-start; width: fit-content;
      margin: 2px 6px;
    }
    #_cb-typing._show { display: flex; }
    #_cb-typing span {
      width: 7px; height: 7px; border-radius: 50%;
      background: rgba(255,255,255,0.5);
      animation: cbDot 1.2s ease-in-out infinite;
    }
    #_cb-typing span:nth-child(2) { animation-delay: 0.18s; }
    #_cb-typing span:nth-child(3) { animation-delay: 0.36s; }
    @keyframes cbDot {
      0%,80%,100% { transform: scale(0.65); opacity: 0.35; }
      40%          { transform: scale(1.1);  opacity: 1; }
    }

    /* Input bar */
    #_cb-input-wrap {
      padding: 10px 12px 14px;
      background: #1c1c1e;
      border-top: 0.5px solid rgba(255,255,255,0.1);
      display: flex; gap: 8px; align-items: flex-end;
      flex-shrink: 0;
    }
    #_cb-input {
      flex: 1;
      background: #2c2c2e;
      border: 0.5px solid rgba(255,255,255,0.12);
      border-radius: 20px;
      padding: 9px 14px;
      color: #fff;
      font-size: 15px;
      outline: none;
      resize: none;
      max-height: 90px;
      min-height: 38px;
      line-height: 1.4;
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
      transition: border-color 0.2s;
    }
    #_cb-input::placeholder { color: rgba(255,255,255,0.3); }
    #_cb-input:focus { border-color: rgba(255,255,255,0.25); }

    #_cb-send {
      width: 34px; height: 34px;
      border-radius: 50%;
      background: ${cfg.color};
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1), opacity 0.15s ease;
      flex-shrink: 0;
    }
    #_cb-send:hover { transform: scale(1.1); }
    #_cb-send:active { transform: scale(0.88); }
    #_cb-send:disabled { opacity: 0.35; cursor: default; transform: none; }

    @media (max-width: 420px) {
      #_cb-window { width: calc(100vw - 20px); right: 10px; left: 10px; bottom: 88px; border-radius: 18px; }
    }
  `;

  // ── HTML ─────────────────────────────────────────────────────────────────────
  const html = `
    <style>${css}</style>
    <div id="_cb-root">
      <button id="_cb-btn" aria-label="Open chat">
        <svg class="icon-chat" width="22" height="22" fill="none" stroke="${cfg.textColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <svg class="icon-close" width="20" height="20" fill="none" stroke="${cfg.textColor}" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div id="_cb-window" role="dialog" aria-label="${cfg.name} chat">
        <div id="_cb-header">
          <div id="_cb-avatar">💬</div>
          <div id="_cb-header-name">${cfg.name}</div>
          <div id="_cb-header-status">Active now</div>
          <button id="_cb-header-close" aria-label="Close chat">
            <svg width="12" height="12" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div id="_cb-messages"></div>
        <div id="_cb-input-wrap">
          <textarea id="_cb-input" placeholder="${cfg.placeholder}" rows="1"></textarea>
          <button id="_cb-send" aria-label="Send">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="19" x2="12" y2="5"/>
              <polyline points="5 12 12 5 19 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;

  // ── Mount ────────────────────────────────────────────────────────────────────
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);

  // ── Elements ─────────────────────────────────────────────────────────────────
  const btn       = document.getElementById('_cb-btn');
  const win       = document.getElementById('_cb-window');
  const msgs      = document.getElementById('_cb-messages');
  const input     = document.getElementById('_cb-input');
  const sendBtn   = document.getElementById('_cb-send');
  const closeBtn  = document.getElementById('_cb-header-close');

  let history = [];
  let isOpen = false;
  let isLoading = false;

  // ── Typing indicator ─────────────────────────────────────────────────────────
  const typingEl = document.createElement('div');
  typingEl.id = '_cb-typing';
  typingEl.innerHTML = '<span></span><span></span><span></span>';
  msgs.appendChild(typingEl);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  function addMessage(role, text) {
    const wrap = document.createElement('div');
    wrap.className = `cb-msg-wrap ${role}`;
    const el = document.createElement('div');
    el.className = `cb-msg ${role}`;
    el.textContent = text;
    wrap.appendChild(el);
    msgs.insertBefore(wrap, typingEl);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  }

  function setTyping(show) {
    typingEl.classList.toggle('_show', show);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function autoResize() {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 90) + 'px';
  }

  function toggleChat(open) {
    isOpen = open;
    btn.classList.toggle('_open', isOpen);
    win.classList.toggle('_open', isOpen);
    if (isOpen && history.length === 0) {
      setTimeout(() => addMessage('bot', cfg.greeting), 220);
    }
    if (isOpen) setTimeout(() => input.focus(), 320);
  }

  // ── Toggle ───────────────────────────────────────────────────────────────────
  btn.addEventListener('click', () => toggleChat(!isOpen));
  closeBtn.addEventListener('click', () => toggleChat(false));

  // ── Send ─────────────────────────────────────────────────────────────────────
  async function sendMessage() {
    const text = input.value.trim();
    if (!text || isLoading) return;

    isLoading = true;
    sendBtn.disabled = true;
    input.value = '';
    input.style.height = 'auto';

    addMessage('user', text);
    history.push({ role: 'user', content: text });
    setTyping(true);

    try {
      const res = await fetch(`${cfg.server}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          systemPrompt: cfg.prompt,
          businessName: cfg.name,
        }),
      });

      const data = await res.json();
      const reply = data.reply || 'Sorry, something went wrong.';
      setTyping(false);
      addMessage('bot', reply);
      history.push({ role: 'assistant', content: reply });

    } catch (err) {
      setTyping(false);
      addMessage('bot', 'Connection error. Please try again.');
    }

    isLoading = false;
    sendBtn.disabled = false;
    input.focus();
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('input', autoResize);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

})();
