import NameEdit from "./NameEdit";
import styles from "../scss/List.module.scss";

interface IListProps{
    key:string;
    id:string;
    index:number;
    name : string;
}

function List({key, id, index, name}:IListProps){
    return(
        <div className={styles.innerWrapper}>
        <div className={styles.outerWrapper}>
            <div className={styles.header}>
                <div className={styles.headerName}>{name}</div>
            </div>
        </div>
        </div>
    );
}
export default List ; 