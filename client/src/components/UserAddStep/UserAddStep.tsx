
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, Message, Input, Popup } from 'semantic-ui-react';
import {useCookies} from "react-cookie";
import {useRecoilValue, useSetRecoilState} from "recoil";

import {useForm} from "react-hook-form";


import {IUser, IModifyUser, defaultUser, allUserSelector} from "../../atoms/atomsUser";
import {apiSingUp} from "../../api/user";

import styles from './UserAddStep.module.scss';

const createMessage = (error:any) => {
  if (!error) {
    return error;
  }

  switch (error.message) {
    case 'Email already in use':
      return {
        type: 'error',
        content: 'common.emailAlreadyInUse',
      };
    case 'Username already in use':
      return {
        type: 'error',
        content: 'common.usernameAlreadyInUse',
      };
    default:
      return {
        type: 'warning',
        content: 'common.unknownError',
      };
  }
};
interface IUserAddStep{
  defaultData: IUser; 
  isSubmitting: boolean;
  error: any; // eslint-disable-line react/forbid-prop-types
  onCreate: (data:IUser)=> void;
  onMessageDismiss: any,
  onClose: ()=>void;
}
const UserAddStep =
  ({ defaultData, isSubmitting, error, onCreate, onMessageDismiss, onClose }:IUserAddStep) => {
    const [t] = useTranslation();
    const [cookies] = useCookies(['UserId', 'UserName','AuthToken']);
    const {register, handleSubmit,formState:{errors}} = useForm();
    const allUsers = useRecoilValue(allUserSelector);
    const setUsers = useSetRecoilState(allUserSelector);

    const onValid = async (data:any) =>{
      console.log('add user');
      const addUser : IModifyUser= {...defaultUser, userActionType:'ADD', createrId:cookies.UserId, userName:data.userName, 
                                    name:data.name, email:data.email, password:data.password};
    
      const response = await apiSingUp(addUser);
      console.log('response', response, response.status);
      if(response){
        if(response.outUserId){
          const addUser : IUser ={...defaultUser,  userName:data.userName, 
            name:data.name, email:data.email, userId:response.outUserId }

          const newAllUsers = allUsers.concat(addUser);
          setUsers(newAllUsers);

          onClose();
        }else if(response.message){
          console.log('사용자 생성 실패', response.message)
        }else{
          console.log('사용자 생성 실패', response.message)
        }
      }


    } 

    const message = useMemo(() => createMessage(error), [error]);

    return (
      <>
        <Popup.Header style={{
           color: '#444444',
           fontSize: '12px',
           fontWeight: 'bold',
           textAlign: 'center',
           padding: '8px'
        }} classname = {styles.popupHeader}>
          {t('common.addUser', {
            context: 'title',
          })}
        </Popup.Header>
        <Popup.Content>
          {message && (
            <Message
              
              {...{
                [message.type]: true,
              }}
              visible
              content={t(message.content)}
              onDismiss={onMessageDismiss}
            />
          )}
          <Form onSubmit={handleSubmit(onValid)}>
            <div className={styles.text}>{t('common.email')}</div>
            <input
              {...register("email", {
              required:"email is required."
              }) }
              type = "text"
              name="email"
              style={{marginBottom: '8px'}}
              readOnly={isSubmitting}
              className={styles.field}
            />
            <div className={styles.text}>{t('common.password')}</div>
            <input
              {...register("password", {
                  required:"password is required."
              }) }
              type = "password"
              name="password"
              style={{marginBottom: '8px'}}
              readOnly={isSubmitting}
              className={styles.field}
              
            />
            <div className={styles.text}>{t('common.name')}</div>
            <input
             {...register("name", {
              required:"name is required."
             }) }
              name="name"
              style={{marginBottom: '8px'}}
              readOnly={isSubmitting}
              className={styles.field}
            />
             <div className={styles.text}>{t('common.username')}</div>
            <input
               {...register("userName", {
                required:"userName is required."
            }) }
              
              name="userName"
              style={{marginBottom: '8px'}}
              readOnly={isSubmitting}
              className={styles.field}
            />
            <Button
              positive
              content={t('action.addUser')}
              loading={isSubmitting}
              disabled={isSubmitting}
            />
          </Form>
        </Popup.Content>
      </>
    );
  };



export default UserAddStep;
