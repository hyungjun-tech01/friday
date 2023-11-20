import React, {useState, useCallback, useEffect} from "react";
import {Link, useHistory} from "react-router-dom";
import { Icon, Menu, Dropdown } from "semantic-ui-react";
import {useCookies} from "react-cookie";
import { useTranslation } from 'react-i18next';
import {useRecoilState, useRecoilValue} from 'recoil';

import Paths from "../constants/Paths";
import styles from "../scss/Header.module.scss";
import NotiModal from "./NotiModal";
import UsersModal from "./UsersModal";
import {atomMyUser, IUser, } from "../atoms/atomsUser";
import { atomMyNotification } from "../atoms/atomNotification";
import {apiGetUser} from "../api/user";
import { SubscriptionRepository } from "../repository/subscriptionRepo";
import { NotificationRepository } from "../repository/notificationRepo";

import Path from '../constants/Paths';
import ProjectSettingsModal from "./ProjectSettingsModal";
import { usePopup } from "../lib/hook";


function Header({setCurrent, projectName, projectId}:any){
    const { t } = useTranslation();
    //project id로 보드를 쿼리할 것.
    const [cookies, setCookie, removeCookie] = useCookies(['UserId','UserName', 'AuthToken']);
    const history = useHistory();
    const [showUsers, setShowUsers] = useState(false);

    // 현재 사용자의 isAdmin을 체크 
    const [currentUser,setCurrentUser] = useRecoilState<IUser>(atomMyUser);
    console.log('isAdmin', currentUser.isAdmin);

    // Load subscription
    const { loadSubscriptions } = useRecoilValue(SubscriptionRepository);
    // Notification
    const notifications = useRecoilValue(atomMyNotification);
    const { loadNotifications, removeNotification } = useRecoilValue(NotificationRepository);
    
    const getUserInfo = async ()=>{
        const userInfo = await apiGetUser(cookies.UserId);
        setCurrentUser(userInfo);
    };

    // Notification
    const NotificationPopup = usePopup(NotiModal,  {
        position: 'bottom right',
      });

    useEffect(() => {
        getUserInfo();
        loadSubscriptions(cookies.UserId);
        loadNotifications(cookies.UserId);
    }, [cookies.UserId, loadSubscriptions, loadNotifications]);

    if(cookies.AuthToken === undefined || cookies.AuthToken === "" || cookies.AuthToken === null){
        removeCookie('UserId');
        removeCookie('UserName');
        removeCookie('AuthToken');
        history.push(Path.LOGIN);
    }
    
    const [showProjSetting, setShowProjSetting] = useState(false);
    const onSettings = ()=> {
        console.log('setting');
    };
    const handleProjectSettingsClick = useCallback(() => {
       // if(currentUser.isAdmin === true )
            setShowProjSetting(true);
        //if (canEditProject) {
        //  onProjectSettingsClick();
        //}
      }, [projectId]);
    const onLogout = ()=> {
        console.log('logout');
        removeCookie('AuthToken');
        removeCookie('UserName');
        removeCookie('UserId');
        history.push(Path.LOGIN);
    //    console.log(cookies);
    };

    return(
        <>
        <div className={styles.wrapper}>
            <Link to={Paths.ROOT} onClick={()=>{setCurrent(false); projectName="";}} className={`${styles.logo} ${styles.title}`}>
                {t('common.productName')}
            </Link>
            <Menu inverted size="large" className={styles.menu}>
                <Menu.Menu position="left">
                    <Menu.Item   onClick={handleProjectSettingsClick}
                       className={`${styles.item} ${styles.itemHoverable}`} >
                        {projectName}
                    </Menu.Item>
                </Menu.Menu>    
                <Menu.Menu position="right">
                    <Menu.Item onClick={()=>{setShowUsers(!showUsers)}}
                        className={`${styles.item} ${styles.itemHoverable}`}>
                    <Icon fitted name= "users" />
                    </Menu.Item>
                    <NotificationPopup
                        items={notifications}
                        onDelete={removeNotification}
                    >
                        <Menu.Item  className={`${styles.item}  ${styles.itemHoverable}`}>
                            <Icon fitted name="bell" />
                            {notifications.length > 0 && (
                            <span className={styles.notification}>{notifications.length}</span>
                            )}
                        </Menu.Item>
                    </NotificationPopup>
                    <Menu.Item className={`${styles.item}, ${styles.itemHoverable}`}>
                    {cookies?.UserName}   {/* 로그인 하면 사용자 정보 표시  -> 로그아웃, 사용자 정보 메뉴화면 나옴. */}
                        <Dropdown item icon='caret down' simple>
                        <Dropdown.Menu >
                            <Dropdown.Item onClick={onSettings}>설정</Dropdown.Item>
                            <Dropdown.Item onClick={onLogout}>로그아웃</Dropdown.Item>
                        </Dropdown.Menu>
                        </Dropdown>
                    </Menu.Item>
                </Menu.Menu>
            </Menu>
            <Menu>
           </Menu>
        </div>
        {showUsers && <UsersModal onClose={setShowUsers}/>}
        {showProjSetting&&<ProjectSettingsModal projectId={projectId} onClose={setShowProjSetting} setCurrent={setCurrent} projectName={projectName}/>}
        </>

    );
}
/*

          <Menu inverted size="large" className={styles.menu}>
             
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