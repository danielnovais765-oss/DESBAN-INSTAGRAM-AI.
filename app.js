const $ = id => document.getElementById(id);
let state = null;
let toastTimer;
function toast(message) { const el=$('toast'); el.textContent=message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),2600); }
async function api(url, options={}) {
  const res = await fetch(url, {headers:{'Content-Type':'application/json'}, ...options});
  const data = await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.error || 'Não foi possível salvar.');
  return data;
}
function localDate(value) { if(!value) return '—'; const p=value.split('-'); return p.length===3?`${p[2]}/${p[1]}/${p[0]}`:value; }
function esc(s='') { return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
async function load() { state=await api('/api/case'); render(); }
function render() {
  if(!state) return;
  $('accountName').textContent=state.account.username || '@d_novais5';
  $('disabledDateText').textContent=localDate(state.account.disabledDate);
  $('statusText').textContent=state.account.status || 'Em acompanhamento';
  $('reason').value=state.account.reason || '';
  $('exactMessage').value=state.account.exactMessage || '';
  $('notes').value=state.account.notes || '';
  const done=state.steps.filter(s=>s.done).length, pct=Math.round(done/state.steps.length*100);
  $('progressLabel').textContent=`${done} de ${state.steps.length} concluídas`;
  $('progressPercent').textContent=`${pct}%`; $('progressBar').style.width=pct+'%';
  $('stepsList').innerHTML=state.steps.map(s=>`<div class="step-item"><input type="checkbox" data-step="${esc(s.id)}" ${s.done?'checked':''} aria-label="Marcar ${esc(s.title)}"><div style="flex:1;min-width:0"><b>${esc(s.title)}</b><textarea data-step-note="${esc(s.id)}" rows="2" placeholder="Nota opcional">${esc(s.note||'')}</textarea></div></div>`).join('');
  $('attemptCount').textContent=state.attempts.length;
  $('responseCount').textContent=state.responses.length;
  $('attemptsList').classList.toggle('empty',!state.attempts.length);
  $('attemptsList').innerHTML=state.attempts.length?state.attempts.map(a=>`<div class="history-item"><div class="history-item-head"><b>${esc(a.channel)}</b><span>${localDate(a.date)}</span></div>${a.protocol?`<p><b>Protocolo:</b> ${esc(a.protocol)}</p>`:''}<p>${esc(a.result||'Tentativa registrada sem descrição.')}</p>${a.appealText?`<details><summary>Ver rascunho salvo</summary><p>${esc(a.appealText)}</p></details>`:''}<button data-delete-attempt="${esc(a.id)}">Excluir registro</button></div>`).join(''):'Nenhuma tentativa registrada.';
  $('responsesList').classList.toggle('empty',!state.responses.length);
  $('responsesList').innerHTML=state.responses.length?state.responses.map(r=>`<div class="history-item"><div class="history-item-head"><b>${esc(r.source)}</b><span>${localDate(r.date)}</span></div><p>${esc(r.text)}</p>${r.nextAction?`<small>Próximo passo: ${esc(r.nextAction)}</small><br>`:''}<button data-delete-response="${esc(r.id)}">Excluir registro</button></div>`).join(''):'Nenhuma resposta registrada.';
  $('stepsList').querySelectorAll('[data-step]').forEach(el=>el.addEventListener('change',async()=>{try{state=await api('/api/steps/'+el.dataset.step,{method:'PATCH',body:JSON.stringify({done:el.checked})});render()}catch(e){toast(e.message)}}));
  $('stepsList').querySelectorAll('[data-step-note]').forEach(el=>el.addEventListener('change',async()=>{try{state=await api('/api/steps/'+el.dataset.stepNote,{method:'PATCH',body:JSON.stringify({note:el.value})});render()}catch(e){toast(e.message)}}));
  document.querySelectorAll('[data-delete-attempt]').forEach(el=>el.addEventListener('click',async()=>{if(!confirm('Excluir este registro?'))return;state=await api('/api/attempts/'+el.dataset.deleteAttempt,{method:'DELETE'});render();toast('Registro excluído.')}));
  document.querySelectorAll('[data-delete-response]').forEach(el=>el.addEventListener('click',async()=>{if(!confirm('Excluir esta resposta registrada?'))return;state=await api('/api/responses/'+el.dataset.deleteResponse,{method:'DELETE'});render();toast('Registro excluído.')}));
}
$('saveAnalysis').addEventListener('click',async()=>{
  try{state=await api('/api/account',{method:'PATCH',body:JSON.stringify({reason:$('reason').value,exactMessage:$('exactMessage').value,notes:$('notes').value})});
  $('analysisSaveState').textContent='Salvo'; toast('Análise salva.'); setTimeout(()=>$('analysisSaveState').textContent='',2200);
  }catch(e){toast(e.message)}
});
$('generateAppeal').addEventListener('click',()=>{
  if(!$('truthCheck').checked){toast('Confirme que as informações são verdadeiras antes de gerar.');return}
  const reason=$('reason').value, msg=$('exactMessage').value.trim(), context=$('appealContext').value.trim();
  const name=$('fullName').value.trim(), email=$('contactEmail').value.trim();
  const reasonLine=reason?`A mensagem exibida indicou: ${reason}.`:'Não consegui identificar com certeza o motivo específico da desabilitação.';
  const contextLine=context?`\n\nContexto que posso relatar: ${context}`:'';
  const message=`Olá, equipe do Instagram/Meta.\n\nGostaria de solicitar, se houver uma opção de revisão disponível para minha conta ${state?.account?.username||'@d_novais5'}, uma nova análise da decisão de desabilitação. A conta foi desabilitada em ${localDate(state?.account?.disabledDate||'2026-09-14')}.\n\n${reasonLine}${msg?`\n\nMensagem exibida pelo Instagram: “${msg}”`:''}${contextLine}\n\nPeço, por gentileza, que verifiquem o caso e me informem se existe alguma etapa ou informação adicional necessária. Estou disposto(a) a seguir os procedimentos oficiais e fornecer informações verdadeiras pelos canais seguros da plataforma.\n\n${name?`Nome: ${name}\n`:''}${email?`E-mail de contato: ${email}\n`:''}\nObrigado(a) pela atenção.`;
  $('appealText').value=message; $('appealResult').classList.remove('hidden'); $('appealResult').scrollIntoView({behavior:'smooth',block:'nearest'});
});
$('copyAppeal').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('appealText').value);toast('Texto copiado.')}catch{ $('appealText').select();document.execCommand('copy');toast('Texto selecionado/copied quando permitido.')}});
$('saveAttemptWithAppeal').addEventListener('click',async()=>{ $('attemptResult').value=$('attemptResult').value||'Rascunho de contestação preparado; envio ainda não confirmado.'; await saveAttempt($('appealText').value);});
async function saveAttempt(appealText=''){
 try{
  state=await api('/api/attempts',{method:'POST',body:JSON.stringify({date:$('attemptDate').value,channel:$('attemptChannel').value,protocol:$('protocol').value,result:$('attemptResult').value,appealText})});
  $('protocol').value='';$('attemptResult').value='';render();toast('Tentativa registrada. Lembre-se: registro não significa envio à Meta.');
 }catch(e){toast(e.message)}
}
$('addAttempt').addEventListener('click',()=>saveAttempt());
$('addResponse').addEventListener('click',async()=>{
 if(!$('responseText').value.trim()){toast('Digite a resposta real recebida.');return}
 try{state=await api('/api/responses',{method:'POST',body:JSON.stringify({date:$('responseDate').value,source:$('responseSource').value,text:$('responseText').value,nextAction:$('nextAction').value})});
 $('responseText').value='';$('nextAction').value='';render();toast('Resposta registrada.');}catch(e){toast(e.message)}
});
$('exportData').addEventListener('click',()=>{
 const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}), url=URL.createObjectURL(blob), a=document.createElement('a');
 a.href=url;a.download='desban-instagram-ai-registros.json';a.click();URL.revokeObjectURL(url);toast('Exportação preparada.');
});
(async()=>{
 $('attemptDate').value=new Date().toISOString().slice(0,10);$('responseDate').value=new Date().toISOString().slice(0,10);
 try{await load()}catch(e){toast('Não foi possível conectar ao servidor. Recarregue a página.')}
})();