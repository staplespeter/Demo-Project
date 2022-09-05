import express from 'express';
import AuthController from './AuthController';
import AuthResult from './AuthResult';

export default class AuthRoutes {
    static getRoutes(): express.Router {
        let result: AuthResult = null;

        const router = express.Router();
        router.use(express.json());

        router.post('/register', async (req, res) => {
            res.type('appplication.json');

            if (!req.body || Object.keys(req.body).length == 0 ) {
                result = new AuthResult();
                result.error = 'No data found';
                res.status(400).send(result);
                return;
            }
            result = await AuthController.register(req.body.username, req.body.password);
            if (result.error) {
                res.status(500).send(result);
                return;
            }
            res.status(201).send(result);
        });

        router.post('/login', async (req, res) => {
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
            res.type('appplication.json');

            if (!req.body || Object.keys(req.body).length == 0 ) {
                result = new AuthResult();
                result.error = 'No data found';
                res.status(400).send(result);
                return;
            }
            result = await AuthController.authenticate(req.body.token);
            if (result.error) {
                res.status(500).send(result);
                return;
            }
            res.status(201).send(result);
        });

        return router;
    }
}