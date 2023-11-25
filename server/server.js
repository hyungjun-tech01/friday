const express = require('express');
const app = express();
const pool = require('./db');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// multer 미들웨어 사용
const multer = require('multer');
const fsUpper = require('fs');
const path = require('path');




//const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises; // fs.promises를 사용하여 비동기 파일 작업을 수행합니다.
const util = require('util');

const fsSync = require('fs');


try {
    fsUpper.readdirSync('uploads');
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
  fsUpper.mkdirSync('uploads');
}

const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

const PORT =  process.env.MYPORT ? process.env.MYPORT:8000;
const MYHOST  = process.env.MYHOST ? "http://"+process.env.MYHOST+":"+PORT:"http://localhost"+":"+PORT;

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded( {extended : false } ));
app.use('/uploads', express.static('uploads'));

// util.promisify를 사용하여 fs.writeFile을 프로미스로 변환합니다.
const writeFileAsync = util.promisify(fs.writeFile);
// promisify를 사용하여 fs.unlink를 비동기 함수로 변환
// const unlinkAsync = util.promisify(fs.unlink);
const unlinkSync = fs.unlink;

// 동적요청에 대한 응답을 보낼때 etag 를 생성하지 않도록
app.set('etag', false);

// 정적요청에 대한 응답을 보낼때 etag 생성을 하지 않도록
const options = { etag : false };

app.post('/upload', upload.single('file'),async (req, res) => {
    const cardId = req.body.cardId;
    const file_ext = req.body.fileExt;
    const fileData = req.file.buffer; // 이미지 데이터가 여기에 들어온다고 가정합니다.
    const fileName = req.body.fileName;

    // /카드 id 폴더가 없으면 생성 
    try {
        fsUpper.readdirSync(`uploads/${cardId}`);
    } catch (error) {
        console.error('uploads/cardid  폴더가 없어 cardid 폴더를 생성합니다.');
        fsUpper.mkdirSync(`uploads/${cardId}`);
    }

    // 이미지를 저장할 경로 및 파일 이름
    const filePath = `uploads/${cardId}/${fileName}`;
    try {
    // 이미지 데이터를 바이너리로 변환하여 파일에 저장 (동기) -> 앞에 await를 붙히면 프로세스가 안 끝남.
        writeFileAsync(filePath, fileData, 'binary');
        console.log('파일 저장 성공:', filePath); 
        res.json({fileName:fileName, filePath:filePath});
    } catch (err) {
        console.error(err);
        res.status(500).send('파일 업로드 중 오류가 발생했습니다.');
    }finally{
        res.end();
        console.log('final:', filePath); 
    }
});

app.post('/deleteFile', async (req, res) => {
    const {cardId, fileExt, fileName} = req.body;
    // 이미지를 삭제할 경로 및 파일 이름
    const filePath = `uploads/${cardId}/${fileName}`;
    try {
        // 파일이 존재하는지 확인
         const fileStats = await fs.stat(filePath);
        //const fileStats = await fs.promises.stat(filePath); 
    
        // 파일이 존재할 때만 삭제 수행
        if (fileStats.isFile()) {
            //  unlinkAsync(filePath);   // sync 밖에 안됨. 왜 안되는지 모르겠음 await넣으면 진행 안됨.
            fsUpper.unlinkSync(filePath);
            console.log('파일 삭제 성공:', filePath); 
            res.json({fileName:fileName, filePath:filePath});
        }else{
            console.error(err);
            console.log('파일 미존재 삭제 성공:', filePath); 
            res.json({fileName:fileName, filePath:filePath});
        }
    } catch (err) {
        console.error(err);
        console.log('파일 미존재 삭제 성공:', filePath); 
        res.json({fileName:fileName, filePath:filePath});
      //  res.status(500).send('파일 삭제 중 오류가 발생했습니다.');
    }finally{
        res.end();
        console.log('final:', filePath); 
    }
});

// home  test
app.get('/', (req, res)=>{
    res.send("Service is started");
});

// get all projects by user 
app.get('/projects/:userId', async(req, res)=>{
    const userId = req.params.userId;
    try{
            const userIsAdminCheck = await pool.query(`
            select is_admin as "isAdmin" 
            from user_account 
            where id =$1`, [userId]);

            let projectResult;
            if(userIsAdminCheck.rows[0].isAdmin === true) {
                projectResult = await pool.query(`
                select p.id as "projectId", true as "isAdmin", p.name as "projectName",
                'manager' as "role",
                (select id from board b
                    where b.project_id = p.id
                    order by position 
                    limit 1) as "defaultBoardId"
                from project p`, []);
            }else{
                projectResult = await pool.query(`
                select p.id as "projectId", false as "isAdmin", p.name as "projectName",
                pm.role as "role",
                (select id from board b
                    where b.project_id = p.id
                    order by position 
                    limit 1) as "defaultBoardId"
                from project p, project_manager pm
                where p.id = pm.project_id 
                and pm.user_id = $1`, [userId]);
            }
            if( projectResult.rows.length > 0 ) {
                const projects = projectResult.rows;
                for(const project of projects){
                    const members = await pool.query(`
                        select 
                            t.user_id as "userId", 
                            t1.name as "userName",
                            t1.avatar as "avatarUrl",
                            t1.email as "userEmail",
                            t.role as "role"
                        from project_manager t, user_account t1
                        where t.user_id = t1.id
                        and t.project_id = $1`, [project.projectId]);
                    if( members.rows.length > 0 ) {
                        project.members = members.rows;
                    }else{
                        project.members = [];
                    }
                    const userPools = await pool.query(`
                    select 
                        t1.id as "userId", 
                        t1.name as "userName",
                        t1.avatar as "avatarUrl",
                        t1.email as "userEmail",
                        (select 'Manager' from project_manager t where t.user_id = t1.id and t.project_id = $1) as "role",
                        (select true from project_manager t where t.user_id = t1.id and t.project_id = $1) as "canEdit"
                    from user_account t1`, [project.projectId]);
                    if( userPools.rows.length > 0 ) {
                        project.userPools = userPools.rows;
                    }else{
                        project.userPools = [];
                    }
                }

                res.json(projects);
                res.end();
            }

    }catch(err){
        console.log(err);
        res.json({message:err});        
        res.end();
    }
    }
);

