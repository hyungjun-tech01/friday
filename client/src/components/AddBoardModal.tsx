import { useTranslation } from 'react-i18next';
import { Button, Form, Icon } from 'semantic-ui-react';
import Popup from '../lib/custom-ui/Popup'

function AddBoardModal(){
    const [t] = useTranslation();
    return(
        <>
        <Popup.Header>
          {t('common.createBoard', {
            context: 'title',
          })}
        </Popup.Header>
        <Popup.Content>
          <Form onSubmit={handleSubmit}>
            <input
              name="name"
              value={data.name}
              className={styles.field}
              onChange={handleFieldChange}
            />
            <div className={styles.controls}>
              <Button positive content={t('action.createBoard')} className={styles.createButton} />
              <Button type="button" className={styles.importButton} onClick={handleImportClick}>
                <Icon
                  name={data.import ? data.import.type : 'arrow down'}
                  className={styles.importButtonIcon}
                />
                {data.import ? data.import.file.name : t('action.import')}
              </Button>
            </div>
          </Form>
        </Popup.Content>
      </>
    );
}

export default AddBoardModal;