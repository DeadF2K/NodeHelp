const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const bcrypt = require("bcrypt");
const Datastore = require("nedb");
const session = require("express-session");
const NedbSessionStore = require("nedb-session-store")(session);

app.listen(8080, () => {
    console.log("Server online on port 8080");
})

app.use(session({
    secret: process.env.SECRET || 'ENTER YOUR SECRET KEY IN ENV VARIABLES!',
    resave: false,
    saveUninitialized: false,
    unset: "destroy",
    cookie: {
        path: '/',
        httpOnly: true,
        maxAge: 3600000 //cookie time in ms (=1h)
    },
    store: new NedbSessionStore({
        filename: 'db/sessions.db'
    })
}))

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



/*--------------------------------------------------PAGE REQUESTS--------------------------------------------------*/

app.get("/", (req, res) => {
    res.send("index.html");
});

app.get("/info", (req, res) => {
    res.sendFile(__dirname + '/public/info-page.html')
});

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

app.get("/newPost", (req, res) => {
    if(req.session.isLoggedIn && req.session.userRole === "user"){
        res.sendFile(__dirname + '/public/new-Postv2.html')
    } else {
        req.session = null;
        res.redirect("/");
    }
});

app.get("/manage-posts", (req, res) => {
    if(req.session.isLoggedIn && (req.session.userRole === "mod" || req.session.userRole === "admin")){
        res.sendFile(__dirname + '/public/manage-post.html')
    } else {
        req.session = null;
        res.redirect("/");
    }
});

app.get("/new-password", (req, res) => {
    if(req.session.isLoggedIn){
        res.sendFile(__dirname + '/public/change-pw.html')
    } else {
        req.session = null;
        res.redirect("/");
    }
});

app.post("/updatePostID", (req, res) => {
    
    if(req.session.isLoggedIn){
        req.session.revpost = req.body.postid;
        res.json({suc:true});
        //res.sendFile(__dirname + '/public/post-review.html')
    } else {
        res.json({suc:false});
    }
});

app.get("/post-review", (req, res) => {
    if(req.session.isLoggedIn ){
        res.sendFile(__dirname + '/public/post-review.html')
    } else {
        req.session = null;
        res.redirect("/");
    }
});

/*--------------------------------------------------GETTER FUNCTIONS--------------------------------------------------*/

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

