import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import classNames from 'classnames';
//import LabelColors from '../constants/LabelColors';

import styles from '../scss/Label.module.scss';
import globalStyles from '../styles.module.scss';

type SIZES = 'tiny' | 'small' | 'medium';

interface ILabelProps {
  name?: string;
  color: string;
  size?: SIZES;
  isDisabled?: boolean;
  onClick?: () => void;
}

const Label = ({
  name,
  color,
  size = 'medium',
  isDisabled = false,
  onClick,
}: ILabelProps) => {
  const contentNode = (
    <div
      title={name}
      className={classNames(
        styles.wrapper,
        !name && styles.wrapperNameless,
        styles[`wrapper${upperFirst(size)}`],
        onClick && styles.wrapperHoverable,
        globalStyles[`background${upperFirst(camelCase(color))}`]
      )}
    >
      {name || '\u00A0'}
    </div>
  );

  return onClick ? (
    <button
      type="button"
      disabled={isDisabled}
      className={styles.button}
      onClick={onClick}
    >
      {contentNode}
    </button>
  ) : (
    contentNode
  );
};

export default Label;
