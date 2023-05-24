import express from "express";

import https from 'https';
import fs from 'fs';
import AuthRoutes from "./Auth/AuthRoutes";

export default class Server {
    private httpServer: https.Server;

    static DEFAULT_PORT = 25025;

    constructor() {
        const expressApp = express();
        expressApp.use((req, res, next) => {
            //todo: add list of allowed origins to config file, check request origin,
            //and set Access-Control-Allow-Origin to appropriate one.
            res.header('Access-Control-Allow-Origin', 'https://localhost');
            res.header('Access-Control-Allow-Headers', 'origin, Content-Type, Accept, Cookie');
            if (req.method.toUpperCase() == 'OPTIONS') {
                res.header('Access-Control-Allow-Methods', 'POST');
                return res.sendStatus(200);
            }
            next();
        });
        expressApp.use(express.static('wwwroot', { index: false }));
        expressApp.use('/auth', AuthRoutes.getRoutes());
        expressApp.use((req, res, next) => {
            res.status(404).send('Requested route not found');
        });

        this.httpServer = https.createServer({
            key: fs.readFileSync('./tls/demo-project.key'),
            cert: fs.readFileSync('./tls/demo-project.cert')
        }, expressApp);
        //todo: if server cannot bind to port
        // this.httpServer.on('error', (err) => {
        //     if (err.name == 'EADDRINUSE' ) {
        //     }
        // });
    }

    start(): void;
    start(port: number): void;
    start(port?: number): void {
        let p = port ?? process.env.port ?? Server.DEFAULT_PORT;
        this.httpServer.listen({
            port: p,
            host: 'localhost'
        },
        () => {
            console.log('http server started');
        });
    }

    async stop() {
        console.log('stopping http server');

        let closed = false;
        let iterations = 0;
        let p = new Promise((resolve, reject) => {
            let id = setInterval(() => {
                iterations++;
                if (closed) {
                    clearInterval(id);
                    resolve(closed);
                }
                else if (iterations == 10) {
                    clearInterval(id);
                    reject("http server stop timeout");
                }
            }, 500);
        });
        p.then(() => console.log('http server stopped'));
        p.catch((err) => console.log(err));

        this.httpServer.close(() => {
            closed = true;
        });
        await p;
    }
}