app.get("/getReviewPost", (req, res) => {
    if(req.session.isLoggedIn){
        const db = new Datastore("db/posts.db");
        db.loadDatabase();
        db.find({_id:req.session.revpost}, (err, docs) => { 
            if(docs.length === 1) {
                let post = [];
                post.push({
                    postid:docs[0]._id,
                    username:docs[0].creatorName,
                    showpost:docs[0].showpost,
                    title:docs[0].title,
                    text:docs[0].text,
                    bcolor:docs[0].bcolor,
                    startdate:docs[0].startDate,
                    enddate:docs[0].endDate,
                })
                res.json({suc:true, post:post})
            } else {
                res.json({suc:false});
            }
        })
    } else {
        res.json({suc:false});
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

app.get("/getliveposts", (req, res) => {
    const now = new Date();
    const now_year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(now);
    const now_month = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(now);
    const now_day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(now);
    const db_post = new Datastore("db/posts.db");
    db_post.loadDatabase();
    const db_users = new Datastore("db/users.db");
    db_users.loadDatabase();
    db_post.find({}, (err, docs) => {
        if(docs.length > 0) {
            let resArray = [];
            docs.forEach(element => {
                if(element.showpost){ 
                    const startDate = element.startDate.split("-", 3);
                    const endDate = element.endDate.split("-", 3);
                    if((now_year >= startDate[0]) && (now_year <= endDate[0])){
                        if((now_month >= startDate[1]) && (now_month <= endDate[1])){
                            if((now_day >= startDate[2]) && (now_day <= endDate[2])){
                                db_users.find({_id:element.creatorId}, (err2, docs2) =>{
                                    docs2.forEach(element2 => {
                                        if(!element2.suspended)
                                        { 
                                            db_users.find({_id:element.creatorGroup}, (err3, docs3) =>{
                                                docs3.forEach(element3 => {
                                                    if(!element3.suspended)
                                                    { 
                                                        resArray.push({
                                                            title:element.title,
                                                            text:element.text,
                                                            bcolor:element.bcolor
                                                        })
                                                    }
                                                })
                                            })
                                        }
                                    })
                                })                                
                            }
                        }
                    }
                }                               
            });
            setTimeout(function(){ res.json({suc:true, posts:resArray}); }, 100);   //delay to resolve timing issue
        } else {
            res.json({suc:false});
        }
    });
});

/*--------------------------------------------------FUNCTIONS--------------------------------------------------*/

app.post("/login", (req, res) => {
    const db = new Datastore("db/users.db");
    db.loadDatabase();
    const un = req.body.username;
    const pw = req.body.password;
    if(un && pw){
        db.find({username:un}, (err, docs) => {
            if(docs.length === 1){
                const userRole =  docs[0].role;
                bcrypt.compare(pw, docs[0].password, (err2, result) => {
                    if(result){                                                 
                        req.session.userRole = userRole;
                        req.session.userid = docs[0]._id;
                        req.session.gr = docs[0].group;
                        req.session.un = docs[0].username;
                        req.session.revpost = 0;
                        req.session.isLoggedIn = true;
                        if(userRole === "admin") {
                            res.json({suc:true, redirect:"admin"})  //login to admin page
                        } else if(userRole === "mod"){
                            res.json({suc:true, redirect:"mod"})    //login to mod page
                        } else if(userRole === "user"){
                            res.json({suc:true, redirect:"user"})   //login to user page
                        }
                    } else { res.json({suc:false}); }
                })
            } else { res.json({suc:false}); }
        })
    } else { res.json({suc:false}); }
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
});

app.post("/changepw", (req, res) => {
    const db = new Datastore("db/users.db");
    db.loadDatabase();
    const old_pw = req.body.old_password;
    const new_pw_1 = req.body.new_password_1;
    const new_pw_2 = req.body.new_password_2;
    if(old_pw && (new_pw_1 === new_pw_2)){
        db.find({_id:req.session.userid}, (err, docs) => {
            if(docs.length === 1){
                bcrypt.compare(old_pw, docs[0].password, (err2, result) => {
                    if(result){                                        
                        bcrypt.hash(new_pw_1, 10, (err3, hash) => {         
                            db.update({_id: docs[0]._id}, {$set: {password: hash}}, (err4, num) =>{
                                res.json({suc:true});
                            });
                        })
                    } else { res.json({suc:false}); }
                })
            } else { res.json({suc:false}); }
        })
    } else { res.json({suc:false}); }
})

app.post("/newmod", (req, res) => {
    if(req.session.isLoggedIn && req.session.userRole === "admin"){
        const nun = req.body.username;
        const nemail = req.body.email;
        const db = new Datastore("db/users.db");
        db.loadDatabase();
        db.find({username:nun}, (err, docs) => {
            if(docs.length === 0){
                db.find({email:nemail}, (err2, docs2) => {
                    if(docs2.length === 0){
                        bcrypt.hash(nun, 10, (err3, hash) => {
                            db.insert({email: nemail, 
                                username: nun,
                                password: hash, 
                                role: "mod", 
                                suspended: false
                            }, (err4, doc) => {
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

app.post("/newuser", (req, res) => {
    if(req.session.isLoggedIn && req.session.userRole === "mod"){
        const nun = req.body.username;
        const nemail = req.body.email;
        const db = new Datastore("db/users.db");
        db.loadDatabase();
        db.find({username:nun}, (err, docs) => {
            if(docs.length === 0){
                db.find({email:nemail}, (err2, docs2) => {
                    if(docs2.length === 0){
                        bcrypt.hash(nun, 10, (err3, hash) => {
                            db.insert({
                                email: nemail, 
                                username: nun, 
                                password: hash, 
                                role: "user", 
                                group: req.session.userid, 
                                suspended: false
                            }, (err4, doc) => {
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
            text:req.body.text,
            bcolor:req.body.bcolor
        }, (err, doc) => {
            res.json({suc:true});
        });
    }
});

app.post("/toggleSus", (req, res) => {
    if(req.session.isLoggedIn && (req.session.userRole === "admin" || req.session.userRole === "mod")){
        const db = new Datastore("db/users.db");
        db.loadDatabase();
        db.find({username:req.body.username}, (err, docs) => { 
            if(docs.length === 1) {
                var now = !docs[0].suspended;
                db.update({_id: docs[0]._id}, {$set: {suspended: now}}, (err2, num) =>{
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

app.post("/toggleShow", (req, res) => {
    if(req.session.isLoggedIn && (req.session.userRole === "mod" || req.session.userRole === "admin")){
        const db = new Datastore("db/posts.db");
        db.loadDatabase();
        db.find({_id:req.body.postid}, (err, docs) => { 
            if(docs.length === 1) {
                var now = !docs[0].showpost;
                db.update({_id: docs[0]._id}, {$set: {showpost: now}}, (err2, num) =>{
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
    if(req.session.isLoggedIn && req.session.userRole === "admin") {
        const db = new Datastore("db/users.db");
        db.loadDatabase();
        db.find({username:req.body.username}, (err, docs) => { 
            if(docs.length === 1) {
                deleteMod(docs[0]._id);
                setTimeout(function(){ res.json({suc:true}); }, 100);   //delay to resolve timing issue
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
                deleteUser(docs[0]._id);
                setTimeout(function(){ res.json({suc:true}); }, 100);   //delay to resolve timing issue
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
                deletePost(docs[0]._id);
                setTimeout(function(){ res.json({suc:true}); }, 100);   //delay to resolve timing issue
            } else {
                res.json({suc:false});
            }
        })
    } else {
        res.json({suc:false});
    }
});

/*--------------------------------------------------FUNCTIONS--------------------------------------------------*/

function deleteMod(modID){
    const db_users = new Datastore("db/users.db");
    db_users.loadDatabase();
    db_users.find({group:modID}, (err, docs) => {
        docs.forEach(element => {
            deleteUser(element._id);
            if(docs.indexOf(element) === docs.length-1)
                db_users.find({_id:modID}, (err2, docs2) => {
                    console.log("deleted mod: ", docs2[0]._id);
                    db_users.remove({_id: docs2[0]._id});
                })
        });
    })
}

function deleteUser(userID){
    const db_posts = new Datastore("db/posts.db");
    db_posts.loadDatabase();
    db_posts.find({creatorId:userID}, (err, docs) => {
        docs.forEach(element => {
            deletePost(element._id);
        });
    })
    const db_users = new Datastore("db/users.db");
    db_users.loadDatabase();
    db_users.find({_id:userID}, (err, docs) => {
        console.log("deleted user: ", docs[0]._id);
        db_users.remove({_id: docs[0]._id})

    })
}

function deletePost(postID){
    const db_posts = new Datastore("db/posts.db");
    db_posts.loadDatabase();
    db_posts.find({_id:postID}, (err, docs) => {
        console.log("deleted post: ", docs[0]._id);
        db_posts.remove({_id: docs[0]._id});
    })
}