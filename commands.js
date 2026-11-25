const {
  SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType
} = require("discord.js");
const config = require("./config");

const P = PermissionFlagsBits;
const commands = [
  new SlashCommandBuilder().setName("nox").setDescription("Exibe o status do NOX"),
  new SlashCommandBuilder().setName("help").setDescription("Lista os comandos do NOX"),
  ...[
    ["path", "Ativa o Path of the Infinite"],
    ["ui", "Ativa o Ultra Instinct"],
    ["kishin", "Desperta o Kishin"],
    ["copy", "Executa a técnica de cópia"],
    ["threshold", "Ultrapassa um threshold"],
    ["aura", "Libera sua aura"],
    ["gen0", "Invoca a atmosfera da Geração 0"]
  ].map(([name, description]) => new SlashCommandBuilder().setName(name).setDescription(description)),
  new SlashCommandBuilder().setName("rank").setDescription("Mostra a ficha de um membro")
    .addUserOption(o => o.setName("membro").setDescription("Membro").setRequired(false)),
  new SlashCommandBuilder().setName("warn").setDescription("Adverte um membro")
    .setDefaultMemberPermissions(P.ModerateMembers)
    .addUserOption(o => o.setName("membro").setDescription("Alvo").setRequired(true))
    .addStringOption(o => o.setName("motivo").setDescription("Motivo").setRequired(false)),
  new SlashCommandBuilder().setName("timeout").setDescription("Silencia um membro")
    .setDefaultMemberPermissions(P.ModerateMembers)
    .addUserOption(o => o.setName("membro").setDescription("Alvo").setRequired(true))
    .addIntegerOption(o => o.setName("minutos").setDescription("1 a 40320 minutos").setMinValue(1).setMaxValue(40320).setRequired(true))
    .addStringOption(o => o.setName("motivo").setDescription("Motivo").setRequired(false)),
  new SlashCommandBuilder().setName("untimeout").setDescription("Remove o silenciamento")
    .setDefaultMemberPermissions(P.ModerateMembers)
    .addUserOption(o => o.setName("membro").setDescription("Alvo").setRequired(true)),
  new SlashCommandBuilder().setName("kick").setDescription("Expulsa um membro")
    .setDefaultMemberPermissions(P.KickMembers)
    .addUserOption(o => o.setName("membro").setDescription("Alvo").setRequired(true))
    .addStringOption(o => o.setName("motivo").setDescription("Motivo").setRequired(false)),
  new SlashCommandBuilder().setName("ban").setDescription("Bane um membro")
    .setDefaultMemberPermissions(P.BanMembers)
    .addUserOption(o => o.setName("membro").setDescription("Alvo").setRequired(true))
    .addStringOption(o => o.setName("motivo").setDescription("Motivo").setRequired(false)),
  new SlashCommandBuilder().setName("purge").setDescription("Apaga de 1 a 100 mensagens recentes")
    .setDefaultMemberPermissions(P.ManageMessages)
    .addIntegerOption(o => o.setName("quantidade").setDescription("Quantidade").setMinValue(1).setMaxValue(100).setRequired(true)),
  new SlashCommandBuilder().setName("lock").setDescription("Bloqueia este canal")
    .setDefaultMemberPermissions(P.ManageChannels),
  new SlashCommandBuilder().setName("unlock").setDescription("Desbloqueia este canal")
    .setDefaultMemberPermissions(P.ManageChannels),
  new SlashCommandBuilder().setName("slowmode").setDescription("Define o modo lento")
    .setDefaultMemberPermissions(P.ManageChannels)
    .addIntegerOption(o => o.setName("segundos").setDescription("0 a 21600").setMinValue(0).setMaxValue(21600).setRequired(true)),
  new SlashCommandBuilder().setName("setlog").setDescription("Define o canal de logs (temporário)")
    .setDefaultMemberPermissions(P.ManageGuild)
    .addChannelOption(o => o.setName("canal").setDescription("Canal de texto").addChannelTypes(ChannelType.GuildText).setRequired(true))
].map(c => c.toJSON());

function embed(title, description) {
  return new EmbedBuilder().setColor(config.theme).setTitle(title).setDescription(description)
    .setFooter({ text: "NOX • LOOKISM SYSTEM" }).setTimestamp();
}
function canModerate(member) {
  return member.permissions.has(P.Administrator) ||
    member.permissions.has(P.ModerateMembers) ||
    member.permissions.has(P.KickMembers) ||
    member.permissions.has(P.BanMembers) ||
    member.permissions.has(P.ManageMessages) ||
    (config.moderatorRoleIds.length > 0 && config.moderatorRoleIds.some(id => member.roles.cache.has(id)));
}
async function log(guild, e) {
  const id = guild.client.noxLogChannelId;
  const channel = id && guild.channels.cache.get(id);
  if (channel?.isTextBased()) await channel.send({ embeds: [e] }).catch(() => {});
}

