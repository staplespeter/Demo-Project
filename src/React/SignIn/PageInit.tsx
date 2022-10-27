import React from "react";
import { createRoot } from "react-dom/client";
import Page from "../Page";
import ClientAuthentication from "../../Client/ClientAuthentication";
import SignIn from "./SignIn";
import Layout from "../Layout";

const auth = new ClientAuthentication();
const root = createRoot(document.getElementById('reactRoot'));
root.render(
    <React.StrictMode>
        <Page>
            <Layout>
                <SignIn auth={auth} />
            </Layout>
        </Page>
    </React.StrictMode>);