/* ===========================
   SENIM AI CHAT ASSISTANT
   Calls your Spring Boot backend → OpenAI
   =========================== */

(function () {

  // ─── CONFIG — only change this if your backend URL is different ───────────
  const BACKEND_URL = 'http://localhost:8081';
  // ─────────────────────────────────────────────────────────────────────────

  const QUICK_REPLIES = [
    'Show me sofas 🛋️',
    'Best sellers',
    'Delivery info',
    'What tables do you have?',
    'How are you?',
  ];

  // ─── STATE ────────────────────────────────────────────────────────────────
  let isOpen    = false;
  let isTyping  = false;
  let history   = []; // { role: 'user'|'assistant', content: string }[]

  // ─── BACKEND CALL ────────────────────────────────────────────────────────
  async function askBackend(userMessage) {
    const res = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage, history }),
    });

    if (!res.ok) throw new Error(`Backend error ${res.status}`);

    const data = await res.json();
    return data.reply || 'Sorry, no response received.';
  }

  // ─── BUILD UI ─────────────────────────────────────────────────────────────
  function buildUI() {
    // Launcher
    const launcher = document.createElement('div');
    launcher.className = 'chat-launcher';

    const tooltip = document.createElement('div');
    tooltip.className = 'chat-tooltip';
    tooltip.id = 'chat-tooltip';
    tooltip.textContent = '👋 Need help? Chat with us!';
    launcher.appendChild(tooltip);
    setTimeout(() => { tooltip.style.opacity = '0'; tooltip.style.pointerEvents = 'none'; }, 5000);

    const btn = document.createElement('button');
    btn.className = 'chat-bubble-btn';
    btn.setAttribute('aria-label', 'Open AI chat assistant');
    btn.innerHTML = `
      <svg class="icon-chat" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <svg class="icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
      </svg>
      <span class="chat-notif-dot"></span>`;
    btn.addEventListener('click', toggleChat);
    launcher.appendChild(btn);
    document.body.appendChild(launcher);

    // Chat window
    const win = document.createElement('div');
    win.className = 'chat-window';
    win.id = 'senim-chat-window';
    win.innerHTML = `
      <div class="chat-header">
        <div class="chat-header-avatar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V15a1 1 0 0 0-2 0v1.93A8 8 0 0 1 4.07 11H6a1 1 0 0 0 0-2H4.07A8 8 0 0 1 11 4.07V6a1 1 0 0 0 2 0V4.07A8 8 0 0 1 19.93 11H18a1 1 0 0 0 0 2h1.93A8 8 0 0 1 13 16.93z"/>
          </svg>
        </div>
        <div class="chat-header-info">
          <h4>Senim Assistant</h4>
          <span><span class="chat-online-dot"></span>AI-powered · Always online</span>
        </div>
      </div>
      <div class="chat-messages" id="chat-messages"></div>
      <div class="chat-quick-replies" id="chat-quick-replies"></div>
      <div class="chat-input-row">
        <input class="chat-input" id="chat-input" type="text"
               placeholder="Ask me anything…" autocomplete="off" maxlength="600"/>
        <button class="chat-send-btn" id="chat-send-btn" aria-label="Send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9l20-7z"/>
          </svg>
        </button>
      </div>
      <div class="chat-powered">Powered by GPT-4o-mini · Senim Furniture 🌿</div>`;
    document.body.appendChild(win);

    document.getElementById('chat-input').addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
    document.getElementById('chat-send-btn').addEventListener('click', () => sendMessage());

    // Quick replies
    const qrEl = document.getElementById('chat-quick-replies');
    QUICK_REPLIES.forEach(text => {
      const b = document.createElement('button');
      b.className = 'chat-quick-btn';
      b.textContent = text;
      b.addEventListener('click', () => sendMessage(text));
      qrEl.appendChild(b);
    });

    // Greeting
    setTimeout(() => {
      addBotMsg("Hey there! 👋 I'm Senim, your AI furniture assistant. I can help you find the perfect piece, answer questions, or just chat. What's on your mind?");
    }, 500);
  }

  // ─── TOGGLE ───────────────────────────────────────────────────────────────
  function toggleChat() {
    isOpen = !isOpen;
    const win = document.getElementById('senim-chat-window');
    const btn = document.querySelector('.chat-bubble-btn');
    const dot = btn.querySelector('.chat-notif-dot');
    win.classList.toggle('visible', isOpen);
    btn.classList.toggle('open', isOpen);
    if (dot) dot.style.display = isOpen ? 'none' : '';
    const tooltip = document.getElementById('chat-tooltip');
    if (tooltip) { tooltip.style.opacity = '0'; tooltip.style.pointerEvents = 'none'; }
    if (isOpen) setTimeout(() => document.getElementById('chat-input')?.focus(), 320);
  }

  // ─── MESSAGE RENDERING ────────────────────────────────────────────────────
  function addBotMsg(html) {
    const msgs = document.getElementById('chat-messages');
    const row = document.createElement('div');
    row.className = 'chat-msg bot';
    row.innerHTML = `
      <div class="chat-msg-avatar">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V15a1 1 0 0 0-2 0v1.93A8 8 0 0 1 4.07 11H6a1 1 0 0 0 0-2H4.07A8 8 0 0 1 11 4.07V6a1 1 0 0 0 2 0V4.07A8 8 0 0 1 19.93 11H18a1 1 0 0 0 0 2h1.93A8 8 0 0 1 13 16.93z"/>
        </svg>
      </div>
      <div class="chat-msg-bubble">${html}</div>`;
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addUserMsg(text) {
    const msgs = document.getElementById('chat-messages');
    const row = document.createElement('div');
    row.className = 'chat-msg user';
    row.innerHTML = `<div class="chat-msg-bubble">${esc(text)}</div>`;
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping() {
    const msgs = document.getElementById('chat-messages');
    const el = document.createElement('div');
    el.className = 'chat-msg bot';
    el.id = 'chat-typing-indicator';
    el.innerHTML = `
      <div class="chat-msg-avatar">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V15a1 1 0 0 0-2 0v1.93A8 8 0 0 1 4.07 11H6a1 1 0 0 0 0-2H4.07A8 8 0 0 1 11 4.07V6a1 1 0 0 0 2 0V4.07A8 8 0 0 1 19.93 11H18a1 1 0 0 0 0 2h1.93A8 8 0 0 1 13 16.93z"/>
        </svg>
      </div>
      <div class="chat-typing"><span></span><span></span><span></span></div>`;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function hideTyping() { document.getElementById('chat-typing-indicator')?.remove(); }

  // ─── SEND ─────────────────────────────────────────────────────────────────
  async function sendMessage(override) {
    if (isTyping) return;
    const input = document.getElementById('chat-input');
    const text  = (override ?? input?.value ?? '').trim();
    if (!text) return;

    document.getElementById('chat-quick-replies').style.display = 'none';
    if (!override && input) input.value = '';
    addUserMsg(text);

    isTyping = true;
    document.getElementById('chat-send-btn').disabled = true;
    showTyping();

    try {
      const reply = await askBackend(text);
      hideTyping();
      addBotMsg(reply);

      // Update history for next turn
      history.push({ role: 'user', content: text });
      history.push({ role: 'assistant', content: reply });
      if (history.length > 20) history = history.slice(-20);

    } catch (err) {
      hideTyping();
      console.error('Chat error:', err);
      addBotMsg('Oops, could not reach the server 😔 Make sure the backend is running, then try again.');
    } finally {
      isTyping = false;
      document.getElementById('chat-send-btn').disabled = false;
      input?.focus();
    }
  }

  // ─── UTIL ─────────────────────────────────────────────────────────────────
  function esc(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ─── INIT ─────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => buildUI());

})();
