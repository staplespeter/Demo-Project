import mysqlx from '@mysql/xdevapi';

declare global {
    var jest_mysqlConfig: mysqlx.ConnectionOptions;
}