// sigle projects by projectId
app.get('/project/:projectId', async(req, res)=>{
    const projectId = req.params.projectId;
    console.log('getproject', projectId);
    try{
            const project = await pool.query(`
            select p.id as "projectId", p.name as "projectName"
            from project p
            where p.id = $1`, [projectId]);


            let currentProject;
            if(project.rows.length > 0 ) {
                currentProject = project.rows[0];
            }    
            const members = await pool.query(`
                        select 
                            t.user_id as "userId", 
                            t1.name as "userName",
                            t1.avatar as "avatarUrl",
                            t1.email as "userEmail",
                            t.role as "role"
                        from project_manager t, user_account t1
                        where t.user_id = t1.id
                        and t.project_id = $1`, [projectId]);
                    if( members.rows.length > 0 ) {
                        currentProject.members = members.rows;
                    }else{
                        currentProject.members = [];
                    }         
                    const userPools = await pool.query(`
                    select 
                        t1.id as "userId", 
                        t1.name as "userName",
                        t1.avatar as "avatarUrl",
                        t1.email as "userEmail",
                        (select role from project_manager t where t.user_id = t1.id and t.project_id = $1) as "role",
                        (select true from project_manager t where t.user_id = t1.id and t.project_id = $1) as "canEdit"
                    from user_account t1`, [projectId]);
                    if( userPools.rows.length > 0 ) {
                        currentProject.userPools = userPools.rows;
                    }else{
                        currentProject.userPools = [];
                    }                    
            res.json(currentProject);
            res.end();
    }catch(err){
        console.log(err);
        res.json({message:err});        
        res.end();
    }
    }
);

