import Server from '../Server';
import axios from 'axios';
import https from 'https';
import fs from 'fs';
jest.mock('../Auth/AuthController');
jest.mock('../../../shared/helpers');

//TODO: HTTP/2
const client = axios.create({
    baseURL: 'https://localhost:25025/',
    validateStatus: () => {
        return true;
    },
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});

describe('Server start tests', () => {
    it('can be started with a specified port and block a CORS request', async () => {
        const oldNodeEnv = process.env.NODE_ENV;
        try {
            process.env.NODE_ENV = 'production';
            const s = new Server();
            try {
                s.start(25051);
                const res = await client.post('https://localhost:25051/test');
                expect(res.status).toEqual(400);
                expect(res.data).toEqual("Error: Origin 'undefined' is not allowed");
            }
            finally {
                await s.stop();
            }
        }
        finally {
            process.env.NODE_ENV = oldNodeEnv;
        }        
    });
});

describe('Server API tests', () => {
    let s: Server;
    var fileData: string = null;
    fs.open('./wwwroot/test/redirectTarget.html', 'r', (err, fd) => {
        if (err) {
            throw err;
        }
        else if (fd > 0) {
            fs.readFile(fd, 'utf8', (err, data) => {
                fileData = data;
                fs.close(fd);
            });
        }
    });

    beforeAll(() => {
        s = new Server();
        s.start();
    });

    afterAll(async () => {
        await s.stop();
    });

    it('can return not found when accessing a missing resource', async () => {
        const res = await client.post('test');
        expect(res.status).toEqual(404);
        expect(res.data).toEqual('Requested route not found');
    });

    it('can return the HTTP method options', async () => {
        const res = await client.options('/');
        expect(res.status).toEqual(200);
        expect(res.headers['access-control-allow-methods']).toEqual('POST');  
    });

    it('can request a static page', async () => {
        const res = await client.get('/test/redirectTarget.html');
        expect(res.status).toEqual(200);
        expect(res.data).toEqual(fileData) 
    });

    it('can register a user', async () => {
        const res = await client.post('auth/register', {
            username: 'testUsername',
            password: 'testPassword'
        });
        expect(res.status).toEqual(201);
        expect(res.data.token).toEqual('testTokenValue');
    });

    it('can return an error when registering a user if no request data is sent', async () => {
        const res = await client.post('auth/register');
        expect(res.status).toEqual(400);
        expect(res.data.error).toEqual('No data found');
    });

    it('can return an error when registering a user if an internal error occurs', async () => {
        const res = await client.post('auth/register', {
            username: 'existingUsername',
            password: 'testPassword'
        });
        expect(res.status).toEqual(500);
        expect(res.data.error).toEqual('Internal processing error');
    });

    it('can log in a user', async () => {
        const res = await client.post('auth/login', {
            username: 'testUsername',
            password: 'testPassword'
        });
        expect(res.status).toEqual(201);
        expect(res.data.token).toEqual('testTokenValue');
    });

    it('can return an error when logging in a user if no request data is sent', async () => {
        const res = await client.post('auth/login');
        expect(res.status).toEqual(400);
        expect(res.data.error).toEqual('No data found');
    });

    it('can return an error when logging in a user if an internal error occurs', async () => {
        const res = await client.post('auth/login', {
            username: 'nonExistingUsername',
            password: 'testPassword'
        });
        expect(res.status).toEqual(500);
        expect(res.data.error).toEqual('Internal processing error');
    });

    it('can authenticate a user', async () => {
        //set token in auth header
        const res = await client.post('auth/authenticate', undefined, {
            headers: { 'Authorization': 'Bearer testTokenValue' }
        });
        expect(res.status).toEqual(201);
        expect(res.data.token).toEqual('newTestTokenValue');
    });

    it('can return an error when authenticating a user if no request data is sent', async () => {
        let res = await client.post('auth/authenticate');
        expect(res.status).toEqual(400);
        expect(res.data.error).toEqual('Invalid authorization header');

        res = await client.post('auth/authenticate', undefined, {
            headers: { 'Authorization': 'Bearer ' }
        });
        expect(res.status).toEqual(400);
        expect(res.data.error).toEqual('Invalid authorization header');
    });

    it('can return an error when authenticating a user if an internal error occurs', async () => {
        const res = await client.post('auth/authenticate', undefined, {
            headers: { 'Authorization': 'Bearer invalidTokenValue' }
        });
        expect(res.status).toEqual(500);
        expect(res.data.error).toEqual('Internal processing error');
    });

    it('can return a redirect when authenticating a user if the token has expired', async () => {
        const res = await client.post('auth/authenticate', undefined, {
            headers: { 'Authorization': 'Bearer expiredTokenValue' }
        });
        expect(res.status).toEqual(200);
        expect(res.request.path).toEqual('/test/redirectTarget.html');
        expect(res.data).toEqual(fileData);
    });
});