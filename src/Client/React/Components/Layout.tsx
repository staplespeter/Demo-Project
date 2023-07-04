import React from "react";
import styled from "styled-components";

const StyledLayout = styled.div`
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

type Props = {
    children: React.ReactNode;
};

export default function Layout(props: Props) {    
    return (
        <StyledLayout>
            {props.children}
        </StyledLayout>
    );
}