import React from "react";
import { createRoot } from "react-dom/client";
import ClientAuthentication from "../../Model/ClientAuthentication";
import Page from "../Components/Page";
import SignIn from "../Components/SignIn";
import Layout from "../Components/Layout";

const auth = new ClientAuthentication();

const reactRoot = document.createElement('div');
reactRoot.setAttribute('id', 'reactRoot');
const body = document.getElementsByTagName('body').item(0);
body.appendChild(reactRoot);

const root = createRoot(reactRoot);
root.render(
    <React.StrictMode>
        <Page>
            <Layout>
                <SignIn auth={auth} />
            </Layout>
        </Page>
    </React.StrictMode>);