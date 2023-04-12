const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoose = require("mongoose");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const nodemailer = require("nodemailer");
const badWordChecker = require("badwords-js-from-csv");
require("dotenv").config({ path: __dirname + "/.env" });

const app = express();
const PORT = 3360;

mongoose.connect("mongodb://127.0.0.1:27017/campusJournal");


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: ['application/json', 'text/plain'] }))
app.set("view engine", "ejs");
app.use("/", express.static(__dirname + '/public'));

app.use(session(
    {
        secret: "MyLittleSecret1231234249872492982389478926",
        saveUninitialized: false,
        resave: false
    }
));

const articleSchema = {
    author: String,
    name: String,
    content: Object,
    Journal: String,
    image: String
};

const Article = new mongoose.model("article", articleSchema);


const userSchema = new mongoose.Schema({
    username: String,
    fullname: String,
    password: String
});


const User = new mongoose.model("user", userSchema);

const commentSchema = new mongoose.Schema({
    user: String,
    comment: String,
    article: String,
});

const Comment = new mongoose.model("comment", commentSchema);

app.get("/", (req, res) => {
    res.render("login")
});
app.post("/login", (req, res) => {

    User.findOne({ username: req.body.email }).then((foundUser) => {
        if (foundUser) {
            if (foundUser.password === req.body.password) {
                req.session.email = req.body.email
                res.redirect("/journals");
            }
        } else {
            res.send("Wrong Password try again!");
        }

    })
});

app.get("/journals", (req, res) => {
    if (req.session.email) {
        res.render("journals");
    }
    else {
        res.redirect("/");
    }
})


app.get("/register", (req, res) => {
    res.render("register")
});

app.post("/register", (req, res) => {

    User.findOne({ username: req.body.email }).then((foundUser) => {
        if (foundUser) {
            res.send("An error occured make sure u never created an account")

        } else {
            const user = new User({
                username: req.body.email,
                fullname: req.body.fullname,
                password: req.body.password
            })
            req.session.email = req.body.email
            user.save()
            // send email to show user they registered
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth:{
                    user: "",
                    pass: ""
                }
            });

            const mailOptions = {
                from: "tynoemaisyry@gmail.com",
                to: req.body.email,
                subect: "Registery conformation",
                text: "Welcome To Campus Journal Lets continue to spread knowledge and enlighten the world!"

            }

            transporter.sendMail(mailOptions,(error,info)=>{
                if(error){
                    console.log(error);
                }
            })

            res.redirect("/journals");
        }
    })

})
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/")
})


app.get("/articles/:journal", (req, res) => {

    const journal = _.capitalize(req.params.journal);

    Article.find({ Journal: journal }).then((foundArticles) => {
        res.render("articles", { foundArticles, journalName: journal, user: false })
    })

});

app.get("/article/:id", (req, res) => {
    const id = req.params.id

    Article.findOne({ _id: id }).then((article) => {
        res.render("article", { article });
    });

});

app.get("/compose-setup", (req, res) => {
    if (req.session.email) {
        res.render("compose_setup");
    } else {
        res.redirect("/")
    }

});



app.post("/compose", (req, res) => {
    res.render("compose", { title: req.body.articleName, journal: req.body.journal })
});

app.post("/comments", (req, res) => {

    if (req.session.email) {

        (async () => {
            const user = (await findUserFullName(req.session.email))
            const comment = new Comment({
                user: user,
                comment: req.body.comment,
                article: req.body.articleID
            })

            comment.save();
            res.send("200");


        })()
    } else {
        res.redirect("/");
    }




});

app.get("/comments/:articleID", (req, res) => {
    Comment.find({ article: req.params.articleID }).then((foundComments) => {
        res.send(foundComments);
    })
})

app.post("/image", (req, res) => {
    res.render("add_image", { id: req.body.id });
})

app.post("/image/:id", (req, res) => {
    form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        const oldpath = files.filetoupload.filepath;
        const newpath = __dirname + "/public/images/" + files.filetoupload.originalFilename;
        fs.rename(oldpath, newpath, function (err) {
            if (err) {
                res.send("err");
            } else {
                Article.findOneAndUpdate({ _id: req.params.id }, { image: files.filetoupload.originalFilename }, { new: true }).then((article) => {
                    res.redirect("/journals");
                })
            }
        })
    })
});

app.post("/savepost", (req, res) => {
    const isProfane = checkForBadWord(req.body.articleContent);

    (async () => {
        const author = await findUserFullName(req.session.email)

        if (!isProfane) {
            const article = new Article({
                author: author,
                name: _.capitalize(req.body.articleName),
                content: (req.body.articleContent),
                Journal: _.capitalize(req.body.journalName),
            })
            article.save();
            res.send({ id: article._id, isProfane })
        } else {
            res.send({ isProfane: isProfane })
        }
    })()



})

app.post("/search", (req, res) => {
    Article.find({ name: { $regex: _.capitalize(req.body.search), $options: "i" } }).then((foundArticles) => {
        res.render("articles", { foundArticles, journalName: req.body.search, user: false })
    })
})


app.get("/myarticles", (req, res) => {
    if (req.session.email) {

        (async () => {
            const author = await findUserFullName(req.session.email);

            Article.find({ author: author }).then((foundArticles) => {
                res.render("articles", { foundArticles, journalName: "Your Articles", user: true })
            })

        })()
    } else {
        res.redirect("/")
    }
})

app.get("/delete/:id", (req, res) => {
    Article.deleteOne({ _id: req.params.id }).then((cnt) => {
        res.redirect("/myarticles")
    })
})

app.get("/update/:id", (req, res) => {
    Article.findOne({ _id: req.params.id }).then((foundArticle) => {
        res.render("update", { foundArticle: JSON.stringify(foundArticle.content), id: req.params.id })
    })
})

app.post("/updatepost", (req, res) => {

    const isProfane = checkForBadWord(req.body.articleContent)

    if (!isProfane) {
        Article.findOneAndUpdate({ _id: req.body.articleId }, { content: req.body.articleContent }).then((article) => {

        });
    }
    res.send({ isProfane: isProfane });

})

app.get("/isprofane", (req, res) => {
    res.render("profane");
})

function checkForBadWord(editorData) {
    let result = false
    editorData.blocks.forEach((block) => {
        const words = block.data.text.split(" ")
        words.forEach((word) => {
            if (badWordChecker.isProfane(word)) {
                result = true
            }
        })
    });
    return result;

}

const findUserFullName = async (email) => {
    const response = await User.findOne({ username: email })
    return response.fullname
}

app.listen(PORT, () => {
    console.log("Server successfully running on port 3360!")
});
