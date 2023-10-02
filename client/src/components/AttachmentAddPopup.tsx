import { cloneElement, ReactElement, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Menu, Popup } from 'semantic-ui-react';
import CustomPopupHeader from '../lib/ui/CustomPopupHeader';
import FilePicker from '../lib/ui/FilePicker';

import styles from '../scss/AttachmentAddPopup.module.scss';

interface AttachmentAddPopupProps {
  children: ReactElement;
  onCreate: (data: { file: any }) => void;
}

const AttachmentAddPopup = ({ children, onCreate }: AttachmentAddPopupProps) => {
  // Popup Control Part ---------------------
  const [t] = useTranslation();
  const popupRef = useRef<any>(null);
  const [isOpened, setIsOpened] = useState(false);

  const handleOpen = useCallback(() => {
    setIsOpened(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpened(false);
  }, []);

  const handleMouseDown = useCallback((event:any) => {
    event.stopPropagation();
  }, []);

  const handleClick = useCallback((event:any) => {
    event.stopPropagation();
  }, []);

  const handleTriggerClick = useCallback(() => {
    setIsOpened(!isOpened);
  }, [isOpened]);

  const trigger = cloneElement(children as ReactElement<any>, {
    onClick: handleTriggerClick,
  });

  // Attachment Part ---------------------
  const handleFileSelect = useCallback(
    (file: any) => {
      onCreate({
        file,
      });
      handleClose();
    },
    [onCreate, handleClose]
  );

  const contents = (
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

  return (
    <Popup
      basic
      wide
      ref={popupRef}
      trigger={trigger}
      on="click"
      open={isOpened}
      position="bottom left"
      popperModifiers={[
        {
          name: 'preventOverflow',
          enabled: true,
          options: {
            altAxis: true,
            padding: 20,
          },
        },
      ]}
      className={styles.popupWrapper}
      onOpen={handleOpen}
      onClose={handleClose}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <div>
        <Button
          icon="close"
          onClick={handleClose}
          className={styles.popupCloseButton}
        />
        {contents}
      </div>
    </Popup>
  );
};

export default AttachmentAddPopup;
