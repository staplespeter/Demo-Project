import IDaoField from "./IDaoField";

export default interface IDaoRecord {
    isNew: boolean;
    hasChanged: boolean;
    fields: Array<IDaoField>;

    load(): void;
    save(): void;
    discard(): void;
}