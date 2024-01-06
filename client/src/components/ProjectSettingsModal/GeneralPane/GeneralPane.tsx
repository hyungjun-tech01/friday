import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Divider, Header, Tab } from 'semantic-ui-react';
import usePopup from '../../../lib/hook/use-popup';
import {useRecoilValue} from 'recoil';
import {atomMyUser, IUser} from "../../../atoms/atomsUser";

import InformationEdit from './InformationEdit';
import DeleteStep from '../../DeleteStep';
//import DeletePopup from '../../DeletePopup';
import styles from './GeneralPane.module.scss';

interface IGeneralPane {
  projectId : string;
  name: string;
  isAdmin:boolean;
  role : string;
  onUpdate: (name:any)=>void;
  onDelete: ()=>void;
}
const GeneralPane = React.memo(({ projectId, name, isAdmin, role, onUpdate, onDelete }:IGeneralPane) => {
  const [t] = useTranslation();
  const currentUser = useRecoilValue<IUser>(atomMyUser);
  const DeletePopup = usePopup(DeleteStep);
  const projectEdit = isAdmin || role === 'manager' ? true:false;
//<Button className={styles.actionButton}>
///{t('action.deleteProject', {
//  context: 'title',
//})}
//</Button>
//        </DeletePopup>
  const onBack = ()=>{};
  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <InformationEdit
        defaultData={{
          name,
        }}
        canEdit = {projectEdit}
        onUpdate={(name)=>onUpdate(name)}
      />  
      <Divider horizontal section>
        <Header as="h4">
          {t('common.dangerZone', {
            context: 'title',
          })}
        </Header>
      </Divider>
      {currentUser.isAdmin && <div className={styles.action}>
        <DeletePopup
          projectId = {projectId}
          title={t("common.deleteProject")} 
          content={t("common.areYouSureYouWantToDeleteThisProject")}
          buttonContent={t("action.deleteProject")}
          onConfirm={onDelete}
        >
        <Button className={styles.actionButton}>
        {t('action.deleteProject', {
        context: 'title',
        })}
        </Button>
        </DeletePopup>        
      </div>}
    </Tab.Pane>
  );
});



export default GeneralPane;
