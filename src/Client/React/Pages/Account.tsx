import React from "react";
import { createRoot } from "react-dom/client";
import ClientAuthentication from "../../Model/ClientAuthentication";
import Page from "../Components/Page";
import Account from "../Components/Account";
import Layout from "../Components/Layout";

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