import { dequal } from "dequal";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  ReactElement,
  cloneElement,
} from "react";
import { useTranslation } from "react-i18next";
import { Button, Form, Popup, Input } from "semantic-ui-react";
import {
  createStopwatch,
  getStopwatchParts,
  startStopwatch,
  stopStopwatch,
  updateStopwatch,
} from "../utils/stopwatch";

import styles from "../scss/StopwatchEdit.module.scss";
import { IStopwatch } from "../atoms/atomStopwatch";

const createData = (stopwatch: IStopwatch | null) => {
  if (!stopwatch) {
    return {
      hours: "0",
      minutes: "0",
      seconds: "0",
    };
  }
  const { hours, minutes, seconds } = getStopwatchParts(stopwatch);

  return {
    hours: `${hours}`,
    minutes: `${minutes}`,
    seconds: `${seconds}`,
  };
};

interface IStopwatchEditProps {
  children: ReactElement;
  defaultValue: IStopwatch | null;
  onUpdate: (data: IStopwatch | null) => void;
}

const StopwatchEdit = ({
  children,
  defaultValue,
  onUpdate,
}: IStopwatchEditProps) => {
  // Popup Control Part ---------------------
  const [t] = useTranslation();
  const popupRef = useRef<any>(null);
  const [isOpened, setIsOpened] = useState(false);

  // const handleOpen = useCallback(() => {
  //   setIsOpened(true);
  // }, []);

  const handleClose = useCallback(() => {
    setIsOpened(false);
  }, []);

  const handleMouseDown = useCallback((event:any) => {
    event.stopPropagation();
  }, []);

  const handleClick = useCallback((event:any) => {
    event.stopPropagation();
  }, []);

  const handleTriggerClick = useCallback(() => {
    setIsOpened(!isOpened);
  }, [isOpened]);

  const trigger = cloneElement(children as ReactElement<any>, {
    onClick: handleTriggerClick,
  });

  // Stopwatch Properties ---------------------
  const [data, setData] = useState(() => createData(defaultValue));
  const [isEditing, setIsEditing] = useState(false);

  const hoursField = useRef<any>(null);
  const minutesField = useRef<any>(null);
  const secondsField = useRef<any>(null);

  const handleStartClick = useCallback(() => {
    onUpdate(startStopwatch(defaultValue));
    setIsOpened(false);
  }, [defaultValue, onUpdate]);

  const handleStopClick = useCallback(() => {
    onUpdate(stopStopwatch(defaultValue));
  }, [defaultValue, onUpdate]);

  const handleClearClick = useCallback(() => {
    if (defaultValue) {
      onUpdate(null);
    }
    setIsOpened(false);
  }, [defaultValue, onUpdate]);

  const handleToggleEditingClick = useCallback(() => {
    setData(createData(defaultValue));
    setIsEditing(!isEditing);
  }, [defaultValue, setData, isEditing]);

  const handleFieldChange = useCallback((event: any) => {
    setData((prevData) => ({
      ...prevData,
      [event.target.name]: event.target.value,
    }));
  }, []);

  const handleOpenPopup = useCallback(() => {
    setData(createData(defaultValue));
    setIsOpened(true);
  }, [defaultValue]);

  const handleSubmit = useCallback(() => {
    const parts = {
      hours: parseInt(data.hours, 10),
      minutes: parseInt(data.minutes, 10),
      seconds: parseInt(data.seconds, 10),
    };

    if (hoursField.current && Number.isNaN(parts.hours)) {
      hoursField.current.select();
      return;
    }

    if (Number.isNaN(parts.minutes) || parts.minutes > 60) {
      minutesField.current.select();
      return;
    }

    if (Number.isNaN(parts.seconds) || parts.seconds > 60) {
      secondsField.current.select();
      return;
    }

    if (defaultValue) {
      if (!dequal(parts, getStopwatchParts(defaultValue))) {
        onUpdate(updateStopwatch(defaultValue, parts));
      }
    } else {
      onUpdate(createStopwatch(parts));
    }
    setIsOpened(false);
  }, [defaultValue, onUpdate, data]);

  useEffect(() => {
    if (isEditing) {
      hoursField.current.select();
    }
  }, [isEditing]);

  const contents = (
    <>
      <Popup.Header className={styles.popupHeader}>
        {t("common.editStopwatch", {
          context: "title",
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <div className={styles.fieldWrapper}>
            <div className={styles.fieldBox}>
              <div className={styles.text}>{t("common.hours")}</div>
              <Input
                ref={hoursField}
                name="hours"
                value={data.hours}
                //mask="9999"
                //maskChar={null}
                disabled={!isEditing}
                onChange={handleFieldChange}
              />
            </div>
            <div className={styles.fieldBox}>
              <div className={styles.text}>{t("common.minutes")}</div>
              <Input
                ref={minutesField}
                name="minutes"
                value={data.minutes}
                //mask="99"
                //maskChar={null}
                disabled={!isEditing}
                onChange={handleFieldChange}
              />
            </div>
            <div className={styles.fieldBox}>
              <div className={styles.text}>{t("common.seconds")}</div>
              <Input
                ref={secondsField}
                name="seconds"
                value={data.seconds}
                //mask="99"
                //maskChar={null}
                disabled={!isEditing}
                onChange={handleFieldChange}
              />
            </div>
            <Button
              type="button"
              icon={isEditing ? "close" : "edit"}
              className={styles.iconButton}
              onClick={handleToggleEditingClick}
            />
          </div>
          {isEditing && <Button positive content={t("action.save")} />}
        </Form>
        {!isEditing &&
          (defaultValue && defaultValue.startedAt ? (
            <Button
              positive
              content={t("action.stop")}
              icon="pause"
              onClick={handleStopClick}
            />
          ) : (
            <Button
              positive
              content={t("action.start")}
              icon="play"
              onClick={handleStartClick}
            />
          ))}
        <Button
          negative
          content={t("action.remove")}
          className={styles.deleteButton}
          onClick={handleClearClick}
        />
      </Popup.Content>
    </>
  );

  return (
    <Popup
      basic
      // wide
      ref={popupRef}
      trigger={trigger}
      on="click"
      open={isOpened}
      position="bottom left"
      popperModifiers={[
        {
          name: "preventOverflow",
          enabled: true,
          options: {
            altAxis: true,
            padding: 20,
          },
        },
      ]}
      className={styles.popupWrapper}
      onOpen={handleOpenPopup}
      onClose={handleClose}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <div>
        {/* <div ref={handleContentRef}> */}
        <Button
          icon="close"
          onClick={handleClose}
          className={styles.popupCloseButton}
        />
        {contents}
      </div>
    </Popup>
  );
};

export default StopwatchEdit;
