import IFieldDef from "./IFieldDef";

export default interface IField {
    readonly fieldDef: IFieldDef;
    readonly isNew: boolean;
    readonly hasChanged: boolean;
    readonly oldValue: any;
    value: any;

    discard(): void;
    save(): void;
}