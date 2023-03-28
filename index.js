const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");
const mongoose = require("mongoose");
const _ =require("lodash")

const app = express();
const PORT = 3306;

mongoose.connect("mongodb://127.0.0.1:27017/campusJournal",);


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({type: ['application/json', 'text/plain']}))
app.set("view engine", "ejs");
app.use("/", express.static(__dirname + '/public'));

app.use(session(
    {
        secret: "MyLittleSecret1231234249872492982389478926",
        saveUninitialized : false,
        resave: false
    }
));

app.use(passport.initialize());
app.use(passport.session())

const articleSchema = {
    name: String,
    content: Object,
    Journal: String
};

const Article = new mongoose.model("article", articleSchema);


const userSchema = new mongoose.Schema({
    email: String,
    fullname: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("user", userSchema);

// const commentSchema = new mongoose.Schema({
//     user : User,
//     comment : String,
//     article : Article,
// });

// const Comment = new mongoose.model("comment",commentSchema);


passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", (req, res) => {
    res.render("login")
});
app.post("/login", (req, res) => {

    User.findOne({ email: req.body.email }).then((foundUser) => {
        if (foundUser) {
            if (foundUser.password === req.body.password) {
                res.redirect("/journals");
            } else {
                // res.send("Wrong Password try again!");
                console.log(foundUser)
            }
        } else {
            redirect("/");
        }

    })
});

app.get("/journals", (req, res) => {
    res.render("journals");
})


app.get("/register", (req, res) => {
    res.render("register")
})

app.post('/register', function(req, res) {
    // User.register(new User({ username : req.body.email , fullname : req.body.fullname }), req.body.password, function(err,user) {
    //     if (err) {
    //         return res.redirect("/register");
    //     }
    //     });
        passport.authenticate("local")(req,res,()=>{
        res.redirect('/journals');
    });
  });


// app.post("/register", (req, res) => {

//     const user = new User({
//         email: req.body.email,
//         fullname: req.body.fullname,
//         password: req.body.password
//     })
//     user.save();
//     res.redirect("/journals");

// })


app.get("/articles/:journal", (req, res) => {

    const journal =  _.capitalize(req.params.journal);
    console.log(journal);

    Article.find({Journal : journal}).then((foundArticles) => {
        console.log(foundArticles);
        res.render("articles", {foundArticles,journalName : journal})
    })

});

app.get("/article/:id", (req, res) => {
    const id = req.params.id

    Article.findOne({_id:id}).then((article)=>{
        res.render("article",{article});
    });

});

app.get("/compose-setup", (req, res) => {
    res.render("compose_setup")
});



app.post("/compose", (req, res) => {
    res.render("compose", { title: req.body.articleName, journal: req.body.journal })
});

app.post("/comment",(req ,res) =>{

    const article = new Article();
    const user = new User();

    User.findOne({username:req.username}).then((foundUser)=>{
        user = foundUser;
    })

    Article.findOne({_id:req.id}).then((foundArticle)=>{
        article = foundArticle;
    });

    const comment = new Comment({
        user : user ,
        comment : req.comment,
        article : article
    })

    comment.save();
    res.send("200");

})

app.post("/savepost", (req, res) => {
    const article = new Article({
        name: _.capitalize(req.body.articleName),
        content: (req.body.articleContent),
        Journal: _.capitalize(req.body.journalName)
    })
    article.save();
    res.redirect("/journals");
})

app.listen(PORT, () => {
    console.log("Server successfully running on port 3306!")
});