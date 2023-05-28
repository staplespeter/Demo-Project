import express from "express";
import cors from 'cors';
import https from 'https';
import fs from 'fs';
import AuthRoutes from "./Auth/AuthRoutes";

export default class Server {
    private httpServer: https.Server;

    static DEFAULT_PORT = 25025;

    constructor() {      
        const expressApp = express();
        const corsOptions = {
            origin: function (origin: any, cb: any) {
                try {
                    fs.open('./wwwroot/CORS-allowed-list.txt', 'r', (err, fd) => {
                        if (err) {
                            cb('Unable to verify origin', false);
                        }
                        else if (fd > 0) {
                            fs.readFile(fd, 'ascii', (err, data) => {
                                const allowedList = data.split('\n');
                                if (allowedList.includes(origin)) {
                                    cb(null, true);
                                }
                                else {
                                    cb('Origin is not allowed', false);
                                }
                            });
                        }
                    });
                }
                catch (err) {
                    cb(err, false);
                }
            },
            methods: ['POST'],
            allowedHeaders: ['origin', 'Content-Type', 'Accept', 'Cookie'],
            optionsSuccessStatus: 200
        };
        expressApp.use(cors(corsOptions));
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
