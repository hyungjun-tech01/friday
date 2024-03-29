import Paths from "../constants/Paths";
import {IValidateUser, IModifyUser} from "../atoms/atomsUser";

const BASE_PATH = Paths.BASE_PATH;
 
export async function  apiLoginValidate(data:IValidateUser) {
    try{
        const response = await fetch(`${BASE_PATH}/login`,{
            method: "POST", 
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(data)
           }); 
        const responseMessage = await response.json();
           return(responseMessage);
    }catch(err){
        console.error(err);
        return(err);
    }
 }

 export async function  apiGetUser(userId:string) {
    if(userId === "" || userId === undefined) return ;
    try{
        const response = await fetch(`${BASE_PATH}/getuser/`,{
            method: "POST", 
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({"userId":userId})
           }); 
        const responseMessage = await response.json();
           return(responseMessage);
    }catch(err){
        console.error(err);
        return(err);
    }
 }

 export async function  apiGetAllUser() {
    const userId = 1;
    try{
        const response = await fetch(`${BASE_PATH}/getalluser/${userId}`);  // backtik 
        const json = await response.json()
        return json;
    }catch(err){
        console.error(err);
        return(err);
    }
 }

 export async function  apiSingUp(data:IModifyUser) {
    try{
        const response = await fetch(`${BASE_PATH}/signup`,{
            method: "POST", 
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(data)
           }); 
        const responseMessage = await response.json();
           return(responseMessage);
    }catch(err){
        console.error(err);
        return(err);
    }
 }