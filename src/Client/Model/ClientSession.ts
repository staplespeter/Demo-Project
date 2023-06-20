import Jwt from "../../Server/Api/Auth/Jwt";
import AxiosClient from "../AxiosClient";
import ClientAuthentication from './ClientAuthentication'
import IClientSession from "./IClientSession";

export default class ClientSession extends EventTarget implements IClientSession, EventListenerObject {
    //tokens should be refreshed if there is less than 15min left.
    static readonly TOKEN_EXPIRY_PREEMPT = 15 * 60 * 1000;
    static readonly EVENTS = {
        Authorisation: 'Authorisation'
    } as const;
    
    private _currentTimeout: number = null;

    private _client = new AxiosClient();
    private _auth;

    private _lastError: string = null;
    get lastError(): string {
        return this._lastError;
    }

    private _token: Jwt = null;
    get token(): Jwt {
        return this._token;
    }

    constructor();
    constructor(auth: ClientAuthentication);
    constructor(auth?: ClientAuthentication) {
        super();
        this._auth = auth;
        if (auth) {
            auth.addEventListener(ClientAuthentication.EVENTS.Authorisation, this.handleEvent);
        }
    }

    async isValid(): Promise<boolean> {
        this._lastError = null;
        if (this._currentTimeout) {
            window.clearTimeout(this._currentTimeout);
        }

        const tokenValue = window.localStorage.getItem(ClientAuthentication.TOKEN_STORAGE_KEY);
        this._token = tokenValue ? new Jwt(tokenValue) : null;
        this._token.parse();

        if (this._token && !this._token.isValid) {
            this._token = null;
            window.localStorage.clearItem(ClientAuthentication.TOKEN_STORAGE_KEY);
            this.dispatchEvent(new Event(ClientSession.EVENTS.Authorisation));

            //do a server check if client check fails
            //todo: change the server response to 302 redirect -> Authcontroller returns redirect
            //todo: possibly remove this and do client side redirect
            const response = await this._client.axios.post('auth/authenticate', undefined, {
                headers: { 'Authorization': 'Bearer ' + tokenValue }
            });
            if (response.status != 500) {
                throw new Error('Server disagrees with invalid token detection.');
            }
            if (response.data.error) {
                this._lastError = response.data.error;

            }

            return false;
        }

        if (this._token?.hasExpired) {
            this._token = null;
            window.localStorage.clearItem(ClientAuthentication.TOKEN_STORAGE_KEY);
            this.dispatchEvent(new Event(ClientSession.EVENTS.Authorisation));

            //do a server check and redirect if client check fails
            //todo: possibly remove this and do client side redirect
            const response = await this._client.axios.post('auth/authenticate', undefined, {
                headers: { 'Authorization': 'Bearer ' + tokenValue }
            });
            if (response.status != 200 || response.request.path != '/wwwroot/login.html') {
                throw new Error('Server disagrees with expired token detection.');
            }

            return false;
        }

        const refreshFn = async () => {
            const response = await this._client.axios.post('auth/authenticate', undefined, {
                headers: { 'Authorization': 'Bearer ' + window.localStorage.getItem(ClientAuthentication.TOKEN_STORAGE_KEY) }
            });
            if (response.status == 201) {
                window.localStorage.setItem(ClientAuthentication.TOKEN_STORAGE_KEY, response.data.token);
                this._token = new Jwt(response.data.token);
                this._token.parse();
                const msRemaining = this._token.data.sessionEndDate.valueOf() - Date.now();
                this._currentTimeout = window.setTimeout(refreshFn, msRemaining - ClientSession.TOKEN_EXPIRY_PREEMPT);
            }
            else {
                this._token = null;
                window.localStorage.clearItem(ClientAuthentication.TOKEN_STORAGE_KEY);
                if (response.data.error) {
                    this._lastError = response.data.error;
                }
            }
            this.dispatchEvent(new Event(ClientSession.EVENTS.Authorisation));
        };

        const msRemaining = this.token.data.sessionEndDate.valueOf() - Date.now();
        this._currentTimeout = window.setTimeout(refreshFn, msRemaining - ClientSession.TOKEN_EXPIRY_PREEMPT);
        this.dispatchEvent(new Event(ClientSession.EVENTS.Authorisation));
        return true;
    }

    async handleEvent(event: Event): Promise<void> {
        if (event.type == ClientAuthentication.EVENTS.Authorisation) {
            await this.isValid();
        }
    }
}