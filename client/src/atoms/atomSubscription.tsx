import React from 'react';
import { atom } from 'recoil';

interface isSubscribed {
    card_id: string,
}

export const atomMySubscription = atom<isSubscribed[]>({
    key: 'mySubscription',
    default: []
});