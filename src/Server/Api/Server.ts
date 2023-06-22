import express, { ErrorRequestHandler } from "express";
import cors from 'cors';
import https from 'https';
import fs from 'fs';
import AuthRoutes from "./Auth/AuthRoutes";
import helpers from '../../shared/helpers';

export default class Server {
    private httpServer: https.Server;

    static readonly DEFAULT_PORT = 25025;

    constructor() {
        const expressApp = express();

        const corsOptions = {
            origin: async function (origin: any, cb: any) {
                try {
                    if (!helpers.isProduction()) {
                        cb(null, true);
                        return;
                    }

                    fs.open('./config/CORS-allowed-list.txt', 'r', (err, fd) => {
                        if (err) {
                            cb(`Unable to verify origin ${origin}`, false);
                        }
                        else if (fd > 0) {
                            fs.readFile(fd, 'ascii', (err, data) => {
                                const allowedList = data.split('\n');
                                if (allowedList.includes(origin)) {
                                    cb(null, true);
                                }
                                else {
                                    cb(`Origin '${origin}' is not allowed`, false);
                                }
                                fs.close(fd);
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
        
        const staticOptions = {
            index: 'signIn.html',
            extensions: ['html, htm']
        };
        //TODO: figure out how to resolve paths correctly?
        //  Supposed to not rely on a relative path here, which is relative to the node execution directory.
        //  Suggested solution to get the module directory (__dirname) and specify a relative path from that.
        //  But when bundling this changes.
        //  And Jest seems to try to build in commonjs (even if all configs say otherwise!) so can't use import.meta.env.
        //  So best to define a specfic release folder structure and be relative to that.
        expressApp.use('/', express.static('dist/Client', staticOptions));
        expressApp.use('/', express.static('wwwroot'));
        
        expressApp.use('/auth', AuthRoutes.getRoutes());
        
        expressApp.use((req, res, next) => {
            res.type('text/html');
            res.status(404).send('Requested route not found');
        });
        expressApp.use(function (err, req, res, next) {
            if (err) {
                res.type('text/html');
                res.status(400).send('Error: ' + err);
            }
            else {   
                next();
            }
        } as ErrorRequestHandler);

        this.httpServer = https.createServer({
            key: fs.readFileSync('./tls/demo-project.key'),
            cert: fs.readFileSync('./tls/demo-project.cert')
        }, expressApp);
        //TODO: if server cannot bind to port
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
        //todo: check if these promises are being called and correct as required.
        p.then(() => console.log('http server stopped'));
        p.catch((err) => console.log(err));

        this.httpServer.close(() => {
            closed = true;
        });
        await p;
    }
}
