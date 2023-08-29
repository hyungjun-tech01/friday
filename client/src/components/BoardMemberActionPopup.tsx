import {useRef, useEffect, useState} from "react";
import styles from "../scss/BoardMemberActionPopup.module.scss";
import User from "./User";
import classNames from "classnames";
import {Button} from "semantic-ui-react";
import {useTranslation} from "react-i18next";
import EditPermissions from "./EditPermissions";

interface IBoardMemberActionPopupProps{
    boardId : string;
    currentUserCanEdit : string;
    currentUserId : string;
    userId: string;
    userName : string;
    userEmail : string;
    canEdit : string;
    avatarUrl : string;
    showPopUp:(value:{userId:string, userName:string,  userEmail:string, avatarUrl:string, canEdit:string, positionX:number, positionY:number}) =>  void;
}
function BoardMemberActionPopup({boardId, currentUserCanEdit, currentUserId, userId, userEmail, userName, avatarUrl, canEdit, showPopUp}:IBoardMemberActionPopupProps){
    let wrapperRef = useRef<any>(null); //모달창 가장 바깥쪽 태그를 감싸주는 역할
    useEffect(()=>{
        document.addEventListener('mousedown', handleClickOutside);
        return()=>{
          document.removeEventListener('mousedown', handleClickOutside);
        }
      });
  
    const handleClickOutside=(event:any)=>{
        if (wrapperRef && 
            wrapperRef.current &&
            !wrapperRef.current.contains(event.target)) {
          console.log('close modal');
          showPopUp({userId:"", userName:"", userEmail:"", avatarUrl:"", canEdit:"", positionX:-1, positionY:-1 });
        }
      }     
    
    const [t] = useTranslation();
    const [dummyState, setDummyState]= useState({userId:"",userName:"", userEmail:"", avatarUrl:"", positionX:-1, positionY:-1});
    console.log('boardMemberActionPopup', boardId, userName, userEmail);
    const [editPermissions, setEditPermissions] = useState(false);
    //클릭한 마우스 위치 가지고 있을 수 있는 const 지정 
    const [positions, setPositions] = useState({positionX:-1, positionY:-1});
    //현재 클릭한 곳의 position 을 가지고 와서 위의 const에 저장
    const handleEditPermissionsClick = (event:React.MouseEvent<HTMLButtonElement>)=>{
      setPositions({positionX:event.pageX,  positionY:event.pageY});
      // 권한 설정하는 Modal 띄움. EditPermissionModal 
      console.log('handleEditPermissionsClick');
      setEditPermissions(true);
    }
    const handleDeleteClick = () => { 
      // 보드에서 멤버를 제거하는 Modal 띄움 DeleteBoardMemberModal
      console.log('handleDeleteClick');
    }
    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.currentTarget.style.background = 'rgba(9, 30, 66, 0.08)';
      e.currentTarget.style.color = '#092d42';
    };
  
    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color = '#6b808c';
    };
    
    return (
        <div className={classNames(styles.overlay )} > 
            <div className={styles.modal} ref={wrapperRef} >
              <span>
              <span className={styles.user}>
                <User userId={userId} onClick = {false} size={"Large"} showAnotherPopup={setDummyState} userName={userName} canEdit={canEdit} avatarUrl={avatarUrl} userEmail={userEmail} />
              </span>
              <span className={styles.content}>
                <div className={styles.name}>{userName}</div>
                <div className={styles.email}>{userEmail}</div>
              </span>
              </span>
        {currentUserCanEdit === "editor" && (
          <Button
            fluid
            content={t('action.editPermissions')}
            style = {{
              background: 'transparent',
              boxShadow: 'none', // CSS 속성명에 대시(-) 대신 카멜 케이스를 사용해야 합니다.
              color: '#6b808c',
              fontWeight: 'normal',
              marginTop: '8px',
              padding: '6px 11px',
              textAlign: 'left',
              textDecoration: 'underline',
              transition: 'none',
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleEditPermissionsClick}
          />
        ) }
        { currentUserId === userId 
          ? (
              <Button
                fluid
                content={t('action.leaveButtonContent')}
                style = {{
                  background: 'transparent',
                  boxShadow: 'none', // CSS 속성명에 대시(-) 대신 카멜 케이스를 사용해야 합니다.
                  color: '#6b808c',
                  fontWeight: 'normal',
                  marginTop: '8px',
                  padding: '6px 11px',
                  textAlign: 'left',
                  textDecoration: 'underline',
                  transition: 'none',
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleDeleteClick}
              />
            )
          : currentUserCanEdit === "editor" && (
              <Button
                fluid
                content={t('action.deleteButtonContent')}
                style = {{
                  background: 'transparent',
                  boxShadow: 'none', // CSS 속성명에 대시(-) 대신 카멜 케이스를 사용해야 합니다.
                  color: '#6b808c',
                  fontWeight: 'normal',
                  marginTop: '8px',
                  padding: '6px 11px',
                  textAlign: 'left',
                  textDecoration: 'underline',
                  transition: 'none',
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleDeleteClick}
              />
          ) }
        {editPermissions&&
        <div style = {{top:`${positions.positionY}px`, left:`${positions.positionX}px` , position:'absolute'}}>
        <EditPermissions boardId={boardId} userId={userId} canEdit={canEdit}/>
        </div>
        }
        </div>
        </div>
    );
}

export default BoardMemberActionPopup; 