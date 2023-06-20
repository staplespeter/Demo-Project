import React, { useState, useRef } from "react";
import IClientAuthentication from "../../Model/IClientAuthentication";


type propsType = {
     auth: IClientAuthentication;
}

export default function Account(props: propsType) {
    return (
        <div className="Account">
            Account Details
            <hr></hr>
        </div>
    );
}