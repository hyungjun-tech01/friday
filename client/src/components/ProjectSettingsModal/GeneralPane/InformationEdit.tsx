import { dequal } from 'dequal';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form,}  from 'semantic-ui-react';

import { useForm } from 'react-hook-form';

import styles from './InformationEdit.module.scss';

interface IInformation {
  defaultData: any; 
  onUpdate: (name:any)=>void;
}
const InformationEdit = React.memo(({ defaultData, onUpdate }:IInformation) => {
  const [t] = useTranslation();
  const {register, handleSubmit,formState:{errors}} = useForm();
  const onValid = ()=>{
    console.log('Information Edit');
   // onUpdate(data.projectName);
  }
  

  const [data, setData] = useState({ projectName: defaultData.name });

  const handleFieldChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target;
    setData({ projectName: value });
  };
  
  const cleanData = useMemo(
    () => ({
      ...data,
      projectName: data.projectName?.trim(),
    }),
    [data],
  );

  const nameField = useRef(null);

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
        ref={nameField}
        name="projectName"
        value={data.projectName}
        style={{marginBottom: '8px'}}
        className={styles.field}
        onChange={handleFieldChange}
      />
      <Button positive disabled={dequal(cleanData, defaultData)} content={t('action.save')} />
    </Form>
  );
});

export default InformationEdit;
