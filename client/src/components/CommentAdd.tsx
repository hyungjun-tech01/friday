import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { Button, Form, TextArea } from 'semantic-ui-react';
import styles from '../scss/CommentAdd.module.scss';

// interface ICommentAddProps{
//     onCreate: object;
// };

const CommentAdd = () => {
  const [t] = useTranslation();
  const [isOpened, setIsOpened] = useState(false);
  const [isClosable, setIsClosable] = useState(true);
  const [text, setText] = useState("");
  
  const textField = useRef(null);

  const close = useCallback(() => {
    setIsOpened(false);
  }, []);

  const submit = useCallback(() => {
    if(!text
      && textField.current)
    {
      // textField.current.select();
      return;
    }
    // need to send text to db
  }, [text]);

  const handleFieldFocus = useCallback(() => {
    setIsOpened(true);
  }, []);

  const handleFieldKeyDown = useCallback(
    (event : {ctrlKey : boolean, key: string }) => {
      if (event.ctrlKey && event.key === 'Enter') {
        submit();
      }
    },
    [submit],
  );

  const handleFieldBlur = useCallback(() => {
    if (isClosable) {
      close();
    };
  }, [isClosable, close]);

  const handleFieldChange = useCallback((e:any) => {
    setText(e.target.data);
  }, []);

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);

  const handleControlMouseOver = useCallback(() => {
    setIsClosable(false);
  }, []);

  const handleControlMouseOut = useCallback(() => {
    setIsClosable(true);
  }, []);

  return (
    <Form onSubmit={handleSubmit}>
      <TextArea
        ref={textField}
        as={TextareaAutosize}
        name="text"
        value={text}
        placeholder={t('common.writeComment')}
        minRows={isOpened ? 3 : 1}
        spellCheck={false}
        className={styles.field}
        onFocus={handleFieldFocus}
        onKeyDown={handleFieldKeyDown}
        onChange={handleFieldChange}
        onBlur={handleFieldBlur}
      />
      {isOpened && (
        <div className={styles.controls}>
          <Button
            positive
            content={t('action.addComment')}
            onMouseOver={handleControlMouseOver}
            onMouseOut={handleControlMouseOut}
          />
        </div>
      )}
    </Form>
  );
};

export default CommentAdd;
