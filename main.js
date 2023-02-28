
//=============================
//add middleware (is a function that has three arguments which all the arguments are object (req, res, next))
require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const router = require('./routes/routes');
const path = require('path')

const app = express();
const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,   
    useUnifiedTopology: true,  
});

const db = mongoose.connection;
db.on("error", (error)=> console.log(error));   
db.once('open',()=> console.log("connected to database!"));  

app.use(express.urlencoded({ extended: false })) 
app.use(express.json())
app.use(session({
    secret: 'mysecret ejs',
    saveUninitialized: true,
    resave: false,
}))

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

app.use(express.static('public'))

app.set('view engine', 'ejs')


app.use('', router);

app.listen(PORT, ()=>{
    console.log(`server running at http://localhost ${PORT}`);
})