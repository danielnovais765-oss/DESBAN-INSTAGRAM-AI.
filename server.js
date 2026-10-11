const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'case.json');

app.use(express.json({ limit: '200kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const initial = {
  account: { username: '@d_novais5', disabledDate: '2026-09-14', status: 'Desabilitada', reason: '', exactMessage: '', notes: '' },
  steps: [
    { id: 'review-message', title: 'Conferir a mensagem do Instagram', done: false, note: '' },
    { id: 'official-review', title: 'Abrir o canal oficial de revisão', done: false, note: '' },
    { id: 'submit-appeal', title: 'Enviar a contestação pelo Instagram/Meta', done: false, note: '' },
    { id: 'save-protocol', title: 'Registrar protocolo ou confirmação', done: false, note: '' },
    { id: 'wait-response', title: 'Aguardar e registrar a resposta', done: false, note: '' }
  ],
  attempts: [],
  responses: [],
  updatedAt: new Date().toISOString()
};

function ensureStore() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
}
function readCase() {
  ensureStore();
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2)); return structuredClone(initial); }
}
function writeCase(data) {
  data.updatedAt = new Date().toISOString();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}
function cleanString(value, max = 3000) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'DESBAN INSTAGRAM AI' }));
app.get('/api/case', (_req, res) => res.json(readCase()));

app.patch('/api/account', (req, res) => {
  const data = readCase();
  const a = req.body || {};
  if (a.username !== undefined) data.account.username = cleanString(a.username, 60) || '@d_novais5';
  if (a.disabledDate !== undefined) data.account.disabledDate = cleanString(a.disabledDate, 20);
  if (a.status !== undefined) data.account.status = cleanString(a.status, 80);
  if (a.reason !== undefined) data.account.reason = cleanString(a.reason, 1000);
  if (a.exactMessage !== undefined) data.account.exactMessage = cleanString(a.exactMessage, 2000);
  if (a.notes !== undefined) data.account.notes = cleanString(a.notes, 3000);
  writeCase(data); res.json(data);
});

app.patch('/api/steps/:id', (req, res) => {
  const data = readCase();
  const step = data.steps.find(s => s.id === req.params.id);
  if (!step) return res.status(404).json({ error: 'Etapa não encontrada.' });
  if (typeof req.body.done === 'boolean') step.done = req.body.done;
  if (req.body.note !== undefined) step.note = cleanString(req.body.note, 1000);
  writeCase(data); res.json(data);
});

app.post('/api/attempts', (req, res) => {
  const data = readCase();
  const body = req.body || {};
  const attempt = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    date: cleanString(body.date, 20) || new Date().toISOString().slice(0, 10),
    channel: cleanString(body.channel, 100) || 'Central oficial do Instagram',
    protocol: cleanString(body.protocol, 200),
    result: cleanString(body.result, 1000),
    appealText: cleanString(body.appealText, 5000),
    createdAt: new Date().toISOString()
  };
  data.attempts.unshift(attempt);
  writeCase(data); res.status(201).json(data);
});
app.delete('/api/attempts/:id', (req, res) => {
  const data = readCase(); data.attempts = data.attempts.filter(a => a.id !== req.params.id);
  writeCase(data); res.json(data);
});

app.post('/api/responses', (req, res) => {
  const data = readCase(); const body = req.body || {};
  const response = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    date: cleanString(body.date, 20) || new Date().toISOString().slice(0, 10),
    source: cleanString(body.source, 120) || 'Instagram/Meta',
    text: cleanString(body.text, 4000),
    nextAction: cleanString(body.nextAction, 1000),
    createdAt: new Date().toISOString()
  };
  if (!response.text) return res.status(400).json({ error: 'Informe o conteúdo da resposta recebida.' });
  data.responses.unshift(response); writeCase(data); res.status(201).json(data);
});
app.delete('/api/responses/:id', (req, res) => {
  const data = readCase(); data.responses = data.responses.filter(r => r.id !== req.params.id);
  writeCase(data); res.json(data);
});

app.post('/api/reset', (_req, res) => {
  writeCase(structuredClone(initial)); res.json(readCase());
});

app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, () => console.log(`DESBAN INSTAGRAM AI rodando na porta ${PORT}`));