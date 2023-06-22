import mysqlx from '@mysql/xdevapi';

export declare global {
    var jest_mysqlConfig: mysqlx.ConnectionOptions;
}