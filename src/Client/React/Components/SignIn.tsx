import React, { useState, useRef } from "react";
import styled from 'styled-components';
import IClientAuthentication from "../../Model/IClientAuthentication";


const StyledSignIn = styled.div`
    width: 400px;
    border: 3px solid green;
    border-radius: 10px;
    padding: 20px;
    font-family: Georgia, Garamond, Serif;
`;
const StyledSignInTitle = styled.div`
    text-align: center;
    color: green;
    font-size: 2.0em;
`;
const StyledHr = styled.hr`
    margin-top: 15px;    
    margin-bottom: 15px;
    border: 2px solid green;
    border-radius: 2px;
`;
const StyledTable = styled.table`
    width: 100%;
`;
const StyledInput = styled.input`
    width: 100%;
    box-sizing: border-box;
`;
const StyledTd = styled.td`
    text-align: center;
    padding-top: 15px;
`
const StyledButton = styled.button`
    margin-left: 5px;
    margin-right: 5px;
    padding: 5px;
    font-size: 1.0em;
`;
const StyledErrorMessage = styled.div`
    margin-top: 15px;
    text-align: center;
    color: IndianRed;
    font-size: 0.8em;
`;

type propsType = {
     auth: IClientAuthentication
}

export default function SignIn(props: propsType) {
    const emailRef = useRef(null);
    const password1Ref = useRef(null);
    const password2Ref = useRef(null);
    const [signInMode, setSignInMode] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);


    async function handleSignInClick() {
        if (signInMode) {
            if (emailRef.current.value == '') {
                setErrorMessage('Missing Username');
                return;
            }
            if (password1Ref.current.value == '') {
                setErrorMessage('Missing Password');
                return;
            }

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
            //TODO: create Field, TextField, PasswordField components etc, with encapsulated validation.
            //  Form component composed of errorField, fields, that will validate all fields and display errors.
            if (emailRef.current.value == '') {
                setErrorMessage('Missing Username');
                return;
            }
            if (password1Ref.current.value == '' && password2Ref.current.value == '') {
                setErrorMessage('Missing Password');
                return;
            }
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
        <StyledSignIn>
            <StyledSignInTitle>Sign In</StyledSignInTitle>
            <StyledHr></StyledHr>
            <StyledTable>
                <tbody>
                    <tr>
                        <td>Username:</td>
                        <td><StyledInput type="email" id="SignIn_Username" ref={emailRef}></StyledInput></td>
                    </tr>
                    <tr>
                        <td>Password:</td>
                        <td><StyledInput type="password" id="SignIn_Password1" ref={password1Ref}></StyledInput></td>
                    </tr>
                    {signInMode ?
                        <></> :
                        <tr>
                            <td>Password:</td>
                            <td><StyledInput type="password" id="SignIn_Password2" ref={password2Ref}></StyledInput></td>
                        </tr>
                    }    
                    <tr>
                        <StyledTd colSpan={2}>
                            <StyledButton id="SignIn_SignIn" onClick={handleSignInClick}>Sign In</StyledButton>
                            <StyledButton id="SignIn_SignUp" onClick={handleSignUpClick}>Sign Up</StyledButton>
                        </StyledTd>
                    </tr>
                </tbody>
            </StyledTable>
            {!errorMessage ?
                <></> :
                <StyledErrorMessage id="SignIn_ErrorMessage">
                    {errorMessage}
                </StyledErrorMessage>
            }
        </StyledSignIn>
    );
}