import upperFirst from 'lodash/upperFirst';
import { ElementType, useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { formatStopwatch } from '../utils/stopwatch';

import styles from '../scss/Stopwatch.module.scss';

type StopWatchSize = 'tiny' | 'small' | 'medium';

interface IStopwatchProps {
  as?: ElementType;
  startedAt: Date | null;
  total: number;
  size?: StopWatchSize;
  isDisabled?: boolean;
  onClick?: () => void;
}

const Stopwatch = ({
  as = 'button',
  startedAt = null,
  total,
  size = 'medium',
  isDisabled = false,
  onClick = undefined,
}: IStopwatchProps) => {
  const [prevStartedAt, setPrevStartedAt] = useState<Date | null >(null);
  const [doUpdate, setDoUpdate] = useState(false);

  const interval = useRef<any>(null);

  const forceUpdate = useCallback(() => {
    setDoUpdate(!doUpdate);
  }, [doUpdate]);


  const start = useCallback(() => {
    interval.current = setInterval(() => {
      forceUpdate();
    }, 1000);
  }, [forceUpdate]);

  const stop = useCallback(() => {
    clearInterval(interval.current);
  }, []);

  useEffect(() => {
    console.log("useEffect - 0");
    if (prevStartedAt) {
      console.log("useEffect - 1");
      if (!startedAt) {
        console.log("useEffect - 2");
        stop();
      }
    } else if (startedAt) {
      console.log("useEffect - 3");
      start();
    }
  }, [startedAt, prevStartedAt, start, stop]);

  useEffect(() => () => {
    console.log("useEffect - 4");
    stop();
  }, [stop]);

  const contentNode = (
    <span
      className={classNames(
        styles.wrapper,
        styles[`wrapper${upperFirst(size)}`],
        startedAt && styles.wrapperActive,
        onClick && styles.wrapperHoverable
      )}
    >
      {formatStopwatch({ startedAt, total })}
    </span>
  );

  const ElementType = as;

  return onClick ? (
    <ElementType
      type="button"
      disabled={isDisabled}
      className={styles.button}
      onClick={onClick}
    >
      {contentNode}
    </ElementType>
  ) : (
    contentNode
  );
};

export default Stopwatch;
