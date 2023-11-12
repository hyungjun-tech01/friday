import { dequal } from 'dequal';
import omit from 'lodash/omit';
import React, { useCallback, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Button, Form, Menu, Radio, Segment, Popup } from 'semantic-ui-react';
import CustomPopupHeader from '../../lib/ui/CustomPopupHeader';


//import { BoardMembershipRoles } from '../../constants/Enums';

import styles from './ProjectMembershipPermissionsSelectStep.module.scss';
import {IBoardUser} from "../../atoms/atomsBoard";

interface IProjectMembershipPermissionsSelectStep{
  defaultData: IBoardUser, 
  title: string,
  buttonContent: string,
  onSelect: (data:IBoardUser) => void,
  onBack: ()=>void,
  onClose: ()=>void,
}

const ProjectMembershipPermissionsSelectStep = ({ defaultData, title, buttonContent, onSelect, onBack, onClose }:IProjectMembershipPermissionsSelectStep) => {
    const [t] = useTranslation();

    const [data, setData] = useState<IBoardUser>(() => ({
      ...defaultData,
      role: "editor",
      canEdit: true,
      canComment: false,
    }));

    const handleSelectRoleClick = useCallback((role:any) => {
      setData((prevData:any) => ({
        ...prevData,
        role:role,
        canEdit:role === "viewer" ? false:true, 
        canComment: role === "viewer" ? !!prevData.canComment : false,
      }));
    }, []);

    const handleSettingChange = useCallback(() => {
       setData((prevData:any) => ({
         ...prevData,
         canComment: !prevData.canComment,
       }));
    }, []);

    const handleSubmit = useCallback(() => {
      onSelect(data);
      onClose();
    }, [ onSelect, onClose, data]);

    return (
      <>
        <CustomPopupHeader>
          {t(title, {
            context: 'title',
          })}
        </CustomPopupHeader>
        <Popup.Content>
          <Form onSubmit={handleSubmit}>
            <Menu secondary vertical className={styles.menu}>
              <Menu.Item 
                active={data.role === "manager"}
                onClick={() => handleSelectRoleClick("manager")}
              >
                <div className={styles.menuItemTitle}>{t('common.manager')}</div>
                <div className={styles.menuItemDescription}>
                  {t('common.managerMember')}
                </div>
              </Menu.Item>
              <Menu.Item 
                active={data.role === "normal"}
                onClick={() => handleSelectRoleClick("normal")}
              >
                <div className={styles.menuItemTitle}>{t('common.normal')}</div>
                <div className={styles.menuItemDescription}>{t('common.normalMember')}</div>
              </Menu.Item>
            </Menu>
            { /* data.role === "viewer" && (
              <Segment basic className={styles.settings}>
                <Radio
                  toggle
                  name="canComment"
                  checked={data.canComment}
                  label={t('common.canComment')}
                  onChange={handleSettingChange}
                />
              </Segment>
            ) */}
            <Button positive content={t(buttonContent)} />
          </Form>
        </Popup.Content>
      </>
    );
  };

export default ProjectMembershipPermissionsSelectStep;
