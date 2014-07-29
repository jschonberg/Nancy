// load all the things we need
var nodemailer = require('nodemailer');
var mongoose = require('mongoose');
var configDB = require('../config/database.js');
mongoose.connect(configDB.url); // connect to configDB

var Mailgun = require('mailgun').Mailgun;

var Notification = require('./models/notification.js');
var User         = require('./models/user.js');
var Schedule     = require('../config/schedule.js');
var CronJob      = require('cron').CronJob;


var job = new CronJob({
  cronTime: '*/5 * * * * *',     // Runs every minute
  onTick: function() {
    console.log("Today is", new Date());
    var today = new Date();
    today.setMilliseconds(00);
    today.setSeconds(00);
    today.setMinutes(00);
    today.setHours(00);

    var tomorrow = new Date();
    tomorrow.setMilliseconds(00);
    tomorrow.setSeconds(00);
    tomorrow.setMinutes(00);
    tomorrow.setHours(00);
    tomorrow.setDate(today.getDate()+1);

    //For each notification set for today, send an email
    Notification.find({nextSend : {$gt:today.toISOString(), $lt:tomorrow.toISOString()}}, function(err, notification){
      if(err){
        throw err;
      }
      if(!notification){
        console.log("No notifications found for date range", today.toISOString(), " to ", tomorrow.toISOString());
      }
      else{
        notification.forEach(function(not){
        
          User.findOne({_id : not.userId}, function(err, user){
            if(err){
              throw err;
            }
            if(!user){
              console.log("No user found for notification with ID: ", not._id);
            }
            else{
              // Found a notification and a user for it. Construct and send the email
              var msg = new Mailgun('key-ee06df25b9f0589582b77316849e2e13');
              msg.sendText('example@example.com', user.local.email,
                           not.name,
                           "Don't forget to reach out to " + not.name + " @ " + not.contactInfo,
                           function(err) {
                            if(err){
                              console.log('Oh noes: ' + err);
                            }
                            else{
                              not.previousSends.push(new Date(not.nextSend));
                              not.nextSend.setDate(not.nextSend.getDate() + not.frequency);
                              not.markModified('nextSend');
                              console.log('Email send success!');
                              console.log(not);
                              not.save(function(err) {
                                if (err) throw err;
                                else console.log("Next send update success!");
                              });
                            }
                          });
            }
          });
        });
      }
    });
  },
  start: true,
});
