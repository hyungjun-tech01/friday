import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { Button, Form, TextArea } from 'semantic-ui-react';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import styles from '../scss/NameEdit.module.scss';

interface INameEditProps {
  children: React.ReactNode;
  defaultValue: string;
  type?: string;
  onUpdate: (data: string) => void;
}

const NameEdit = forwardRef(
  ({ children, defaultValue, type, onUpdate }: INameEditProps, ref) => {
    const [t] = useTranslation();
    const field = useRef<TextArea>(null);
    const [isOpened, setIsOpened] = useState(false);
    const [value, setValue] = useState('');

    const open = useCallback(() => {
      setIsOpened(true);
      setValue(defaultValue);
    }, [defaultValue, setValue]);

    const close = useCallback(() => {
      setIsOpened(false);
      setValue('');
    }, [setValue]);

    const submit = useCallback(() => {
      const cleanValue = value.trim();

      if (cleanValue && cleanValue !== defaultValue) {
        onUpdate(cleanValue);
      }
      close();
    }, [defaultValue, onUpdate, value, close]);

    const handleFieldKeyDown = useCallback(
      (event: any) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          submit();
        }
      },
      [submit]
    );

    const handleFieldBlur = useCallback(() => {
      submit();
    }, [submit]);

    const handleSubmit = useCallback(() => {
      submit();
    }, [submit]);

    const handleFieldChange = useCallback((event: any) => {
      setValue(event.target.value);
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        open,
        close,
      }),
      [open, close]
    );

    useEffect(() => {
      if (isOpened && field.current) {
        field.current.focus();
      }
    }, [isOpened]);

    if (!isOpened) {
      return (<>{children}</>);
    }

    return (
      <Form
        onSubmit={handleSubmit}
        className={type === 'task' ? styles.taskWrapper : styles.fieldWrapper}
      >
        <TextArea
          ref={field}
          as={TextareaAutosize}
          value={value}
          minRows={2}
          maxRows={type === 'task' ? 8 : null}
          spellCheck={false}
          className={type === 'task' ? styles.taskField : styles.field}
          onKeyDown={handleFieldKeyDown}
          onChange={handleFieldChange}
          onBlur={handleFieldBlur}
        />
        <div className={type === 'task' ? '' : styles.controls}>
          <Button
            positive
            content={t('action.save')}
            className={type === 'task' ? styles.submitButton : ''}
          />
        </div>
      </Form>
    );
  }
);

export default NameEdit;
