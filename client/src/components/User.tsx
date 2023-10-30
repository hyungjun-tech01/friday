import styles from "../scss/User.module.scss";
import initials from 'initials';
import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import classNames from "classnames";
import React from "react";

interface IUserProps{
    userId?:string;
    userName:string;
    userEmail?:string;
    avatarUrl : string | null;
    canEdit?: boolean|null;
    size ?: UserSize;
    onClick ?: ()=>void | undefined;
    showAnotherPopup? : (value:{userId:string, userName:string, userEmail:string, avatarUrl:string, canEdit:boolean, role:string, positionX:number, positionY:number}) => void;
}

type UserSize = "tiny" | 'small' | 'medium' | 'large' | 'massive';
  
const COLORS = [
  'emerald',
  'peter-river',
  'wisteria',
  'carrot',
  'alizarin',
  'turquoise',
  'midnight-blue',
];

const getColor = (name:any) => {
  let sum = 0;
  for (let i = 0; i < name.length; i += 1) {
    sum += name.charCodeAt(i);
  }

  return COLORS[sum % COLORS.length];
};
function User({userId, userName, userEmail, avatarUrl=null, canEdit, size='medium', onClick=undefined, showAnotherPopup}:IUserProps){
    const contentNode = (
        <span
          title={userName}
          className={
            classNames(styles.wrapper,styles.wrapperHoverable, styles[`wrapper${upperFirst(size)}`],
            onClick && styles.wrapperHoverable,!avatarUrl && styles[`background${upperFirst(camelCase(getColor(userName)))}`],)}
          style={{
            background: avatarUrl ? `url("${avatarUrl}") center / cover` : undefined,
          }} 
        >
          {!avatarUrl && <span className={styles.initials}>{initials(userName)}</span>}
        </span>
      );    
    const isDisabled = false;

    const onCreate = (event:React.MouseEvent<HTMLButtonElement>)=> {
      
      if (avatarUrl === null) avatarUrl = '';
      if(userId && userEmail && (avatarUrl==='' || avatarUrl)&& canEdit && showAnotherPopup) {
        console.log('user showAnotherPopup', userId)
       showAnotherPopup({userId:userId, userName:userName, userEmail:userEmail, avatarUrl:avatarUrl, canEdit:canEdit, role:"", positionX:event.pageX, positionY:event.pageY});
      }
    };
    return canEdit ? (
      <button type="button" disabled={isDisabled} className={styles.button} onClick={ onCreate}>
        {contentNode}
      </button>
    ) : (
      contentNode
    );
}

export default User;