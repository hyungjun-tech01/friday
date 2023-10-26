import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import initials from 'initials';
import classNames from 'classnames';

import styles from './User.module.scss';

const SIZES = {
  TINY: 'tiny',
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  MASSIVE: 'massive',
};

const COLORS = [
  'emerald',
  'peter-river',
  'wisteria',
  'carrot',
  'alizarin',
  'turquoise',
  'midnight-blue',
];

const getColor = (name:any) => {
  let sum = 0;
  for (let i = 0; i < name.length; i += 1) {
    sum += name.charCodeAt(i);
  }

  return COLORS[sum % COLORS.length];
};
interface IMembershipUser{
  name: string,
  avatarUrl: string,
  size: string,
  isDisabled: boolean,
  onClick: ()=> void,
}
const User = ({ name, avatarUrl, size, isDisabled, onClick }:IMembershipUser) => {
  const contentNode = (
    <span
      title={name}
      className={classNames(
        styles.wrapper,
        styles[`wrapper${upperFirst(size)}`],
        styles.wrapperHoverable,
        !avatarUrl && styles[`background${upperFirst(camelCase(getColor(name)))}`],
      )}
      style={{
        background: avatarUrl && `url("${avatarUrl}") center / cover`,
      }}
    >
      {!avatarUrl && <span className={styles.initials}>{initials(name)}</span>}
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


export default User;