// get all boards by project id , by user id 
app.post('/boards', async(req, res)=>{
    const {projectId, userId} = req.body;
   // console.log(projectId);
    try{
            const boards = await pool.query(`
            select b.id as "boardId", b.name as "boardName", 
            b.position as "position",
			b.project_id as "projectId", p.name as "projectName", 
            b.created_at as "createdAt",
			bm.user_id as "userId", bm.role as "role",
			bm.can_comment as "canComment"
            from board b, board_membership bm, project p
            where b.id = bm.board_id 
            and b.project_id = p.id
            and bm.user_id = $1
			and b.project_id = $2
            union 			
            select b.id as "boardId", b.name as "boardName", 
                   b.position as "position",
                        b.project_id as "projectId", p.name as "projectName", 
                        b.created_at as "createdAt",
                        bm.user_id as "userId", 'editor' as "role",
                        true as "canComment"		
            from board b, project_manager bm, project p		
            where b.project_id = p.id
            and p.id = bm.project_id
            and bm.user_id = $1
            and b.project_id = $2
            and not exists (select 1 from board_membership pm 
                                    where pm.user_id = $1
                                    and pm.board_id =b.id)
            order by position`, [userId, projectId]);
            res.json(boards.rows);
            res.end();
    }catch(err){
        console.log(err);
        res.json({message:err});        
        res.end();
    }
    }
);
// get current board info by board id 
app.post('/currentBoard', async(req, res)=>{
    const {boardId, userId} = req.body;
    //console.log('currentboard', boardId);
    try{
        const result = await pool.query(`
        select b.id as "boardId" , bm.role as "role", 
		case when role = 'editor' then true 
		     when role = 'viewer' then false 
			 else false
			 end as "canEdit"
        from board b, board_membership bm, user_account u
        where b.id = bm.board_id  
        and bm.user_id = u.id
        and b.id = $1
        and u.id = $2
        union 
        select b.id as "boardId", 'editor' as "role", true as "canEdit"
        from board b, project_manager bm, project p		
        where b.project_id = p.id
        and p.id = bm.project_id
        and bm.user_id = $2
        and b.id  = $1
        and not exists (select 1 from board_membership pm 
                                   where pm.user_id = $2
                                   and pm.board_id =b.id)        
        LIMIT 1`, [boardId, userId]);

        let currentBoard;
        if(result.rows.length > 0 ) {
            currentBoard = result.rows[0];
        
        const users = await pool.query(`
            select t.id as "boardMembershipId",
                t.board_id as "boardId",
                t.user_id as "userId", 
                t1.name as "userName",
                t1.avatar as "avatarUrl",
                t1.email as "userEmail",
                t.role as "role",
                case when role = 'editor' then true 
                when role = 'viewer' then false 
                else false
                end as "canEdit",
                t.can_comment as "canComment"
            from board_membership t, user_account t1
            where t.user_id = t1.id
            and t.board_id = $1`, [boardId]);
         if( users.rows.length > 0 ) {
                currentBoard.users = users.rows;
         }else {
          currentBoard.users = [];
         }
         const usersPool = await pool.query(`
            select 
                t1.id as "userId", 
                t1.name as "userName",
                t1.avatar as "avatarUrl",
                t1.email as "userEmail",
                (select role from board_membership t where t.user_id = t1.id and t.board_id = $1) as "role",
                (select case when role = 'editor' then true 
                             when role = 'viewer' then false 
                        else false
                        end 
                    from board_membership t where t.user_id = t1.id and t.board_id = $1) as "canEdit"
            from user_account t1`, [boardId]);
         if( usersPool.rows.length > 0 ) {
                currentBoard.usersPool = usersPool.rows;
         }
        const labels = await pool.query(`
            select id as "labelId",
            name as "labelName",
            board_id as "boardId",
            color as "color"
            from label
            where board_id = $1`, [boardId]);
        if( labels.rows.length > 0 ) {
                currentBoard.labels = labels.rows;
        }else{
            currentBoard.labels = [];
        }
        // lists 
        const lists = await pool.query(`
        select id as "listId", board_id as "boardId", name as "listName", 
        position as "position", created_at as "createdAt", 
        updated_at as "updatedAt" from list 
        where board_id = $1
        order by position`, [boardId]);
        
        if( lists.rows.length > 0 ) {
            currentBoard.lists = lists.rows;
        }else{
            currentBoard.lists = [];
        }
        // 보드에 속한 모든 cards ( card에 속한 label, users, attatchments, tasks, comment (??) )
        const cardsResults = await pool.query(`
        select id as "cardId", 
            board_id as "boardId", 
            list_id as "listId", 
            cover_attachment_id as "coverAttachmentId", 
            name as "cardName",
            description as "description",
            created_at as "createdAt",
            updated_at as "updatedAt",
            position as "position",
            stopwatch as "stopwatch",
            due_date as "dueDate",
            status_id as "statusId",
            '' as "statusName"
            from card
            where board_id = $1
            order by position`,[boardId]);
            let cards;
            if( cardsResults.rows.length > 0 ) {
                cards = cardsResults.rows;
            //    console.log('currentboard', cards.rows);
                /// card labels 
                for(const card of cards){
                    //console.log('card', card.cardId);
                    const labelResult = await pool.query(`
                    select l.id as "labelId", l.board_id as "boardId", l.name as "labelName", l.color as "color"
                    from card_label cl, label l
                    where cl.label_id = l.id
                    and cl.card_id = $1`
                    , [card.cardId]);
                    if( labelResult.rows.length > 0 ) 
                        card.labels = labelResult.rows;
                    else
                        card.labels = [];

                    /// card memberships 
                    const cardMembership = await pool.query(`
                    select a.id as "cardMembershipId", a.card_id as "cardId",
                       a.user_id as "userId", a.created_at as "createdAt",
                       a.updated_at as "updatedAt",
                       b.email as "email", b.name as "userName", b.avatar as "avatarUrl"
                    from card_membership a, user_account b 
                    where a.user_id = b.id
                    and card_id = $1`, [card.cardId]);
                    if( cardMembership.rows.length > 0 ) 
                        card.memberships = cardMembership.rows;
                    else
                        card.memberships = [];

                    const cardTask = await pool.query(`
                    select id as "taskId", card_id as "cardId", name as "taskName", is_completed as "isCompleted" ,
                        created_at as "createdAt", updated_at as "updatedAt", position as "position" 
                    from task
                    where card_id = $1
                    order by position`, [card.cardId]);    
                    if(cardTask.rows.length > 0 )
                        card.tasks = cardTask.rows;
                    else
                        card.tasks = [];

                    const cardAttachment = await pool.query(`
                    select a.id as "cardAttachementId", a.card_id as "cardId", a.creator_user_id as "creatorUserId", b.name as "creatorUserName",
                        a.dirname as "dirName",
                        $2||'/'||a.dirname as url, 
                        a.filename as "fileName", a.name as "cardAttachmentName", 
                        a.created_at as "createdAt", a.updated_at as "updatedAt", a.image as "image"
                    from attachment a, user_account b
                    where a.creator_user_id = b.id 
                    and a.card_id = $1`, [card.cardId, MYHOST]);

                    if(cardAttachment.rows.length > 0 ){
                        card.attachments = cardAttachment.rows;
                    }
                    else
                        card.attachments = [];
                    
                    const cardComment = await pool.query(`
                    select a.id as "commentId" , a.card_id as "cardId", 
                        a.user_id as "userId", b.name as "userName", a.text as "text", 
                        a.created_at as "createdAt", a.updated_at as "updatedAt", 
                        b.avatar as "avatarUrl"
                    from comment a , user_account b
                    where a.user_id = b.id
                    and a.card_id = $1`, [card.cardId]);
    
                    if(cardComment.rows.length > 0 )
                        card.comments = cardComment.rows;
                    else
                        card.comments = [];                        

                }  // cards for 끝
               

                currentBoard.cards = cards;
            }else{
                currentBoard.cards = [];
            }
        res.json(currentBoard);
        res.end();
        }else{
            res.json({message:'no data'});  
        }

    }catch(err){
    console.log(err);
    res.json({message:err});        
    res.end();
    }
}  
);

