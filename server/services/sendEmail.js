require('dotenv').load();
const nodemailer = require('nodemailer');
const emailStyles = `
<style>
	@import url('https://fonts.googleapis.com/css?family=Work Sans:400,700');
	.emailContainer h2 {
		font-family: 'Work Sans', 'Lato','Helvetica Neue', 'Arial', 'Helvetica',sans-serif;
		font-size: xx-large;
	}
	.emailContainer p {
    line-height: 20px;
    color: #5c5c5c;
	}
	.emailContainer {
		max-width: 500px;
		margin: 0 auto;
		text-align: center;
		font-family: 'Work Sans', 'Lato','Helvetica Neue', 'Arial', 'Helvetica',sans-serif;
	}
	.btn {
		background-color: rgb(113, 106, 202);
		border: 1px solid rgb(113, 106, 202);
		border-radius: 4px;
		color: rgb(255, 255, 255);
		cursor: pointer;
		display: inline-block;
		font-family: "Work Sans", sans-serif;
		font-size: 14px;
		height: 32px;
	}
	.btn:hover {
		color: #fff;
		background-color: #9992d6;
		border-color: #9992d6;
	}
</style>
`

/*
example synxtax
from: '"Our Code World " <myzoho@zoho.com>', // sender address (who sends)
to: 'mymail@mail.com, mymail2@mail.com', // list of receivers (who receives)
subject: 'Hello ', // Subject line
text: 'Hello world ', // plaintext body
html: '<b>Hello world </b><br> This is the first email sent with Nodemailer in Node.js' // html body
*/

exports.sendEmail = async ({from, to, subject, text, html}) => {
  return new Promise((resolve,reject) => {
    // Create the transporter with the required configuration for Gmail
    // change the user and pass !
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true, // use SSL
      auth: {
          user: 'noreply@stocktd.com',
          pass: process.env.EMAIL_KEY,
      }
    });

    // setup e-mail data, even with unicode symbols
    const config = {
      from: `"Stocktd " <noreply@stocktd.com>`,
      to,
      subject,
      text,
      html: `
				<html>
				  <head>
						${emailStyles}
				  </head>
				  <body>
				    ${html}
				  </body>
				</html>
			`,
    };
    console.log(config)

    // send mail with defined transport object
    transporter.sendMail(config, function(error, info){
        if(error){
          console.log(error);
          reject(error);
        }
        console.log('Message sent');
        resolve(info.response)
    });
  })
}
