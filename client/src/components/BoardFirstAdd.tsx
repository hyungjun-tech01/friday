import styles from "../scss/Static.module.scss";
import classNames from "classnames";
import {Icon} from "semantic-ui-react";
import {useTranslation} from "react-i18next";
import React from "react";

function BoardFirstAdd(){
    const [t] = useTranslation();
    return(
        <div className={classNames(styles.wrapper, styles.wrapperFlex, styles.wrapperProject)}>
        <div className={styles.message}>
            <Icon inverted name="hand point up outline" size="huge" className={styles.messageIcon} />
            <h1 className={styles.messageTitle}>
            {t('common.openBoard', {
                context: 'title',
            })}
            </h1>
            <div className={styles.messageContent}>
            {t('common.createNewOneOrSelectExistingOne')}
            {/*<Trans i18nKey="common.createNewOneOrSelectExistingOne" />*/}
            </div>
        </div>
        </div>
    );
}
export default BoardFirstAdd;