// get my lists by board id 
app.get('/lists/:boardId', async(req, res)=>{
    const boardId = req.params.boardId;
    try{
            const lists = await pool.query(`
            select id as "listId", board_id as "boardId", name as "listName", 
            position as "position", created_at as "createdAt", 
            updated_at as "updatedAt" from list 
            where board_id = $1
            order by position`, [boardId]);
            res.json(lists.rows);
            res.end();
    }catch(err){
        console.log(err);
        res.json({message:err});        
        res.end();
    }
    }
);

// get cards by list id 
app.get('/cardbylistId/:listId', async(req, res)=>{
    const listId = req.params.listId;
    try{
            const cardResult =   await pool.query(`
            select id as "cardId", board_id as "boardId", list_id as "listId", 
            cover_attachment_id as "coverUrl", name as "cardName", description as "description",
            created_at as "createdAt", 
            updated_at as "updatedAt" ,
            position as "position" 
            from card 
            where list_id = $1
            order by position`, [listId]);

            if( cardResult.rows.length > 0 ) {
                const cards = cardResult.rows;
                for(const card of cards){
                    const labelResult = await pool.query(`
                    select l.id as "labelId", l.board_id as "boardId", l.name as "labelName", l.color as "color"
                    from card_label cl, label l
                    where cl.label_id = l.id
                    and cl.card_id = $1`
                    , [card.cardId]);
                    if( labelResult.rows.length > 0 ) 
                        card.labels = labelResult.rows;
                    else
                        card.labels = [];
                }
                res.json(cards);
                res.end();
                
            }
           
    }catch(err){
        console.log(err);
        res.json({message:err});
        res.end();
    }
    }
);
// get all my card by board id 
app.get('/cards/:boardId', async(req, res)=>{
    const boardId = req.params.boardId;
    let cardsResults = [] ;
    try{    
            const result = await pool.query(`
            select id as "listId", board_id as "boardId", name as "listName", 
            position as "position", created_at as "createdAt", 
            updated_at as "updatedAt" from list 
            where board_id = $1
            order by position`, [boardId]);

            if(result.rows.length > 0 ) {
                const lists = result.rows;
                for (const list of lists) {
                    const cardResult = await pool.query(`
                    select id as "cardId", board_id as "boardId", list_id as "listId", 
                    cover_attachment_id as "coverUrl", name as "cardName", description as "description",
                    created_at as "createdAt", 
                    updated_at as "updatedAt",
                    position as "position" from card 
                    where list_id = $1
                    order by position`, [list.listId]);

                    if( cardResult.rows.length > 0 ) {
                        const cards = cardResult.rows;
                        for(const card of cards){
                            const labelResult = await pool.query(`
                            select l.id as "labelId", l.name as "labelName", l.color as "color"
                            from card_label cl, label l
                            where cl.label_id = l.id
                            and cl.card_id = $1`
                            , [card.cardId]);
                            if( labelResult.rows.length > 0 ) 
                                card.labels = labelResult.rows;
                            else
                            card.labels = [];
                        }
                        cardsResults.push.apply(cardsResults,cards);
                    }
                } 
            }
            res.json(cardsResults);
            res.end();
    }catch(err){
        console.log(err);
        res.json({message:err});
        res.end();
    }
    }
);

