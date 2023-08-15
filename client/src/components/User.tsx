import styles from "../scss/User.module.scss";
import initials from 'initials';
import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';

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

  const getColor = (name:any) => {
    let sum = 0;
    for (let i = 0; i < name.length; i += 1) {
      sum += name.charCodeAt(i);
    }
  
    return COLORS[sum % COLORS.length];
  };
function User({userName,avatarUrl}:IUserProps){
    const contentNode = (
        <span
          title={userName}
          className={`${styles.wrapper} ${styles.wrapperHoverable} ${styles.wrapperLarge} ${styles[`background${upperFirst(camelCase(getColor(userName)))}`]}` }
          style={{
            background: avatarUrl && `url("${avatarUrl}") center / cover`,
          }} 
        >
          {!avatarUrl && <span className={styles.initials}>{initials(userName)}</span>}
        </span>
      );    
    return(
        contentNode
    );
}

export default User;