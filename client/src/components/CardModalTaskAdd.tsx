import { cloneElement, forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { Button, Form, TextArea } from 'semantic-ui-react';

import styles from '../scss/CardModalTaskAdd.module.scss';

interface ICardModalTaskAddProps {
    children: any;
    onCreate: (data:string) => void;
}

const CardModalTaskAdd = forwardRef(({ children, onCreate }:ICardModalTaskAddProps, ref) => {
  const [t] = useTranslation();
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const [data, setData] = useState<string>('');

  const nameField = useRef<any>(null);
  const isClosable = useRef<boolean | null>(null);

  const open = useCallback(() => {
    setIsOpened(true);
  }, []);

  const close = useCallback(() => {
    setIsOpened(false);
  }, []);

  const submit = useCallback(() => {
    const cleanData = data.trim();

    if (!cleanData && nameField.current) {
      nameField.current.focus();
      return;
    }
    console.log("TaskAdd / submit - cleanData : ", cleanData);
    onCreate(cleanData);
    setData('');
    nameField.current.focus();
  }, [onCreate, data, setData]);

  useImperativeHandle(
    ref,
    () => ({
      open,
      close,
    }),
    [open, close],
  );

  const handleChildrenClick = useCallback(() => {
    open();
  }, [open]);

  const handleFieldKeyDown = useCallback(
    (event:any) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        submit();
      }
    }, [submit]);

  const handleFieldBlur = useCallback(
    () => {
      if (isClosable.current) {
        close();
      }
    }, [close]);

  const handleFieldChange = useCallback((event:any) => {
    const newData = event.target.value;
    setData(newData);
  }, []);

  const handleControlMouseOver = useCallback(() => {
    isClosable.current = false;
  }, []);

  const handleControlMouseOut = useCallback(() => {
    isClosable.current = true;
  }, []);

  const handleSubmit = useCallback(() => {
    console.log("handleSubmit");
    submit();
  }, [submit]);

  useEffect(() => {
    if (isOpened) {
      nameField.current.focus();
      isClosable.current = true;

    } else {
      isClosable.current = null;
    }
  }, [isOpened]);

  if (!isOpened) {
    return cloneElement(children, {
      onClick: handleChildrenClick,
    });
  }

  return (
    <Form className={styles.wrapper} onSubmit={handleSubmit}>
      <TextArea
        ref={nameField}
        as={TextareaAutosize}
        name="name"
        value={data}
        placeholder={t('common.enterTaskDescription')}
        minRows={2}
        spellCheck={false}
        className={styles.field}
        onKeyDown={handleFieldKeyDown}
        onChange={handleFieldChange}
        onBlur={handleFieldBlur}
      />
      <div className={styles.controls}>
        {/* eslint-disable-next-line jsx-a11y/mouse-events-have-key-events */}
        <Button
          positive
          content={t('action.addTask')}
          type='submit'
          onMouseOver={handleControlMouseOver}
          onMouseOut={handleControlMouseOut}
        />
      </div>
    </Form>
  );
});

export default CardModalTaskAdd;