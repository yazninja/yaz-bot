import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Get the bots latency!")
    .addBooleanOption(option => option.setName("show")
        .setDescription("Show to everyone!")
        .setRequired(false)
    ),
  execute: async (interaction) => {
    let test = Date.now()
    await interaction.reply({ embeds:[{color: "#0099ff", description: "Pinging..."}], ephemeral: !show})
    let embed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle("Pong!🏓")
      .setDescription(`API: \`${interaction.client.ws.ping}ms\`\nLatency: \`${test - interaction.createdTimestamp}ms\``);
    
    await interaction.editReply({ content: " ", embeds:[embed], ephemeral: !show});
  },
};
