import {useState} from "react";
import {INewProject} from "../atoms/atoms";
import { useMutation } from "react-query";
import { apiPostProjects } from "../api/project";

function NewProject({setshowNewProject}:any) {
    const [data, setData] = useState<INewProject>(
        {
          projectId: ""  ,  // : ''  // cookies.Email,
          projectName : "" , // editMode ? task.title : "",
          userId : "971031260635857921",
          date: new Date()
        });
    
    const handleChange = (e : React.ChangeEvent<HTMLInputElement>)=>{
      const {value} = e.target;
      setData(data => ({
        ...data, 
        projectName : value
      }))
    };    
    const PostData = (e : React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        console.log("postData");
        useMutation("NewProject",
            async params => {apiPostProjects(data)} ,
            {
                onError: () => {
                    console.log("error");
                },
                onSuccess: () => {
                    console.log("success");
                },
            }
        );
        //console.log(mutation);
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
            value = {data.projectName}
            onChange={handleChange}/>
          <br/>
          <input type="submit" onClick={PostData}/>
        </form>
        </div>
    </div>
    );
}

export default NewProject;