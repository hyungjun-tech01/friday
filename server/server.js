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
app.get('/projects', async(req, res)=>{
    try{
            const projects = await pool.query(`
            select p.id as "projectId", p.name as "projectName"
            from project p, project_manager pm, user_account ua
            where p.id = pm.project_id 
            and pm.user_id = ua.id`);
            res.json(projects.rows);
            console.log(projects.rows);
    }catch(err){
        console.log(err);
    }
    }
);
app.post('/project', async(req, res) => {
    const {projectName} = req.body;
    try{
        console.log('create new to do');
        const response = await pool.query('INSERT INTO project(name) values($1)',
        [projectName]);
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