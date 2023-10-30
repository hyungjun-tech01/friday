import React, { ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, Popup } from 'semantic-ui-react';
import CustomPopupHeader from '../../lib/ui/CustomPopupHeader';
import FilePicker from '../../lib/ui/FilePicker';

import styles from './AttachmentAddPopup.module.scss';

interface AttachmentAddPopupProps {
  children: ReactNode;
  onCreate: (data: { file: any }) => void;
  onClose: () => void;
}

const AttachmentAddPopup = ({ children, onCreate, onClose }: AttachmentAddPopupProps) => {
  const [t] = useTranslation();
  const handleFileSelect = useCallback(
    (file: any) => {
      onCreate({
        file,
      });
      onClose();
    },
    [onCreate, onClose]
  );

  return (
    <>
      <CustomPopupHeader>
        {t('common.addAttachment', {
          context: 'title',
        })}
      </CustomPopupHeader>
      <Popup.Content>
        <Menu secondary vertical className={styles.menu}>
          <FilePicker onSelect={handleFileSelect}>
            <Menu.Item className={styles.menuItem}>
              {t('common.fromComputer', {
                context: 'title',
              })}
            </Menu.Item>
          </FilePicker>
        </Menu>
        <hr className={styles.divider} />
        <div className={styles.tip}>
          {t('common.pressPasteShortcutToAddAttachmentFromClipboard')}
        </div>
      </Popup.Content>
    </>
  );
};

export default AttachmentAddPopup;
