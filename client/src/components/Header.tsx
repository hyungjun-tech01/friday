import React from "react";
import styled from "styled-components";
import {Link} from "react-router-dom";
import { Icon, Menu } from "semantic-ui-react";


import Paths from "../constants/Paths";
import styles from "./Header.module.scss";


function Header(){
    console.log(Paths.ROOT);
    return(
        <div className={styles.wrapper}>
            <Link to={Paths.ROOT} className={`${styles.logo} ${styles.title}`}>
                Planka
            </Link>
          <Menu inverted size="large" className={styles.menu}>
            {/* Project가 선택되어 있을 경우 나오는 메뉴 */}
            <Menu.Menu position="left"> 
                <Menu.Item
                    as={Link}
                    to={Paths.ROOT}
                    className={`${styles.item} ${styles.itemHoverable}`}>
                <Icon fitted name="arrow left" />
                </Menu.Item>
                <Menu.Item
                    className={`
                    ${styles.item} 
                    ${styles.itemHoverable}
                    ${styles.title}`
                    }  >
                Test
              </Menu.Item>
            </Menu.Menu>    
            <Menu.Menu position="right">
                <Menu.Item
                    className={`${styles.item} ${styles.itemHoverable}`}>
                <Icon fitted name= "users" />
              </Menu.Item>
            </Menu.Menu>
           </Menu>
        </div>
    );
}
/*
const Row = styled.div`
    display : flex;
    width : 100%;
    top : 0px;
    justify-content: space-between;
    align-items: center;
    position: fixed;    
    background-color: black;
    color : white;
`;
const Col = styled.div`
    display : flex;
    margin-left : 20px;
    margin-right : 20px;
`;
//    border : 1px solid red;
const Logo = styled.div`
    display :flex;
    margin-left : 10px;
    margin-right : 10px;
    justify-content: center;    
    align-items : center;    
    padding : 0px 20px 0px 20px;
`;

const Items = styled.ul`
    display :flex;
`;
const Item = styled.li`
    display :flex;
    position: relative;   
    margin-left : 10px;
    margin-right : 10px;
    justify-content: center;    
    align-items : center;    
    padding : 0px 20px 0px 20px;
    &:hover {
    color: yellow;
  }    
 `;
function Header(){
    return (
        <Row>
            <Col>
                <Logo> <Link to = "/" style={{ textDecoration: "none" }}> MYLATION </Link> </Logo>
            </Col>
            <Col>
                <Items>
                    <Item><Link to = "/" style={{ textDecoration: "none" }}> Add User </Link></Item>
                    <Item> <Link to = "/" style={{ textDecoration: "none" }}> Demo Demo </Link></Item>
                </Items>
            </Col>
        </Row>
    );
}
*/
export default Header;