// load the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define the schema for our user model
var notificationSchema = new Schema({

    userId: String, // id of user who owns this notification
    name: String, // name of target person
    type: String, // "once" or "recurring"
    frequency: Number, // number of days between sends
    contactInfo: String, // field to enter contact method
                           // example: phone number or email address
    notes: String, //notes about person to contact
    nextSend: Date, // date of next scheduled send
    previousSends: [Date]

});

// methods =======================


// create the model for users and expose it to our app
module.exports = mongoose.model('Notification', notificationSchema);