import {useRef, useEffect, useState} from "react";
import styles from "../scss/BoardMemberActionPopup.module.scss";
import User from "./User";
import classNames from "classnames";
import {Button} from "semantic-ui-react";
import {useTranslation} from "react-i18next";
import EditPermissions from "./EditPermissions";


interface IBoardMemberActionPopupProps{
    boardId : string;
    currentUserCanEdit : boolean;
    currentUserId : string;
    userId: string;
    userName : string;
    userEmail : string;
    canEdit : boolean;
    avatarUrl : string;
    showPopUp:(value:{userId:string, userName:string,  userEmail:string, avatarUrl:string, canEdit:boolean, role:string, positionX:number, positionY:number}) =>  void;
    handleDeleteClick : (value:boolean) => void;
}
function BoardMemberActionPopup({boardId, currentUserCanEdit, currentUserId, userId, userEmail, userName, avatarUrl, canEdit, showPopUp, handleDeleteClick}:IBoardMemberActionPopupProps){
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
          showPopUp({userId:"", userName:"", userEmail:"", avatarUrl:"", canEdit:currentUserCanEdit, role:"", positionX:-1, positionY:-1 });
        }
      }     
    
    const [t] = useTranslation();
    const [dummyState, setDummyState]= useState({userId:"",userName:"", userEmail:"", avatarUrl:"", positionX:-1, positionY:-1});
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

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.currentTarget.style.background = 'rgba(9, 30, 66, 0.08)';
      e.currentTarget.style.color = '#092d42';
    };
  
    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color = '#6b808c';
    };
    

    return (
        <div className={classNames(styles.overlay)} > 
            <div className={styles.modal} ref={wrapperRef} >
              <span>
              <span className={styles.user}>
                <User userId={userId} size="large" showAnotherPopup={setDummyState} userName={userName} canEdit={canEdit} avatarUrl={avatarUrl} userEmail={userEmail} />
              </span>
              <span className={styles.content}>
                <div className={styles.name}>{userName}</div>
                <div className={styles.email}>{userEmail}</div>
              </span>
              </span>
        {currentUserCanEdit  && (
          <Button
            fluid
            content={t('action.editPermissions')}
            style = {{
              background: 'transparent',  // CSS 속성명에 대시(-) 대신 카멜 케이스를 사용해야 합니다.
              boxShadow: 'none', 
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
                onClick={()=> handleDeleteClick(true)}
              />
            )
          : currentUserCanEdit  && (
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
                onClick={()=>handleDeleteClick(true)}
              />
          ) }
        {editPermissions&&
        <div style = {{top:`${positions.positionY}px`, left:`${positions.positionX}px` , position:'absolute'}}>
        <EditPermissions boardId={boardId} userId={userId} canEdit={canEdit}/>
          {/* <PermissionsSelectStep
                defaultData={defaultData}
                setDefaultData={setDefaultData}
                title = "common.addBoardMember"
                buttonContent="common.addBoardMember"
                onSelect={handleRoleSelect}
                onBack={handleBack}
                onClose={onClose}
        /> */}

        </div>
        }

        </div>
        </div>
    );
}

export default BoardMemberActionPopup; 