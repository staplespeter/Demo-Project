export type DatasourceType = "MySQL";

export type DaoType = "User" | "UserSession";

export type MySqlDaoFactoryConfig = {
    host: string,
    port: number,
    user: string,
    password: string,
    schema: string
}