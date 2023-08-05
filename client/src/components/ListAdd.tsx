import styles from "../scss/ListAdd.module.scss";
import {useForm} from "react-hook-form";
import {useTranslation} from "react-i18next";
import { Button, Form } from 'semantic-ui-react';
import {useCookies} from "react-cookie";
import {ICreateList} from "../atoms/atomsList";
import {apiCreateList} from "../api/list";

interface IListAddProp{
    boardId : string;
    setShowList : (value:boolean) => void;

}
function ListAdd({setShowList, boardId}:IListAddProp){
    const {register, handleSubmit,formState:{errors}} = useForm();
    const [t] = useTranslation();
    const [cookies] = useCookies(['UserId', 'UserName','AuthToken']);

    const onValid = async(data:any) => {
        const list : ICreateList= {...data, boardId:boardId, userId:cookies.UserId};
        console.log('create board', data);
        const response = await apiCreateList(list);
        if(response.message){
            setShowList(true);
        }else{
            setShowList(false);
        }
    }
    return(
        <Form className={styles.wrapper} onSubmit={handleSubmit(onValid)}>
        <input 
          {...register("listName", {
            required:"list name is required."
          }) }
           name="listName"
          placeholder={t('common.enterListTitle')}
          className={styles.field}
        />
        <div className={styles.controls}>
          {/* eslint-disable-next-line jsx-a11y/mouse-events-have-key-events */}
          <Button
            positive
            content={t('action.addList')}
            className={styles.button}
          />
        </div>
      </Form>
    );
}
export default ListAdd;