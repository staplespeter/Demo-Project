import axios from "axios";
import * as https from 'https';

export default class AxiosClient {
    //todo: supply the base url in a cookie, with value set in .env
    readonly axios = axios.create({
        baseURL: 'https://localhost:25025/',
        validateStatus: () => {
            return true;
        },
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        })
    });
}