// get all my card by card id 
app.get('/cardbyId/:cardId', async(req, res)=>{
    const cardId = req.params.cardId;
    let cards ;
    try{    
            const result = await pool.query(`
            select    id as "cardId", board_id as "boardId", list_id as "listId", 
            creator_user_id as "creatorUserId", cover_attachment_id as "converAttachmentId",
            position as "position", name as "cardName", description as "description" , 
            due_date as "dueDate", stopwatch as "stopwatch", created_at as "createdAt",
            updated_at as updatedAt from card where id = $1`, [cardId]);

            if(result.rows.length > 0 ) {
                cards = result.rows;
                for (const card of cards) {
                    const cardMembership = await pool.query(`
                    select a.id as "cardMembershipId", a.card_id as "cardId",
                       a.user_id as "userId", a.created_at as "createdAt",
                       a.updated_at as "updatedAt",
                       b.email as "email", b.name as "userName", b.avatar as "avatarUrl"
                    from card_membership a, user_account b 
                    where a.user_id = b.id
                    and card_id = $1`, [card.cardId]);
                    if( cardMembership.rows.length > 0 ) 
                        card.cardMembership = cardMembership.rows;
                    else
                        card.cardMembership = [];

                    const cardLabel = await pool.query(`
                    select (select a.id from card_label a 
                            where a.label_id = b.id 
                            and a.card_id = $1) as "cardLabelId", 
                            b.id as "lableId" , 
                            b.board_id as "boardId",
                            $1 as "cardId", 
                            b.name as "labelName", b.color as "color"
                        from label b, card_label c
                        where b.id = c.label_id
                        and c.card_id = $1
                        and b.board_id = $2`,[card.cardId, card.boardId]);    
                    if(cardLabel.rows.length > 0 )
                    {
                        card.cardLabels = cardLabel.rows;
                    }else{
                        card.cardLabels = [];
                    }

                    const cardTask = await pool.query(`
                    select id as "taskId", card_id as "cardId", name as "taskName", is_completed as "isCompleted" ,
                       created_at as "createdAt", updated_at as "updatedAt", position as "position" 
                    from task
                    where card_id = $1
                    order by position`, [card.cardId]);    
                    if(cardTask.rows.length > 0 )
                        card.cardTask = cardTask.rows;
                    else
                        card.cardTask = [];

                    const cardAttachment = await pool.query(`
                    select a.id as "cardAttachementId", a.card_id as "cardId", a.creator_user_id as "creatorUserId", b.name as "creatorUserName",
                       a.dirname as "dirName", a.filename as "fileName", 
                       $2||'/'||a.dirname as url,
                       a.name as "cardAttachmentName", 
                       a.created_at as "createdAt", a.updated_at as "updatedAt", a.image as "image"
                    from attachment a, user_account b
                    where a.creator_user_id = b.id 
                    and a.card_id = $1`, [card.cardId, MYHOST]);

                    if(cardAttachment.rows.length > 0 )
                        card.cardAttachment = cardAttachment.rows;
                    else
                       card.cardAttachment = [];
                    
                    const cardComment = await pool.query(`
                    select a.id as "commentId" , a.card_id as "cardId", 
                        a.user_id as "userId", b.name as "userName", a.text as "text", 
                        a.created_at as "createdAt", a.updated_at as "updatedAt", 
                        b.avatar as "avatarUrl"
                    from comment a , user_account b
                    where a.user_id = b.id
                    and a.card_id = $1`, [card.cardId]);
    
                    if(cardComment.rows.length > 0 )
                        card.cardComment = cardComment.rows;
                    else
                        card.cardComment = [];

                    // card action은 우선 조회에서 제외    
                    // const cardAction = await pool.query(`
                    // select a.id as "actionId", a.card_id as "cardId", 
                    //    a.user_id as "userId", b.name as "userName", a.type as "type" , a.data as "data", 
                    //    a.created_at as "createdAt", a.updated_at as "updatedAt"
                    // from action a, user_account b
                    // where a.user_id = b.id
                    // and a.card_id = $1
                    // order by a.created_at`, [card.cardId]);
                    
                   // if(cardAction.rows.length > 0 )
                   //     card.cardAction = cardAction.rows;    

                }
                //console.log(cards.cardLabel);
            }    
            res.json(cards);
            res.end();
         //   console.log('result', res);
    }catch(err){
        console.log(err);
        res.json({message:err});
        res.end();
    }
    }
);


app.post('/boardAuth', async(req, res) => {
    const {boardId, userId} = req.body;
    try{
        const result = await pool.query(`
        select b.id as "boardId" , bm.role as "canEdit"
        from board b, board_membership bm, user_account u
        where b.id = bm.board_id  
        and bm.user_id = u.id
        and b.id = $1
        and u.id = $2
        LIMIT 1`, [boardId, userId]);

        let boards;
        if(result.rows.length > 0 ) {
            boards = result.rows;
            for (const board of boards) {
                 const boardMemebers = await pool.query(`
                select u.id as "userId", u.name as "userName", email as "userEmail", u.avatar as "avatarUrl", bm.role as "canEdit"
                from board b, board_membership bm, user_account u
                where b.id = bm.board_id  
                and bm.user_id = u.id
                and b.id = $1`, [board.boardId]);
                if(boardMemebers.rows.length > 0)
                    board.users = boardMemebers.rows;
            }
            for (const board of boards) {
                const allBoardMemebers = await pool.query(`
                select u.id as "userId", u.name as "userName", email as "userEmail", avatar as "avatarUrl",
                    (select role 
                        from board_membership t 
                    where t.board_id = $1 
                        and t.user_id = u.id LIMIT 1) as "canEdit" 
                from user_account u`, [board.boardId]);
                if(allBoardMemebers.rows.length > 0)
                    board.boardmMemberAllUsers = allBoardMemebers.rows;
            }            
        }
        res.json(boards);
        res.end();
    }catch(err){
        console.error(err);
        res.json({message:err});
        res.end();
    }
});
// create or Modify project 
app.post('/project', async(req, res) => {
    const {creatorUserId, projectActionType, 
        projectName, projectId, 
        managerId, role} = req.body;

    try{
        const response = await pool.query(`call p_modify_project($1, $2, $3, $4, $5, $6, $7)`,
        [creatorUserId,projectActionType, projectName, projectId, managerId, role, null]);
       
        const outProjectId = response.rows[0].x_project_id;
        res.json({outProjectId:outProjectId, projectId:projectId}); // 결과 리턴을 해 줌 .  
        console.log('project',projectId );
        res.end();
    }catch(err){
        console.error(err);
        res.json({message:err});
        res.end();
    }
});

