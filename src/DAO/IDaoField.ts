import IDaoFieldDef from "./IDaoFieldDef";

export default interface IDaoField {
    readonly fieldDef: IDaoFieldDef;
    readonly isNew: boolean;
    readonly hasChanged: boolean;
    readonly oldValue: any;
    value: any;

    discard(): void;
    save(): void;
}