import ClientSession from "./ClientSession";
//import ClientAuthentication from "./SignIn/ClientAuthentication";

//const reactPage = new Page();
//const auth = new ClientAuthentication();
//reactPage.addComponent(new SignIn(auth));
const session = new ClientSession();
session.isValid();