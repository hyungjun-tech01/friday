import React, { useCallback } from 'react';

import { Radio, Table } from 'semantic-ui-react';
import { usePopup } from '../../../lib/hook';

import ActionsStep from './ActionsStep';
import User from '../../Membership/User';

import styles from './Item.module.scss';
interface IItem{
  email : string;
  username : string;
  name : string;
  avatarUrl :string;
  organization: string;
  phone:string;
  isAdmin : boolean;
}
const Item = ({
    email,
    username,
    name,
    avatarUrl,
   // organization,
  //  phone,
    isAdmin,
  //  emailUpdateForm,
  //  passwordUpdateForm,
  //  usernameUpdateForm,
  //  onUpdate,
  //  onUsernameUpdate,
  //  onUsernameUpdateMessageDismiss,
  //  onEmailUpdate,
  //  onEmailUpdateMessageDismiss,
  //  onPasswordUpdate,
  //  onPasswordUpdateMessageDismiss,
  //  onDelete,
  }:IItem) => {
    const handleIsAdminChange = useCallback(() => {
    //  onUpdate({
    //    isAdmin: !isAdmin,
    //  });
    }, [/*isAdmin, onUpdate*/]);

    //const ActionsPopup = usePopup(ActionsStep);

    const onClick = ()=>{
      console.log('userClick');
    }

     /*  <Table.Cell textAlign="right">
          <ActionsPopup
            user={{
              email,
              username,
              name,
              organization,
              phone,
              isAdmin,
              emailUpdateForm,
              passwordUpdateForm,
              usernameUpdateForm,
            }}
            onUpdate={onUpdate}
            onUsernameUpdate={onUsernameUpdate}
            onUsernameUpdateMessageDismiss={onUsernameUpdateMessageDismiss}
            onEmailUpdate={onEmailUpdate}
            onEmailUpdateMessageDismiss={onEmailUpdateMessageDismiss}
            onPasswordUpdate={onPasswordUpdate}
            onPasswordUpdateMessageDismiss={onPasswordUpdateMessageDismiss}
            onDelete={onDelete}
          >
            <Button className={styles.button}>
              <Icon fitted name="pencil" />
            </Button>
          </ActionsPopup>
        </Table.Cell>
          */
    return (
      <Table.Row>
        <Table.Cell>
          <User name={name} avatarUrl={avatarUrl} size={'large'} isDisabled={true} onClick={onClick} />
        </Table.Cell>
        <Table.Cell>{name}</Table.Cell>
        <Table.Cell>{username || '-'}</Table.Cell>
        <Table.Cell>{email}</Table.Cell>
        <Table.Cell>
          <Radio toggle checked={isAdmin} onChange={handleIsAdminChange} />
        </Table.Cell>
      
      </Table.Row>
    );
  };

export default Item;
