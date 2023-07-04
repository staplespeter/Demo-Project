import { ClientFunction } from "testcafe";

export const getFromLocalStorage = ClientFunction((key: string) => {
    return window.localStorage.getItem(key);
});

export const clearLocalStorage = ClientFunction(() => {
    return window.localStorage.clear();
});