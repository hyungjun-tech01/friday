import dateFns from 'date-fns/locale/ko';

const core = {
  dateFns,

  format: {
    date: 'yyyy/M/d',
    time: 'HH:mm',
    dateTime: '$t(format:date) $t(format:time)',
    longDate: 'MM월dd일',
    longDateTime: "MM'월'dd'일 ' HH:mm",
  },

  translation: {
    common: {
      actions: '활동',
      addAttachment: '첨부파일 추가',
      addComment: '댓글 추가',
      allChangesWillBeAutomaticallySavedAfterConnectionRestored:
        '다시 연결이 되면 모든 변경 사항이<br />자동적으로 저장됩니다.',
      areYouSureYouWantToDeleteThisAttachment: '이 첨부파일을 삭제할까요?',
      areYouSureYouWantToDeleteThisCard: '이 카드를 삭제할까요?',
      areYouSureYouWantToDeleteThisComment: '이 댓글을 삭제할까요?',
      areYouSureYouWantToDeleteThisLabel: '이 라벨을 삭제할까요?',
      areYouSureYouWantToDeleteThisList: '이 리스트를 삭제할까요?',
      areYouSureYouWantToDeleteThisProject: '이 프로젝트를 삭제할까요?',
      areYouSureYouWantToDeleteThisTask: '이 업무를 삭제할까요?',
      areYouSureYouWantToDeleteThisUser: '이 사용자를 삭제할까요?',
      areYouSureYouWantToLeaveBoard: '이 보드를 떠나시겠습니까?',
      areYouSureYouWantToLeaveProject: '이 프로젝트를 떠나시겠습니까?',
      areYouSureYouWantToRemoveThisManagerFromProject:
        '프로젝트에서 이 매니저를 제거할까요??',
      areYouSureYouWantToRemoveThisMemberFromBoard:
        '보드에서 이 구성원을 제가할까요?',
      attachment: '첨부파일',
      attachments: '첨부파일',
      boardmemberadd_title: '멤버 추가',
      canComment :'코맨트 가능',
      canOnlyViewBoard : '보드 및 하위 컨텐츠를 볼 수 있습니다.',
      cardActions : 'Card 변경',
      createBoard_title: '보드 명칭을 입력하세요.',
      createLabel: '새 라벨 만들기',
      createNewOneOrSelectExistingOne:'새 항목을 만들거나 기존 항목을 선택하세요.',
      createProject: '프로젝트 생성',
      color: '색상',
      date: '날짜',
      deleteAttachment_title: '첨부파일 삭제',
      deleteTask: '업무 삭제',
      description: '설명',
      dueDate: '완료일',
      editAttachment_title: '첨부파일 편집',
      editDueDate: '완료일 변경',
      editLabel: '라벨 변경',
      editor : '편집자',
      editStopwatch: '타이머 변경',
      EMailOrUserName: '이메일 주소',
      enterCardTitle: '항목카드명을 입력하세요.',
      enterDescription: '상세 설명을 입력하세요.',
      enterListTitle: '리스트 명을 입력',
      enterProjectTitle: '프로젝트 명칭을 입력하세요',
      enterTaskDescription: '업무 목록 추가',
      fromComputer: '이 PC로부터',
      hours: '시',
      invalidEmailOrUsername: '이메일주소나 비밀번호가 오류입니다.',
      labels: '라벨',
      leaveBoardTitle:'보드탈퇴',
      leaveBoardContent : '보드에서 나가겠습니까?', 
      listAction:'리스트 편집',
      Login: '로그인',
      members: '팀원',
      minutes: '분',
      openBoard:'보드 열기',
      Password: '패스워드',
      pressPasteShortcutToAddAttachmentFromClipboard: 'Ctrl+v로 클립보드로부터 첨부파일을 추가합니다.',
      productName: '마이플래너',
      project: '프로젝트',
      projectManagement: '프로젝트 매니지먼트',
      searchLabels: '라벨을 검색합니다.',
      searchMembers: '회원을 검색합니다.',
      searchUsers: '아이디로 검색하세요',
      seconds: '초',
      stopwatch: '활동 시간',
      tasks: '업무 목록',
      taskActions: '업무 편집',
      thereIsNoPreviewAvailableForThisAttachment:
        '이 첨부파일에 대한 유효한 미리보기가 없습니다.',
      time: '시간',
      title: '제목',
      selectPermission : '권한 선택',
      viewer : '뷰어',
      writeComment: '댓글 추가하기',
    },
    action:{
      Login: '로그인',
      addAnotherCard: '다른 항목카드 추가',
      addAnotherList: '다른 리스트 추가',
      addAnotherTask: '다른 업무 추가',
      addCard: 'Card 항목 추가',
      addComment: '댓글 추가',
      addList: '리스트 추가',
      addTask:'업무 추가',
      addMoreDetailedDescription: '자세한 설명 추가',
      createBoard: '보드생성',
      createLabel: '라벨생성',
      createNewLabel: '새 라벨 생성',
      createProject:'프로젝트 생성',
      delete: '삭제',
      deleteAttachment: '첨부파일 삭제',
      deleteButtonContent: '보드에서 제거',
      deleteCard: 'Card 삭제',
      deleteTask: '업무 삭제',
      edit: '수정',
      editDescription: '상세설명 편집',
      editDueDate: '기한 편집',
      editPermissions: '권한 설정',
      editStopwatch: '타이머 편집',
      editTitle: '제목 편집',
      leaveButtonContent: '보드에서 나가기',
      listNameEdit: '리스트 이름 편집',
      listDelete :'리스트 삭제',
      move: '이동',
      moveCard: 'Card 이동',
      pause: '일시정지',
      remove: '삭제',
      save: '저장',
      showAllAttachments: '모든 첨부파일 보기 ({{hidden}} 숨기기)',
      showDetails: '자세히 보기',
      start: '시작',
      stop: '중지',
      subscribe: '구독',
      unsubscribe: '구독 취소',
      leaveBoardButton: '보드에서 나가기',
      addMember : '멤버 추가',
    }
  },
};

export default core;