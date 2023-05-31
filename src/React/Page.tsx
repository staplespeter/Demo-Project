import React, { PropsWithChildren } from 'react';

type Props = {
    test?: string
};

export default class Page extends React.Component<PropsWithChildren<Props>> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        return (
            <div className='Page'>
                {this.props.children}
            </div>
        );
    }
}