import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Form, TextArea } from 'semantic-ui-react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import TextareaAutosize from 'react-textarea-autosize';
import styles from '../scss/NameEdit.module.scss'
import { IEditElement, atomCurrentEditElment } from '../atoms/atomEditState';

interface INameEditProps{
    children: React.ReactNode
    defaultValue : string;
    parentId: string;
    onUpdate : (data:string) => void;
}

const NameEdit = ({children, defaultValue, parentId, onUpdate}:INameEditProps) => {
    const [t] = useTranslation();
    const field = useRef<TextArea>(null);
    const [isOpened, setIsOpened] = useState(false);
    const [value, setValue] = useState("");
    const atomState = useRecoilValue<IEditElement>(atomCurrentEditElment);

    const open = useCallback(() => {
        setIsOpened(true);
        setValue(defaultValue);
    }, [defaultValue, setValue]);
    
    const close = useCallback(() => {
        setIsOpened(false);
        setValue("");
    }, [setValue]);

    const changeState = useCallback(() => {
        if(atomState.id === parentId
            && atomState.name === "NameEdit"
            && atomState.properties) {
            if(atomState.properties.open) {
                open();
            } else {
                close();
            }
        }
    }, [atomState, open, close]);

    const submit = useCallback(() => {
        const cleanValue = value.trim();
    
        if (cleanValue && cleanValue !== defaultValue) {
            onUpdate(cleanValue);
        }
        close();
    }, [defaultValue, onUpdate, value, close]);

    const handleFieldKeyDown = useCallback((event:any) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            submit();
        }
    }, [submit]);
    
    const handleFieldBlur = useCallback(() => {
        submit();
    }, [submit]);
    
    const handleSubmit = useCallback(() => {
        submit();
    }, [submit]);

    const handleFieldChange = useCallback((event:any) => {
        setValue(event.target.value);
    }, [])

    useEffect(() => {
        if (isOpened && field.current) {
          field.current.focus();
        }
    }, [isOpened]);

    changeState();

    return (
        <div>
            {isOpened ? (
                <Form onSubmit={handleSubmit} className={styles.wrapper}>
                    <TextArea
                        ref={field}
                        as={TextareaAutosize}
                        value={value}
                        minRows={2}
                        spellCheck={false}
                        className={styles.field}
                        onKeyDown={handleFieldKeyDown}
                        onChange={handleFieldChange}
                        onBlur={handleFieldBlur}
                    />
                    <div className={styles.controls}>
                        <Button positive content={t('action.save')} />
                    </div>
                </Form>
                ): children
            }
        </div>
    );
};

export default NameEdit;