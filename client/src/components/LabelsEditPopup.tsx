import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Popup, Input } from 'semantic-ui-react';
import { ILabel } from '../atoms/atomLabel';
import LabelsPopupItem from './LabelsPopupItem';
import LabelsPopupChange from './LabelsPopupChange';
import CustomPopupHeader from '../lib/ui/CustomPopupHeader';
import styles from '../scss/LabelsPopup.module.scss';

type LabelsEditPopupChangeMode = 'ADD' | 'EDIT';

interface ILabelsEditPopupProps {
  items: ILabel[],
  canEdit: boolean,
  currentIds: string[],
  onSelect: (id: string) => void,
  onDeselect: (id: string) => void,
  onCreate: (data: { name: string | null; color: string }) => void,
  onUpdate: (data: { id: string; name?: string; color?: string }) => void,
  // onMove: () => void,
  onDelete: (id: string) => void,
  onBack?: () => void,
}

const LabelsEditPopup = ({
  items,
  canEdit,
  currentIds,
  onSelect,
  onDeselect,
  onCreate,
  onUpdate,
  //onMove,
  onDelete,
  onBack,
}: ILabelsEditPopupProps) => {
  const [t] = useTranslation();

  const [step, setStep] = useState<{
    mode: LabelsEditPopupChangeMode;
    data?: ILabel;
  } | null>(null);

  const handleBack = useCallback(() => {
    setStep(null);
  }, []);

  const handleAddClick = useCallback(() => {
    setStep({ mode: 'ADD' });
  }, []);

  const handleEdit = useCallback((data: ILabel) => {
    setStep({ mode: 'EDIT', data: data });
  }, []);

  // Labels Properties ---------------------
  const [search, setSearch] = useState('');
  const cleanSearch = useMemo(() => search.trim().toLowerCase(), [search]);
  const filteredItems = useMemo(
    () =>
      items.filter(
        (label) =>
          (label.labelName &&
            label.labelName.toLowerCase().includes(cleanSearch)) ||
          label.color.includes(cleanSearch)
      ),
    [items, cleanSearch]
  );

  const searchField = useRef<any>(null);

  const handleSearchChange = useCallback((event: any) => {
    setSearch(event.target.value);
  }, []);

  const handleSelect = useCallback(
    (id: string) => {
      onSelect(id);
    },
    [onSelect]
  );

  const handleDeselect = useCallback(
    (id: string) => {
      onDeselect(id);
    },
    [onDeselect]
  );

  const handleCreate = useCallback(
    (data: { name: string | null; color: string }) => {
      onCreate(data);
    },
    [onCreate]
  );

  const handleUpdate = useCallback(
    (data: { id: string; name?: string; color?: string }) => {
      onUpdate(data);
    },
    [onUpdate]
  );

  const handleDelete = useCallback(
    (id: string) => {
      onDelete(id);
    },
    [onDelete]
  );

  useEffect(() => {
    if (searchField.current) {
      searchField.current.focus({
        preventScroll: true,
      });
    }
  }, []);

  if(step) {
    if (step.mode === 'ADD') {
      return (
        <LabelsPopupChange
          mode={step.mode}
          onCreate={handleCreate}
          onBack={handleBack}
        />
      );
    } else if (step.mode === 'EDIT') {
      return (
        <LabelsPopupChange
          mode={step.mode}
          defaultData={step.data}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onBack={handleBack}
        />
      );
    }
  };

  return (
    <>
      <CustomPopupHeader onBack={onBack}>
        {t('common.labels', {
          context: 'title',
        })}
      </CustomPopupHeader>
      <Popup.Content>
        <Input
          fluid
          ref={searchField}
          value={search}
          placeholder={t('common.searchLabels')}
          icon="search"
          onChange={handleSearchChange}
        />
        {filteredItems.length > 0 && (
          <div className={styles.items}>
            {filteredItems.map((item, index) => (
              <LabelsPopupItem
                key={item.labelId}
                id={item.labelId}
                index={index}
                name={item.labelName}
                color={item.color}
                //isPersisted={item.isPersisted}
                isActive={currentIds.includes(item.labelId)}
                canEdit={canEdit}
                onSelect={() => handleSelect(item.labelId)}
                onDeselect={() => handleDeselect(item.labelId)}
                onEdit={() => handleEdit(item)}
              />
            ))}
          </div>
        )}
        {canEdit && (
          <Button
            fluid
            content={t('action.createNewLabel')}
            className={styles.addButton}
            onClick={handleAddClick}
          />
        )}
      </Popup.Content>
    </>
  );
};

export default LabelsEditPopup;
