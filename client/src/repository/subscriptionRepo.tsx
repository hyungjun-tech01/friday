import { selector } from "recoil";
import { atomMySubscription } from "../atoms/atomSubscription";
import Paths from "../constants/Paths";
const BASE_PATH = Paths.BASE_PATH;

export const SubscriptionRepository = selector({
    key: 'SubscriptionRepository',
    get: ({getCallback}) => {
        const loadSubscriptions = getCallback(({set}) => async (userId:string) => {
            try{
                const response = await fetch(`${BASE_PATH}/subscribe/user/${userId}`);
                const data = await response.json();
                if(data.message) {
                    set(atomMySubscription, []);
                }
                else {
                    set(atomMySubscription, data);
                }
            }
            catch(err){
                console.error(err);
            };
        });
        const addSubscription = getCallback(({set, snapshot}) => async (cardId:string, userId:string) => {
            try{
                const input_data = {
                    subscription_action: 'ADD',
                    card_id: cardId,
                    user_id: userId,
                    is_permanent: true   // use this value after checking how to use this
                };
                const response = await fetch(`${BASE_PATH}/subscription`, {
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify(input_data)
                });
                const data = await response.json();
                if(data.message) {
                    console.log('addSubscription - fail :', data.message);
                } else {
                    const subscription = await snapshot.getPromise(atomMySubscription);
                    set(atomMySubscription, subscription.concat({card_id: cardId}));
                };
            }
            catch(error){
                console.error(error);
            }
        });
        const removeSubscription = getCallback(({set, snapshot}) => async (cardId:string, userId:string) => {
            try{
                const input_data = {
                    subscription_action: 'DELETE',
                    card_id: cardId,
                    user_id: userId,
                    is_permanent: true   // use this value after checking how to use this
                };
                const response = await fetch(`${BASE_PATH}/subscription`, {
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify(input_data)
                });
                const data = await response.json();
                if(data.message) {
                    console.log('addSubscription - fail :', data.message);
                } else {
                      const subscription = await snapshot.getPromise(atomMySubscription);
                    set(atomMySubscription, subscription.filter((data) => data.card_id !== cardId));
                };
            }
            catch(error){
                console.error(error);
            }
        });
        const isSubscribed = getCallback(({snapshot}) => async(cardId:string) => {
            const subscription = await snapshot.getPromise(atomMySubscription);
            const foundIdx = subscription.findIndex((data) => data.card_id === cardId);
            if(foundIdx >=0) return true;
            else return false;
        });
        return {
            loadSubscriptions,
            addSubscription,
            removeSubscription,
            isSubscribed
        }
    }
});