import axios from "axios";
import * as https from 'https';

export default class AxiosClient {
    readonly axios = axios.create({
        baseURL: 'https://' + process.env.API_HOSTNAME + ':' + process.env.API_PORT + '/',
        validateStatus: () => {
            return true;
        },
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        })
    });
}