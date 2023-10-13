import {useRef, useMemo, useEffect, useState} from "react";
import { useTranslation } from 'react-i18next';
import styles from '../scss//BoardMemberAdd.module.scss';
import {IBoardUser} from "../atoms/atomsBoard";
import {atomAllUser} from "../atoms/atomsUser";
import {Input} from "semantic-ui-react";
import UserItem from "./UserItem";
import {useRecoilValue} from "recoil";
import BoardMemberPermission from "./BoardMemberPermission";


interface IBoardmemberAddProps{
    members?: IBoardUser[];
    canEdit:boolean;
    setOnAddPopup:(value:boolean) => void;
    setBoardMemeberPermissionUserId : (value:{userId:string, userName:string, userEmail:string, avatarUrl:string, canEdit:boolean, role:string, positionX:number, positionY:number}) =>void;
}
function BoardMemeberAdd({members, canEdit,setOnAddPopup, setBoardMemeberPermissionUserId}:IBoardmemberAddProps){
    const allUsers = useRecoilValue(atomAllUser);
    const [t] = useTranslation();
    let wrapperRef = useRef<any>(null); //모달창 가장 바깥쪽 태그를 감싸주는 역할
    const users = members !== undefined ? allUsers:null;
    const [search, handleSearchChange] = useState('');
    const cleanSearch = useMemo(() => search.trim().toLowerCase(), [search]);
    const searchField = useRef(null);

    console.log('board member add', users);
    /* 필터 구현 search 를 받아서 이놈이 userName중에 포함된 놈이 있으며 이놈을 리턴  */
    const filteredUsers = useMemo(
      () =>
        users?.filter(
          (user) =>
            user.userName.includes(cleanSearch) ,
        ),
      [users, cleanSearch],
    );

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
        setOnAddPopup(false);
      }
    }     
    const handleUserSelect = (userId:string, canEdit:boolean) => {
      if(canEdit === null){
        console.log('add user');
        setOnAddPopup(false);
        setBoardMemeberPermissionUserId({userId:userId, userName:"", userEmail:"", avatarUrl:"",  canEdit:canEdit,role:"", positionX:-1, positionY:-1});
      }
    }
    return(
      <>
      <div className = {styles.overlay}>
        <div className={styles.modal} >
          <div ref={wrapperRef} >
            <div className={styles.content}>
              <div className={styles.title} >
              {t('common.boardmemberadd_title')}
              </div>
              <Input
              ref={searchField}
              value={search}
              placeholder={t('common.searchUsers')}
              icon="search"
              onChange={()=>handleSearchChange} />
            {filteredUsers&&(
              <div className={styles.users}>
                {filteredUsers.map((user)=>(
                  <UserItem key={user.userId} userId={user.userId} userName={user.userName} avatarUrl={user.avatar} canEdit={canEdit} onSelect={() => handleUserSelect(user.userId, canEdit)}/>
                ))}
              </div>
            )}
            </div>
        </div>
        </div>  
      </div>

      </>
    );
}
export default BoardMemeberAdd;