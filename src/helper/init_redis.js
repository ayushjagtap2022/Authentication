import { createClient } from 'redis';
import {config} from 'dotenv'
config()
const client = createClient({
    password: process.env.REDIS_PASSWORD,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_HOST_PORT
});

client.on('connect', () => {
    console.log('Client connected to Redis');
});

client.on('ready', () => {
    console.log('Client connected to Redis and ready to use');
});

client.on('error', (err) => {
    console.log('Client connection to Redis error: ' + err.message);
});

client.on('end', () => {
    console.log('Client disconnected from Redis');
});

process.on('SIGINT', () => {
    client.quit();
    process.exit(0);
});

export { client };
