import React, {useState} from 'react';
import PropTypes from 'prop-types';
import { Tab } from 'semantic-ui-react';

import Membership from '../Membership';

import styles from './ManagersPane.module.scss';

import {IBoardUser} from '../../atoms/atomsBoard';

interface IManagersPane{
  managers: IBoardUser[];
  allUsers: IBoardUser[];
  onCreate: ()=>void;
  onDelete: ()=>void;
};

const ManagersPane = ({ managers, allUsers, onCreate, onDelete }:IManagersPane) => {
  const [isMemberLoading, setIsMemberLoading] = useState(true);  
  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <Membership 
         members={managers} 
         allUsers={allUsers} 
         canEdit={true} 
         boardId={null} 
         isMemberLoading={isMemberLoading} 
         setIsMemberLoading={setIsMemberLoading} 
         projectId={null}/>
    </Tab.Pane>
  );
}



export default ManagersPane;
