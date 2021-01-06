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


/* Landing Page Call */
app.get("/", (req, res) => {
    res.send("index.html");
});

/* Logout Call */
app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
});

/* New Post Page Call */
app.get("/newPost", (req, res) => {
    if(req.session.isLoggedIn && req.session.userRole === "user"){
        res.sendFile(__dirname + '/public/new-Post.html')
    } else {
        req.session = null;
        res.redirect("/");
    }
});

/* Manage Posts Page Call */
app.get("/manage-posts", (req, res) => {
    if(req.session.isLoggedIn && (req.session.userRole === "mod" || req.session.userRole === "admin")){
        res.sendFile(__dirname + '/public/manage-post.html')
    } else {
        req.session = null;
        res.redirect("/");
    }
});

/* Back to Admin/Mod/User Landing Page */
app.get("/main", (req, res) => {
    if(req.session.isLoggedIn && req.session.userRole === "admin"){
        res.sendFile(__dirname + '/public/admin-login.html')
    }else if(req.session.isLoggedIn && req.session.userRole === "mod") {
        res.sendFile(__dirname + '/public/mod-login.html')
    }else if(req.session.isLoggedIn && req.session.userRole === "user") {
        res.sendFile(__dirname + '/public/user-login.html')
    }else {
        req.session = null;
        res.redirect("/");
    }
});

/* Noticeboard Page Call */
app.get("/info", (req, res) => {
    res.sendFile(__dirname + '/public/info-page.html')
});

/* Login/Credentials check and Redirect */
app.post("/login", (req, res) => {
    const db = new Datastore("db/users.db");
    db.loadDatabase();
    const un = req.body.username;
    const pw = req.body.password;
    if(un && pw){
        db.find({username:un}, (err, docs) => {
            if(docs.length === 1){
                const userRole =  docs[0].role;
                bcrypt.compare(pw, docs[0].password, (err, result) => {
                    if(result){                                                 //logged in?
                        req.session.userRole = userRole;
                        req.session.userid = docs[0]._id;
                        req.session.gr = docs[0].group;
                        req.session.un = docs[0].username;
                        req.session.isLoggedIn = true;
                        if(userRole === "admin") {
                            res.json({suc:true, redirect:"admin"})              //login to admin page
                        } else if(userRole === "mod"){
                            res.json({suc:true, redirect:"mod"})               //login to mod page
                        } else if(userRole === "user"){
                            res.json({suc:true, redirect:"user"})               //login to user page
                        }
                    } else { res.json({suc:false}); }
                })
            } else { res.json({suc:false}); }
        })
    } else { res.json({suc:false}); }
});

