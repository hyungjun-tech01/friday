import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Popup, Input } from 'semantic-ui-react';
import {useCookies} from "react-cookie";

import UserItem from '../UserItem';
import {IBoardUser, defaultBoardUser} from "../../atoms/atomsBoard";
import CustomPopupHeader from '../../lib/ui/CustomPopupHeader';

import styles from './AddStep.module.scss';


interface IAddStep{
    users: IBoardUser[],
    currentUserIds: string,
    permissionsSelectStep: any,
    title: string,
    onCreate: (data:IBoardUser)=>void,
    onClose: ()=>void,
}
const StepTypes = {
  SELECT_PERMISSIONS: 'SELECT_PERMISSIONS',
};

const AddStep = ({ users, currentUserIds, permissionsSelectStep, title, onCreate, onClose }:IAddStep) => {
    const [t] = useTranslation();
    const [step, setStep] = useState<string | null>(null);
    const [search, setSearch] = useState<string>('');
    const cleanSearch = useMemo(() => search.trim().toLowerCase(), [search]);
    const [cookies] = useCookies(['UserId', 'UserName','AuthToken']);
    const [defaultData, setDefaultData] = useState<IBoardUser>(defaultBoardUser);
    
  const handleFieldChange = useCallback((event:any) => {
    const newData = event.target.value;
    setSearch(newData);
  }, []);
  const handleBack = useCallback(() => {
    setStep(null);
  }, [setStep]);

  const filteredUsers = useMemo(
      () =>
        users.filter(
          (user) =>
            user.userEmail.includes(cleanSearch) ||
            user.userName.toLowerCase().includes(cleanSearch) ||
            (user.userName && user.userName.includes(cleanSearch)),
        ),
      [users, cleanSearch],
    );

    const searchField = useRef<any>(null);

    const handleUserSelect = useCallback(
      (id:any) => {
        if (permissionsSelectStep) {
            setStep(StepTypes.SELECT_PERMISSIONS);
            setDefaultData({...defaultData, 
              userId:id,}); 
           console.log('userselect ', defaultData, id);
        } else {
          setDefaultData({...defaultData, 
            userId:id,});
         // onCreate({...defaultData, userId:id});
         console.log('userselect ', defaultData);
          onClose();
        }
      },
      [defaultData, permissionsSelectStep, onClose],
    );

    const handleRoleSelect = useCallback(
      (data:any) => {
        setDefaultData({...defaultData, 
          userId:data.userId,
          role:data.role, 
          canComment: data.canComment});
        // onCreate({...defaultData, 
        //   userId:data.userId,
        //   role:data.role, 
        //   canComment: data.canComment}
        // );
      },
      [defaultData],
    );

    useEffect(() => {
        if(searchField.current){
            searchField.current.focus({preventScroll: true,});
        }
    }, []);

    if (step) {
      switch (step) {
        case StepTypes.SELECT_PERMISSIONS: {
          const currentUser = users.find((user) => user.userId === cookies.UserId);

          if (currentUser) {
            const PermissionsSelectStep = permissionsSelectStep;

            return (
              <PermissionsSelectStep
                defaultData={defaultData}
                title = "common.addBoardMember"
                buttonContent="common.addBoardMember"
                onSelect={handleRoleSelect}
                onBack={handleBack}
                onClose={onClose}
              />
            );
          }

          setStep(null);

          break;
        }
        default:
      }
    }

    return (
      <>
        <CustomPopupHeader>
          {t(title, {
            context: 'title',
          })}
        </CustomPopupHeader>
        <Popup.Content>
          <Input
            fluid
            ref={searchField}
            value={search}
            placeholder={t('common.searchUsers')}
            icon="search"
            onChange={handleFieldChange}
          />
          {filteredUsers.length > 0 && (
            <div className={styles.users}>
              {filteredUsers.map((user) => (
                <UserItem
                  key={user.userId}
                  userId={user.userId}
                  userName={user.userName}
                  avatarUrl={user.avatarUrl}
                  canEdit={user.canEdit}
                  onSelect={() => handleUserSelect(user.userId)}
                />
              ))}
            </div>
          )}
        </Popup.Content>
      </>
    );
  }

export default AddStep;
