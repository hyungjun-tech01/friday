import isUndefined from 'lodash/isUndefined';
import Config from '../constants/Config';


export const getNextPosition = (items:any[], index?:number) => {
  if (isUndefined(index)) {
    const lastItem = items[items.length - 1];

    return (lastItem ? lastItem.position : 0) + Config.POSITION_GAP;
  }

  const prevItem = items[index - 1];
  const nextItem = items[index];

  const prevPosition = prevItem ? prevItem.position : 0;

  if (!nextItem) {
    return prevPosition + Config.POSITION_GAP;
  }

  return (prevPosition + nextItem.position) / 2;
};
