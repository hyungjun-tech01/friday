const express = require('express');
const app = express();
const pool = require('./db');
const cors = require('cors');
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
        console.log(project.rows);
        const {projectid} = project.rows[0];
        console.log(projectid);
        // insert project_manager 
        const response = await pool.query(`INSERT INTO project_manager(project_id, user_id,created_at ) 
                                            values($1, $2, now())`,
        [projectid, userId]);

        res.json(response); // 결과 리턴을 해 줌 .
    }catch(err){
        console.error(err);
    }
});
/*
, pm.created_at, pm.updated_at, 
            ua.email, ua.name user_name, 
            pm.user_id
            */
app.listen(PORT, ()=> {
    console.log(`Server running on PORT ${PORT}`);
});