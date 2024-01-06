import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Table } from 'semantic-ui-react';
import { usePopup } from '../../lib/hook';
import {useRecoilValue, useSetRecoilState,} from 'recoil';


// /import UserAddStepContainer from '../../containers/UserAddStepContainer';
import Item from './Item';
import { IUser, allUserSelector, atomMyUser} from "../../atoms/atomsUser";
import {apiGetAllUser} from "../../api/user";
import userAddStep from "../UserAddStep";

interface IUserModal{
  onClose:(value:boolean)=>void;
}
const UsersModal = ({
   /*  items,
    onUpdate,
    onUsernameUpdate,
    onUsernameUpdateMessageDismiss,
    onEmailUpdate,
    onEmailUpdateMessageDismiss,
    onPasswordUpdate,
    onPasswordUpdateMessageDismiss,
    onDelete, */
    onClose,
  }:IUserModal) => {

    // 현재 사용자의 isAdmin을 체크 
    const currentUser= useRecoilValue<IUser>(atomMyUser);

    const items = useRecoilValue(allUserSelector);
    const setUsers = useSetRecoilState(allUserSelector);

   // const items = useRecoilValue(allUserSelector);
    const [t] = useTranslation();

    const onHandleClose = useCallback(
      ()  => {
       onClose(false); 
      },[onClose]
    );

    useEffect(()=>{onValid()},[]);
    
    const onValid = useCallback(
      async() => {
        const alluser = await apiGetAllUser();
        if(alluser){
          setUsers(alluser);
        }
      },[setUsers]
    );
    

    // const handleUpdate = useCallback(
    //   (id, data) => {
    //    // onUpdate(id, data);
    //   },
    //   [/*onUpdate*/],
    // );

    // const handleUsernameUpdate = useCallback(
    //   (id, data) => {
    //     //onUsernameUpdate(id, data);
    //   },
    //   [/*onUsernameUpdate*/],
    // );

    // const handleUsernameUpdateMessageDismiss = useCallback(
    //   (id) => {
    //     //onUsernameUpdateMessageDismiss(id);
    //   },
    //   [/*onUsernameUpdateMessageDismiss*/],
    // );

    // const handleEmailUpdate = useCallback(
    //   (id, data) => {
    //     //onEmailUpdate(id, data);
    //   },
    //   [/*onEmailUpdate*/],
    // );

    // const handleEmailUpdateMessageDismiss = useCallback(
    //   (id) => {
    //     // onEmailUpdateMessageDismiss(id);
    //   },
    //   [/*onEmailUpdateMessageDismiss*/],
    // );

    // const handlePasswordUpdate = useCallback(
    //   (id, data) => {
    //     // onPasswordUpdate(id, data);
    //   },
    //   [/*onPasswordUpdate*/],
    // );

    // const handlePasswordUpdateMessageDismiss = useCallback(
    //   (id) => {
    //     // onPasswordUpdateMessageDismiss(id);
    //   },
    //   [/*onPasswordUpdateMessageDismiss*/],
    // );

    // const handleDelete = useCallback(
    //   (id) => {
    //     // onDelete(id);
    //   },
    //   [/*onDelete*/],
    // );

    const UserAddPopup = usePopup(userAddStep);

    /*
                    emailUpdateForm={item.emailUpdateForm}
                  passwordUpdateForm={item.passwordUpdateForm}
                  usernameUpdateForm={item.usernameUpdateForm}
                  onUpdate={(data) => handleUpdate(item.id, data)}
                  onUsernameUpdate={(data) => handleUsernameUpdate(item.id, data)}
                  onUsernameUpdateMessageDismiss={() => handleUsernameUpdateMessageDismiss(item.id)}
                  onEmailUpdate={(data) => handleEmailUpdate(item.id, data)}
                  onEmailUpdateMessageDismiss={() => handleEmailUpdateMessageDismiss(item.id)}
                  onPasswordUpdate={(data) => handlePasswordUpdate(item.id, data)}
                  onPasswordUpdateMessageDismiss={() => handlePasswordUpdateMessageDismiss(item.id)}
                  onDelete={() => handleDelete(item.id)}
    */
    return (
      <Modal open closeIcon size="large" centered={false} onClose={onHandleClose}>
        <Modal.Header>
          {t('common.users', {
            context: 'title',
          })}
        </Modal.Header>
        <Modal.Content scrolling>
          <Table unstackable basic="very">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell />
                <Table.HeaderCell width={4}>{t('common.name')}</Table.HeaderCell>
                <Table.HeaderCell width={4}>{t('common.username')}</Table.HeaderCell>
                <Table.HeaderCell width={4}>{t('common.email')}</Table.HeaderCell>
                <Table.HeaderCell>{t('common.administrator')}</Table.HeaderCell>
                <Table.HeaderCell />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {items.map((item) => (
                <Item
                  key={item.userId}
                  email={item.email}
                  username={item.userName}
                  name={item.name}
                  avatarUrl={item.avatar}
                  organization={item.organization}
                  phone={item.phone}
                  isAdmin={item.isAdmin}
                />
              ))}
            </Table.Body>
          </Table>
        </Modal.Content>
        <Modal.Actions>
          <UserAddPopup>
            {currentUser.isAdmin && <Button positive content={t('action.addUser')} /> }
          </UserAddPopup>
        </Modal.Actions>
      </Modal>
    );
  };


export default UsersModal;
