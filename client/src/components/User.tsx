import styles from "../scss/User.module.scss";
import initials from 'initials';

interface IUserProps{
    userName:string;
    avatarUrl : string;
}
const SIZES = {
    TINY: 'tiny',
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large',
    MASSIVE: 'massive',
  };
  
  const COLORS = [
    'emerald',
    'peter-river',
    'wisteria',
    'carrot',
    'alizarin',
    'turquoise',
    'midnight-blue',
  ];

function User({userName,avatarUrl}:IUserProps){
    const contentNode = (
        <span
          title={userName}
          className={`${styles.wrapper} ${styles.wrapperHoverable} ${styles.wrapperSmall}`}
            
          style={{
            background: `url("${avatarUrl}") center / cover`,
          }}
        >
          {!avatarUrl && <span className={styles.initials}>{initials(userName)}</span>}
        </span>
      );    
    return(
        <div>{contentNode}</div>
    );
}

export default User;