// call all the required packages
const express = require('express')
const bodyParser= require('body-parser')
const multer = require('multer');
const app = express();
app.use(bodyParser.urlencoded({extended: true}))
const mongoose = require('mongoose');
const dbConfig = 'mongodb://127.0.0.1:27017/Image';
const db = mongoose.connection;

mongoose.Promise = global.Promise;
mongoose.connect(dbConfig, { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => {
  console.log("Connected to dbs.");
}).catch(err => {
  console.log('Cannot connect to dbs.', err);
  process.exit();
});
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

 
app.get('/',function(req,res){
    res.sendFile(__dirname + '/index.html');
   
  });

  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
  })
   
  var upload = multer({ storage: storage })


  app.post('/uploadfile', upload.single('myFile'), (req, res, next) => {
    const file = req.file
    if (!file) {
      const error = new Error('Please upload a file')
      error.httpStatusCode = 400
      return next(error)
    }
      res.send(file)
    
  })

  app.post('/uploadmultiple', upload.array('myFiles', 12), (req, res, next) => {
    const files = req.files
    if (!files) {
      const error = new Error('Please choose files')
      error.httpStatusCode = 400
      return next(error)
    }
   
      res.send(files)
    
  })

  app.post('/uploadphoto', upload.single('picture'), (req, res) => {
    var img = fs.readFileSync(req.file.path);
 var encode_image = img.toString('base64');
 // Define a JSONobject for the image attributes for saving to database
  
 var finalImg = {
      contentType: req.file.mimetype,
      image:  new Buffer(encode_image, 'base64')
   };
db.collection('quotes').insertOne(finalImg, (err, result) => {
    console.log(result)
 
    if (err) return console.log(err)
 
    console.log('saved to database')
    res.redirect('/')
   
     
  })
})

app.get('/photos', (req, res) => {
    db.collection('mycollection').find().toArray((err, result) => {
     
          const imgArray= result.map(element => element._id);
                console.log(imgArray);
     
       if (err) return console.log(err)
       res.send(imgArray)
     
      })
    });
app.listen(3000, () => console.log('Server started on port 4000'));