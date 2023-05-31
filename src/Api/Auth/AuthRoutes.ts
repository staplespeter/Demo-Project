import express from 'express';
import AuthController from './AuthController';
import AuthResult from './AuthResult';

export default class AuthRoutes {
    static getRoutes(): express.Router {
        const router = express.Router();
        router.use(express.json());

        router.post('/register', async (req, res) => {
            let result: AuthResult = null;
            res.type('appplication.json');

            if (!req.body || Object.keys(req.body).length == 0 ) {
                result = new AuthResult();
                result.error = 'No data found';
                res.status(400).send(result);
                return;
            }
            result = await AuthController.register(req.body.username, req.body.password);
            if (result.error) {
                //TODO: Have AuthController error enum that maps to better HTTP response codes.
                res.status(500).send(result);
                return;
            }
            res.status(201).send(result);
        });

        router.post('/login', async (req, res) => {
            let result: AuthResult = null;
            res.type('appplication.json');

            if (!req.body || Object.keys(req.body).length == 0 ) {
                result = new AuthResult();
                result.error = 'No data found';
                res.status(400).send(result);
                return;
            }
            result = await AuthController.login(req.body.username, req.body.password);
            if (result.error) {
                res.status(500).send(result);
                return;
            }
            res.status(201).send(result);
        });

        router.post('/authenticate', async (req, res) => {
            let result: AuthResult = null;
            res.type('appplication.json');

            const authHeader = req.headers.authorization;
            const token = authHeader?.slice('Bearer '.length);
            if (!authHeader || !token) {
                result = new AuthResult();
                result.error = 'Invalid authorization header';
                res.status(400).send(result);
                return;
            }
            result = await AuthController.authenticate(token);
            if (result.redirectUrl) {
                res.redirect(302, result.redirectUrl);
                return;
            }
            if (result.error) {
                res.status(500).send(result);
                return;
            }
            res.status(201).send(result);
        });

        return router;
    }
}