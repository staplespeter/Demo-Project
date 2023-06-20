import React from "react";
import { createRoot } from "react-dom/client";
import Page from "../Page";
import ClientAuthentication from "../../Model/ClientAuthentication";
import Account from "./Account";
import Layout from "../Layout";

const auth = new ClientAuthentication();
const root = createRoot(document.getElementById('reactRoot'));
root.render(
    <React.StrictMode>
        <Page>
            <Layout>
                <Account auth={auth} />
            </Layout>
        </Page>
    </React.StrictMode>);