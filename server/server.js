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
            select p.id as "projectId", p.name as "projectName"
            from project p, project_manager pm
            where p.id = pm.project_id 
            and pm.user_id = $1`, [userId]);
            res.json(projects.rows);
            console.log(projects.rows);
    }catch(err){
        console.log(err);
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
            res.json(project.rows);
            console.log(project.rows);
    }catch(err){
        console.log(err);
    }
    }
);

// get all boards by project id 
app.get('/boards/:projectId', async(req, res)=>{
    const projectId = req.params.projectId;
    console.log(projectId);
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
			and b.project_id = $1`, [projectId]);
            res.json(boards.rows);
            console.log(boards.rows);
    }catch(err){
        console.log(err);
    }
    }
);


// create project 
app.post('/project', async(req, res) => {
    const {projectName, userId} = req.body;
    try{
        console.log('create new project');
        // insert project 
        const response1 = await pool.query(`INSERT INTO project(name) values($1)`,
        [projectName]);
        // 성공하면 get max project by user id 
        const project = await pool.query(`SELECT MAX(id) projectId from project where name = $1`,
        [projectName]);
        const {projectid} = project.rows[0];   // project id를 못가지고 와서 한 참 헤맴. 원래 대로 하면 project_manager를 먼저 넣고, 그 다음에 project를 생성해야 할 듯 한다. 
        // insert project_manager 
        const response = await pool.query(`INSERT INTO project_manager(project_id, user_id,created_at ) 
                                            values($1, $2, now())`,
        [projectid, userId]);

        res.json(response); // 결과 리턴을 해 줌 .
    }catch(err){
        console.error(err);
    }
});

//login
app.post('/login', async(req, res) => {
    const {email, password} = req.body;
    try{
        console.log(email, password);
        const users = await pool.query('SELECT * FROM user_account WHERE email = $1', [email]);
        if(!users.rows.length) return res.json({detail:'User does not exist'});

        console.log(users.rows[0]);
        const success = await bcrypt.compare(password, users.rows[0].password);
        const token = jwt.sign({email}, 'secret', {expiresIn:'1hr'});
        if(success){
            console.log("success");
            res.json({'email' : users.rows[0].id, token});
        }else{
            console.log("fail");
            res.json({detail:"Login failed"});
        }
    }catch(err){
        console.error(err);
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

    }catch(err){
        console.error(err);
    }
});

app.listen(PORT, ()=> {
    console.log(`Server running on PORT ${PORT}`);
});