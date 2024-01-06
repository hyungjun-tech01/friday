import { dequal } from 'dequal';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form,}  from 'semantic-ui-react';
import {useRecoilValue} from 'recoil';
import {atomMyUser, IUser} from "../../../atoms/atomsUser";

import { useForm } from 'react-hook-form';

import styles from './InformationEdit.module.scss';

interface IInformation {
  defaultData: any; 
  canEdit : boolean;
  onUpdate: (name:any)=>void;
}
const InformationEdit = React.memo(({ defaultData,canEdit, onUpdate }:IInformation) => {
  const [t] = useTranslation();
  const {register, handleSubmit,formState:{errors}} = useForm();
  const currentUser = useRecoilValue<IUser>(atomMyUser);

  const onValid = (data:any)=>{
   onUpdate(data);
  }
  

  const [projectName, setProjectName] = useState(defaultData.name );

  const handleFieldChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    if(canEdit === true){
    const {value} = e.target;
    setProjectName(value);
    }
  };
  
  // const cleanData = useMemo(
  //   () => ({
  //     ...projectName,
  //     projectName: projectName.projectName?.trim(),
  //   }),
  //   [projectName],
  // );

  // const nameField = useRef(null);
  // value={data.projectName}
  // disabled={dequal(cleanData, defaultData)}
  //         onChange={handleFieldChange}


  // const handleSubmit1 = useCallback(() => {
  //   if (!cleanData.name) {
  //     nameField.current.select();
  //     return;
  //   }

  //   onUpdate(cleanData);
  // }, [onUpdate, cleanData]);

  return (
    <Form onSubmit={handleSubmit(onValid)}>
      <div className={styles.text}>{t('common.title')}</div>
      <input
        {...register("projectName", {
          required:"project name is required."
        })}
        name="projectName"
        type="text"
        value={projectName}
        style={{marginBottom: '8px'}}
        className={styles.field}
        onChange={handleFieldChange}
      />
      <Button positive  content={t('action.save')} />
    </Form>
  );
});

export default InformationEdit;
