import React, { PropsWithChildren, SyntheticEvent } from "react";
import IClientAuthentication from "../../Client/IClientAuthentication";

type Props = {
    auth: IClientAuthentication
};

type State = {
    signIn: boolean;
    errorMessage: string;
};

export default class SignIn extends React.Component<PropsWithChildren<Props>, State> {
    private emailRef: React.RefObject<HTMLInputElement> = React.createRef();
    private password1Ref: React.RefObject<HTMLInputElement> = React.createRef();
    private password2Ref: React.RefObject<HTMLInputElement> = React.createRef();
    private errorMessageRef: React.RefObject<HTMLDivElement> = React.createRef();
    

    constructor(props: Props) {
        super(props);
        this.handleSignInClick = this.handleSignInClick.bind(this);
        this.handleSignUpClick = this.handleSignUpClick.bind(this);
        this.state = {
            signIn: true,
            errorMessage: null
        };
    }

    async handleSignInClick() {
        if (this.state.signIn) {
            if (await this.props.auth.signIn(this.emailRef.current.value, this.password1Ref.current.value)) {
                this.setState({ errorMessage: null });
            }
            else {
                this.setState({ errorMessage: 'Error signing in: ' + this.props.auth.lastError });
            }
        }
        else {
            this.setState({ signIn: true });
        }
    }

    async handleSignUpClick(){
        if (this.state.signIn) {
            this.setState({ signIn: false });
        }
        else {
            if (this.password1Ref.current.value != this.password2Ref.current.value) {
                this.setState({ errorMessage: 'Passwords do not match'});
                return;
            }

            if (await this.props.auth.signUp(this.emailRef.current.value, this.password1Ref.current.value)) {
                this.setState({ errorMessage: null });
            }
            else {
                this.setState({ errorMessage: 'Error signing up: ' + this.props.auth.lastError });
            }
        }
    }
    
    render() {
        return (
            <div className="SignIn">
                Sign In
                <hr></hr>
                <div>
                    Username: <input type="email" id="SignInUsername" ref={this.emailRef}></input>
                </div>
                <div>
                    Password: <input type="password" id="SignInPassword1" ref={this.password1Ref}></input>
                </div>
                {this.state.signIn ?
                    <div></div> :
                    <div>
                        Password: <input type="password" id="SignInPassword2" ref={this.password2Ref}></input>
                    </div>
                }                
                <div>
                    <input type="button" value="Sign In" onClick={this.handleSignInClick} readOnly></input>
                    <input type="Button" value="Sign Up" onClick={this.handleSignUpClick} readOnly></input>
                </div>
                {!this.state.errorMessage ?
                    <div></div> :
                    <div id="errorMessage" ref={this.errorMessageRef}>
                        {this.state.errorMessage}
                    </div>
                }
            </div>
        );
    }
}