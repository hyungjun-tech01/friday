import {useState} from "react";
import {INewProject} from "../atoms/atomsProject";
import { apiPostProjects } from "../api/project";
import styles from "../scss/ProjectAddModal.module.scss";

// project add modal  props interface 정의 
interface IProjectAddModalProps{
    setShowProjectAddModal: (value:boolean) => void;
}

function ProjectAddModal({setShowProjectAddModal}:IProjectAddModalProps){
   const [data, setData] = useState<INewProject>(
    {
     projectId: ""  ,  // : ''  // cookies.Email,
     projectName : "" , // editMode ? task.title : "",
     userId : "967860418955445249",  // userId atom 에서 가지고 와야 함.
     date: new Date()
   });
   const handleChange = (e : React.ChangeEvent<HTMLInputElement>)=>{
        const {value} = e.target;
        setData(data => ({
            ...data, 
            projectName : value
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
            setShowProjectAddModal(false);
          }
        }catch(err){
          console.error(err);
        }
    };            
   return(
    <div className= {styles.overlay}>
        <div className={styles.modal}>
            <div className={styles.title}> 
                <h3>your new project</h3>
                    <button className={styles.button} onClick={()=>setShowProjectAddModal(false)}>X</button>
            </div>
            <form>
                <input 
                    required 
                    maxLength = {70}
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

export default ProjectAddModal;