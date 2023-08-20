import styles from "../scss/UserItem.module.scss";
import User from "./User";
import classNames from "classnames";
import {useState} from "react";
interface IUserItemProp{
    userId : string;
    userName:string;
    avatarUrl : string;
    canEdit : string;
    onSelect: (value: { userId: string; canEdit: string }) => void; // Corrected the parameter type
}
function UserItem({userName, userId, avatarUrl, canEdit, onSelect}:IUserItemProp){
    const isActive = canEdit === null ? false:true;
    const [dummyState, setDummyState]= useState({userId:"", userName:"", userEmail:"", avatarUrl:"", positionX:-1, positionY:-1});

    console.log("user Item", userId, userName, canEdit, avatarUrl, isActive);
    return(
    <button type="button" disabled={isActive} className={styles.menuItem} onClick={()=> onSelect({userId:userId, canEdit:canEdit})}>
    <span className={styles.user}>
      <User userId={userId} onClick = {false} size={"Large"}showAnotherPopup={setDummyState} userName={userName} canEdit={canEdit} avatarUrl={avatarUrl} userEmail={""}/>
    </span>
    <div className={classNames(styles.menuItemText, isActive && styles.menuItemTextActive)}>
      {userName}  
    </div>
    </button>
    );
}
export default UserItem;
