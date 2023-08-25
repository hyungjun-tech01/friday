//import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Icon } from 'semantic-ui-react';
import CommentAdd from './CommentAdd';

import styles from '../scss/Activities.module.scss';

interface IActivityProps{
  isDetailsVisible: boolean;
  canEdit: boolean;
};

const Activities = ({
    isDetailsVisible,
    canEdit,
  } : IActivityProps) => {
    const [t] = useTranslation();

    return (
      <div className={styles.contentModule}>
        <div className={styles.moduleWrapper}>
          <Icon name="list ul" className={styles.moduleIcon} />
          <div className={styles.moduleHeader}>
            {t('common.actions')}
            <Button
              content={isDetailsVisible ? t('action.hideDetails') : t('action.showDetails')}
              className={styles.toggleButton}
            />
          </div>
          {canEdit && <CommentAdd />}
          <div className={styles.wrapper}>
          </div>
        </div>
      </div>
    );
  };

export default Activities;
