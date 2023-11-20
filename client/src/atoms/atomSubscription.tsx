import React from 'react';
import { atom } from 'recoil';

export const atomMySubscription = atom<string[]>({
    key: 'mySubscription',
    default: []
});