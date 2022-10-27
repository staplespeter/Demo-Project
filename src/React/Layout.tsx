import React, { PropsWithChildren } from "react";

type Props = {
};

export default class Layout extends React.Component<PropsWithChildren<Props>> {
    constructor(props: Props) {
        super(props);
    }
    
    render() {
        return (
            <div>
                {this.props.children}
            </div>
        );
    }
}