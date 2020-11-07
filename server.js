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
    if(req.session.isLoggedIn){
        console.log(req.session.userRole);
        res.sendFile(__dirname + '/public/admin-login.html')
    } else {
        req.session = null;
        res.redirect("/");
    }
});

app.get("/user-login", (req, res) => {

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
                    if(result){ 
                        req.session.userRole = userRole;
                        req.session.isLoggedIn = true;
                        if(userRole === "admin") {
                            res.json({suc:true, redirect:"admin"})
                        } else {
                            res.json({suc:true, redirect:"user"})
                        }
                    } else { res.json({suc:false}); }
                })
            } else { res.json({suc:false}); }
        })
    } else { res.json({suc:false}); }
});

/*first user Setup in db
app.get("/newuser", (req, res) => {
    const db = new Datastore("db/users.db");
    db.loadDatabase();
    bcrypt.hash("admin", 10, (err, hash) => {
        console.log(err);
        console.log(hash);
        db.insert({email: "admin@email.fu", username: "admin", password: hash, role: "admin"}, (err, doc) => {console.log(doc)})
    });
})*/

app.listen(8080, () => {
    console.log("Sever online on port 8080.");
})