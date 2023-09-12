import merge from 'lodash/merge';

import login from './login';
import core from './core';

const en = {
  language: 'en',
  country: 'gb',
  name: 'English',
  embeddedLocale: merge(login, core),
};

export default en;
