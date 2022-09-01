import IField from "./IField";
import IFieldDef from "./IFieldDef";

export default class Field implements IField {
    readonly fieldDef: IFieldDef;
    
    private _isNew: boolean;
    get isNew(): boolean {
        return this._isNew;
    }

    private _hasChanged: boolean = false;
    get hasChanged(): boolean {
        return this._hasChanged;
    }

    private _oldValue: any = undefined;
    get oldValue(): any {
        return this._oldValue;
    }

    private _value: any;
    get value(): any {
        return this._value
    }
    set value(v: any) {
        if (!this._isNew && !this._hasChanged && !this.fieldDef.isPrimaryKey && v != this.value) {
            this._oldValue = this._value;
            this._hasChanged = true;
        }

        if (this._isNew || !this.fieldDef.isPrimaryKey) {
            this._value = v;

            if (v == this._oldValue) {
                this._oldValue = undefined;
                this._hasChanged = false;
            }
        }
    }


    constructor(fieldDef: IFieldDef, value: any, isNew: boolean = false) {
        this.fieldDef = fieldDef;
        this._value = value;
        this._isNew = isNew;
    }

    discard(): void {
        if (!this._isNew) {
            this._value = this._oldValue;
            this._oldValue = undefined;
            this._hasChanged = false;
        }
    }

    save(): void {
        if (this._isNew) {
            this._isNew = false;
        }
        else {
            this._oldValue = undefined;
            this._hasChanged = false;
        }
    }
}