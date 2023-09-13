export interface IStopwatch {
  total: number;
  startedAt: Date | null;
}

export const defaultStopwatch: IStopwatch = {
  total: 0,
  startedAt: null,
};
