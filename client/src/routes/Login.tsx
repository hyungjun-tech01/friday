import React, {useState} from "react";
import styles from "../scss/Login.module.scss";
import { Form, Grid, Header, Message } from 'semantic-ui-react';
import {useForm} from "react-hook-form";
import {useCookies} from "react-cookie";
import {apiLoginValidate, apiGetUser, apiGetAllUser} from "../api/user";
import { IValidateUser,IUser, atomMyUser, atomAllUser} from "../atoms/atomsUser";
import Path from '../constants/Paths';
import {useHistory} from "react-router-dom";
import { useTranslation } from 'react-i18next';
import {useRecoilState} from "recoil";


const createMessage = (error:IError) => {
  if (!error) {
    return error;
  }
  console.log("createMessage", error.message);
  switch (error.message) {
    case 'Invalid email or password':
      return {
        ...error,        
        type: 'error',
        content: 'common.invalidEmailOrUsername',
      };
    case 'Failed to fetch':
      return {
        ...error,
        type: 'warning',
        content: 'common.noInternetConnection',
      };
    case 'Network request failed':
      return {
        ...error,    
        type: 'warning',
        content: 'common.serverConnectionFailed',
      };
    default:
      return {
        ...error,
        type: 'warning',
        content: 'common.unknownError',
      };
  }
};
interface IError {
  message:string;
  type:string;
  content:string;
}
function Login(){

  const [currentUser, setCurrentUser] = useRecoilState<IUser>(atomMyUser);
  const [allUser, setAllUser] = useRecoilState<IUser[]>(atomAllUser);
  const { t, i18n } = useTranslation();
    const [cookies, setCookie, removeCookie] = useCookies(['UserId', 'UserName','AuthToken']);

    const history = useHistory();
    const initErrorContent:IError =  {message:"", type:"", content:""};

    const [loginError, setLoginError] = useState<IError>(initErrorContent);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const {register, handleSubmit, reset} = useForm<IValidateUser>();
    
    const onMessageDismiss = () => {
      setLoginError(initErrorContent);
      reset();
    }
    const onValid = async (data:any) => {
      setIsSubmitting(true);
      const response = await apiLoginValidate(data);
      
      if(response.message){
        // errorContent = createMessage(response);

        setLoginError(createMessage(response));          
        removeCookie('UserId');
        removeCookie('UserName');
        removeCookie('AuthToken');
      }else{
        setCookie('UserId', response.userId);
        setCookie('UserName', response.userName);
        setCookie('AuthToken', response.token);

        if(response.userId !== ""){
          const userInfo = await apiGetUser(response.userId);
          const alluser = await apiGetAllUser();
          if(userInfo && alluser){
              setCurrentUser(userInfo);
              setAllUser(alluser);
              history.push(Path.ROOT); 
          }
        }
      }
      setIsSubmitting(false);
    }

    return (
        <div className={`${styles.wrapper} ${styles.fullHeight}`}>
          <Grid verticalAlign="middle" className={styles.fullHeightPaddingFix}>
            <Grid.Column widescreen={4} largeScreen={5} computer={6} tablet={16} mobile={16}>
              <Grid verticalAlign="middle" className={styles.fullHeightPaddingFix}>
                <Grid.Column>
                  <div className={styles.loginWrapper}>
                    <Header
                      as="h1"
                      textAlign="center"
                      content={t('common.Login')}
                      color='grey'
                      className={styles.formTitle}
                    />
                    <div>
                      {loginError.message==="" ? "" : (
                        <Message
                        {...{
                          [loginError.type]: true,
                        }}
                          visible
                          content={t(`${loginError.content}`)}
                          onDismiss={onMessageDismiss}
                        />
                      )}
                      <Form size="large" onSubmit={handleSubmit(onValid)}>
                        <div className={styles.inputWrapper}>
                          <div className={styles.inputLabel}>{t('common.EMailOrUserName')}</div>
                          <input type="text"
                             {...register("email")} 
                             placeholder = "enter your e-mail"
                            readOnly={isSubmitting}
                            className={styles.input}
                          />
                        </div>
                        <div className={styles.inputWrapper}>
                          <div className={styles.inputLabel}>{t('common.Password')}</div>
                          <input type="password"
                             {...register("password")} 
                            placeholder = "password"
                            readOnly={isSubmitting}
                            className={styles.input}
                          />
                        </div>
                        <div className={styles.buttonWrapper}>
                          <Form.Button
                            primary
                            size="large"
                            icon="right arrow"
                            labelPosition="right"
                            content={t('action.Login')}
                            floated="right"
                            loading={isSubmitting}
                            disabled={isSubmitting}
                          />
                        </div>
                      </Form>
                    </div>
                  </div>
                </Grid.Column>
              </Grid>
            </Grid.Column>
            <Grid.Column
              widescreen={12}
              largeScreen={11}
              computer={10}
              only="computer"
              className={`${styles.cover} ${styles.fullHeight}`}
            >
              <div className={styles.descriptionWrapperOverlay} />
              <div className={styles.descriptionWrapper}>
                <Header inverted as="h1" content={t('common.productName')} className={styles.descriptionTitle} />
                <Header
                  inverted
                  as="h2"
                  content={t('common.projectManagement')}
                  className={styles.descriptionSubtitle}
                />
              </div>
            </Grid.Column>
          </Grid>
        </div>
      );
}
export default Login;