import React from "react";
import { createRoot } from "react-dom/client";
import Page from "../Page";
import ClientAuthentication from "../../Model/ClientAuthentication";
import SignIn from "./SignIn";
import Layout from "../Layout";

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