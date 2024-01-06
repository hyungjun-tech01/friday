import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { useTranslation } from "react-i18next";
import DatePicker from "react-datepicker";
import { Button, Form, Popup, Input } from "semantic-ui-react";
import styles from "../scss/DueDateEditPopup.module.scss";
import CustomPopupHeader from "../lib/ui/CustomPopupHeader";

interface IDueDateEidtProps {
  defaultValue: Date | null,
  onUpdate: (date: Date | null) => void,
  onClose?: () => void,
  onBack?: () => void,
}

const DueDateEditPopup = ({
  defaultValue,
  onUpdate,
  onClose,
  onBack,
}: IDueDateEidtProps) => {
  const [t] = useTranslation();
  const dateField = useRef<any>(null);
  const timeField = useRef<any>(null);

  const [data, setData] = useState(() => {
    const date = defaultValue ? new Date(defaultValue) : new Date().setHours(12, 0, 0, 0);

    return {
      date: t("format:date", {
        postProcess: "formatDate",
        value: date,
      }),
      time: t("format:time", {
        postProcess: "formatDate",
        value: date,
      }),
    };
  });

  const nullableDate = useMemo(() => {
    const date = t("format:date", {
      postProcess: "parseDate",
      value: data.date,
    });

    if (Number.isNaN(new Date(date).getTime())) {
      return null;
    }

    return date;
  }, [data.date, t]);

  const handleClearClick = useCallback(() => {
    if (defaultValue) {
      onUpdate(null);
    }

    if(onClose) onClose();
    else if(onBack) onBack();
  }, [defaultValue, onUpdate, onClose, onBack]);

  const handleDatePickerChange = useCallback(
    (date: Date) => {
      setData((prevData) => ({
        ...prevData,
        date: t("format:date", {
          postProcess: "formatDate",
          value: date,
        }),
      }));
      if (timeField.current) {
        timeField.current.select();
      }
    },
    [setData, t]
  );

  const handleSubmit = useCallback(() => {
    if (!nullableDate) {
      dateField.current.select();
      return;
    }
    const value = new Date(
      t("format:dateTime", {
        postProcess: "parseDate",
        value: `${data.date} ${data.time}`,
      })
    );

    if (Number.isNaN(value.getTime())) {
      timeField.current.select();
      return;
    }

    if (!defaultValue || value.getTime() !== defaultValue.getTime()) {
      onUpdate(value);
    }

    if(onClose) onClose();
    else if(onBack) onBack();
  }, [data.date, data.time, defaultValue, nullableDate, onUpdate, t, onClose, onBack]);

  const handleFieldChange = useCallback(
    (event: any) => {
      setData((prevData) => ({
        ...prevData,
        [event.target.name]: event.target.value,
      }));
    },
    []
  );

  useEffect(() => {
    if (dateField.current) {
      dateField.current.select();
    }
  }, []);

  return (
    <>
      <CustomPopupHeader onBack={onBack}>
        {t("common.editDueDate", {
          context: "title",
        })}
      </CustomPopupHeader>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <div className={styles.fieldWrapper}>
            <div className={styles.fieldBox}>
              <div className={styles.text}>{t("common.date")}</div>
              <Input
                ref={dateField}
                name="date"
                value={data.date}
                onChange={handleFieldChange}
              />
            </div>
            <div className={styles.fieldBox}>
              <div className={styles.text}>{t("common.time")}</div>
              <Input
                ref={timeField}
                name="time"
                value={data.time}
                onChange={handleFieldChange}
              />
            </div>
          </div>
          <DatePicker
            inline
            disabledKeyboardNavigation
            selected={nullableDate}
            onChange={handleDatePickerChange}
            className={'react-datepicker'}
          />
          <Button positive content={t("action.save")} />
        </Form>
        <Button
          negative
          content={t("action.remove")}
          className={styles.deleteButton}
          onClick={handleClearClick}
        />
      </Popup.Content>
    </>
  );
};

export default DueDateEditPopup;
