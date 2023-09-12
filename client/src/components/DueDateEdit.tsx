import { useCallback, useEffect, useMemo, useState, useRef, cloneElement } from 'react';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-datepicker';
import { Button, Form, Popup, Input } from 'semantic-ui-react';
import styles from '../scss/DueDateEditPopup.module.scss';
import { ReactElement } from 'react';

interface IDueDateEidtProps {
    children: ReactElement;
    defaultValue: Date;
    onUpdate: (date: Date | null) => void;
    //onBack: () => void;
    //onClose: () => void;
}
const DueDateEdit = ({ children, defaultValue, onUpdate }:IDueDateEidtProps) => {
    const [t] = useTranslation();

    const dateField = useRef<any>(null);
    const timeField = useRef<any>(null);
    const [data, setData] = useState(() => {
        const date = new Date(defaultValue) || new Date().setHours(12, 0, 0, 0);
        
        return {
            date: t('format:date', {
                postProcess: 'formatDate',
                value: date,
            }),
            time: t('format:time', {
                postProcess: 'formatDate',
                value: date,
            }),
        };
    });

    const [isOpened, setIsOpened] = useState(false);

    const nullableDate = useMemo(() => {
        const date = t('format:date', {
          postProcess: 'parseDate',
          value: data.date,
        });
    
        if (Number.isNaN(new Date(date).getTime())) {
          return null;
        }
    
        return date;
    }, [data.date, t]);
    
    const handleDatePickerChange = useCallback(
        (date : Date) => {
            setData((prevData) => ({
            ...prevData,
            date: t('format:date', {
                postProcess: 'formatDate',
                value: date,
            }),
        }));
        if(timeField.current) {
            timeField.current.focus();
        };
    }, [setData, t]);

    const handleSubmit = useCallback(() => {
        if (!nullableDate) {
            dateField.current.focus();
            return;
        }
        const value = new Date(t('format:dateTime', {
            postProcess: 'parseDate',
            value: `${data.date} ${data.time}`,
        }));
      
        if (Number.isNaN(value.getTime())) {
            timeField.current.focus();
            return;
        };
    
        if (!defaultValue || value.getTime() !== defaultValue.getTime()) {
            onUpdate(value);
        }
      
        setIsOpened(false);
    }, [data]);

    const handleClearClick = useCallback(() => {
        if (defaultValue) {
            onUpdate(null);
        }

        setIsOpened(false);
    }, [defaultValue, onUpdate]);

    const handleFieldChange = useCallback((event:any) =>{
        if(event.target === timeField.current) {
            setData((prevData) => ({
                ...prevData,
                date: t('format:date', {
                    postProcess: 'formatDate',
                    value: event.target.value,
                }),
        }))}
        else if(event.target === dateField.current) {
            setData((prevData) => ({
                ...prevData,
                time: t('format:time', {
                    postProcess: 'formatDate',
                    value: event.target.value,
                }),
        }))};
    }, [t]);

    const handleTriggerClick = useCallback(()=>{
        console.log('handleTriggerClick');
        setIsOpened(true);
    }, []);

    const trigger = cloneElement(children as ReactElement<any>, {
        onClick : handleTriggerClick
    });

    useEffect(() => {
        if(dateField.current){
            dateField.current.focus();
        }
    }, []);

    return (
        <Popup
            on="click"
            open={isOpened}
            trigger={trigger}
            position="bottom left" >
            <Popup.Header>
                {t('common.editDueDate', {
                context: 'title',
                })}
            </Popup.Header>
            <Popup.Content>
                <Form onSubmit={handleSubmit}>
                    <div className={styles.fieldWrapper}>
                        <div className={styles.fieldBox}>
                            <div className={styles.text}>{t('common.date')}</div>
                            <Input ref={dateField} name="date" value={data.date} onChange={handleFieldChange} />
                        </div>
                        <div className={styles.fieldBox}>
                            <div className={styles.text}>{t('common.time')}</div>
                            <Input ref={timeField} name="time" value={data.time} onChange={handleFieldChange} />
                        </div>
                    </div>
                    <DatePicker
                        inline
                        disabledKeyboardNavigation
                        selected={nullableDate}
                        onChange={handleDatePickerChange}
                    />
                    <Button positive content={t('action.save')} />
                </Form>
                <Button
                    negative
                    content={t('action.remove')}
                    className={styles.deleteButton}
                    onClick={handleClearClick}
                />
            </Popup.Content>
        </Popup>
    );
}

export default DueDateEdit;