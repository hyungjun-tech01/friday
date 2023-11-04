import React, {useState} from "react";
import {IModifyProject, defaultModifyProject} from "../atoms/atomsProject";
import { apiPostProjects } from "../api/project";
import {useCookies} from "react-cookie";

function NewProject({setshowNewProject}:any) {
  const [cookies] = useCookies(['UserId', 'UserName','AuthToken']);
    const [data, setData] = useState<IModifyProject>(
        {
          ...defaultModifyProject, creatorUserId:cookies.UserId
        });
    
    const handleChange = (e : React.ChangeEvent<HTMLInputElement>)=>{
      const {value} = e.target;
      setData(data => ({
        ...data, 
        projectName : value,
        projectActionType:"ADD",
      }))
    };    
    const postData = async (e : React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        console.log("postData");
        //console.log(mutation);
        try{
          const response:any = await apiPostProjects(data);
          console.log("response", response.status);
          if(response.status === 200){
            setshowNewProject(false);
          }
        }catch(err){
          console.error(err);
        }
    };    
    return (
        <div className= "overlay">
        <div className="modal">
          <div className="form-title-container"> 
            <h3>your new project</h3>
            <button onClick={()=>setshowNewProject(false)}>X</button>
          </div>
          <form>
          <input 
            required 
            maxLength = {50}
            placeholder = "Your project goes here"
            name = "projectName"
            value = {data.projectName !== null ? data.projectName:""}
            onChange={handleChange}/>
          <br/>
          <input type="submit" onClick={postData}/>
        </form>
        </div>
    </div>
    );
}

export default NewProject;