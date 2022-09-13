import express from "express";
import AuthRoutes from "./Auth/AuthRoutes";
import http from 'http';

export default class Server {
    private httpServer: http.Server;

    static DEFAULT_PORT = 25025;

    constructor() {
        const expressApp = express();
        expressApp.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'origin, X-Requested-With, Content-Type, Accept, Authorization');
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

        this.httpServer = http.createServer(expressApp);
        //todo: if server cannot bind to port
        // this.httpServer.on('error', (err) => {
        //     if (err.name == 'EADDRINUSE' ) {
        //     }
        // });

        process.on('SIGTERM', () => {
            this.httpServer.close(() => {
                console.log('http server stopped');
            });
        });
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

    stop() {
        this.httpServer.close(() => {
            //todo: enable and stop jest from complaining about console.log after tests stopped
            //console.log('http server stopped');
        });
    }
}

