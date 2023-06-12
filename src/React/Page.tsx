import React from 'react';

type Props = {
    children: React.ReactNode
};

export default function Page(props: Props) {
    return (
        <div className='Page'>
            {props.children}
        </div>
    );
}