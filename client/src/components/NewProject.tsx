import {useState} from "react";
import {INewProject} from "../atoms/atoms";
import { apiPostProjects } from "../api/project";

function NewProject({setshowNewProject}:any) {
    const [data, setData] = useState<INewProject>(
        {
          projectId: ""  ,  // : ''  // cookies.Email,
          projectName : "" , // editMode ? task.title : "",
          userId : "967860418955445249",
          date: new Date()
        });
    
    const handleChange = (e : React.ChangeEvent<HTMLInputElement>)=>{
      const {value} = e.target;
      setData(data => ({
        ...data, 
        projectName : value
      }))
    };    
    const postData = (e : React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        console.log("postData");
        //console.log(mutation);
        try{
          const response = apiPostProjects(data);
          console.log(response);
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
            value = {data.projectName}
            onChange={handleChange}/>
          <br/>
          <input type="submit" onClick={postData}/>
        </form>
        </div>
    </div>
    );
}

export default NewProject;