// create board 
app.post('/board', async(req, res) => {
    const {boardActionType, userId, projectId, boardName, boardPosition,
        boardId, boardMembershipActionType, boardMembershipId, boardMembershipUserId , boardMembershipRole,
        boardMembershipCanComment, 
        boardLabelActionType , labelId , labelName , labelColor , labelPosition 
     } = req.body;
    try{
        const response = await pool.query(`call p_modify_board($1, $2, $3, $4, $5, 
             $6, $7, $8, $9, $10, $11, $12, $13,
             $14, $15, $16, $17, $18, $19, $20)`,
        [boardActionType, userId, projectId, boardName, boardPosition,
            boardId, boardMembershipActionType, boardMembershipId, boardMembershipUserId , boardMembershipRole,
            boardMembershipCanComment,  boardLabelActionType , labelId , labelName , labelColor , labelPosition ,null, null, null, null]);
        
            const outBoardId = response.rows[0].x_board_id;
            const outLableId = response.rows[0].x_label_id;
            const outBoardMembershipId = response.rows[0].x_board_membership_id;
            const outBoardPosition = response.rows[0].x_position;


        //add 시에는 outBoardId, outLableId, outBoardMembershipId not null, 나머지 트랜잭션은 boardId not null  
        res.json({ outBoardId:outBoardId, boardId:boardId, outLableId:outLableId, outBoardMembershipId:outBoardMembershipId, outBoardPosition:outBoardPosition}); 

        res.end();
    }catch(err){
        console.error(err);
        res.json({message:err});
        res.end();
    }
});

// create list 
app.post('/list', async(req, res) => {
    const {boardId, userId, listActionType, listId,  listName, position} = req.body;
    try{
        const response = await pool.query(`call p_modify_list($1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10)`,
        [boardId,userId,listActionType, listId, listName, position,
        null, null, null, null]);
       
        const outlistId = response.rows[0].x_list_id;
        const outPosition = response.rows[0].x_position;
        const outCreatedAt = response.rows[0].x_createdAt;
        const outUpdatedAt = response.rows[0].x_updatedAt;

        res.json({listName:listName, outlistId:outlistId, 
            outPosition:outPosition, outCreatedAt:outCreatedAt,
            outUpdatedAt:outUpdatedAt }); // 결과 리턴을 해 줌 .  
        res.end();
    }catch(err){
        console.error(err);
        res.json({message:err});
        res.end();
    }
});

//create card 
app.post('/card', async(req, res) => {
    const {cardId,     // number 
        userId ,       // number 
        cardActionType ,    // 나머지는 모두 string 
        listId,
        boardId,
        description ,
        cardName , 
        dueDate , 
        position ,
        stopwatch,
        cardMembershipActionType ,
        cardMembershipId ,
        cardMembershipUserId ,
        cardLabelActionType ,
        cardLabelId , 
        labelId ,
        cardTaskActionType ,
        cardTaskId ,
        cardTaskName ,
        cardTaskIsCompleted ,
        cardTaskPosition , 
        cardAttachmentActionType ,
        cardAttachmentId ,
        cardAttachmentDirname ,
        cardAttachmentFilename ,
        cardAttachmentName , 
        cardAttachmentImage ,
        cardCommentActionType ,  
        cardCommentId , 
        cardCommentText  ,
        cardStatusActionType ,
        cardStatusId } = req.body;
    try{
        const response = await pool.query(`call p_modify_card($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, 
                                           $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49)`,
        [cardId,     //  
        userId ,       //  
        cardActionType ,    // 나머지는 모두 string 
        listId,
        boardId,
        description ,
        cardName , 
        dueDate , 
        position ,
        stopwatch,
        cardMembershipActionType ,
        cardMembershipId ,
        cardMembershipUserId ,
        cardLabelActionType ,
        cardLabelId , 
        labelId ,
        cardTaskActionType ,
        cardTaskId ,
        cardTaskName ,
        cardTaskIsCompleted ,
        cardTaskPosition , 
        cardAttachmentActionType ,
        cardAttachmentId ,
        cardAttachmentDirname ,
        cardAttachmentFilename ,
        cardAttachmentName , 
        cardAttachmentImage ,
        cardCommentActionType ,  
        cardCommentId , 
        cardCommentText  ,
        cardStatusActionType ,
        cardStatusId,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
     ]);
     const outCardId = response.rows[0].x_card_id;
     const outCardPosition = response.rows[0].x_card_position;
     const outCardCreatedAt = response.rows[0].x_card_created_at;
     res.json({ outCardId: outCardId,  outCardPosition:outCardPosition, 
            outCardCreatedAt:outCardCreatedAt, outCardName:cardName }); // 결과 리턴을 해 줌 .  
        res.end();
    }catch(err){
        console.error(err);
        res.json({message:err});
        res.end();
    }
});

