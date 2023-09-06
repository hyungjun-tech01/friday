import { useCallback, useEffect, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { TextArea } from 'semantic-ui-react';

import styles from '../scss/NameField.module.scss';

interface INameFieldProps {
    defaultValue: string;
    onUpdate: (name:string) => void;
  };

const NameField = ({ defaultValue, onUpdate }:INameFieldProps) => {
    const [prevValue, setPrevValue] = useState(defaultValue);
    const [value, setValue] = useState(defaultValue);
    
    const isFocused = useRef(false);

    const handleChange = useCallback((event:any) => {
        setValue(event.target.value);
    }, [setValue]);

    const handleFocus = useCallback(() => {
        isFocused.current = true;
    }, []);

    const handleKeyDown = useCallback((event:any) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.target.blur();
        }
    }, []);

    const handleBlur = useCallback(() => {
        isFocused.current = false;
        const cleanValue = value.trim();

        if (cleanValue) {
            if (cleanValue !== defaultValue) {
                onUpdate(cleanValue);
            }
        } else {
            setValue(defaultValue);
        }
    }, [defaultValue, onUpdate, value, setValue]);

    useEffect(() => {
        if (!isFocused.current && defaultValue !== prevValue) {
            setPrevValue(defaultValue)
            setValue(defaultValue);
        }
    }, [defaultValue, prevValue, setValue]);

    return (
        <TextArea
        as={TextareaAutosize}
        value={value}
        spellCheck={false}
        className={styles.field}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        onBlur={handleBlur}
        />
    );
};

export default NameField;