async function handle(i) {
  const name = i.commandName, guild = i.guild, member = i.member;
  const user = i.options.getUser("membro");
  const reason = i.options.getString("motivo") || "Não informado.";
  const powers = {
    path: ["THE PATH OF THE INFINITE", "Every technique has already been witnessed.\\nEvery movement has already been understood.\\n\\n**There is nothing left to copy.**"],
    ui: ["ULTRA INSTINCT", "The body moves before the mind can react.\\nNo hesitation. No wasted movement.\\n\\n**Unconscious combat.**"],
    kishin: ["THE KISHIN", "The Yamazaki bloodline awakens.\\nA monster forged for destruction.\\n\\n**The Kishin has arrived.**"],
    copy: ["COPY COMPLETE", "Observation. Understanding. Replication.\\n\\n**The technique is no longer unique.**"],
    threshold: ["THRESHOLD BROKEN", "Pain is another obstacle.\\nLimits exist to be surpassed.\\n\\n**A new mastery has been reached.**"],
    aura: ["MONSTROUS AURA", "The atmosphere changes.\\nThe room falls silent.\\n\\n**Presence alone is enough.**"],
    gen0: ["GENERATION 0", "Before the legends became stories, they created them.\\n\\n**The fist generation remembers.**"]
  };

  if (name === "nox") return i.reply({ embeds: [embed("NOX // SYSTEM ONLINE", "Combat data loaded.\\nModeration protocols ready.\\n\\nUse `/help` to inspect the system.")] });
  if (name === "help") return i.reply({ embeds: [embed("NOX // COMMAND DIRECTORY",
    "**Lookism:** `/path` `/ui` `/kishin` `/copy` `/threshold` `/aura` `/gen0` `/rank`\\n\\n**Moderation:** `/warn` `/timeout` `/untimeout` `/kick` `/ban` `/purge`\\n\\n**Channels:** `/lock` `/unlock` `/slowmode` `/setlog`")], ephemeral: true });
  if (powers[name]) return i.reply({ embeds: [embed(powers[name][0], powers[name][1])] });
  if (name === "rank") {
    const target = user || i.user;
    const m = await guild.members.fetch(target.id);
    const roles = m.roles.cache.filter(r => r.id !== guild.id).map(r => r.name).slice(0, 8);
    return i.reply({ embeds: [embed("CHARACTER PROFILE", `**Name:** ${target.username}\\n**Rank:** Unclassified\\n**Affiliation:** ${roles.join(", ") || "Unassigned"}\\n**Status:** Active`)] });
  }

  if (!canModerate(member)) return i.reply({ content: "❌ Você não tem permissão para isso.", ephemeral: true });
  if (user && user.id === i.user.id) return i.reply({ content: "❌ Você não pode aplicar essa ação em si mesmo.", ephemeral: true });
  const target = user ? await guild.members.fetch(user.id).catch(() => null) : null;
  if (user && !target) return i.reply({ content: "❌ Membro não encontrado no servidor.", ephemeral: true });
  if (target && guild.ownerId !== i.user.id && target.roles.highest.position >= member.roles.highest.position)
    return i.reply({ content: "❌ Seu cargo precisa estar acima do cargo do alvo.", ephemeral: true });

  if (name === "warn") {
    const e = embed("FINAL WARNING", `**${user.username}** recebeu uma advertência.\\n**Motivo:** ${reason}\\n\\n*One warning. One chance to change.*`);
    await log(guild, e); return i.reply({ embeds: [e] });
  }
  if (name === "timeout") {
    const minutes = i.options.getInteger("minutos");
    await target.timeout(minutes * 60000, reason);
    const e = embed("PATH SUPPRESSION", `**${user.username}** foi silenciado por **${minutes} minuto(s)**.\\n**Motivo:** ${reason}\\n\\n*Your techniques are useless against me.*`);
    await log(guild, e); return i.reply({ embeds: [e] });
  }
  if (name === "untimeout") {
    await target.timeout(null, "Removido pela moderação.");
    return i.reply({ embeds: [embed("SUPPRESSION RELEASED", `**${user.username}** voltou a poder falar.`)] });
  }
  if (name === "kick") {
    await target.kick(reason);
    const e = embed("EXPULSION THRESHOLD", `**${user.username}** foi expulso.\\n**Motivo:** ${reason}`);
    await log(guild, e); return i.reply({ embeds: [e] });
  }
  if (name === "ban") {
    await target.ban({ reason });
    const e = embed("ABSOLUTE JUDGMENT", `**${user.username}** foi banido.\\n**Motivo:** ${reason}`);
    await log(guild, e); return i.reply({ embeds: [e] });
  }
  if (name === "purge") {
    const n = i.options.getInteger("quantidade");
    const deleted = await i.channel.bulkDelete(n, true);
    return i.reply({ content: `🧹 **YAMAZAKI PURGE** • ${deleted.size} mensagem(ns) apagada(s). Mensagens com mais de 14 dias não entram na exclusão em massa.`, ephemeral: true });
  }
  if (name === "lock" || name === "unlock") {
    await i.channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: name === "unlock" ? null : false });
    return i.reply({ embeds: [embed(name === "lock" ? "CHANNEL SEALED" : "CHANNEL RELEASED",
      name === "lock" ? "This channel has been sealed by NOX." : "This channel is open again.")] });
  }
  if (name === "slowmode") {
    const seconds = i.options.getInteger("segundos");
    await i.channel.setRateLimitPerUser(seconds);
    return i.reply({ embeds: [embed("PACE CONTROL", `Slowmode: **${seconds} segundo(s)**.`)] });
  }
  if (name === "setlog") {
    const channel = i.options.getChannel("canal");
    i.client.noxLogChannelId = channel.id;
    return i.reply({ content: `✅ Logs configurados em ${channel}. (A configuração será perdida ao reiniciar o bot nesta versão.)`, ephemeral: true });
  }
}
module.exports = { commands, handle };
