import { ReactNode } from 'react';
import { Button, Popup } from 'semantic-ui-react';
import styles from './CustomPopupHeader.module.scss';

interface ICustomPopupProps {
  children: ReactNode;
  onBack?: () => void;
}
const CustomPopupHeader = ({ children, onBack }: ICustomPopupProps) => {
  return (
    <Popup.Header className={styles.wrapper}>
      {onBack && (
        <Button
          icon="angle left"
          onClick={onBack}
          className={styles.backButton}
        />
      )}
      <div className={styles.content}>{children}</div>
    </Popup.Header>
  );
};

export default CustomPopupHeader;
