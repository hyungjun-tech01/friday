import pick from 'lodash/pick';
import React, { useState,useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import { Button } from 'semantic-ui-react';
import {useCookies} from "react-cookie";


import DeleteStep from '../DeleteStep';
import {IBoardUser} from "../../atoms/atomsBoard";


import styles from './ActionsStep.module.scss';

const StepTypes = {
  EDIT_PERMISSIONS: 'EDIT_PERMISSIONS',
  DELETE: 'DELETE',
};
interface IActionStep{
    boardId:string,
    projectId:string,
    membership: IBoardUser, // eslint-disable-line react/forbid-prop-types
    permissionsSelectStep: any,
    leaveButtonContent: string,
    leaveConfirmationTitle: string,
    leaveConfirmationContent: string,
    leaveConfirmationButtonContent: string,
    deleteButtonContent: string,
    deleteConfirmationTitle: string,
    deleteConfirmationContent: string,
    deleteConfirmationButtonContent: string,
    canEdit: boolean,
    canLeave: boolean,
    onUpdate: (boardId:string, userId:string, data:any)=>void,
    onDelete: (userId:string, delBoardId:string)=>void,
    onClose: ()=>void,
};
const ActionsStep = ({
    boardId,
    projectId,
    membership,
    permissionsSelectStep,
    leaveButtonContent,
    leaveConfirmationTitle,
    leaveConfirmationContent,
    leaveConfirmationButtonContent,
    deleteButtonContent,
    deleteConfirmationTitle,
    deleteConfirmationContent,
    deleteConfirmationButtonContent,
    canEdit,
    canLeave,
    onUpdate,
    onDelete,
    onClose,
  }:IActionStep) => {
    const [t] = useTranslation();
    const [step, setStep] = useState<string | null>(null);
    const [cookies] = useCookies(['UserId', 'UserName','AuthToken']);

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.currentTarget.style.background = '#9e3f08';
      e.currentTarget.style.color = 'white';
    };
  
  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color = '#6b808c';
    };

    const handleBack = useCallback(() => {
      setStep(null);
    }, [setStep]);

    const handleEditPermissionsClick = useCallback(() => {
      setStep(StepTypes.EDIT_PERMISSIONS);
    }, [setStep]);

    const handleDeleteClick = useCallback(() => {
      setStep(StepTypes.DELETE);
    }, [setStep]);

    const handleTempClick = (userId:string, boardId:string) =>{
      //console.log('handleTempClick');
      //onConfirm={()=> onDelete( membership.userId, boardId)}
      onClose();
    }
    const handleRoleSelect = useCallback(
      (data:any) => {
        if (onUpdate) {
          console.log('onUpdate', data);
          onUpdate(boardId, membership.userId, data);
        }
      },
      [boardId, membership.userId, onUpdate],
    );

    if (step) {
      switch (step) {
        case StepTypes.EDIT_PERMISSIONS: {
          const PermissionsSelectStep = permissionsSelectStep;

          return (
            <PermissionsSelectStep
              defaultData={pick(membership, ['userName', 'avatarUrl', 'userEmail', 'role', 'canComment'])}
              title="common.editPermissions"
              buttonContent="action.save"
              onSelect={handleRoleSelect}
              onBack={handleBack}
              onClose={onClose}
            />
          );
        }
        case StepTypes.DELETE:
          return (
            <DeleteStep
              boardId ={membership.boardId}
              projectId={projectId}
              userId = {membership.userId}
              title={membership.userId === cookies.UserId  ? leaveConfirmationTitle : deleteConfirmationTitle}
              content={
                membership.userId === cookies.UserId   ? leaveConfirmationContent : deleteConfirmationContent
              }
              buttonContent={
                membership.userId === cookies.UserId 
                  ? leaveConfirmationButtonContent
                  : deleteConfirmationButtonContent
              }
              onConfirm={()=> handleTempClick( membership.userId, boardId)}
              onBack={handleBack}
            />
          );
        default:
      }
    }

    return (
      <>
        <span className={styles.user}>
          {/* <User name={membership.userName} avatarUrl={membership.avatarUrl} size="large" /> */}
        </span>
        <span className={styles.content}>
          <div className={styles.name}>{membership.userName}</div>
          <div className={styles.email}>{membership.userEmail}</div>
          <div className={styles.role}>{membership.role} {membership.role === 'viewer'&&membership.canComment ? 'Comment Enable': ''}</div>
        </span>
        {permissionsSelectStep && canEdit && (
          <Button
            fluid
            content={t('action.editPermissions')}
            style={{
              background: 'transparent',
              boxShadow: 'none',
              color:'#6b808c',
              fontWeight: 'normal',
              marginTop: '8px',
              padding: '6px 11px',
              textAlign: 'left',
              textDecoration: 'underline',
              transition: 'none'
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}                      
            onClick={handleEditPermissionsClick}
          />
        )}
        { membership.userId === cookies.UserId  
          ? canLeave && (
              <Button
                fluid
                content={t(leaveButtonContent)}
                style={{
                  background: 'transparent',
                  boxShadow: 'none',
                  color:'#6b808c',
                  fontWeight: 'normal',
                  marginTop: '8px',
                  padding: '6px 11px',
                  textAlign: 'left',
                  textDecoration: 'underline',
                  transition: 'none'
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}   
                onClick={handleDeleteClick}
              />
            )
          : canEdit && (
              <Button
                fluid
                content={deleteButtonContent}
                style={{
                  background: 'transparent',
                  boxShadow: 'none',
                  color:'#6b808c',
                  fontWeight: 'normal',
                  marginTop: '8px',
                  padding: '6px 11px',
                  textAlign: 'left',
                  textDecoration: 'underline',
                  transition: 'none'
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}   
                onClick={handleDeleteClick}
              />
            )}
      </>
    );
  }

export default ActionsStep;
