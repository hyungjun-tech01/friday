import { useCallback, useState } from 'react';
import classNames from 'classnames';
import { Progress } from 'semantic-ui-react';
import { ITask } from '../../atoms/atomTask';

import styles from './CardTasks.module.scss';

interface ICardTasksProps {
    items: ITask[];
  };

const CardTasks = ({ items }: ICardTasksProps) => {
  const [isOpened, setIsOpened] = useState(false);

  const handleToggleClick = useCallback(
    (event: any) => {
      event.preventDefault();

      setIsOpened((prevState) => !prevState);
    },
    [setIsOpened],
  );

  const completedItems = items.filter((item) => item.isCompleted);

  return (
    <>
      <div className={styles.button} onClick={handleToggleClick}>
        <span className={styles.progressWrapper}>
          <Progress
            autoSuccess
            value={completedItems.length}
            total={items.length}
            color="blue"
            size="tiny"
            className={styles.progress}
          />
        </span>
        <span
          className={classNames(styles.count, isOpened ? styles.countOpened : styles.countClosed)}
        >
          {completedItems.length}/{items.length}
        </span>
      </div>
      {isOpened && (
        <ul className={styles.tasks}>
          {items.map((item) => (
            <li
              key={item.taskId}
              className={classNames(styles.task, item.isCompleted && styles.taskCompleted)}
            >
              {item.taskName}
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default CardTasks;
