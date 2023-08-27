import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form } from 'semantic-ui-react';
import SimpleMDE from 'react-simplemde-editor';
import styles from '../scss/DescriptionEdit.module.scss';

interface IDescriptionEditProps{
  children: any;
  defaultValue: string;
  onUpdate: (data:string) => void;
};

const DescriptionEdit = ({ children, defaultValue, onUpdate }:IDescriptionEditProps) => {
  const [t] = useTranslation();
  const [isOpened, setIsOpened] = useState(false);
  const [value, setValue] = useState("");

  const open = useCallback(() => {
    setIsOpened(true);
    setValue(defaultValue || '');
  }, [defaultValue, setValue]);

  const close = useCallback(() => {
    const cleanValue = value.trim() || "";

    if (cleanValue && (cleanValue !== defaultValue)) {
      onUpdate(cleanValue);
    }

    setIsOpened(false);
    setValue("");
  }, [defaultValue, onUpdate, value, setValue]);

  // useImperativeHandle(
  //   ref,
  //   () => ({
  //     open,
  //     close,
  //   }),
  //   [open, close],
  // );

  const handleChildrenClick = useCallback(() => {
    const gotSelection = getSelection();
    if (!gotSelection
        || !gotSelection.toString()) {
      open();
    }
  }, [open]);

  const handleFieldKeyDown = useCallback(
    (event:any) => {
      if (event.ctrlKey && event.key === 'Enter') {
        close();
      }
    }, [close]);

  const handleSubmit = useCallback(() => {
    close();
  }, [close]);

  // const mdEditorOptions = useMemo(
  //   () => ({
  //     autofocus: true,
  //     spellChecker: false,
  //     status: false,
  //     toolbar: [
  //       'bold',
  //       'italic',
  //       'heading',
  //       'strikethrough',
  //       '|',
  //       'quote',
  //       'unordered-list',
  //       'ordered-list',
  //       'table',
  //       '|',
  //       'link',
  //       'image',
  //       '|',
  //       'undo',
  //       'redo',
  //       '|',
  //       'guide',
  //     ],
  //   }),
  //   [],
  // );

  if (!isOpened) {
    return React.cloneElement(children, {
      onClick: handleChildrenClick,
    });
  }

  return (
    <Form onSubmit={handleSubmit}>
      <SimpleMDE
        value={value}
        // options={mdEditorOptions}
        placeholder={t('common.enterDescription')}
        className={styles.field}
        onKeyDown={handleFieldKeyDown}
        onChange={setValue}
      />
      <div className={styles.controls}>
        <Button positive content={t('action.save')} />
      </div>
    </Form>
  );
};

export default DescriptionEdit;
