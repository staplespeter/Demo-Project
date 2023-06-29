import React from 'react';
import styled from 'styled-components';


document.body.style.margin = "0px";

const StyledPage = styled.div`
    height: ${document.documentElement.clientHeight}px;
`;

type Props = {
    children: React.ReactNode
};

export default function Page(props: Props) {
    function onResize () {

    }

    return (
        <StyledPage>
            {props.children}
        </StyledPage>
    );
}