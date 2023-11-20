import { selector } from "recoil";
import { atomMyNotification } from "../atoms/atomNotification";
import Paths from "../constants/Paths";
const BASE_PATH = Paths.BASE_PATH;

export const NotificationRepository = selector({
    key: 'NotificationRepository',
    get: ({getCallback}) => {
        const loadNotifications = getCallback(({set}) => async (userId:string) => {
            try{
                const response = await fetch(`${BASE_PATH}/notification/user/${userId}`);
                const data = await response.json();
                if(data.message){
                    console.log('loadNotification message:', data.message)
                    set(atomMyNotification, []);
                    return;
                }
                console.log('loadNotification : ', data);
                set(atomMyNotification, data);
            }
            catch(err){
                console.error(err);
            };
        });
        const removeNotification = getCallback(({set, snapshot}) => async (notiId:string) => {
            try{
                const response = await fetch(`${BASE_PATH}/notification/read/${notiId}`);
                const data = await response.json();
                if(data.result === 'succeeded') {
                    const notifications = await snapshot.getPromise(atomMyNotification);
                    set(atomMyNotification, notifications.filter((noti) => noti.notiId !== notiId));
                }
            }
            catch(err){
                console.log(err);
            }
        })
        return {
            loadNotifications,
            removeNotification
        }
    }
});