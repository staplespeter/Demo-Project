import { Selector } from "testcafe";

class SignIn {
    public username = Selector('#SignIn_Username');
    public password1 = Selector('#SignIn_Password1');
    public password2 = Selector('#SignIn_Password2');
    public signIn = Selector('#SignIn_SignIn');
    public signUp = Selector('#SignIn_SignUp');
}

export default new SignIn();