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

    // Check if the channel name is "Support Team"
    if (newState.channel && newState.channel.name === 'Support Team') {
        // Trigger when a user joins the "Support Team" voice channel
        if (!oldState.channel && newState.channel) {
            console.log('User joined "Support Team" voice channel:', newState.member.user.tag);

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
    }

    // Trigger when a user leaves the "Support Team" voice channel
    if (oldState.channel && oldState.channel.name === 'Support Team' && !newState.channel) {
        console.log('User left "Support Team" voice channel:', oldState.member.user.tag);

        try {
            // Check how many members are left in the "Support Team" channel
            const membersInChannel = oldState.channel.members.size;

            // If nobody is left in the channel, stop recording
            if (membersInChannel < 1) {
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
