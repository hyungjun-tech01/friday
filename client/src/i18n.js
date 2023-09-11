import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import LanguageDetector from 'i18next-browser-languagedetector';
import formatDate from 'date-fns/format';
import parseDate from 'date-fns/parse';
import { embeddedLocales, languages } from './locales'

// 추후에 resource 파일을 분리하는 부분을 진행해야 할듯 .
// const resources = {
//     ko: {
//       translation: {
//         common: {
//             actions: '활동',
//             addComment: '댓글 추가',
//             attachment: '첨부파일',
//             boardmemberadd_title: '멤버 추가',
//             createBoard_title: '보드 명칭을 입력하세요.',
//             createNewOneOrSelectExistingOne:'새 항목을 만들거나 기존 항목을 선택하세요.',
//             createProject: '프로젝트 생성',
//             description: '설명',
//             dueDate: '기한',
//             EMailOrUserName: '이메일 주소',
//             enterCardTitle: '항목카드명을 입력하세요.',
//             enterDescription: '상세 설명을 입력하세요.',
//             enterListTitle: '리스트 명을 입력',
//             enterProjectTitle: '프로젝트 명칭을 입력하세요',
//             enterTaskDescription: '태스크 추가',
//             invalidEmailOrUsername: '이메일주소나 비밀번호가 오류입니다.',
//             labels: '라벨',
//             Login: '로그인',
//             membership: '팀원',
//             openBoard:'보드 열기',
//             Password: '패스워드',
//             productName: '마이플래너',
//             projectManagement: '프로젝트 매니지먼트',
//             searchUsers: '아이디로 검색하세요',
//             stopwatch: 'Stopwatch',
//             tasks: '태스크',
//             taskActions: '태스크 편집',
//             writeComment: '댓글 추가하기',
//         },
//         action:{
//             Login: '로그인',
//             addAnotherCard: '다른 항목카드 추가',
//             addAnotherList: '다른 리스트 추가',
//             addAnotherTask: '다른 태스크 추가',
//             addCard: '항목카드 추가',
//             addComment: '댓글 추가',
//             addList: '리스트 추가',
//             addTask:'태스크 추가',
//             addMoreDetailedDescription: '자세한 설명 추가',
//             createBoard: '보드생성',
//             createProject:'프로젝트 생성',
//             delete: '삭제',
//             deleteButtonContent: '보드에서 제거',
//             deleteTask: '태스크 삭제',
//             edit: '수정',
//             editDescription: '상세설명 편집',
//             editPermissions: '권한 설정',
//             leaveButtonContent: '보드에서 나가기',
//             move: '이동',
//             save: '저장',
//             showDetails: '자세히 보기',
//             subscribe: '구독',
//             unsubscribe: '구독 취소',
//         }
//       }
//     },
// };

i18n.dateFns = {
  locales: {},
  addLocale(language, locale) {
    this.locales[language] = locale;

    registerLocale(language, locale);
  },
  getLocale(language = i18n.resolvedLanguage) {
    return this.locales[language];
  },
  format(date, format, { language, ...options } = {}) {
    return formatDate(date, format, {
      locale: this.getLocale(language),
      ...options,
    });
  },
  parse(dateString, format, backupDate, { language, ...options } = {}) {
    return parseDate(dateString, format, backupDate, {
      locale: this.getLocale(language),
      ...options,
    });
  },
};

const formatDatePostProcessor = {
  type: 'postProcessor',
  name: 'formatDate',
  process(value, _, options) {
    return i18n.dateFns.format(options.value, value);
  },
};

const parseDatePostProcessor = {
  type: 'postProcessor',
  name: 'parseDate',
  process(value, _, options) {
    return i18n.dateFns.parse(options.value, value, new Date());
  },
};

i18n
  .use(LanguageDetector)
  .use(formatDatePostProcessor)
  .use(parseDatePostProcessor)
  .use(initReactI18next)
  .init({
    //resources,
    // lng:'ko',
    resources: embeddedLocales,
    fallbackLng: 'ko',
    supportedLngs: languages,
    load: 'languageOnly',
    interpolation: {
      escapeValue: false,
      format(value, format, language) {
        if (value instanceof Date) {
          return i18n.dateFns.format(value, format, {
            language,
          });
        }

        return value;
      },
    },
    react: {
      useSuspense: true,
    },
    debug: process.env.NODE_ENV !== 'production',
});

i18n.loadCoreLocale = async (language = i18n.resolvedLanguage) => {
  if (language === 'en') {
    return;
  }

  const { default: locale } = await import(`./locales/${language}/core`);

  Object.keys(locale).forEach((namespace) => {
    if (namespace === 'dateFns') {
      i18n.dateFns.addLocale(language, locale[namespace]);
    } else {
      i18n.addResourceBundle(language, namespace, locale[namespace], true, true);
    }
  });
};

i18n.detectLanguage = () => {
  const {
    services: { languageDetector, languageUtils },
  } = i18n;

  localStorage.removeItem(languageDetector.options.lookupLocalStorage);

  const detectedLanguages = languageDetector.detect();

  i18n.language = languageUtils.getBestMatchFromCodes(detectedLanguages);
  i18n.languages = languageUtils.toResolveHierarchy(i18n.language);

  i18n.resolvedLanguage = undefined;
  i18n.setResolvedLanguage(i18n.language);
  console.log("Detected Language : ", i18n.resolvedLanguage);
};

export default i18n;