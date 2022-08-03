import IDaoFieldDef from "./IDaoFieldDef";

export default class DaoFieldDef implements IDaoFieldDef {
    readonly name: string;
    readonly isPrimaryKey: boolean;

    constructor(name: string, isPrimaryKey: boolean = false) {
        this.name = name;
        this.isPrimaryKey = isPrimaryKey;
    }
}