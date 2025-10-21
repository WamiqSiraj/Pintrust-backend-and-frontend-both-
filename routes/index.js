var express = require('express');
var router = express.Router();
const passport = require('passport')
const localStrategy = require('passport-local')
const userModel = require('./users')
const postModel = require("./posts")
const upload = require("./multer")
passport.use(new localStrategy(userModel.authenticate()))

// Show single post
router.get('/post/:id', isLoggedIn, async (req, res) => {
  try {
    const post = await postModel.findById(req.params.id).populate("user");
    res.render("post", { post, user: req.user });
  } catch (err) {
    console.error(err);
    res.send("Post not found");
  }
});







router.post('/post/:id/like', isLoggedIn, async (req, res) => {
  const post = await postModel.findById(req.params.id);
  const userId = req.user._id.toString();

 
  const index = post.likes.findIndex(id => id.toString() === userId);

  if (index === -1) {
    post.likes.push(userId);  
  } else {
    post.likes.splice(index, 1);
  }

  await post.save();
  res.redirect(`/post/${req.params.id}`);
});


router.post('/post/:id/save', isLoggedIn, async (req, res) => {
  const user = await userModel.findById(req.user._id);
  const postId = req.params.id;

  const index = user.savedPosts.indexOf(postId);

  if (index === -1) {
    // not saved yet → save
    user.savedPosts.push(postId);
  } else {
    // already saved → unsave
    user.savedPosts.splice(index, 1);
  }

  await user.save();
  res.redirect(`/post/${req.params.id}`);
});



router.get('/feed', isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({ username: req.user.username });
  const posts = await postModel.find().populate("user")
  res.render("feed",{user, posts})
});


router.get('/edit', isLoggedIn ,async function(req, res){
const user = await userModel.findOne({username: req.user.username})
res.render("edit", {user})
})
router.post('/update',upload.single("file") ,isLoggedIn ,async function(req, res){
const user = await userModel.findOneAndUpdate({username: req.user.username},{username: req.body.username,fullname: req.body.fullname,bio: req.body.bio },{new: true})

if(req.file){
user.dp = req.file.filename;
await user.save()
}
res.redirect('/profile')
})




/*router.post('/editprofile',isLoggedIn , async function(req, res, next) {
const user = await userModel.findOne({username: req.user.username})
res.render("edit",{user})
});

router.post('/update',isLoggedIn , upload.array("file1","file2"), async function(req, res, next) {
const user = await userModel.findOneAndUpdate({username: req.user.username},{username:req.body.username, bio: req.body.bio, fullname: req.body.fullname},{new:true})
  user.dp = req.file.filename("file1")
  user.coverphoto = req.file.filename("file2")
  await user.save()
res.redirect("/profile")
});*/

router.get('/delete/:id', isLoggedIn, async function(req, res, next) {
  try {
    // Find and delete the post
    const post = await postModel.findByIdAndDelete(req.params.id);

    if (post) {
      // Remove post reference from the user
      await userModel.updateOne(
        { _id: req.user._id },
        { $pull: { posts: post._id } }
      );
    }

    res.redirect("/profile");
  } catch (err) {
    console.error(err);
    res.send("Error deleting post");
  }
});


router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/upload',isLoggedIn, upload.single("file"), async function(req, res, next) {
  if(!req.file){
    return res.send("Somting went wrong")
  }
  const user = await userModel.findOne({username: req.user.username })
  const post = await postModel.create({
    postText: req.body.filetext,
    user: user._id,
    image: req.file.filename
  })
  user.posts.push(post._id)
  await user.save()
  res.redirect("/profile")
});

router.get('/profile',isLoggedIn , async function(req, res, next) {
  const user = await userModel.findOne({username: req.user.username }).populate("posts")
  res.render('profile',{user});
});
router.get('/login', function(req, res, next) {
  res.render('login',{error: req.flash('error')});
});
router.get('/feed', function(req, res, next) {
  res.render('feed');
});

router.post('/register', function(req, res) {
  const {username, email, fullname} = req.body;
  const userdata = new userModel({
    username,
    email,
    fullname
  })
  userModel.register(userdata, req.body.password)
  .then(function(registeredUser){
    passport.authenticate("local" )(req, res ,function(){
      res.redirect('/profile')
    })
  })
});

router.post('/login', passport.authenticate("local",{
  successRedirect:"/profile",
  failureRedirect:"/login",
  failureFlash: true
}),function(req, res) {
});

router.get('/logout',isLoggedIn, function(req, res ,next){
  req.logout(function(err){
    if(err) {return next(err)}
      res.redirect("/login")
  })
})
function isLoggedIn(req, res, next){
  if(req.isAuthenticated())
  {
    return next()
  }
  res.redirect('/login')
}

module.exports = router;
