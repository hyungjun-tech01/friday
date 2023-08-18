import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 추후에 resource 파일을 분리하는 부분을 진행해야 할듯 .
const resources = {
    ko: {
      translation: {
        common: {
            productName:'마이플래너',
            EMailOrUserName:'이메일 주소',
            Password:'패스워드',
            Login:'로그인',
            projectManagement:'프로젝트 매니지먼트',
            createBoard_title:'보드 명칭을 입력하세요',
            invalidEmailOrUsername:'이메일주소나 비밀번호가 오류입니다',
            enterListTitle : '리스트 명을 입력',
            enterCardTitle : '항목카드명을 입력하세요..',
            boardmemberadd_title : '멤버 추가',
            searchUsers : '아이디로 검색하세요',
        },
        action:{
            Login:'로그인',
            createBoard:'보드생성',
            addAnotherList :'다른 리스트 추가',
            addList : '리스트 추가',
            addAnotherCard: '다른 항목카드 추가',
            addCard: '항목카드 추가',
        }
      }
    },
  };

i18n.use(initReactI18next).init({
  resources,
  lng:'ko',
  interpolation: {
    escapeValue: false
  }
});

export default i18n;