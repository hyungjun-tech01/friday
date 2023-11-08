import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Divider, Header, Tab } from 'semantic-ui-react';
import usePopup from '../../../lib/hook/use-popup';

import InformationEdit from './InformationEdit';
import DeleteStep from '../../DeleteStep';

import styles from './GeneralPane.module.scss';

interface IGeneralPane {
  name: string;
  onUpdate: (name:any)=>void;
  onDelete: ()=>void;
}
const GeneralPane = React.memo(({ name, onUpdate, onDelete }:IGeneralPane) => {
  const [t] = useTranslation();
  console.log('General Pane', name);
  const DeletePopup = usePopup(DeleteStep);

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <InformationEdit
        defaultData={{
          name,
        }}
        onUpdate={(name)=>onUpdate(name)}
      />
      <Divider horizontal section>
        <Header as="h4">
          {t('common.dangerZone', {
            context: 'title',
          })}
        </Header>
      </Divider>
      <div className={styles.action}>
        <DeletePopup
          title="common.deleteProject"
          content="common.areYouSureYouWantToDeleteThisProject"
          buttonContent="action.deleteProject"
          onConfirm={onDelete}
        >
          <Button className={styles.actionButton}>
            {t('action.deleteProject', {
              context: 'title',
            })}
          </Button>
        </DeletePopup>
      </div>
    </Tab.Pane>
  );
});



export default GeneralPane;
