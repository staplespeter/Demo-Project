import AxiosClient from "../AxiosClient";
import IClientAuthentication from "./IClientAuthentication";

export default class ClientAuthentication extends EventTarget implements IClientAuthentication {
    static readonly TOKEN_STORAGE_KEY = 'DemoProjectTokenKey';
    static readonly EVENTS = {
        Authorisation: 'Authorisation'
    } as const;

    private _client = new AxiosClient();

    private _lastError: string = null;
    get lastError(): string {
        return this._lastError;
    }

    async signIn(username: string, password: string): Promise<boolean> {
        this._lastError = null;
        try {
            const response = await this._client.axios.post('auth/login', {
                username: username,
                password: password
            });
            if (response.status == 201) {
                window.localStorage.setItem(ClientAuthentication.TOKEN_STORAGE_KEY, response.data.token);
                return true;
            }
            if (response.data.error) {
                this._lastError = response.data.error;
            }
            return false;
        }
        catch (err: any) {
            this._lastError = err;
            return false;    
        }
    }

    async signUp(username: string, password: string): Promise<boolean> {
        this._lastError = null;
        try {
            const response = await this._client.axios.post('auth/register', {
                username: username,
                password: password
            });
            if (response.status == 201) {
                window.localStorage.setItem(ClientAuthentication.TOKEN_STORAGE_KEY, response.data.token);
                return true;
            }
            if (response.data.error) {
                this._lastError = response.data.error;
            }
            return false;
        }
        catch (err: any) {
            this._lastError = err;
            return false;
        }
    }

}