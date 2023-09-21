import { useCallback, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Popup, Button, Form } from 'semantic-ui-react';
import classNames from 'classnames';
import { upperFirst, camelCase } from 'lodash';
import LabelColors from '../constants/LabelColors';
import styles from '../scss/LabelsPopupChange.module.scss';
import globalStyles from '../styles.module.scss';

type LabelsPopupChangeMode = 'ADD' | 'EDIT';

interface ILabelsPopupChangeProps {
  mode: LabelsPopupChangeMode;
  defaultData?: { id?: string; name?: string; color?: string };
  onCreate?: (data: { name: string | null; color: string }) => void;
  onUpdate?: (data: { id: string; name?: string; color?: string }) => void;
  onDelete?: (id: string) => void;
  onBack: () => void;
}

const LabelsPopupChange = ({
  mode,
  defaultData,
  onCreate,
  onUpdate,
  onDelete,
  onBack,
}: ILabelsPopupChangeProps) => {
  const [t] = useTranslation();
  const nameField = useRef<any>(null);
  const [data, setData] = useState<any>(() => ({
    name: '',
    color: LabelColors[0],
    ...defaultData,
  }));

  const handleChange = useCallback(
    (event: any) => {
      const changedData = {
        ...data,
        [event.target.name]: event.target.value,
      };
      setData(changedData);
    },
    [data]
  );

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim() || null,
    };

    if (mode === 'ADD' && onCreate) {
      onCreate({ name: cleanData.name, color: cleanData.color });
    } else if (mode === 'EDIT' && onUpdate) {
      onUpdate({
        id: cleanData.id,
        name: cleanData.name,
        color: cleanData.color,
      });
    }
    onBack();
  }, [data, mode, onCreate, onUpdate, onBack]);

  const handleDelete = useCallback(()=>{
    if(defaultData && defaultData.id && onDelete) {
      onDelete(defaultData.id);
    };
  }, [defaultData, onDelete])

  const title = mode === 'ADD' ?
    t('common.createLabel', {
      context: 'title',
    }) :
    t('common.editLabel', {
      context: 'title',
    });

  return (
    <>
      <Popup.Header onBack={onBack}>
        {title}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <div className={styles.text}>{t('common.title')}</div>
          <Input
            fluid
            ref={nameField}
            name="name"
            value={data.name}
            className={styles.field}
            onChange={handleChange}
          />
          <div className={styles.text}>{t('common.color')}</div>
          <div className={styles.colorButtons}>
            {LabelColors.map((color: string) => (
              <Button
                key={color}
                type="button"
                name="color"
                value={color}
                className={classNames(
                  styles.colorButton,
                  color === data.color && styles.colorButtonActive,
                  globalStyles[`background${upperFirst(camelCase(color))}`]
                )}
                onClick={handleChange}
              />
            ))}
          </div>
          {mode === 'ADD' ? (
            <Button
              positive
              content={t('action.createLabel')}
              className={styles.submitButton}
            />
          ) : (
            <>
              <Button
                positive
                content={t('action.save')}
                className={styles.submitButton}
              />
              <Button
                positive
                content={t('action.delete')}
                className={styles.submitButton}
                onClick={handleDelete}
              />
            </>
          )}
        </Form>
      </Popup.Content>
    </>
  );
};

export default LabelsPopupChange;
