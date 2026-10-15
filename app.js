const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
let category = 'Study';
let conversations = [];
let currentConversation = [];
let activeHistoryId = null;
let busy = false;
const icons = {Study:'🎓',Health:'🩺',Fitness:'💪',Fashion:'👕',History:'🏛️',Coding:'⌘'};
const welcome = $('#welcome'), messages = $('#messages'), input = $('#messageInput');

function setCategory(next) {
  category = next;
  $('#currentCategory').textContent = next;
  $('#inputCategory').textContent = next + ' mode';
  $$('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.category === next));
  if (!currentConversation.length) input.placeholder = `Ask a ${next.toLowerCase()} question…`;
}
function newChat() {
  if (currentConversation.length) saveConversation();
  currentConversation = [];
  activeHistoryId = null;
  messages.innerHTML = '';
  messages.hidden = true;
  welcome.hidden = false;
  input.value = '';
  setCategory(category);
  input.focus();
}
function saveConversation() {
  if (!currentConversation.length) return;
  const first = currentConversation.find(x=>x.role==='user');
  const item = {id: activeHistoryId || Date.now(), title:(first?.content || 'New conversation').slice(0,54), category, messages:[...currentConversation]};
  activeHistoryId = item.id;
  const existing = conversations.findIndex(c => c.id === item.id);
  if (existing >= 0) conversations.splice(existing, 1);
  conversations.unshift(item);
  conversations = conversations.slice(0,30);
  localStorage.setItem('studybuddy-history', JSON.stringify(conversations));
  renderHistory();
}
function loadHistory() {
  try { conversations = JSON.parse(localStorage.getItem('studybuddy-history') || '[]'); } catch { conversations=[]; }
  renderHistory();
}
function renderHistory() {
  const el = $('#historyList');
  if (!conversations.length) { el.innerHTML='<p class="empty-history">Your chats will appear here.</p>'; return; }
  el.innerHTML='';
  conversations.forEach(c=>{
    const b=document.createElement('button'); b.className='history-entry'; b.textContent=`${icons[c.category]||'✦'}  ${c.title}`; b.title=c.title;
    b.onclick=()=>{currentConversation=[...c.messages];activeHistoryId=c.id;setCategory(c.category);welcome.hidden=true;messages.hidden=false;messages.innerHTML='';currentConversation.forEach(m=>renderMessage(m.role,m.content));};
    el.appendChild(b);
  });
}
function renderMessage(role, content, extra='') {
  welcome.hidden = true; messages.hidden = false;
  const row=document.createElement('div'); row.className='message '+(role==='user'?'user':'assistant');
  const avatar=document.createElement('div');avatar.className='message-avatar';avatar.textContent=role==='user'?'U':'✳';
  const body=document.createElement('div');body.className='message-body';
  const label=document.createElement('div');label.className='message-label';label.textContent=role==='user'?'YOU':'STUDYBUDDY AI';
  const bubble=document.createElement('div');bubble.className='bubble';bubble.textContent=content;
  body.append(label,bubble);
  if(extra){const note=document.createElement('div');note.className='mode-note';note.textContent=extra;body.append(note);}
  row.append(avatar,body);messages.append(row);
  $('#chatArea').scrollTop=$('#chatArea').scrollHeight;
  return row;
}
async function sendMessage(text) {
  text=(text??input.value).trim();
  if(!text||busy)return;
  if(!currentConversation.length) currentConversation=[];
  const previousCategory=category;
  currentConversation.push({role:'user',content:text});
  renderMessage('user',text);
  input.value='';input.style.height='auto';busy=true;$('#sendBtn').disabled=true;
  const typing=renderMessage('assistant','Thinking through it…');typing.classList.add('typing');
  try {
    const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,category:previousCategory,history:currentConversation.slice(0,-1)})});
    if(!res.ok)throw new Error('Server error');
    const data=await res.json();typing.remove();
    currentConversation.push({role:'assistant',content:data.reply});
    renderMessage('assistant',data.reply,data.demoMode?'Demo mode · set OPENAI_API_KEY for AI-generated answers':'AI-generated answer');
    saveConversation();
    $('#modeStatus').textContent=data.demoMode?'Demo mode · local server':'AI mode · connected';
  } catch(e) {
    typing.remove();const reply='I could not connect to the app server. Make sure the Spring Boot app is running, then refresh this page.';
    currentConversation.push({role:'assistant',content:reply});renderMessage('assistant',reply);
  } finally {busy=false;$('#sendBtn').disabled=false;input.focus();}
}
$$('[data-category]').forEach(b=>b.addEventListener('click',()=>{if(b.classList.contains('topic-card')||b.classList.contains('nav-item')){setCategory(b.dataset.category);if(b.classList.contains('topic-card'))input.focus();}}));
$$('[data-prompt]').forEach(b=>b.addEventListener('click',()=>sendMessage(b.dataset.prompt)));
$('#sendBtn').addEventListener('click',()=>sendMessage());
input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}});
input.addEventListener('input',()=>{input.style.height='auto';input.style.height=Math.min(input.scrollHeight,120)+'px';});
$('#newChat').addEventListener('click',newChat);
$('#clearHistory').addEventListener('click',()=>{if(confirm('Clear all saved chat history on this browser?')){conversations=[];localStorage.removeItem('studybuddy-history');renderHistory();}});
$('#themeToggle').addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('studybuddy-dark',document.body.classList.contains('dark')?'1':'0');});
$('#mobileMenu').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
document.addEventListener('click',e=>{if(window.innerWidth<=760&&!e.target.closest('#sidebar')&&!e.target.closest('#mobileMenu'))$('#sidebar').classList.remove('open');});
if(localStorage.getItem('studybuddy-dark')==='1')document.body.classList.add('dark');
loadHistory();setCategory(category);
window.addEventListener('beforeunload',()=>{if(currentConversation.length) { /* Saved when starting a new conversation; current session remains in memory until then. */ }});
