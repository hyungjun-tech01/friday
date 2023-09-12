import merge from 'lodash/merge';
import core from './core';
import login from './login';

const ko = {
  language: 'ko',
  country: 'kr',
  name: '한국어',
  embeddedLocale: merge(core, login),
}

export default ko;
