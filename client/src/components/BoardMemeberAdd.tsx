import {useRef, useMemo, useEffect, useState} from "react";
import { useTranslation } from 'react-i18next';
import styles from '../scss//BoardMemberAdd.module.scss';
import {IBoardMember} from "../atoms/atomsBoard";
import {Input} from "semantic-ui-react";
import UserItem from "./UserItem";

interface IBoardmemberAddProps{
    members?: IBoardMember[];
    setOnAddPopup:(value:boolean) => void;
}
function BoardMemeberAdd({members, setOnAddPopup}:IBoardmemberAddProps){
    const [t] = useTranslation();
    let wrapperRef = useRef<any>(null); //모달창 가장 바깥쪽 태그를 감싸주는 역할
    const users = members !== undefined ? members[0].boardmMemberAllUsers:null;
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
    const handleUserSelect = (id:string, canEdit:string) => {
      if(canEdit === null){
        console.log('add user');
      }
    }
    return(
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
                  <UserItem key={user.userId} userId={user.userId} userName={user.userName} avatarUrl={user.avatarUrl} canEdit={user.canEdit} onSelect={() => handleUserSelect(user.userId, user.canEdit)}/>
                ))}
              </div>
            )}
            </div>
        </div>
      </div>  
      </div>
    );
}
export default BoardMemeberAdd;