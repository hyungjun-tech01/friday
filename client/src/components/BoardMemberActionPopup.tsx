import {useRef, useEffect, useState} from "react";
import styles from "../scss/BoardMemberActionPopup.module.scss";
import User from "./User";

interface IBoardMemberActionPopupProps{
    userId: string;
    userName : string;
    userEmail : string;
    avatarUrl : string;
    showPopUp:(value:{userId:string, positionX:number, positionY:number}) =>  void;
}
function BoardMemberActionPopup({userId, userEmail, userName, avatarUrl, showPopUp}:IBoardMemberActionPopupProps){
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
          showPopUp({userId:"", positionX:-1, positionY:-1 });
        }
      }     
    
    const [dummyState, setDummyState]= useState({userId:"", positionX:-1, positionY:-1});
    return (
        <div className = {styles.overlay}>
            <div ref={wrapperRef} className={styles.modal}>
                <span className={styles.user}>
                <User userId={userId} onClick = {false} size={"Large"} showAnotherPopup={setDummyState} userName={userName} avatarUrl={avatarUrl} />
            </span>
            <span className={styles.content}>
                <div className={styles.name}>{userName}</div>
                <div className={styles.email}>{userEmail}</div>
            </span>
        {/*  permissionsSelectStep && canEdit && (
          <Button
            fluid
            content={t('action.editPermissions')}
            className={styles.button}
            onClick={handleEditPermissionsClick}
          />
        ) */}
        {/* membership.user.isCurrent
          ? canLeave && (
              <Button
                fluid
                content={t(leaveButtonContent)}
                className={styles.button}
                onClick={handleDeleteClick}
              />
            )
          : canEdit && (
              <Button
                fluid
                content={t(deleteButtonContent)}
                className={styles.button}
                onClick={handleDeleteClick}
              />
          ) */}
        
        </div>
        </div>
    );
}

export default BoardMemberActionPopup; 