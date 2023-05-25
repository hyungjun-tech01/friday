import React from "react";
import logo from '../logo.svg';
import styled from "styled-components";

const Logo = styled.img.attrs({
    src : `${logo}`
})`
    width : 50px;
`;
const Items = styled.div``;
const Item = styled.div``;
function Header(){
    return (
        <Logo />
    );
}
export default Header;