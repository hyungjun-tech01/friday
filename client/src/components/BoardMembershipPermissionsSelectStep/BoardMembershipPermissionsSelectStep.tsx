import { dequal } from 'dequal';
import omit from 'lodash/omit';
import React, { useCallback, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Button, Form, Menu, Radio, Segment, Popup } from 'semantic-ui-react';
import CustomPopupHeader from '../../lib/ui/CustomPopupHeader';


//import { BoardMembershipRoles } from '../../constants/Enums';

import styles from './BoardMembershipPermissionsSelectStep.module.scss';
import {IBoardUser} from "../../atoms/atomsBoard";

interface IBoardMembershipPermissionsSelectStep{
  defaultData: IBoardUser, 
  title: string,
  buttonContent: string,
  onSelect: (data:IBoardUser) => void,
  onBack: ()=>void,
  onClose: ()=>void,
}

const BoardMembershipPermissionsSelectStep = ({ defaultData, title, buttonContent, onSelect, onBack, onClose }:IBoardMembershipPermissionsSelectStep) => {
    const [t] = useTranslation();

    const [data, setData] = useState(() => ({
      ...defaultData,
      role: "editor",
      canComment: false,
    }));

    const handleSelectRoleClick = useCallback((role:any) => {
      setData((prevData:any) => ({
        ...prevData,
        role:role,
        canComment: role === "viewer" ? !!prevData.canComment : false,
      }));
    }, []);

    const handleSettingChange = useCallback(() => {
      console.log('change');
       setData((prevData:any) => ({
         ...prevData,
         canComment: !prevData.canComment,
       }));
    }, []);

    const handleSubmit = useCallback(() => {
      console.log('member add',data);
      if (!dequal(data, defaultData)) {
        onSelect(data);
      }

      onClose();
    }, [defaultData, onSelect, onClose, data]);

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
                active={data.role === "editor"}
                onClick={() => handleSelectRoleClick("editor")}
              >
                <div className={styles.menuItemTitle}>{t('common.editor')}</div>
                <div className={styles.menuItemDescription}>
                  {t('common.canEditContentOfBoard')}
                </div>
              </Menu.Item>
              <Menu.Item 
                active={data.role === "viewer"}
                onClick={() => handleSelectRoleClick("viewer")}
              >
                <div className={styles.menuItemTitle}>{t('common.viewer')}</div>
                <div className={styles.menuItemDescription}>{t('common.canOnlyViewBoard')}</div>
              </Menu.Item>
            </Menu>
            {data.role === "viewer" && (
              <Segment basic className={styles.settings}>
                <Radio
                  toggle
                  name="canComment"
                  checked={data.canComment}
                  label={t('common.canComment')}
                  onChange={handleSettingChange}
                />
              </Segment>
            )}
            <Button positive content={t(buttonContent)} />
          </Form>
        </Popup.Content>
      </>
    );
  };

export default BoardMembershipPermissionsSelectStep;
