import {atom, selector} from "recoil";

export interface IUser{
    userId : string;
    userName : string;
    name : string; 
    email : string;
    isAdmin : boolean; 
    password : string; 
    phone : string; 
    organization : string; 
    subscribeToOwnCards : boolean;
    createdAt : string;
    updatedAt : string;
    deletedAt : string;
    language : string;
    passwordChangeAt :string;
    avatar : string;
    detail : string;
}

export interface IValidateUser{
    todo : string;
    email: string;
    password: string;
    password2: string;
    password3: string;
}

// default 로그인 하면 세팅, 로그 아웃 하면 "" 로 세팅 
export const atomMyUser = atom<IUser>({
    key:"myUser",
    default : 
        { userId:"" , userName:"", name:"", email:"", isAdmin:false, password:"", phone:"", 
        organization:"", subscribeToOwnCards:false, createdAt:"", updatedAt:"", deletedAt:"",language:"",
        passwordChangeAt:"", avatar:"", detail:""},
});

