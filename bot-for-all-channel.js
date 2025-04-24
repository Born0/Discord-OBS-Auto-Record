require('dotenv').config();  // To load environment variables from .env file
const { Client, GatewayIntentBits } = require('discord.js');  // For Discord bot
const OBSWebSocket = require('obs-websocket-js').default;  // For OBS WebSocket

// Initialize the Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,  // To detect voice state changes
    ],
});

const obs = new OBSWebSocket();

// When the bot is ready
client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);

    try {
        // Connect to OBS WebSocket
        await obs.connect('ws://127.0.0.1:4455', process.env.OBS_PASSWORD);
        console.log('Connected to OBS');
    } catch (err) {
        console.error('OBS connection failed:', err);
    }
});

// Listen for voice state changes (e.g., user joining a voice channel)
client.on('voiceStateUpdate', async (oldState, newState) => {
    console.log('Voice State Update Detected');
    console.log('Old State Channel:', oldState.channel ? oldState.channel.name : 'None');
    console.log('New State Channel:', newState.channel ? newState.channel.name : 'None');

    // Trigger when a user joins a voice channel
    if (!oldState.channel && newState.channel) {
        console.log('User joined a voice channel:', newState.member.user.tag);

        try {
            // Check if recording is already active
            const status = await obs.call('GetRecordStatus');
            console.log('Recording status:', status.outputActive);

            if (!status.outputActive) {
                // Start recording if not already recording
                await obs.call('StartRecord');
                console.log('Recording started.');
            } else {
                console.log('Already recording.');
            }
        } catch (err) {
            console.error('Failed to start recording:', err);
        }
    }

    // Trigger when a user leaves a voice channel
    if (oldState.channel && !newState.channel) {
        console.log('User left a voice channel:', oldState.member.user.tag);

        try {
            // Check if the bot is the only one in the channel
            const membersInChannel = oldState.channel.members.size;
            console.log(membersInChannel);
            // If there are no members left in the channel, stop recording
            // if (membersInChannel === 1) {  // Only the bot remains
            if (membersInChannel < 1) {  // nobody remains
                const status = await obs.call('GetRecordStatus');
                if (status.outputActive) {
                    await obs.call('StopRecord');
                    console.log('Recording stopped.');
                }
            }
        } catch (err) {
            console.error('Failed to stop recording:', err);
        }
    }
});

// Log in to Discord
client.login(process.env.DISCORD_TOKEN);
