import Server from "./Server";

let server = new Server();
server.start();
process.on('SIGTERM', async () => {
    await server.stop();
});