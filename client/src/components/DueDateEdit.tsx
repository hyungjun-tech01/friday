import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-datepicker';
import { Button, Form, Popup, Input } from 'semantic-ui-react';
import styles from './DueDateEditStep.module.scss';

interface IDueDateEidtProps {
    defaultValue: Date;
    onUpdate: (date: Date | null) => void;
    onBack: () => void;
    onClose: () => void;
}
const DueDateEdit = ({ defaultValue, onUpdate, onBack, onClose }:IDueDateEidtProps) => {
    const [t] = useTranslation();

    const dateField = useRef<any>(null);
    const timeField = useRef<any>(null);
    const [data, setData] = useState(() => {
        const date = defaultValue || new Date().setHours(12, 0, 0, 0);
        
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
    const handleOpen = useCallback(() => {
        setIsOpened(true);
      }, []);

    const handleClose = useCallback(() => {
        setIsOpened(false);
    }, []);

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
            timeField.current.select();
        };
    }, [setData, t]);

    const handleSubmit = useCallback(() => {
        if (!nullableDate) {
          dateField.current.select();
          return;
        }
        const value = new Date(t('format:dateTime', {
            postProcess: 'parseDate',
            value: `${data.date} ${data.time}`,
          }));
      
          if (Number.isNaN(value.getTime())) {
            timeField.current.select();
            return;
          };
      
          if (!defaultValue || value.getTime() !== defaultValue.getTime()) {
            onUpdate(value);
          }
      
        onClose();
    }, []);

    const handleClearClick = useCallback(() => {
        if (defaultValue) {
            onUpdate(null);
        }

        onClose();
    }, [defaultValue, onUpdate, onClose]);

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
    }, []);

    useEffect(() => {
        dateField.current.select();
    }, []);

    return (
        <div>
        <Popup.Header onBack={onBack}>
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
      </div>
    );
}

export default DueDateEdit;