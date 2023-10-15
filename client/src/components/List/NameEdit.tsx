import React, { useCallback, useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
//import TextareaAutosize from 'react-textarea-autosize';
//import { TextArea } from 'semantic-ui-react';

import styles from './NameEdit.module.scss';

interface INameFieldProps {
    children: React.ReactNode;
    defaultValue: string;
    size : 'Normal'|'Small';
    onUpdate: (name:string) => void;
  };
const NameEdit = forwardRef(({ children, defaultValue, size, onUpdate }:INameFieldProps, ref1) => {
    const [isOpened, setIsOpened] = useState(false);
    //const [value, handleFieldChange, setValue] = useField(defaultValue);
    const [value,  setValue] = useState(defaultValue);

    const field = useRef<HTMLTextAreaElement | null>(null);
  
    const handleChange = useCallback((event:any) => {
        setValue(event.target.value);
    }, [setValue]);

    const open = useCallback(() => {
      setIsOpened(true);
      setValue(defaultValue);
    }, [defaultValue, setValue]);
  
    const close = useCallback(() => {
      setIsOpened(false);
      setValue("");
    }, [setValue]);
  
    const submit = useCallback(() => {
      const cleanValue = value.trim();
  
      if (cleanValue && cleanValue !== defaultValue) {
        onUpdate(cleanValue);
      }
  
      close();
    }, [defaultValue, onUpdate, value, close]);
  
    useImperativeHandle(
      ref1,
      () => ({
        open,
        close,
      }),
      [open, close],
    );
  
    const handleFieldClick = useCallback((event:any) => {
      event.stopPropagation();
    }, []);
  
    const handleFieldKeyDown = useCallback(
      (event:any) => {
        switch (event.key) {
          case 'Enter':
            event.preventDefault();
  
            submit();
  
            break;
          case 'Escape':
            submit();
  
            break;
          default:
        }
      },
      [submit],
    );
  
    const handleFieldBlur = useCallback(() => {
      submit();
    }, [submit]);
  
    useEffect(() => {
      if (isOpened) {
        if(field.current)
            field.current.select();
      }
    }, [isOpened]);

  return (
    <div>
    {isOpened ? 
    <textarea
      ref={field}
      value={value}
      spellCheck={false}
      className={styles.field}
      onClick={handleFieldClick}
      onKeyDown={handleFieldKeyDown}
      onChange={handleChange}
      onBlur={handleFieldBlur}
    />: 
    children
    }
    </div>
  );
});


export default NameEdit;
