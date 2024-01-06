import React, {useState} from "react";
import {IModifyProject} from "../atoms/atomsProject";
import { apiPostProjects } from "../api/project";
import styles from "../scss/ProjectAddModal.module.scss";
import { useCookies } from "react-cookie";
import {useForm} from "react-hook-form";
import { Button, Header, Modal, Input, Form } from 'semantic-ui-react';
import {useTranslation} from "react-i18next";


// project add modal  props interface 정의 
interface IProjectAddModalProps{
    setShowProjectAddModal: (value:boolean) => void;
}

function ProjectAddModal({setShowProjectAddModal}:IProjectAddModalProps){
    const [cookies ] = useCookies(['UserId','UserName', 'AuthToken']);
    const [t] = useTranslation();
    const {register, handleSubmit,formState:{errors}} = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const onValid = async (data:any) =>{
      setIsSubmitting(true);
      const project : IModifyProject= {...data, projectActionType:'ADD', creatorUserId:cookies.UserId};
      try{
        const response:any = await apiPostProjects(project);
      //   console.log("response", response);
        if(response.outProjectId){
          setShowProjectAddModal(false);
  
        }else{
            console.error(response);   
        }
      }catch(err){
        console.error(err);
      }
      setIsSubmitting(false);
    } 
    const onClose = (e : React.MouseEvent<HTMLElement>)=>{
        e.preventDefault();
        setShowProjectAddModal(false);
    }
//     const [data, setData] = useState<INewProject>(
//     {
//      projectId: ""  ,  // : ''  // cookies.Email,
//      projectName : "" , // editMode ? task.title : "",
//      userId : cookies.UserId,  // userId atom 에서 가지고 와야 함.
//      date: new Date()
//    });
  
            
   return(
    <Modal open basic closeIcon size="tiny" onClose={onClose}>
        <Modal.Content>
        <Header inverted size="huge">
          {t('common.createProject', {
            context: 'title',
          })}
        </Header>
        <p>{t('common.enterProjectTitle')}</p>
        <Form onSubmit={handleSubmit(onValid)}>
          <input
          {...register("projectName", {
            required:"project name is required."
            })}
            name="projectName"
            readOnly={isSubmitting}
            style = {{
                marginBottom: '20px',
            }}
           />
          <Button
            inverted
            color="green"
            icon="checkmark"
            content={t('action.createProject')}
            floated="right"
            loading={isSubmitting}
            disabled={isSubmitting}
          />
        </Form>
        </Modal.Content>
    </Modal>
    );
}

export default ProjectAddModal;

/*
 <div className= {styles.overlay}>
        <div className={styles.modal}>
            <div className={styles.title}> 
                <h3>your new project</h3>
                    <button className={styles.button} onClick={()=>setShowProjectAddModal(false)}>X</button>
            </div>
            <Form onSubmit={handleSubmit(onValid)}>
                <input {...register("projectName", {
                    required:"project name is required."
                    })}
                    required 
                    maxLength = {70}
                    placeholder = "Your project goes here"
                    name = "projectName"
                    value = {data.projectName}
                    onChange={handleChange}/>
            <br/>
            <input type="submit" onClick={postData}/>
            </Form>
        </div>
    </div> */