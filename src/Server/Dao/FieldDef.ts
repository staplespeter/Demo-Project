import IFieldDef from "./IFieldDef";

export default class FieldDef implements IFieldDef {
    readonly name: string;
    readonly isPrimaryKey: boolean;

    constructor(name: string, isPrimaryKey: boolean = false) {
        this.name = name;
        this.isPrimaryKey = isPrimaryKey;
    }
}