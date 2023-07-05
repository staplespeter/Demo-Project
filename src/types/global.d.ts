import mysqlx from '@mysql/xdevapi';

declare global {
    var jest_mysqlConfig: mysqlx.ConnectionOptions;
    var jest_apiHostname: string;
    var jest_apiPort: number;
    var jest_apiHost: string;
}