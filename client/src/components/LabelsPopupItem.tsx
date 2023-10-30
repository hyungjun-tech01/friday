import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import { Button } from 'semantic-ui-react';

import styles from '../scss/LabelsPopupItem.module.scss';
import globalStyles from '../styles.module.scss';

interface ILabelsPopupItemProps {
  id: string;
  index: number;
  name?: string;
  color: string;
  isActive: boolean;
  canEdit: boolean;
  onSelect: () => void;
  onDeselect: () => void;
  onEdit: () => void;
}

const LabelsPopupItem = ({
  id,
  index,
  name,
  color,
  isActive,
  canEdit,
  onSelect,
  onDeselect,
  onEdit,
}: ILabelsPopupItemProps) => {
  const handleToggleClick = useCallback(() => {
    if (isActive) {
      onDeselect();
    } else {
      onSelect();
    }
  }, [isActive, onSelect, onDeselect]);

  return (
    <div className={styles.wrapper}>
      <span
        className={classNames(
          styles.name,
          isActive && styles.nameActive,
          globalStyles[`background${upperFirst(camelCase(color))}`]
        )}
        onClick={handleToggleClick}
      >
        {name}
      </span>
      {canEdit && (
        <Button
          icon="pencil"
          size="small"
          floated="right"
          className={styles.editButton}
          onClick={onEdit}
        />
      )}
    </div>
  );
};

export default LabelsPopupItem;
