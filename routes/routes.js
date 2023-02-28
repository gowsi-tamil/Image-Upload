const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer'); 
const fs = require('fs');  

var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './public/uploads');
    },
    filename:  function(req, file, cb){
        cb(null, file.fieldname + '_' + Date.now() + '_' + file.originalname );
    }
})

//middleware
var upload = multer({
    storage: storage,
}).single('image')  

router.post('/add', upload, (req, res)=> {

    if(req.file && !['image/png', 'image/jpeg'].includes(req.file.mimetype)) {
        return res.json({ message: 'Invalid image format. Only PNG and JPEG images are allowed.', type: 'danger' });
    }
    const user = new User({
        name: req.body.name,   
        image: req.file.filename,
    });

    user.save((err)=> {
        if(err){
            res.json({ message: err.message, type: 'danger' });
        }else{
            req.session.message ={
                type: 'success', 
                message: 'image added successfully!',
            };
        }
        console.log(req.session)
        res.redirect('/')
    })
})

//Get all users route
router.get('/', (req, res)=>{
    User.find().exec((err, users)=>{
        if(err){
            res.json({message: err.message});
        }else{
            res.render('index', {title: 'Home Page', users: users})
        }
    })
})

router.get('/add',  (req, res)=>{
    res.render('add_users', {title: 'Add Users'})
})

router.get('/edit/:id', (req, res)=> {
    let id = req.params.id;
    User.findById(id, (err, user)=> {
        if(err){
            res.redirect('/');
        }else {
            if (user == null){
                res.redirect('/')
            }else{
                res.render('edit_users', {title: 'Edit User', user: user})
            }
        }
    })
})

//Update user route
router.post('/update/:id', upload, (req, res)=>{
    let id = req.params.id;
    let new_image = '';

    if(req.file){
        new_image = req.file.filename; 
        try{
            fs.unlinkSync('./public/uploads/' + req.body.old_image); 
        } catch(err){
            console.log(err)
        }
    }else{
        new_image = req.body.old_image;  //means we are not changing the old image
    }

    User.findByIdAndUpdate(id, {
        name: req.body.name,
        image: new_image,
    }, (err, result)=>{
        if(err){
            res.json({message: err.message, type: 'danger'});
        }else{
            req.session.message = {
                type: 'success',
                message: 'User updated successfully',
            };
            res.redirect('/');
        }
    });
});



router.get('/countImages', (req, res) => {
    let pngCount = 0;
    let jpegCount = 0;

    fs.readdirSync('./public/uploads').forEach(file => {
        const extension = file.split('.').pop().toLowerCase();
        if (extension === 'png') {
            pngCount++;
        } else if (extension === 'jpeg' || extension === 'jpg') {
            jpegCount++;
        }
    });

    res.render('countImages', {
        title: 'Number of PNG and JPEG Images',
        pngCount: pngCount,
        jpegCount: jpegCount
    });
});



//delete user route
router.get('/delete/:id', (req, res)=>{
    let id = req.params.id;
    User.findByIdAndRemove(id, (err, result)=> {
        if(result.image != ''){
            try{
                fs.unlinkSync('./public/uploads/'+result.image);  //remove the image of the delete record
            }catch(err){
                console.log(err);
            }
        }

        if(err){
            res.json({message:err.message})
        }else{
           req.session.message ={
            type: 'info',
            message: 'image deleted successfully',
           };
           res.redirect('/') 
        }

    })
})

module.exports = router;