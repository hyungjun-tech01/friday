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
    console.log(userId);
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
    console.log("sigle projects by projectId", projectId);
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
app.get('/cards/:listId', async(req, res)=>{
    const listId = req.params.listId;
    //console.log(listId);
    try{
            const cardResult =   await pool.query(`
            select id as "cardId", board_id as "boardId", list_id as "listId", 
            cover_attachment_id as "coverUrl", name as "cardName", description as "description",
            created_at as "createdAt", 
            updated_at as "updatedAt" from card 
            where list_id = $1`, [listId]);

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
                res.end();
                //console.log("queryed card", cards);
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
                    updated_at as "updatedAt" from card 
                    where list_id = $1`, [list.listId]);

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
                    select a.id as "cardLabelId", a.label_id as "lableId" , card_id as "cardId", 
                      b.name as "labelName", b.color as "color", a.created_at as "createdAt",
                      a.updated_at as "updatedAt" 
                    from card_label a, label b
                    where a.label_id = b.id
                    and a.card_id = $1`,[card.cardId]);    
                    if(cardLabel.rows.length > 0 )
                        card.cardLabel = cardLabel.rows;

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
                        a.created_at as "createdAt", a.updated_at as "updatedAt"
                    from comment a , user_account b
                    where a.user_id = b.id
                    and a.card_id = $1`, [card.cardId]);
    
                    if(cardComment.rows.length > 0 )
                        card.cardComment = cardComment.rows;

                    const cardAction = await pool.query(`
                    select a.id as "actionId", a.card_id as "cardId", 
                       a.user_id as "userId", b.name as "userName", a.type as "type" , a.data as "data", 
                       a.created_at as "createdAt", a.updated_at as "updatedAt"
                    from action a, user_account b
                    where a.user_id = b.id
                    and a.card_id = $1
                    order by a.created_at`, [card.cardId]);
        
                    if(cardAction.rows.length > 0 )
                        card.cardAction = cardAction.rows;    

                }
                console.log(cards);
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
    console.log('boardAuth', boardId, userId);
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
                console.log('board', board.boardId);
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
                console.log('all user', board.boardId);
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
    const {projectId, userId, boardName} = req.body;
    try{
        console.log('create new board');
        // insert project 
        const response = await pool.query(`call p_insert_board($1, $2, $3)`,
        [userId,projectId,boardName]);
       
        res.json({boardName:boardName}); // 결과 리턴을 해 줌 .  
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
    const {listId, userId, cardName} = req.body;
    try{
        console.log('create new card', cardName);
        // insert project 
        const response = await pool.query(`
        insert into card(id, board_id, list_id, creator_user_id,name, created_at)
        select next_id(), board_id, $1, $2, $3, now()
        from list where id=$1`,
        [listId,userId,cardName]);
       
        res.json({cardName:cardName}); // 결과 리턴을 해 줌 .  
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
        description ,
        cardName , 
        dueDate , 
        position ,
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
        console.log('create new board');
        // insert project 
        const response = await pool.query(`call p_modify_card($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)`,
        [cardId,     // number 
        userId ,       // number 
        cardActionType ,    // 나머지는 모두 string 
        description ,
        cardName , 
        dueDate , 
        position ,
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
        cardStatusId ]);
       
        res.json({cardId:cardId}); // 결과 리턴을 해 줌 .  
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
        console.log("getuser", userId);
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