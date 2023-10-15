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
  const [t] = useTranslation();

  return (
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
};

export default DeletePopup;
