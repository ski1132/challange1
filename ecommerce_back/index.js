var express = require("express");
var app = express();
const mongoose = require("mongoose");
var cors = require('cors')
app.use(cors())
var dateFormat = require('dateformat');
const bodyParser = require("body-parser");
app.use(bodyParser.json()); //ทำให้รับ json จาก body ได้
/*
  var localStorage = require('localStorage')
  , myValue = { foo: 'bar', baz: 'quux' }
  ;

  localStorage.setItem('myKey', JSON.stringify(myValue));
  myValue = localStorage.getItem('myKey');
*/
/////////////////////////////////// เพิ่มส่วนนี้ ////////////////////////////////////
const connect = `mongodb://localhost:27017/test_1?authSource=admin`;
mongoose.connect(connect, { useNewUrlParser: true });

var db = mongoose.connection;

db.on("connected", function() {
  console.log("connected");
});
const loginMiddleware = (req, res, next) => {
  console.log(req.body.username);
  if(req.body.username == "user" && 
     req.body.password == "name") next();
  else res.send("Wrong username and password") 
  //ถ้า username password ไม่ตรงให้ส่งว่า Wrong username and password
}

const Schema = mongoose.Schema;

const account_sche = new mongoose.Schema({
  id_owner: String,
  type: String,
  purpose: String,
  balance:Number
});
const personal_sche = new mongoose.Schema({
  id: String,
  name: String,
  lname: String,
  mname: String,
  home_phone: String,
  phone: String,
  email: String,
  address: String,
  SSN: String,
  password: String, 
  about_us: String
});
const transfer_sche = new mongoose.Schema({
  id_owner: String,
  id_transfer: String,
  amount  : Number,
  comment: String,
  date: String
});
//let user_test = mongoose.model("user", user_sche); //ในตาราง test_1
let personals = mongoose.model("personal", personal_sche); //ในตาราง student โครงสร้างเหมือนกับ student_sche
let transfers = mongoose.model("transfer", transfer_sche);//ในตาราง 
let accounts = mongoose.model("account", account_sche);//ในตาราง 

////////////////////////////// ถึงส่วนนี้ //////////////////////////////////////////
app.post("/", async (req, res) => {
  const stu = await personals.find({email:req.body.email,password:req.body.password});
  console.log("data => ", stu);
  res.json(stu);
});
app.post("/checkBalance",async (req, res) => {
  const jData = await accounts.find({id_owner:req.body.id});
  console.log("check balance data => ", jData);
  res.json(jData);
});
app.post("/checkMail",async  (req, res) => {
  const jData = await personals.find({email:req.body.email});
  if(jData)
    res.json(jData);
  else
  res.send("not found");
});
app.post("/test",async (req, res) => {
  const stu = await personals.find();
  var lastId = parseInt(stu[stu.length-1].id,10)+1;
  console.log("id => ", lastId);
});
app.post("/getHis",async (req, res) => {
  const jData = await transfers.find();
  res.json(jData);
});
app.post("/register",async (req, res) => {
  const stu = await personals.find();
  var lastId = parseInt(stu[stu.length-1].id,10)+1;
  personals.create({
    id: lastId,
    name: req.body.name,
    lname: req.body.lname,
    mname: req.body.mname,
    home_phone: req.body.home_phone,
    phone: req.body.phone,
    email: req.body.email,
    address: req.body.address,
    security_number: "",
    password: pass,
    about_us: req.body.about_us
  });
  accounts.create({
    id_owner: lastId,
    type: req.body.account_type,
    purpose: req.body.purpose,
    balance: 0
  });

  res.send("success");
});

app.post("/makeTrans", (req, res) => {
  transfers.create({
    id_owner: req.body.id_owner,
    id_transfer: req.body.id_transfer,
    amount: req.body.amount,
    comment:req.body.comment,
    date  :req.body.date
  });
  res.send("insert success");
    var total = req.body.balance-req.body.amount;
      accounts.findByIdAndUpdate(req.body.id_owner,{balance:total},{new:true},(err,data) =>{
        if(err) console(err);
      });
 
  res.send("success");
});

app.listen(5000, () => {
  console.log("server listening on port 5000");
});