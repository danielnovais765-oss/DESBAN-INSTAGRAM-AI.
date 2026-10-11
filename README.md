# DESBAN INSTAGRAM AI

Assistente independente para organizar a recuperação de uma conta Instagram por canais oficiais. Inclui frontend responsivo, API Express e armazenamento JSON no servidor.

## O que faz
- Painel da conta `@d_novais5` e data de desabilitação inicial `14/09/2026`.
- Registo do motivo/mensagem apresentada e observações.
- Links para recursos oficiais da Instagram/Meta.
- Geração local de rascunho de contestação (não envia nada).
- Etapas marcáveis, histórico de tentativas, protocolos e respostas reais.
- Exportação dos registros em JSON.
- Não pede senha, códigos de autenticação nem cookies.

## Requisitos
- Node.js 18 ou superior
- npm

## Executar no computador
1. Extraia o ZIP.
2. Abra o terminal dentro da pasta do projeto.
3. Execute:
   ```bash
   npm install
   npm start
   ```
4. Abra `http://localhost:3000`.

## Publicar no Render
1. Envie todos os arquivos desta pasta para um repositório GitHub.
2. No Render, crie um **Web Service** conectado ao repositório.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Opcional: configure `DATA_DIR` para o caminho de um disco persistente montado no Render (por exemplo `/var/data`).
6. Se usar disco persistente, adicione um Persistent Disk e configure `DATA_DIR` para o seu ponto de montagem. Sem disco persistente, os registros podem ser apagados quando o serviço for reconstruído/reiniciado conforme a infraestrutura.

## Rotas da API
- `GET /api/health` — estado básico do serviço
- `GET /api/case` — carrega o caso
- `PATCH /api/account` — atualiza os dados do caso
- `PATCH /api/steps/:id` — atualiza etapa
- `POST /api/attempts` / `DELETE /api/attempts/:id`
- `POST /api/responses` / `DELETE /api/responses/:id`
- `POST /api/reset` — reinicia os registros (use com cuidado)

## Importante sobre segurança e limites
- A aplicação é uma ferramenta de organização, não um serviço oficial da Meta.
- Não há API pública geral que permita a um app independente contestar ou reativar qualquer conta desabilitada. A disponibilidade da revisão é determinada pela própria plataforma e pode variar por caso.
- Para contestar, entre no Instagram oficial e siga a opção de revisão que aparecer; não compartilhe senha, códigos de autenticação, cookies ou documentos sensíveis com terceiros.
- O texto gerado é um modelo e deve ser conferido e editado para refletir fatos verdadeiros.
- O painel não consegue verificar a situação da conta diretamente e não garante recuperação.
- A API não tem autenticação de usuário; mantenha o serviço privado ou adicione autenticação antes de hospedar dados pessoais publicamente. Evite registrar dados sensíveis.