// modify card 
app.post('/modifyCard', async(req, res) => {
    const {cardId,     // number 
        userId ,       // number 
        cardActionType ,    // 나머지는 모두 string 
        listId,
        boardId,
        description ,
        cardName , 
        dueDate , 
        position ,
        stopwatch,
        coverAttachmentId,
        cardMembershipActionType ,
        cardMembershipId ,
        cardMembershipUserId ,
        cardLabelActionType ,
        cardLabelId , 
        labelId ,
        cardTaskActionType ,
        cardTaskId ,
        cardTaskName ,
        cardTaskIsCompleted ,
        cardTaskPosition , 
        cardAttachmentActionType ,
        cardAttachmentId ,
        cardAttachmentDirname ,
        cardAttachmentFilename ,
        cardAttachmentName , 
        cardAttachmentImage ,
        cardCommentActionType ,  
        cardCommentId , 
        cardCommentText  ,
        cardStatusActionType ,
        cardStatusId } = req.body;
        
    try{

        const response = await pool.query(`call p_modify_card($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, 
                                           $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49)`,
        [cardId,     //  
        userId ,       //  
        cardActionType ,    // 나머지는 모두 string 
        listId,
        boardId,
        description ,
        cardName , 
        dueDate , 
        position ,
        stopwatch,
        coverAttachmentId,
        cardMembershipActionType ,
        cardMembershipId ,
        cardMembershipUserId ,
        cardLabelActionType ,
        cardLabelId , 
        labelId ,
        cardTaskActionType ,
        cardTaskId ,
        cardTaskName ,
        cardTaskIsCompleted ,
        cardTaskPosition , 
        cardAttachmentActionType ,
        cardAttachmentId ,
        cardAttachmentDirname ,
        cardAttachmentFilename ,
        cardAttachmentName , 
        cardAttachmentImage ,
        cardCommentActionType ,  
        cardCommentId , 
        cardCommentText  ,
        cardStatusActionType ,
        cardStatusId,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null       
     ]);
        // out 매개변수의 값을 확인합니다.

        const outCardMembershipId = response.rows[0].x_card_membership_id;
        const outCardLabelId = response.rows[0].x_card_label_id;
        

        const outCommentId = response.rows[0].x_comment_id;
        const outCommentCreatedAt = response.rows[0].x_comment_created_at;
        const outCommentUpdatedAt = response.rows[0].x_comment_updated_at;

        const outMembershipCreatedAt = response.rows[0].x_card_membership_created_at;

        const outTaskId = response.rows[0].x_task_id;
        const outTaskCreatedAt = response.rows[0].x_card_task_created_at;
        const outTaskUpdatedAt = response.rows[0].x_card_task_updated_at;
        const outTaskPosition = response.rows[0].x_card_task_position;

        const outAttachmentId = response.rows[0].x_attachment_id;
        const outAttachmentCreatedAt = response.rows[0].x_card_attachment_created_at;
        const outAttachmentUpdatedAt = response.rows[0].x_card_attachment_updatec_at;
        const outAttachmentUrl = MYHOST+'/'+ cardAttachmentDirname;
        
        res.json({ cardId:cardId, outCardMembershipId : outCardMembershipId, outCardLabelId:outCardLabelId,
            outTaskId:outTaskId, outAttachmentId:outAttachmentId, outCommentId:outCommentId, outCommentCreatedAt:outCommentCreatedAt,
            outCommentUpdatedAt:outCommentUpdatedAt, outMembershipCreatedAt:outMembershipCreatedAt, 
            outTaskCreatedAt:outTaskCreatedAt, outTaskUpdatedAt:outTaskUpdatedAt, outAttachmentCreatedAt:outAttachmentCreatedAt,
            outAttachmentUpdatedAt:outAttachmentUpdatedAt, outAttachmentUrl:outAttachmentUrl,
            outTaskPosition:outTaskPosition
         }); // 결과 리턴을 해 줌 .  
        res.end();
    }catch(err){
        console.error(err);
        res.json({message:err});
        res.end();
    }
});

//login
app.post('/login', async(req, res) => {
    const {email, password} = req.body;
    try{
        const users = await pool.query('SELECT * FROM user_account WHERE email = $1', [email]);
        if(!users.rows.length) return res.json({message:'Invalid email or password'});

        const success = await bcrypt.compare(password, users.rows[0].password);
        const token = jwt.sign({email}, 'secret', {expiresIn:'1hr'});
        if(success){
            console.log("success");
            res.json({'userId' : users.rows[0].id,'userName' : users.rows[0].username, token});
        }else{
            console.log("fail");
            res.json({message:"Invalid email or password"});
        }
        res.end();
    }catch(err){
        console.error(err);
        res.json({message:err});        
        res.end();
    }
});

//login
app.post('/getuser', async(req, res) => {
    const {userId} = req.body;
    try{
        const users = await pool.query(`
        SELECT t.id as "userId", 
        t.username as "userName", 
        t.name as "name",
        t.email as "email", 
        t.is_admin as "isAdmin", 
        t.phone as "phone", 
        t.organization  as "organization",
        t.subscribe_to_own_cards  as "subscribeToOwnCards", 
        t.created_at as "createdAt",
        t.updated_at as "updatedAt",
        t.deleted_at as "deletedAt", 
        t.language as "language",
        t.password_changed_at as "passwordChangeAt",
        t.avatar as "avatar"
        FROM user_account t WHERE t.id = $1`, [userId]);
        if(!users.rows.length) 
            return res.json({detail:'User does not exist'});


        res.json(users.rows[0]); // 결과 리턴을 해 줌 .
        res.end();

    }catch(err){
        console.error(err);
        res.json({message:err});        
        res.end();
    }
});

