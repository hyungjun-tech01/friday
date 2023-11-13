import React, {useState, useEffect} from 'react';

import { Tab } from 'semantic-ui-react';


import Membership from '../Membership';

import styles from './ManagersPane.module.scss';

import {IBoardUser} from '../../atoms/atomsBoard';

interface IManagersPane{
  projectId:string;
  isAdmin:boolean;
  role:string;
  managers: IBoardUser[];
  allUsers: IBoardUser[];
  onCreate: ()=>void;
  onDelete: ()=>void;
};

const ManagersPane = ({ projectId, isAdmin, role, managers, allUsers, onCreate, onDelete }:IManagersPane) => {
  const [isMemberLoading, setIsMemberLoading] = useState(true); 
  const projectEdit = isAdmin || role === 'manager' ? true:false;
  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <Membership 
         members={managers} 
         allUsers={allUsers} 
         canEdit={projectEdit} 
         boardId={null} 
         isMemberLoading={isMemberLoading} 
         setIsMemberLoading={setIsMemberLoading} 
         projectId={projectId}/>
    </Tab.Pane>
  );
}



export default ManagersPane;
