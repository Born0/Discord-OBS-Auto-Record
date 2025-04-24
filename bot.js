require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const OBSWebSocket = require('obs-websocket-js').default;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const obs = new OBSWebSocket();

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    try {
        await obs.connect(`ws://127.0.0.1:4455`, process.env.OBS_PASSWORD);
        console.log("Connected to OBS");
    } catch (err) {
        console.error("Failed to connect to OBS:", err);
    }
});

client.on('messageCreate', async message => {
    // Ignore bots or messages outside the "Meeting Recorder Bot" channel
    if (message.author.bot) return;
    if (message.channel.name !== "meeting-recorder-bot") return;

    const content = message.content.toLowerCase();
    console.log(content);
    if (content === "sb-r-start") {
        try {
            const status = await obs.call("GetRecordStatus");
            if (!status.outputActive) {
                await obs.call("StartRecord");
                message.channel.send("📹 Recording started.");
            } else {
                message.channel.send("⚠️ Already recording.");
            }
        } catch (err) {
            console.error("Error starting recording:", err);
            message.channel.send("❌ Failed to start recording.");
        }
    }

    if (content === "sb-r-stop") {
        try {
            const status = await obs.call("GetRecordStatus");
            if (status.outputActive) {
                await obs.call("StopRecord");
                message.channel.send("🛑 Recording stopped.");
            } else {
                message.channel.send("⚠️ No recording is currently running.");
            }
        } catch (err) {
            console.error("Error stopping recording:", err);
            message.channel.send("❌ Failed to stop recording.");
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
