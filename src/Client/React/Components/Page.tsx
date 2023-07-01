import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';


let StyledPage = styled.div<{ $height: number }>`
    height: ${props => props.$height ? props.$height + 'px' : 'auto'};
`;


type Props = {
    children: React.ReactNode,
    fitToWindow?: boolean
};

export default function Page(props: Props) {
    const [windowResizedToggle, setWindowResizedToggle] = useState(false);

    //want the pixelHeight to be set during render, conditional on the window resize.
    const pixelHeight = useMemo(() => {
        if (props.fitToWindow) {
            document.body.style.margin = "0px";
            return document.documentElement.clientHeight;
        }
        return null;
    }, [windowResizedToggle]);

    //trigger the rerender every 500ms.  Only register the event listener on component mount.
    useEffect(() => {
        let timer: number = null;
        function setWindowResized () {
            if (timer === null) {
                timer = window.setTimeout(() => {
                    timer = null;
                    setWindowResizedToggle(windowResizedToggle => { return !windowResizedToggle; });
                }, 200);
            }
        }

        window.addEventListener('resize', setWindowResized);        
        return () => { window.removeEventListener('resize', setWindowResized) };
    }, []);

    return (
        <StyledPage $height={pixelHeight}>
            {props.children}
        </StyledPage>
    );
}