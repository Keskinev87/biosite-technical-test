import React from 'react';

interface buttonProps {
    name: string,
    onClick: (event: React.MouseEvent<HTMLElement>) => void 
}

function Button(props: buttonProps) {
    return(
        <button onClick={props.onClick}>{props.name}</button>
    )
}

export default Button;