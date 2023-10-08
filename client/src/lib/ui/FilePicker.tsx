import { cloneElement, ReactElement, useCallback, useRef } from 'react';

import styles from './FilePicker.module.css';

interface FilePickerProps {
  children: ReactElement;
  accept?: string;
  onSelect: (file: any) => void;
}

const FilePicker = ({ children, accept, onSelect }: FilePickerProps) => {
  const field = useRef<any>(null);

  const handleTriggerClick = useCallback(() => {
    field.current.click();
  }, []);

  const handleFieldChange = useCallback(
    //  ({ target }) => {
    //     if (target.files[0]) {
    //       onSelect(target.files[0]);

    //       target.value = null; // eslint-disable-line no-param-reassign
    //     }
    //   },
    //   [onSelect],
    // );
    ({ target }: any) => {
      console.log('FilePicker / handleFieldchange / target : ', target );
      if (target.files[0]) {
        console.log('FilePicker / handleFieldchange / target : ', target.files[0] );
        onSelect(target.files[0]);

        target.value = null; // eslint-disable-line no-param-reassign
      }
    },
    [onSelect]
  );

  const trigger = cloneElement(children, {
    onClick: handleTriggerClick,
  });

  return (
    <>
      {trigger}
      <input
        ref={field}
        type="file"
        accept={accept}
        className={styles.field}
        onChange={handleFieldChange}
      />
    </>
  );
};

export default FilePicker;
