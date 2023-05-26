import React from "react";
import logo from '../logo.svg';
import styled from "styled-components";

const Row = styled.div`
    display : flex;
    width : 100%;
    height : 50px;    
    margin-top : 10px;
`;
const Col = styled.div`
    display : flex;
    margin-left : 20px;
    margin-right : 20px;
`;
const Logo = styled.img.attrs({
    src : `${logo}`
})`
    width : 50px;
    border : 1px solid blue;
`;
const Items = styled.div`
    display :flex;
`;
const Item = styled.div`
    display :flex;
    margin-left : 10px;
    margin-right : 10px;
    justify-content: center;    
    align-items : center;    
    border : 1px solid red;
    padding : 0px 20px 0px 20px;
`;
function Header(){
    return (
        <Row>
            <Col>
                <Logo />
            </Col>
            <Col>
                <Items>
                    <Item> 검색 </Item>
                    <Item> 인맥추가 </Item>
                    <Item> 스티커생성 </Item>
                    <Item> 설정 </Item>
                </Items>
            </Col>
        </Row>
    );
}
export default Header;