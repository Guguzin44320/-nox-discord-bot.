require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  Events,
  REST,
  Routes
} = require("discord.js");
const config = require("./config");
const { commands, handle } = require("./commands");

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error("NOX: configure DISCORD_TOKEN, CLIENT_ID e GUILD_ID nas variáveis de ambiente.");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once(Events.ClientReady, c => {
  console.log(`NOX online: ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  try {
    await handle(interaction);
  } catch (error) {
    console.error("NOX command error:", error);
    const payload = {
      content: "❌ Não consegui executar. Confira as permissões do NOX e a hierarquia dos cargos.",
      ephemeral: true
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload).catch(() => {});
    } else {
      await interaction.reply(payload).catch(() => {});
    }
  }
});

client.on(Events.MessageCreate, async message => {
  if (!config.antiLinkEnabled || !message.guild || message.author.bot) return;
  if (config.linkWhitelistUserIds.includes(message.author.id)) return;
  if (config.linkWhitelistChannelIds.includes(message.channelId)) return;
  if (message.member?.permissions.has("ManageMessages")) return;

  const link = /(?:https?:\/\/|www\.|discord\.gg\/|discord\.com\/invite\/)[^\s]+/i;
  if (!link.test(message.content)) return;

  try {
    await message.delete();
    const warning = await message.channel.send(
      `🔗 ${message.author}, links não são permitidos neste canal.`
    );
    setTimeout(() => warning.delete().catch(() => {}), 7000);
  } catch (error) {
    console.error("Filtro de links:", error.message);
  }
});

async function startNOX() {
  try {
    // Registra/atualiza os comandos deste servidor antes de conectar o bot.
    const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log(`NOX: ${commands.length} comandos publicados/atualizados.`);

    await client.login(DISCORD_TOKEN);
  } catch (error) {
    console.error("NOX não conseguiu iniciar:", error);
    process.exit(1);
  }
}

startNOX();
