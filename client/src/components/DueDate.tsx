import upperFirst from 'lodash/upperFirst';
import classNames from 'classnames';
import formatDate from 'date-fns/format';
import { useTranslation } from 'react-i18next';

import styles from '../scss/DueDate.module.scss';

type DueDateSize = 'tiny' | 'small' | 'medium';

const FORMATS = {
  tiny: 'longDate',
  small: 'longDate',
  medium: 'longDateTime',
};

interface IDueDateProps {
  value: Date;
  size?: DueDateSize;
  isDisabled?: boolean;
  onClick?: () => void;
}

const DueDate = ({ value, size="medium", isDisabled=false, onClick=undefined }:IDueDateProps) => {
  const [t] = useTranslation();

  const contentNode = (
    <span
      className={classNames(
        styles.wrapper,
        styles[`wrapper${upperFirst(size)}`],
        onClick && styles.wrapperHoverable,
      )}
    >
      {t(`format:${FORMATS[size]}`, {
        value,
        postProcess: 'formatDate',
      })}
    </span>
  );

  return onClick ? (
    <button type="button" disabled={isDisabled} className={styles.button} onClick={onClick}>
      {contentNode}
    </button>
  ) : (
    contentNode
  );
};

export default DueDate;
