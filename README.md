# NOX — Bot de Discord inspirado em Lookism

Esta é a primeira versão funcional do projeto. O bot usa **slash commands** (com `/`), não prefixos `?`. O Discord exibe os parâmetros e reduz erros de digitação.

## Recursos
- Tema Lookism: `/nox`, `/help`, `/path`, `/ui`, `/kishin`, `/copy`, `/threshold`, `/aura`, `/gen0`, `/rank`
- Moderação: `/warn`, `/timeout`, `/untimeout`, `/kick`, `/ban`, `/purge`
- Canais: `/lock`, `/unlock`, `/slowmode`, `/setlog`
- Filtro básico anti-link configurável em `src/config.js`

## Criar o bot no Discord
1. Abra https://discord.com/developers/applications e clique em **New Application**.
2. Nomeie a aplicação como **NOX**.
3. Na aba **Bot**, adicione o bot e gere/copiei o token. Guarde-o em segredo.
4. Em **OAuth2 → General**, copie o **Application ID**: será `CLIENT_ID`.
5. Em **Bot → Privileged Gateway Intents**, ative **Message Content Intent** para o filtro anti-link.

## Convidar ao servidor
1. Em **OAuth2 → URL Generator**, marque os escopos `bot` e `applications.commands`.
2. Dê apenas as permissões necessárias: View Channels, Send Messages, Embed Links, Read Message History, Manage Messages, Moderate Members, Kick Members, Ban Members e Manage Channels.
3. Abra o link gerado, escolha seu servidor e autorize. Você precisa ter Manage Server para adicionar o bot.
4. Depois de entrar, mova o cargo **NOX** para cima dos cargos que ele precisará moderar. Não dê Administrator.

## Rodar o projeto
É necessário um computador ou hospedagem Node.js para manter o bot online. O celular pode ser usado para editar arquivos, mas manter o processo 24/7 no Android não é confiável.

1. Instale Node.js 20 ou superior.
2. Extraia o ZIP e abra um terminal na pasta `NOX_Discord_Bot`.
3. Rode `npm install`.
4. Copie `.env.example` para `.env`.
5. Preencha `DISCORD_TOKEN`, `CLIENT_ID` e `GUILD_ID`.
   - `DISCORD_TOKEN`: token da aba Bot.
   - `CLIENT_ID`: Application ID.
   - `GUILD_ID`: ID do servidor. Ative Developer Mode no Discord e copie o ID do servidor.
6. Rode `npm run deploy` para publicar os comandos.
7. Rode `npm start` para ligar o bot. Mantenha o processo ativo.

## Exemplos
- `/path`
- `/timeout membro:@Pessoa minutos:30 motivo:spam`
- `/purge quantidade:25`
- `/lock`
- `/slowmode segundos:10`
- `/rank membro:@Pessoa`

## Limitações e segurança
- Nunca compartilhe o token, nem comigo. Se vazar, regenere-o no Developer Portal.
- A hierarquia de cargos do NOX deve ficar acima dos membros que ele vai moderar.
- `/purge` aceita 1–100 mensagens recentes. O Discord não permite bulk-delete de mensagens com mais de 14 dias.
- `/setlog` guarda o canal apenas em memória e perde a configuração ao reiniciar.
- O filtro anti-link é simples e não substitui AutoMod ou um filtro anti-scam.
- Não inclui banco de dados nem painel web nesta primeira versão. Teste em canal privado antes de liberar no servidor.
