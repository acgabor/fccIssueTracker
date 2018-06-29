/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
//var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
var db=require('../db.js');
//var mongoose=require('mongoose');
var Project=db.Project

module.exports = function (app) {
  app.route('/api/issues/:project')
  
  .get(function (req, res){
    var project = req.params.project;
    var queryObj = req.query;
    queryObj['projectName']=project;
    Project.find(queryObj,{"projectName":0,"__v":0},function (err,data){
      if(err) return err;
      res.json(data)
    });
  })

  .post(function (req, res){
    var projectName = req.params.project;
    var issue_title=req.body.issue_title;
    var issue_text=req.body.issue_text;
    var created_by=req.body.created_by;
    if (!issue_title || !issue_text || !created_by){
      res.send('missing inputs');
    }
    var project = new Project({'issue_title':issue_title,
                          'issue_text': issue_text,
                          'created_by':created_by,
                          'assigned_to':req.body.assigned_to || "",
                          'status_text':req.body.status_text || "",
                          'projectName':projectName,
                         })
    project.save(function (err,data) {
      if (err) return err;
      console.log('New data saved.');
      res.json(data)
      Project.find().sort({"_id":-1}).limit(10).exec(function(err,data){
        var lastID=data[data.length-1]['_id'];
        Project.remove({_id:{$lt:lastID}},function(err,data){
          if(err) return err;
          console.log('Old data removed.');
        });
      });
    });
  })
  .put(function (req, res){
    var project = req.params.project;
    var id=req.body._id;
    
    if (JSON.stringify(req.body) == "{}"){
      res.send('no updated field sent')
    }else{
      var changeObj={'open':req.body.open,'update_on':Date.now()}
      var issue_title=req.body.issue_title;
      if (issue_title!=""){
        changeObj['issue_title']=issue_title;
      }
      var issue_text=req.body.issue_text;
      if (issue_text!=""){
        changeObj['issue_text']=issue_text;
      }
      var created_by=req.body.created_by;
      if (created_by!=""){
        changeObj['created_by']=created_by;
      }
      var assigned_to=req.body.assigned_to;
      if (assigned_to!=""){
        changeObj['assigned_to']=assigned_to;
      }
      var status_text=req.body.status_text;
      if (status_text!=""){
        changeObj['status_text']=status_text;
      }
      
      Project.findOneAndUpdate({'_id':id},changeObj,{new:true},function (err,data){
        if(err){
          res.send('could not update ' + id)
        }else{
          res.send('successfully updated')
        };
      });
    }
  })
  .delete(function (req, res){
    var project = req.params.project;
    var id=req.body._id;
    if (!id){
      res.send('_id error')
    }else{
      Project.findByIdAndRemove({'_id':id},function (err,data){
        if (err){
          res.send('could not delete '+ id)
        }else{
          res.send('deleted '+ id)
        }
      });
    }
  });
  
};

  


