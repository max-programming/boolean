import { MessageEmbed, TextChannel } from "discord.js";
import config from "../config";
import { Bot } from "../structures/Bot";
import { IBotEvent } from "../types";
import { getData, writeData } from "../utils";

export const event: IBotEvent = {
    name: "ready",
    once: true,
    async execute(client: Bot) {
        console.log(`Logged in as ${client.user?.tag}.`);

        const data = await getData();

        const rolesChannel = client.channels.cache.get(
            config.rolesChannelId
        ) as TextChannel;
        config.reactionMessages.forEach(async (reactionMessage) => {
            if (reactionMessage.title in data.reactionMessages) return;

            const reactionEmbed = new MessageEmbed()
                .setColor("ORANGE")
                .setTitle(reactionMessage.title);

            reactionEmbed.description = "";

            const emojis = [];

            for (const reactionKey in reactionMessage.reactions) {
                const reaction = reactionMessage.reactions[reactionKey];
                reactionEmbed.description += `${reaction.emoji}: ${reactionKey}\n`;
                emojis.push(reaction.emoji);
            }

            const rolesMessage = await rolesChannel.send({
                embeds: [reactionEmbed],
            });

            emojis.forEach((emoji) => {
                rolesMessage.react(emoji);
            });

            data.reactionMessages[reactionMessage.title] = rolesMessage.id;
            await writeData(data);
        });
    },
};
