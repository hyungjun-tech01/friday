import styles from "../scss/User.module.scss";
import initials from 'initials';
import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import classNames from "classnames";

interface IUserProps{
    userId:string;
    userName:string;
    avatarUrl : string;
    size : string;
    onClick : boolean;
    showAnotherPopup : (value:{userId:string, positionX:number, positionY:number}) => void;
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
function User({userId, userName,avatarUrl, size, onClick, showAnotherPopup}:IUserProps){
    const contentNode = (
        <span
          title={userName}
          className={
            classNames(styles.wrapper,styles.wrapperHoverable, styles[`wrapper${upperFirst(size)}`],
            onClick && styles.wrapperHoverable,!avatarUrl && styles[`background${upperFirst(camelCase(getColor(userName)))}`],)}
          style={{
            background: avatarUrl && `url("${avatarUrl}") center / cover`,
          }} 
        >
          {!avatarUrl && <span className={styles.initials}>{initials(userName)}</span>}
        </span>
      );    
    const isDisabled = false;
    const showPopup  = () => {
      console.log("another popup");
    };
    const onCreate = (event:React.MouseEvent<HTMLButtonElement>)=> {
       showAnotherPopup({userId:userId, positionX:event.pageX, positionY:event.pageY});
    };
    return onClick ? (
      <button type="button" disabled={isDisabled} className={styles.button} onClick={onCreate}>
        {contentNode}
      </button>
    ) : (
      contentNode
    );
}

export default User;