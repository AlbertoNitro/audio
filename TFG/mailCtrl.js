// Definimos un controlador mailCtrl.js que exporte un método sendEmail:
var nodemailer = require('nodemailer'); // email sender function 
exports.sendEmail = function(req, res){
    // nodemailer stuff will go here
};
// Para enviar un email, primero debemos definir un transporter. 
// Lo haremos de la siguiente manera, sustituyendo los datos por los de nuestra 
// cuenta gmail:
var transporter = nodemailer.createTransport({
       service: 'Gmail',
       auth: {
           user: 'GeniusSorting@gmail.com',
           pass: 'cubay6cubay6'
       }
});
// Ahora que ya tenemos el transporter, definiremos el propio email:
var mailOptions = {
       from: 'Genius Sorting',
       to: 'albertojgm@yahoo.es',
       subject: 'Te han invitado ha realizar un CARD SORTING',
       text: 'Hola, tu amigo te ha invitado para que realices un proceso de card sorting...'
};
// y ya sólo nos queda enviar el email!
transporter.sendMail(mailOptions, function(error, info){
    if (error){
        console.log(error);
        res.send(500, err.message);
    } else {
        console.log("Email sent");
        res.status(200).jsonp(req.body);
    }
});