import React from "react";

type Props = {
    children: React.ReactNode;
};

export default function Layout(props: Props) {    
    return (
        <div className='Layout'>
            {props.children}
        </div>
    );
}