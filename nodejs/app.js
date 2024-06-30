const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const fs = require('fs');
const session = require('express-session');
const cors = require('cors');
const { Console } = require('console');
const debug = require('debug')('app:debug');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use(session({
    secret: 'your_secret_key',  // Substitua pela sua chave secreta
    resave: false,
    saveUninitialized: true
}));

// Configurações de conexão com o banco de dados
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'yrpreytasks',
    charset: 'utf8mb4'
};

// Criar a conexão com o banco de dados
const connection = mysql.createConnection(dbConfig);

connection.connect(err => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        process.exit(1);
    }
    console.log('Conectado ao banco de dados MySQL');
});

// Rota para gerenciar tarefas
app.all('/tasks', (req, res) => {
    const action = req.query.action;
    const user_id = req.query.user_id;
    
    if (req.method === 'POST') {
        if (action === 'add') {
            const name = req.body.name;
            const user_id = req.body.user_id;
            const query = `INSERT INTO tasks (user_id, name, status) VALUES ('${user_id}', '${name}', 'pending')`;
            connection.query(query, (err, result) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                } else {
                    res.json({ success: true });
                }
            });
        } else if (action === 'update') {
            const task_id = req.body.id;
            const user_id = req.body.user_id;
            const name = req.body.name;
            const filePath = path.join(__dirname, '../log.php');
            fs.writeFileSync(filePath, `${user_id}`);
            const query = `UPDATE tasks SET name = '${name}' WHERE user_id = '${user_id}' AND id = '${task_id}'`;
            connection.query(query, (err, result) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                } else {
                    res.json({ success: true });
                }
            });
        } else if (action === 'delete') {
            const task_id = req.body.id;
            const user_id = req.body.user_id;
            const filePath = path.join(__dirname, '../log.php');
            fs.writeFileSync(filePath, `${user_id}`);
            const query = `DELETE FROM tasks WHERE id = '${task_id}' AND user_id = '${user_id}'`;
            connection.query(query, (err, result) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                } else {
                    res.json({ success: true });
                }
            });
        }
    } else if (req.method === 'DELETE') {
        const task_id = req.query.id;
        
        const query = `DELETE FROM tasks WHERE user_id = '${user_id}' AND id = '${task_id}'`;
        connection.query(query, (err, result) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ success: true });
            }
        });
    } else if (req.method === 'GET') {
        if (action === 'toggle') {
            const task_id = req.query.id;            
            const user_id = req.query.user_id;            
            const status = req.query.status;
            let new_status;

            if (status === "completed") {
                new_status = "pending";
            }
            else if (status === "pending") {
                new_status = "completed";
            }
            else {
                new_status = "pending";
            }
            const filePath = path.join(__dirname, '../log.php');
            fs.writeFileSync(filePath, `${user_id}`);
            const query = `UPDATE tasks SET status = '${new_status}' WHERE id = '${task_id}' AND user_id = '${user_id}'`;
            console.log(query);
            connection.query(query, (err, result) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                } else {
                    res.json({ success: true });
                }
            });
        } else if (action === 'list') {
            const user_id = req.query.user_id;
            const status = req.query.status;
            const filePath = path.join(__dirname, '../log.php');
            fs.writeFileSync(filePath, `${user_id}`);
            let query = `SELECT * FROM tasks where status = '${status}' AND user_id = '${user_id}'`;
            if (status === 'all') {
                query += ` OR status <> ''`;
            }
            connection.query(query, (err, results) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                } else {
                    res.json(results);
                }
            });
        } else {
            const uri = req.query.uri;
            res.redirect(uri);
        }
    } else {
        res.status(400).json({ error: 'Método não suportado' });
    }
});

app.use((req, res, next) => {
    debug(`${req.method} ${req.url}`);
    next();
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
