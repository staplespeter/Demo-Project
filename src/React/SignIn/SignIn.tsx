import React, { useState, useRef } from "react";
import IClientAuthentication from "../../Client/IClientAuthentication";


type propsType = {
     auth: IClientAuthentication
}

export default function SignIn(props: propsType) {
    const emailRef = useRef(null);
    const password1Ref = useRef(null);
    const password2Ref = useRef(null);
    const errorMessageRef = useRef(null);
    const [signInMode, setSignInMode] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);


    async function handleSignInClick() {
        if (signInMode) {
            if (await props.auth.signIn(emailRef.current.value, password1Ref.current.value)) {
                setErrorMessage(null);
            }
            else {
                setErrorMessage('Error signing in: ' + props.auth.lastError);
            }
        }
        else {
            setSignInMode(true);
        }
    }

    async function handleSignUpClick(){
        if (signInMode) {
            setSignInMode(false);
        }
        else {
            if (password1Ref.current.value != password2Ref.current.value) {
                setErrorMessage('Passwords do not match');
                return;
            }

            if (await props.auth.signUp(emailRef.current.value, password1Ref.current.value)) {
                setErrorMessage(null);
            }
            else {
                setErrorMessage('Error signing up: ' + props.auth.lastError);
            }
        }
    }
    
    return (
        <div className="SignIn">
            Sign In
            <hr></hr>
            <div>
                Username: <input type="email" id="SignIn_Username" ref={emailRef}></input>
            </div>
            <div>
                Password: <input type="password" id="SignIn_Password1" ref={password1Ref}></input>
            </div>
            {signInMode ?
                <div></div> :
                <div>
                    Password: <input type="password" id="SignIn_Password2" ref={password2Ref}></input>
                </div>
            }                
            <div>
                <input type="button" id="SignIn_SignIn" value="Sign In" onClick={handleSignInClick} readOnly></input>
                <input type="button" id="SignIn_SignUp" value="Sign Up" onClick={handleSignUpClick} readOnly></input>
            </div>
            {!errorMessage ?
                <div></div> :
                <div id="errorMessage" ref={errorMessageRef}>
                    {errorMessage}
                </div>
            }
        </div>
    );
}