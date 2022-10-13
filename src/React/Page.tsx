import React from 'react';
import IClientAuthentication from '../Client/IClientAuthentication';

interface IProps {
    auth: IClientAuthentication
}

export default class Page extends React.Component<IProps> {
    constructor(props: IProps) {
        super(props);
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
                <div>
                    Password: <input type="password" id="SignInPassword2"></input>
                </div>
                <div>
                    <input type="button" value="Sign In"></input><input type="Button" value="Sign Up"></input>
                </div>
            </div>
        );
    }
}