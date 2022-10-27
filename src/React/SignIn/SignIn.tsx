import React, { PropsWithChildren, SyntheticEvent } from "react";
import IClientAuthentication from "../../Client/IClientAuthentication";

type Props = {
    auth: IClientAuthentication
};

type State = {
    signIn: boolean
};

export default class SignIn extends React.Component<PropsWithChildren<Props>, State> {
    constructor(props: Props) {
        super(props);
        this.handleSignInClick = this.handleSignInClick.bind(this);
        this.handleSignUpClick = this.handleSignUpClick.bind(this);
        this.state = { signIn: true };
    }

    handleSignInClick() {

    }

    handleSignUpClick(){

    }
    
    render() {
        return (
            <div>
                Sign In
                <hr></hr>
                <div>
                    Username: <input type="email" id="SignInUsername"></input>
                </div>
                <div>
                    Password: <input type="password" id="SignInPassword1"></input>
                </div>
                {this.state.signIn ? <div></div> :
                    <div>
                        Password: <input type="password" id="SignInPassword2"></input>
                    </div>}                
                <div>
                    <input type="button" value="Sign In" onClick={this.handleSignInClick}></input>
                    <input type="Button" value="Sign Up" onClick={this.handleSignUpClick}></input>
                </div>
            </div>
        );
    }
}