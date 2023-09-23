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
    email: string;
    password: string;
}

export const defaultUser:IUser = {
    userId:"" , userName:"", name:"", email:"", isAdmin:false, password:"", phone:"", 
        organization:"", subscribeToOwnCards:false, createdAt:"", updatedAt:"", deletedAt:"",language:"",
        passwordChangeAt:"", avatar:"", detail:""
}

// default 로그인 하면 세팅, 로그 아웃 하면 "" 로 세팅 => 쿠키로 대체했는데, 어떤게 좋을지 ??
export const atomMyUser = atom<IUser>({
    key:"myUser",
    default : defaultUser,
});

// all user 조회해서 가지고 있고, user 추가나 회원 가입하면 가지고 있는다. 
export const atomAllUser = atom<IUser[]>({
    key:"allUser",
    default : [defaultUser],
});

export interface IMembership {
    cardMembershipId: string;
    cardId: string;
    userId: string;
    createdAt: string | null;   // delete 'null' later
    updatedAt: string | null;
    email: string;
    userName: string;
    avatarUrl: string | null;
}