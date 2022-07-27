export type DaoTypes = "User" | "UserSession";

export type MySqlDaoFactoryConfig = {
    host: string,
    port: number,
    user: string,
    password: string,
    schema: string
}