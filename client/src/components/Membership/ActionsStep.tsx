import pick from 'lodash/pick';
import React, { useState,useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import { Button } from 'semantic-ui-react';
import {useCookies} from "react-cookie";


import User from '../User';
import DeleteStep from '../DeleteStep';
import {IBoardUser} from "../../atoms/atomsBoard";


import styles from './ActionsStep.module.scss';

const StepTypes = {
  EDIT_PERMISSIONS: 'EDIT_PERMISSIONS',
  DELETE: 'DELETE',
};
interface IActionStep{
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
    onUpdate: (userUd:string, data:any)=>void,
    onDelete: ()=>void,
    onClose: ()=>void,
};
const ActionsStep = ({
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

    const handleBack = useCallback(() => {
      setStep(null);
    }, [setStep]);

    const handleEditPermissionsClick = useCallback(() => {
      setStep(StepTypes.EDIT_PERMISSIONS);
    }, [setStep]);

    const handleDeleteClick = useCallback(() => {
      setStep(StepTypes.DELETE);
    }, [setStep]);

    const handleRoleSelect = useCallback(
      (data:any) => {
        if (onUpdate) {
          onUpdate(membership.userId, data);
        }
      },
      [membership.userId, onUpdate],
    );

    if (step) {
      switch (step) {
        case StepTypes.EDIT_PERMISSIONS: {
          const PermissionsSelectStep = permissionsSelectStep;

          return (
            <PermissionsSelectStep
              defaultData={pick(membership, ['role', 'canComment'])}
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
              onConfirm={onDelete}
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
        </span>
        {permissionsSelectStep && canEdit && (
          <Button
            fluid
            content={t('action.editPermissions')}
            className={styles.button}
            onClick={handleEditPermissionsClick}
          />
        )}
        { membership.userId === cookies.UserId  
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
            )}
      </>
    );
  }

export default ActionsStep;
