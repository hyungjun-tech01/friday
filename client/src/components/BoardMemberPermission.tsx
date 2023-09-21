
import React, {useState, useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import { Button , Popup as SemanticUIPopup, Menu, Radio, Segment } from 'semantic-ui-react';

import styles from '../scss//BoardMemberPermission.module.scss';
import BoardRole from "../constants/BoardRole";

interface IBoardMemberPermission{
    addBoardId : string;
    title : string;
    content : string;
    buttonContent : string;
    addMember : {userId:string, userName:string, userEmail:string, avatarUrl:string, canEdit:string, positionX:number, positionY:number};
    onConfirm : ()=>void;
    onBack : () => void;
}
const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.currentTarget.style.background = '#9e3f08';
    e.currentTarget.style.color = 'white';
  };

const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.currentTarget.style.background = '#db570a';
    e.currentTarget.style.color = 'white';
  };

function BoardMemberPermission({addBoardId, addMember, title, content, buttonContent, onConfirm, onBack}:IBoardMemberPermission){
    const [t] = useTranslation();
    const [data, setData] = useState(() => ({
        role: BoardRole.EDITOR,
        canComment: true
      }));
    const handleSelectRoleClick = (role:any)=>{
        setData({role:role, canComment:true})
    }
    const handleSettingChange = () => {
      setData({...data, canComment:!data.canComment})
    }
    return(   
    <div className={styles.overlay} > 
      <div className={styles.modal} >
        <SemanticUIPopup.Header className={styles.wrapper}>
            {onBack && <Button icon="angle left" onClick={onBack} className={styles.backButton} />}
            <div className={styles.popupcontent}>{title}</div>
        </SemanticUIPopup.Header>
        <SemanticUIPopup.Content className={styles.wrapper}>
        <div className={styles.content}>
            <Menu secondary vertical className={styles.menu}>
              <Menu.Item
                active={data.role === BoardRole.EDITOR}
                onClick={() => handleSelectRoleClick(BoardRole.EDITOR)}>
                <div className={styles.menuItemTitle}>{t('common.editor')}</div>
                <div className={styles.menuItemDescription}>{t('common.canEditContentOfBoard')}</div>
              </Menu.Item>
              <Menu.Item
                active={data.role === BoardRole.VIEWER}
                onClick={() => handleSelectRoleClick(BoardRole.VIEWER)}>
                  <div className={styles.menuItemTitle}>{t('common.viewer')}</div>
                <div className={styles.menuItemDescription}>{t('common.canOnlyViewBoard')}</div>
              </Menu.Item>
            </Menu>
        {  data.role === BoardRole.VIEWER && (
          <Segment basic className={styles.settings}>
            <Radio
              toggle
              name="canComment"
              checked={data.canComment}
              label={t('common.canComment')}
              onChange={handleSettingChange}
            />
          </Segment>
        ) }
        <Button fluid positive 
                style = {{
                  background : '#21d983',
                  color: 'white',
                  fontWeight: 'bold',
                  marginTop: '8px',
                  padding: '6px 11px',
                  textAlign: 'center',
                  transition: 'none',
                }} 
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}                      
                content={buttonContent} onClick={onConfirm} />
          </div>
          </SemanticUIPopup.Content>
        </div>  
      </div>
    );
}
export default BoardMemberPermission;