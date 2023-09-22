const express = require('express');
const app = express();
const pool = require('./db');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



const PORT =  process.env.MYPORT ? process.env.MYPORT:8000;

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded( {extended : false } ));

// home  test
app.get('/', (req, res)=>{
    res.send("Service is started");
});

// get all projects by user 
app.get('/projects/:userId', async(req, res)=>{
    const userId = req.params.userId;
    try{
            const projects = await pool.query(`
            select p.id as "projectId", p.name as "projectName",
            (select id from board b
                where b.project_id = p.id
                order by position 
                limit 1) as "defaultBoardId"
            from project p, project_manager pm
            where p.id = pm.project_id 
            and pm.user_id = $1`, [userId]);
            res.json(projects.rows);
            res.end();
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
    try{
            const project = await pool.query(`
            select p.id as "projectId", p.name as "projectName"
            from project p, project_manager pm
            where p.id = pm.project_id 
            and pm.project_id = $1`, [projectId]);
            console.log('single project', project.rows);
            res.json(project.rows);
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
			b.project_id as "projectId", p.name as "projectName", 
            b.created_at as "createdAt",
			bm.user_id as "userId", bm.role as "role",
			bm.can_comment as "canComment"
            from board b, board_membership bm, project p
            where b.id = bm.board_id 
            and b.project_id = p.id
            and bm.user_id = $1
			and b.project_id = $2
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
app.get('/currentBoard/:boardId', async(req, res)=>{
    const boardId = req.params.boardId;
    let currentBoard = {boardId:boardId};

    try{
        const users = await pool.query(`
            select t.user_id as "userId", 
                t1.name as "userName",
                t1.avatar as "avatarUrl",
                t1.email as "userEmail",
                t.role as "role",
                t.role as "canEdit"
            from board_membership t, user_account t1
            where t.user_id = t1.id
            and t.board_id = $1`, [boardId]);
         if( users.rows.length > 0 ) {
                currentBoard.users = users.rows;
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
        res.json(currentBoard);
        console.log(currentBoard);
        res.end();
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
  //  console.log(boardId);
    try{
            const lists = await pool.query(`
            select id as "listId", board_id as "boardId", name as "listName", 
            position as "position", created_at as "createdAt", 
            updated_at as "updatedAt" from list 
            where board_id = $1`, [boardId]);
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
    console.log('cardbylistid', listId);
    try{
            const cardResult =   await pool.query(`
            select id as "cardId", board_id as "boardId", list_id as "listId", 
            cover_attachment_id as "coverUrl", name as "cardName", description as "description",
            created_at as "createdAt", 
            updated_at as "updatedAt" ,
            position as "position" 
            from card 
            where list_id = $1
            order by position desc`, [listId]);

            if( cardResult.rows.length > 0 ) {
                const cards = cardResult.rows;
                for(const card of cards){
                    //console.log('card', card.cardId);
                    const labelResult = await pool.query(`
                    select l.id as "labelId", l.name as "labelName", l.color as "color"
                    from card_label cl, label l
                    where cl.label_id = l.id
                    and cl.card_id = $1`
                    , [card.cardId]);
                    if( labelResult.rows.length > 0 ) 
                        card.labels = labelResult.rows;
                }
                res.json(cards);
//                console.log("queryed card", cards);
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
    console.log("card query", boardId);
    let cardsResults = [] ;
    try{    
            const result = await pool.query(`
            select id as "listId", board_id as "boardId", name as "listName", 
            position as "position", created_at as "createdAt", 
            updated_at as "updatedAt" from list 
            where board_id = $1`, [boardId]);

            if(result.rows.length > 0 ) {
                const lists = result.rows;
                for (const list of lists) {
                    //console.log('list', list.listId);
                    const cardResult = await pool.query(`
                    select id as "cardId", board_id as "boardId", list_id as "listId", 
                    cover_attachment_id as "coverUrl", name as "cardName", description as "description",
                    created_at as "createdAt", 
                    updated_at as "updatedAt",
                    position as "position" from card 
                    where list_id = $1
                    order by position desc`, [list.listId]);

                    if( cardResult.rows.length > 0 ) {
                        const cards = cardResult.rows;
                        for(const card of cards){
                            //console.log('card', card.cardId);
                            const labelResult = await pool.query(`
                            select l.id as "labelId", l.name as "labelName", l.color as "color"
                            from card_label cl, label l
                            where cl.label_id = l.id
                            and cl.card_id = $1`
                            , [card.cardId]);
                            if( labelResult.rows.length > 0 ) 
                                card.labels = labelResult.rows;
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
    console.log("card query by cardId", cardId);
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

                    const cardLabel = await pool.query(`
                    select (select a.id from card_label a 
                            where a.label_id = b.id 
                            and a.card_id = $1) as "cardLabelId", 
                            b.id as "lableId" , 
                            $1 as "cardId", 
                            b.name as "labelName", b.color as "color"
                        from label b
                        where b.board_id = $2`,[card.cardId, card.boardId]);    
                    if(cardLabel.rows.length > 0 )
                    {
                        card.cardLabel = cardLabel.rows;
                    }

                    const cardTask = await pool.query(`
                    select id as "taskId", card_id as "cardId", name as "taskName", is_completed as "isCompleted" ,
                       created_at as "createdAt", updated_at as "updatedAt", position as "position" 
                    from task
                    where card_id = $1`, [card.cardId]);    
                    if(cardTask.rows.length > 0 )
                        card.cardTask = cardTask.rows;

                    const cardAttachment = await pool.query(`
                    select a.id as "cardAttachementId", a.card_id as "cardId", a.creator_user_id as "creatorUserId", b.name as "creatorUserName",
                       a.dirname as "dirName", a.filename as "fileName", a.name as "cardAttachmentName", 
                       a.created_at as "createdAt", a.updated_at as "updatedAt", a.image as "image"
                    from attachment a, user_account b
                    where a.creator_user_id = b.id 
                    and a.card_id = $1`, [card.cardId]);

                    if(cardAttachment.rows.length > 0 )
                        card.cardAttachment = cardAttachment.rows;
                    
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
          //  console.log('cardlabel', cards);
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
    //    console.log("res boards", boards);
    }catch(err){
        console.error(err);
        res.json({message:err});
        res.end();
    }
});
// create project 
app.post('/project', async(req, res) => {
    const {projectName, userId} = req.body;
    try{
        console.log('create new project');
        // insert project 
        const response = await pool.query(`call p_create_project($1, $2)`,
        [userId,projectName]);
       
        res.json(response); // 결과 리턴을 해 줌 .  
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
        console.log('create new board');
        // insert project 
        const response = await pool.query(`call p_modify_board($1, $2, $3, $4, $5, 
             $6, $7, $8, $9, $10, $11, $12, $13,
             $14, $15, $16, $17, $18, $19)`,
        [boardActionType, userId, projectId, boardName, boardPosition,
            boardId, boardMembershipActionType, boardMembershipId, boardMembershipUserId , boardMembershipRole,
            boardMembershipCanComment,  boardLabelActionType , labelId , labelName , labelColor , labelPosition ,null, null, null]);
        
            const outBoardId = response.rows[0].x_board_id;
            const outLableId = response.rows[0].x_label_id;
            const outBoardMembershipId = response.rows[0].x_board_membership_id;

        //add 시에는 outBoardId, outLableId, outBoardMembershipId not null, 나머지 트랜잭션은 boardId not null  
        res.json({ outBoardId:outBoardId, boardId:boardId, outLableId:outLableId, outBoardMembershipId:outBoardMembershipId}); 

        res.end();
    }catch(err){
        console.error(err);
        res.json({message:err});
        res.end();
    }
});

// create list 
app.post('/list', async(req, res) => {
    const {boardId, userId, listName} = req.body;
    try{
        console.log('create new list');
        // insert project 
        const response = await pool.query(`call p_create_list($1, $2, $3)`,
        [userId,boardId,listName]);
       
        res.json({listName:listName}); // 결과 리턴을 해 줌 .  
        res.end();
    }catch(err){
        console.error(err);
        res.json({message:err});
        res.end();
    }
});

//create card 
// create list 
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
        console.log('create card');
        // insert project 
        const response = await pool.query(`call p_modify_card($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, 
                                           $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44)`,
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
        null
     ]);
        res.json({ cardName:cardName }); // 결과 리턴을 해 줌 .  
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
        console.log('modify card', req.body);
        // insert project 
        const response = await pool.query(`call p_modify_card($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, 
                                           $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44)`,
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
        null       
     ]);
        // out 매개변수의 값을 확인합니다.
        const outCardMembershipId = response.rows[0].x_card_membership_id;
        const outCardLabelId = response.rows[0].x_card_label_id;
        const outTaskId = response.rows[0].x_task_id;
        const outAttachmentId = response.rows[0].x_attachment_id;
        const outCommentId = response.rows[0].x_comment_id;
        const outCommentCreatedAt = response.rows[0].x_comment_created_at;
        const outCommentUpdatedAt = response.rows[0].x_comment_updated_at;

        const outMembershipCreatedAt = response.rows[0].x_card_membership_created_at;
        const outTaskCreatedAt = response.rows[0].x_card_task_created_at;
        const outTaskUpdatedAt = response.rows[0].x_card_task_updated_at;
        const outAttachmentCreatedAt = response.rows[0].x_card_attachment_created_at;
        const outAttachmentUpdatedAt = response.rows[0].x_card_attachment_updatec_at;
        
        res.json({ cardId:cardId, outCardMembershipId : outCardMembershipId, outCardLabelId:outCardLabelId,
            outTaskId:outTaskId, outAttachmentId:outAttachmentId, outCommentId:outCommentId, outCommentCreatedAt:outCommentCreatedAt,
            outCommentUpdatedAt:outCommentUpdatedAt, outMembershipCreatedAt:outMembershipCreatedAt, 
            outTaskCreatedAt:outTaskCreatedAt, outTaskUpdatedAt:outTaskUpdatedAt, outAttachmentCreatedAt:outAttachmentCreatedAt,
            outAttachmentUpdatedAt:outAttachmentUpdatedAt,
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
        console.log(email, password);
        const users = await pool.query('SELECT * FROM user_account WHERE email = $1', [email]);
        if(!users.rows.length) return res.json({message:'Invalid email or password'});

        console.log(users.rows[0]);
        const success = await bcrypt.compare(password, users.rows[0].password);
        const token = jwt.sign({email}, 'secret', {expiresIn:'1hr'});
        if(success){
            console.log("success");
            res.json({'email' : users.rows[0].id,'userName' : users.rows[0].username, token});
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
    console.log("getuser", req);
    const {userId} = req.body;
    try{
        const users = await pool.query(`
        SELECT t.id as "userId", t.email as "email", t.is_admin as "isAdmin", 
        t.username as "userName", t.phone as "phone", t.organization  as "organization",
        t.subscribe_to_own_cards  as "subscribeToOwnCards", t.created_at as "createdAt" 
        FROM user_account t WHERE t.id = $1`, [userId]);
        if(!users.rows.length) return res.json({detail:'User does not exist'});

        console.log(users.rows[0]);

        res.json(users); // 결과 리턴을 해 줌 .
        res.end();

    }catch(err){
        console.error(err);
        res.json({message:err});        
        res.end();
    }
});

app.listen(PORT, ()=> {
    console.log(`Server running on PORT ${PORT}`);
});