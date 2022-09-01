import Field from "./Field";
import IField from "./IField";
import IFieldDef from "./IFieldDef";
import IRecord from "./IRecord";

export default class Record implements IRecord {
    private _fieldDefs: Array<IFieldDef>;

    readonly primaryKeyField: IField = null;
    
    get fieldCount(): number {
        return this._fields.length;
    }

    get isNew(): boolean {
        return this._fields.some((field: IField) => field.isNew);
    }

    get hasChanged(): boolean {
        return this._fields.some((field: IField) => field.hasChanged);
    }

    private _fields: Array<IField> = new Array<IField>();
    getField(name: string): IField {
        return this.getFieldByIndex(this._fieldDefs.findIndex(fd => fd.name == name));
    }
    getFieldByIndex(x: number): IField {
        if (x < 0 || x >= this._fields.length) {
            return null;
        }
        return this._fields[x];
    }

    constructor(fieldDefs: Array<IFieldDef>, values: Map<string, any>, isNew: boolean = false) {
        if (!fieldDefs || fieldDefs.length == 0) {
            throw new RangeError('No field definitions');
        }
        
        for (let fieldDef of fieldDefs) {
            let field = new Field(fieldDef, values.get(fieldDef.name), isNew);
            this._fields.push(field);
            if (fieldDef.isPrimaryKey) {
                this.primaryKeyField = field;
            }
        }
        
        this._fieldDefs = fieldDefs;
    }

    //todo: record specific load and save
    // load(): void {}

    // async save(: any): Promise<void> {}

    discard(): number {
        let changedFields = this._fields.filter(f => f.hasChanged);
        for (let field of changedFields) {
            field.discard();
        }
        return changedFields.filter(f => !f.hasChanged).length;
    }
}