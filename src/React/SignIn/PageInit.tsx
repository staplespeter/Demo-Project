import React from "react";
import { createRoot } from "react-dom/client";
import Page from "../Page";
import ClientAuthentication from "../../Client/ClientAuthentication";

const auth = new ClientAuthentication();
const root = createRoot(document.getElementById('reactRoot'));
root.render(
    <React.StrictMode>
        <Page auth={auth}/>
    </React.StrictMode>);