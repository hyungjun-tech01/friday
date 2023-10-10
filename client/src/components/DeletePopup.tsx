import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Popup } from 'semantic-ui-react';
import CustomPopupHeader from '../lib/ui/CustomPopupHeader';

import styles from '../scss/DeletePopup.module.scss';

interface IDeletePopupProps {
  title: string;
  content: string;
  buttonContent: string;
  onConfirm: () => void;
  onBack?: () => void;
}

const DeletePopup = ({
  title,
  content,
  buttonContent,
  onConfirm,
  onBack,
}: IDeletePopupProps) => {
  // Popup Control Part ---------------------
  const [t] = useTranslation();
  const popupRef = useRef<any>(null);
  const [isOpened, setIsOpened] = useState(true);

  const handleOpen = useCallback(() => {
    setIsOpened(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpened(false);
  }, []);

  const handleMouseDown = useCallback((event: any) => {
    event.stopPropagation();
  }, []);

  const handleClick = useCallback((event: any) => {
    event.stopPropagation();
    onConfirm();
    setIsOpened(false);
  }, [onConfirm]);

  const contentNode = (
    <>
      <CustomPopupHeader onBack={onBack}>
        {t(title, {
          context: 'title',
        })}
      </CustomPopupHeader>
      <Popup.Content>
        <div className={styles.content}>{t(content)}</div>
        <Button fluid negative content={t(buttonContent)} onClick={onConfirm} />
      </Popup.Content>
    </>
  );

  return (
    <Popup
      basic
      wide
      ref={popupRef}
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
        {/* <div ref={handleContentRef}> */}
        <Button
          icon="close"
          onClick={handleClose}
          className={styles.popupCloseButton}
        />
        {contentNode}
      </div>
    </Popup>
  );
};

export default DeletePopup;
