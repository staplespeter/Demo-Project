import express from "express";
import AuthRoutes from "./Auth/AuthRoutes";
import http from 'https';

export default class Server {
    private httpServer: http.Server;

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
        expressApp.use('/', AuthRoutes.getRoutes());
        expressApp.use((req, res, next) => {
            res.status(404).send('Requested method not found');
        });

        this.httpServer = http.createServer(expressApp);
    }

    start() {
        const port = process.env.port ?? 25025;
        this.httpServer.listen(port);
    }

    stop() {
        this.httpServer.close();
    }
}