/*create new mod*/
app.post("/newmod", (req, res) => {
    if(req.session.isLoggedIn && req.session.userRole === "admin"){
        const nun = req.body.username;
        const nemail = req.body.email;
        const db = new Datastore("db/users.db");
        db.loadDatabase();
        db.find({username:nun}, (err, docs) => {
            if(docs.length === 0){
                db.find({email:nemail}, (err, docs) => {
                    if(docs.length === 0){
                        bcrypt.hash(nun, 10, (err, hash) => {
                            db.insert({email: nemail, username: nun, password: hash, role: "mod", suspended: false}, (err, doc) => {
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

app.get("/getmods", (req, res) => {
    if(req.session.isLoggedIn && req.session.userRole === "admin"){
        const db = new Datastore("db/users.db");
        db.loadDatabase();
        db.find({role:"mod"}, (err, docs) => {
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

/*create new users*/
app.post("/newuser", (req, res) => {
    if(req.session.isLoggedIn && req.session.userRole === "mod"){
        const nun = req.body.username;
        const nemail = req.body.email;
        const db = new Datastore("db/users.db");
        db.loadDatabase();
        db.find({username:nun}, (err, docs) => {
            if(docs.length === 0){
                db.find({email:nemail}, (err, docs) => {
                    if(docs.length === 0){
                        bcrypt.hash(nun, 10, (err, hash) => {
                            db.insert({email: nemail, username: nun, password: hash, role: "user", group: req.session.userid, suspended: false}, (err, doc) => {
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
    if(req.session.isLoggedIn && req.session.userRole === "mod"){
        const db = new Datastore("db/users.db");
        db.loadDatabase();
        db.find({role:"user" , group: req.session.userid }, (err, docs) => {
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

/*Create new Post*/
app.post("/newpost", (req, res) => {
    if(req.session.isLoggedIn && req.session.userRole === "user"){
        const db = new Datastore("db/posts.db");
        db.loadDatabase();
        db.insert({
            creatorId:req.session.userid ,
            creatorName:req.session.un ,
            creatorGroup:req.session.gr ,
            showpost:false ,
            startDate:req.body.startDate ,
            endDate:req.body.endDate ,
            title:req.body.title ,
            text:req.body.text 
        }, (err, doc) => {
            res.json({suc:true});
        });
    }
});

app.get("/getposts", (req, res) => {
    if(req.session.isLoggedIn){
        const db_post = new Datastore("db/posts.db");
        db_post.loadDatabase();
        switch(req.session.userRole)
        {
            case "admin":
                db_post.find({}, (err, docs) => {
                    if(docs.length > 0) {
                        let resArray = [];
                        docs.forEach(element => {
                            resArray.push({
                                creator: element.creatorName,
                                postid: element._id,
                                title:element.title,
                                text:element.text,
                                showpost:element.showpost,
                                startDate:element.startDate,
                                endDate:element.endDate,
                            })
                        });
                        res.json({suc:true, users:resArray})
                    } else {
                        res.json({suc:false});
                    }
                });
            break;
            case "mod":
                db_post.find({creatorGroup:req.session.userid}, (err, docs) => {
                    if(docs.length > 0) {
                        let resArray = [];
                        docs.forEach(element => {
                            resArray.push({
                                creator: element.creatorName,
                                postid: element._id,
                                title:element.title,
                                text:element.text,
                                showpost:element.showpost,
                                startDate:element.startDate,
                                endDate:element.endDate,
                            })
                        });
                        res.json({suc:true, users:resArray})
                    } else {
                        res.json({suc:false});
                    }
                });
                break;
            case "user":
                db_post.find({creatorId:req.session.userid}, (err, docs) => {
                    if(docs.length > 0) {
                        let resArray = [];
                            docs.forEach(element => {
                            resArray.push({
                                title:element.title,
                                showpost:element.showpost,
                                postid:element._id
                            })
                        });
                        res.json({suc:true, users:resArray})
                    } else {
                        res.json({suc:false});
                    }});
                break;
        }
    }
});

/* Toggle The Suspended State of a User/Mod */
app.post("/toggleSus", (req, res) => {
    if(req.session.isLoggedIn && (req.session.userRole === "admin" || req.session.userRole === "mod")){
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

/* Toggle the Showing Post state */
app.post("/toggleShow", (req, res) => {
    if(req.session.isLoggedIn && (req.session.userRole === "mod" || req.session.userRole === "admin")){
        const db = new Datastore("db/posts.db");
        db.loadDatabase();
        db.find({_id:req.body.postid}, (err, docs) => { 
            if(docs.length === 1) {
                var now = !docs[0].showpost;
                db.update({_id: docs[0]._id}, {$set: {showpost: now}}, (err, num) =>{
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

app.post("/deletePost", (req, res) => {
    if(req.session.isLoggedIn){
        const db = new Datastore("db/posts.db");
        db.loadDatabase();
        db.find({_id:req.body.postid}, (err, docs) => { 
            if(docs.length === 1) {
                db.remove({_id: docs[0]._id}, (err, num) =>{
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

app.post("/deleteUser", (req, res) => {
    if(req.session.isLoggedIn && req.session.userRole === "mod"){
        const db = new Datastore("db/users.db");
        db.loadDatabase();
        db.find({username:req.body.username}, (err, docs) => { 
            if(docs.length === 1) {
                db.remove({_id: docs[0]._id}, (err, num) =>{
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

app.post("/deleteMod", (req, res) => {
    var modid;
    if(req.session.isLoggedIn && req.session.userRole === "admin"){
        const db = new Datastore("db/users.db");
        db.loadDatabase();
        db.find({username:req.body.username}, (err, docs) => { 
            if(docs.length === 1) {
                modid = docs[0]._id;
                db.find({group:modid}, (err, docs) => { 
                    if(docs.length > 0) {
                        docs.forEach(element => {
                            db.remove({_id: element._id}, (err, num) =>{})
                        });
                    }
                })
                db.find({username:req.body.username}, (err, docs) => { 
                    if(docs.length === 1) {
                        db.remove({_id: docs[0]._id}, (err, num) =>{
                            res.json({suc:true});
                        })
                    } else {
                        res.json({suc:false});
                    }
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
    console.log("Who da fuq woke me up!? port 8080");
})