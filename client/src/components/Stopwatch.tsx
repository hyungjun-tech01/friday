import upperFirst from 'lodash/upperFirst';
import React, { ElementType, useCallback, useEffect, useRef, useState } from 'react';
import usePrevious from '../lib/hook/use-previous';
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
  const [doUpdate, setDoUpdate] = useState(false);
  const prevStartedAt = usePrevious(startedAt);
  const interval = useRef<any>(null);

  const forceUpdate = useCallback(() => {
    setDoUpdate((prevState) => !prevState);
  }, []);

  const start = useCallback(() => {
    interval.current = setInterval(() => {
      forceUpdate();
    }, 1000);
  }, [forceUpdate]);

  const stop = useCallback(() => {
    clearInterval(interval.current);
  }, []);

  useEffect(() => {
    if (prevStartedAt) {
      if (!startedAt) {
        stop();
      }
    } else if (startedAt) {
      start();
    }
  }, [startedAt, prevStartedAt, start, stop]);

  useEffect(
    () => () => {
      stop();
    },
    [stop]
  );

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
