import React, {useState, useMemo} from "react";
import styles from "../scss/Login.module.scss";
import { Form, Grid, Header, Message } from 'semantic-ui-react';
import {useForm} from "react-hook-form";
import {useCookies} from "react-cookie";
import {apiLoginValidate} from "../api/user";
import {IValidateUser} from "../atoms/atomsUser";
import Path from '../constants/Paths';
import {useHistory} from "react-router-dom";
import {useRecoilState} from "recoil";
const createMessage = (error:IError) => {
  if (!error) {
    return error;
  }

  switch (error.message) {
    case 'Invalid email or username':
      return {
        type: 'error',
        content: 'common.invalidEmailOrUsername',
      };
    case 'Invalid password':
      return {
        type: 'error',
        content: 'common.invalidPassword',
      };
    case 'Failed to fetch':
      return {
        type: 'warning',
        content: 'common.noInternetConnection',
      };
    case 'Network request failed':
      return {
        type: 'warning',
        content: 'common.serverConnectionFailed',
      };
    default:
      return {
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
    const [cookies, setCookie, removeCookie] = useCookies(['UserId', 'AuthToken']);
    const [loginError, setLoginError] = useState(null);
    const history = useHistory();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const {register, handleSubmit, formState} = useForm<IValidateUser>();
    
    const onValid = async (data:any) => {
      console.log("handdleSubmtt" ,data);
      const response = await apiLoginValidate(data);
      
      if(response.detail){
        setLoginError(response.detail);
        console.log("error", loginError  );
        removeCookie('UserId');
        removeCookie('AuthToken');
      }else{
        removeCookie('UserId');
        removeCookie('AuthToken');        
        setCookie('UserId', response.email);
        setCookie('AuthToken', response.token);

        console.log(cookies);
        // useQuery
        history.push(Path.ROOT);
      }
    }


    const onMessageDismiss = () => {
      console.log("message dismiss");
    };
    let error:IError = {message:"", type:"", content:""};
    const message = useMemo(() => createMessage(error), [error]);
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
                      content={`Login`}
                      className={styles.formTitle}
                    />
                    <div>
                      {error.message==="" ? "" : (
                        <Message
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          {...{
                            [message.type]: true,
                          }}
                          visible
                          content={message.content}
                          onDismiss={onMessageDismiss}
                        />
                      )}
                      <Form size="large" onSubmit={handleSubmit(onValid)}>
                        <div className={styles.inputWrapper}>
                          <div className={styles.inputLabel}>{`EMail or UserName`}</div>
                          <input type="text"
                             {...register("email")} 
                             placeholder = "enter your e-mail"
                            readOnly={isSubmitting}
                            className={styles.input}
                          />
                        </div>
                        <div className={styles.inputWrapper}>
                          <div className={styles.inputLabel}>{`Password`}</div>
                          <input type="password"
                             {...register("password")} 
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
                            content={`action.logIn`}
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
                <Header inverted as="h1" content="Planka" className={styles.descriptionTitle} />
                <Header
                  inverted
                  as="h2"
                  content={`common.projectManagement`}
                  className={styles.descriptionSubtitle}
                />
              </div>
            </Grid.Column>
          </Grid>
        </div>
      );
}
export default Login;