import {atom, selector} from "recoil";

export interface IUser{
    userId : string;
    userName : string;
    name : string; 
    email : string;
    isAdmin : boolean; 
    password : string; 
    phone : string; 
    organizaition : string; 
    subscribeToOwnCards : boolean;
    createdAt : string;
    updatedAt : string;
    deletedAt : string;
    language : string;
    passwordChangeAt :string;
    avatar : string;
}

// default 로그인 하면 세팅, 로그 아웃 하면 "" 로 세팅 
export const atomMyUser = atom<IUser>({
    key:"myUser",
    default : 
        { userId:"967860418955445249" , userName:"Demo", name:"", email:"", isAdmin:false, password:"", phone:"", 
        organizaition:"", subscribeToOwnCards:false, createdAt:"", updatedAt:"", deletedAt:"",language:"",
        passwordChangeAt:"", avatar:""},
});

