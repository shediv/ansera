const mongoose = require("mongoose");

const User = require("../model/userModel");

//function to view index page
async function home(req, res) {
  res.render("login");
}

//login function
async function login(req, res) {
  let data = req.body;
  try {
    let user = await User.findOne({ "email": data.email, "password": data.password }).exec();
    if (user) {
      res.redirect('../listuser');
    } else {
      var errMsg = "login was unsuccessfull please try again";
      res.render("login", { err: errMsg });
    }
  } catch (e) {
    var errMsg = "login was unsuccessfull please try again";
    res.render("login", { err: errMsg });
  }
}

//function to add user
async function addUser(req, res) {
  let data = req.body;
  //console.log("req.body = ", req);


  try {
    var userData = new User(data);
      console.log("userData = ", userData);
    let user = await userData.save();
    res.redirect('../listuser');
  } catch (e) {
    var errMsg = "There was Error " + e + "\n";
    res.render("newMenu", { err: errMsg });
  }
}

//function to list user
async function profile(req, res) {
  let query = { $and: [] };
  query.$and.push({ status: "active" });

  try {
    let list = await User.find(query).exec();
    res.render("listuser", { list: list });
  } catch (e) {
    var errMsg = "There was Error " + err + "\n";
    res.render("listuser", { err: errMsg });
  }
}

//function delete user
async function removeUser(req, res) {
  let id = req.params.id;
  try {
    let task = await User.findOneAndUpdate({ _id: id }, { $set: { status: 'deleted' } }, { new: true }).exec();
    res.redirect('../listuser');
  } catch (e) {
    var errMsg = "There was Error " + err + "\n";
    console.log(errMsg);
  }
}

async function getUser(req, res) {
  res.render("newUser");
}

module.exports = {
  getUser,
  addUser,
  profile,
  removeUser,
  home,
  login

};
