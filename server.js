const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const bcrypt = require("bcrypt");
const Datastore = require("nedb");
const session = require("express-session");
const NedbSessionStore = require("nedb-session-store")(session);

app.use(session({
    secret: process.env.SECRET || 'ENTER YOUR SECRET KEY IN ENV VARIABLES!',
    resave: false,
    saveUninitialized: false,
    unset: "destroy",
    cookie: {
        path: '/',
        httpOnly: true,
        maxAge: 3600000  /*cookie time in ms*/
    },
    store: new NedbSessionStore({
        filename: 'db/sessions.db'
    })
}))

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("index.html");
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
});

//cookie monster
app.get("/admin-login", (req, res) => {
    if(req.session.isLoggedIn && req.session.userRole === "admin"){
        console.log(req.session.userRole);
        res.sendFile(__dirname + '/public/admin-login.html')
    } else {
        req.session = null;
        res.redirect("/");
    }
});

app.get("/user-login", (req, res) => {
    if(req.session.isLoggedIn && req.session.userRole === "user"){
        console.log(req.session.userRole);
        res.sendFile(__dirname + '/public/user-login.html')
    } else {
        req.session = null;
        res.redirect("/");
    }
});

app.get("/info", (req, res) => {
    res.sendFile(__dirname + '/public/info-page.html')
});

app.post("/login", (req, res) => {
    const db = new Datastore("db/users.db");
    db.loadDatabase();
    const un = req.body.username;
    const pw = req.body.password;
    console.log("Requestbody: ");
    console.log(req.body);
    if(un && pw){
        db.find({username:un}, (err, docs) => {
            if(docs.length === 1){
                const userRole =  docs[0].role;
                bcrypt.compare(pw, docs[0].password, (err, result) => {
                    if(result){                                                 //logged in?
                        req.session.userRole = userRole;
                        req.session.isLoggedIn = true;
                        if(userRole === "admin") {
                            res.json({suc:true, redirect:"admin"})              //login to admin page
                        } else {
                            res.json({suc:true, redirect:"user"})               //login to user page
                        }
                    } else { res.json({suc:false}); }
                })
            } else { res.json({suc:false}); }
        })
    } else { res.json({suc:false}); }
});

/*create new users*/
app.post("/newuser", (req, res) => {
    if(req.session.isLoggedIn && req.session.userRole === "admin"){
        console.log(req.body);
        const nun = req.body.username;
        const nemail = req.body.email;
        const db = new Datastore("db/users.db");
        db.loadDatabase();
        db.find({username:nun}, (err, docs) => {
            if(docs.length === 0){
                db.find({email:nemail}, (err, docs) => {
                    if(docs.length === 0){
                        bcrypt.hash(nun, 10, (err, hash) => {
                            console.log(err);
                            console.log(hash);
                            db.insert({email: nemail, username: nun, password: hash, role: "user", suspended: false}, (err, doc) => {
                                res.json({suc:true});
                            });
                        });
                    } else {
                        res.json({suc:false});
                    }            
                });
            } else {
                res.json({suc:false});
            }   
        });
    } else {
        res.json({suc:false});
    }
})

app.get("/getusers", (req, res) => {
    if(req.session.isLoggedIn && req.session.userRole === "admin"){
        const db = new Datastore("db/users.db");
        db.loadDatabase();
        db.find({role:"user"}, (err, docs) => {
            if(docs.length > 0) {
                let resArray = [];
                docs.forEach(element => {
                    resArray.push({
                        username:element.username, 
                        suspended:element.suspended
                    })
                });
                res.json({suc:true, users:resArray})
            } else {
                res.json({suc:false});
            }

        })
    } else {
        res.json({suc:false});
    }
});

app.post("/toggleSus", (req, res) => {
    if(req.session.isLoggedIn && req.session.userRole === "admin"){
        const db = new Datastore("db/users.db");
        db.loadDatabase();
        db.find({username:req.body.username}, (err, docs) => { 
            if(docs.length === 1) {
                var now = !docs[0].suspended;
                db.update({_id: docs[0]._id}, {$set: {suspended: now}}, (err, num) =>{
                    res.json({suc:true});  
                })
            } else {
                res.json({suc:false});
            }

        })
    } else {
        res.json({suc:false});
    }
});

app.listen(8080, () => {
    console.log("Sever online on port 8080.");
})