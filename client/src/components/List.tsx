import NameEdit from "./NameEdit";
import styles from "../scss/List.module.scss";
import {ICard, cardSelector} from "../atoms/atomCard";
import {useRecoilValue} from "recoil";

interface IListProps{
    id:string;
    index:number;
    name : string;
    isCardLoading : boolean;
}

function List({id, index, name, isCardLoading}:IListProps){
//    const selectCards = useRecoilValue(cardSelector); // 호출 가능한 함수를 가져옴
//    console.log('isCardLoading',isCardLoading);
    let selectedCards:ICard[] = [];
//    if(!isCardLoading) 
//        selectedCards = selectCards(id);
//    console.log(id, selectedCards);
    return(
        <div className={styles.innerWrapper}>
        <div className={styles.outerWrapper}>
            <div className={styles.header}>
                <div className={styles.headerName}>{name}</div>
                {!isCardLoading&&selectedCards.map((card)=>(<h1>card.cardName</h1>))}
            </div>
        </div>
        </div>
    );
}
export default List ; 