import React, { useCallback } from 'react';
import { Menu } from 'semantic-ui-react';
import User from '../User';
import { IBoardUser } from '../../atoms/atomsBoard';
import classNames from 'classnames';
import styles from './CardMembershipItem.module.scss';

interface ICardMembershipItemProps {
  isActive?: boolean;
  user: IBoardUser;
  onUserSelect: () => void;
  onUserDeselect: () => void;
}
const CardMembershipItem = ({
  isActive,
  user,
  onUserSelect,
  onUserDeselect,
}: ICardMembershipItemProps) => {
  const handleToggleClick = useCallback(() => {
    if (isActive) {
      onUserDeselect();
    } else {
      onUserSelect();
    }
  }, [isActive, onUserSelect, onUserDeselect]);

  return (
    <Menu.Item
      active={isActive}
      //disabled={!isPersisted}
      className={classNames(styles.menuItem, isActive && styles.menuItemActive)}
      onClick={handleToggleClick}
    >
      <span className={styles.user}>
        <User userName={user.userName} avatarUrl={user.avatarUrl} />
      </span>
      <div
        className={classNames(
          styles.menuItemText,
          isActive && styles.menuItemTextActive
        )}
      >
        {user.userName}
      </div>
    </Menu.Item>
  );
};

export default CardMembershipItem;
