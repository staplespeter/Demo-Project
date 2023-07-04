import obj from './dotenvLoader';
const o = obj;

import Server from "./Server";
let server = new Server();
server.start();
process.on('SIGINT', async () => {
    await server.stop();
});
process.on('SIGTERM', async () => {
    await server.stop();
});
process.on('SIGQUIT', async () => {
    await server.stop();
});