//signup 계정 생성 
app.post('/signup', async(req, res) => {
    const {createrId , 
        userActionType , 
        userName , 
        name , 
        userId ,
        email ,
        isAdmin,
        password , 
        phone , 
        organization , 
        subscribeToOwnCards,
        language ,
        avatar ,
        detail ,
           } = req.body;    
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);
    try{
        const signUp = await pool.query(`call p_modify_user($1, $2, $3, $4, 
            $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 
            $19)` ,
        [createrId , 
            userActionType , 
            userName , 
            name , 
            userId ,
            email ,
            isAdmin,
            hashPassword , 
            phone , 
            organization , 
            subscribeToOwnCards,
            language ,
            avatar ,
            detail ,
            null,
            null,
            null,
            null,
            null
        ]);
        const outUserId = signUp.rows[0].x_user_id;
        const outCreatedAt = signUp.rows[0].x_created_at;

        res.json({outUserId:outUserId, userName:userName, outCreatedAt:outCreatedAt});
    }catch(err){
        console.error(err);
        if(err){
            res.json({message:err});
        }
    }
});

app.get('/getalluser/:userId', async(req, res) => {
    const userId = req.params.userId;
   
    try{
        const users = await pool.query(`
        SELECT t.id as "userId", 
        t.username as "userName", 
        t.name as "name",
        t.email as "email", 
        t.is_admin as "isAdmin", 
        t.phone as "phone", 
        t.organization  as "organization",
        t.subscribe_to_own_cards  as "subscribeToOwnCards", 
        t.created_at as "createdAt",
        t.updated_at as "updatedAt",
        t.deleted_at as "deletedAt", 
        t.language as "language",
        t.password_changed_at as "passwordChangeAt",
        t.avatar as "avatar"
        FROM user_account t `);
        if(!users.rows.length) 
            return res.json({detail:'User does not exist'});
        res.json(users.rows); // 결과 리턴을 해 줌 .
        res.end();

    }catch(err){
        console.error(err);
        res.json({message:err});        
        res.end();
    }
});
app.get('/getProjectIdBoardIdbyCardId/:cardId', async(req, res) => {
    const cardId = req.params.cardId;
    console.log('getProjectIdBoardIdbyCardId', cardId);
    try{
        const card = await pool.query(`
        select p.id as "projectId",
        b.id as "boardId"
        from board b, list l, card  c, project p
        where c.id = $1
        and c.list_id = l.id
        and l.board_id = b.id
        and p.id = b.project_id
        LIMIT 1
        `,[cardId]);
        console.log(card.rows[0]);
        if(card.rows.length<=0) 
            return res.json({message:'card, board, project does not exist'}); 
        res.json({cardId:cardId, boardId:card.rows[0].boardId, projectId:card.rows[0].projectId});
    }catch(err){
        console.error(err);
        res.json({message:err});        
        res.end();
    }
});

// subscribe 
app.post('/subscription', async(req, res) => {
    const {subscription_action, card_id, user_id, is_permanent} = req.body;
    try{
        const response = await pool.query(`call p_modify_subscription(
            $1, $2, $3, $4)`,
            [subscription_action, card_id, user_id, is_permanent]);
        
        res.json({result:"succeeded"}); // 결과 리턴을 해 줌.
        res.end();
    } catch(err){
        console.error(err);
        res.json({result:"failed",
            message:err});
        res.end();
    }
});
app.get('/subscribe/user/:userId', async(req, res) => {
    const user_id = req.params.userId;
    try{
        const response = await pool.query(`select card_id from card_subscription where user_id = $1`,
            [user_id]);
        if(response.rows.length <= 0) {
            return res.json({message: 'No card_id'});
        }
        const data = [...response.rows];
        res.json(data); // 결과 리턴을 해 줌.
        res.end();
    } catch(err){
        console.error(err);
        res.json({result:"failed",
            message:err});
        res.end();
    }
});

// notification 
app.get('/notification/user/:userId', async(req, res) => {
    const pUserId = req.params.userId;
    try{
        const response = await pool.query(`select notification.id as id, action.type as action_type, action.data as action_data, user_account.name as user_name, user_account.avatar as user_avatar, card.id as card_id, card.name as card_name
            from action
                join notification on notification.action_id = action.id
                join user_account on user_account.id = action.user_id
                join card on card.id = action.card_id
            where action.id in (select action_id from notification where user_id = $1 and is_read = false)`,
                [pUserId]);
        if(response.rows.length <= 0) {
            res.json({message: 'Empty'})
            res.end();
        } else {
            const result = response.rows.map((resp) => ({
                notiId: resp.id,
                card: {id: resp.card_id, name: resp.card_name},
                user: {name: resp.user_name, avatarUrl: resp.user_avatar},
                activity: {type: resp.action_type, data: resp.action_data},
            }));
            res.json(result); // 결과 리턴을 해 줌.
            res.end();
        }
    } catch(err){
        console.error(err);
        res.json({result:"failed",
            message:err});
        res.end();
    }
});
app.get('/notification/read/:notiId', async(req, res) => {
    const pNotiId = req.params.notiId;
    try{
        const response = await pool.query(`update notification set is_read = true where notification.id = $1`,
            [pNotiId]);
        res.json({result:"succeeded"}); // 결과 리턴을 해 줌.
        res.end();
    } catch(err){
        console.error(err);
        res.json({result:"failed",
            message:err});
        res.end();
    }
});

app.listen(PORT, ()=> {
    console.log(`Server running on PORT ${PORT}`);
});