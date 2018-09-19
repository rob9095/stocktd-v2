require('dotenv').load();
const nodemailer = require('nodemailer');
const emailStyles = `
<style>
	@import url('https://fonts.googleapis.com/css?family=Lato:400,700');
	.emailVerifyContainer h2 {
		font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;
		font-size: xx-large;
	}
	.emailVerifyContainer p {
    line-height: 30px;
    color: #5c5c5c;
    font-size: 16px;
	}
	.emailVerifyContainer {
		max-width: 500px;
		margin: 0 auto;
		text-align: center;
	}
	.ui.teal.button {
			background-color: #3fd1c4;
			color: #fff;
			text-shadow: none;
			background-image: none;
			font-size: 1.42857143rem;
			box-shadow: 0 0 0 0 rgba(34,36,38,.15) inset;
			border: 1px solid #3fd1c4;
			border-radius: 5px;
			cursor: pointer;
			font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;
			padding: .78571429em 1.5em .78571429em;
			font-weight: 700;
			font-size: large;
	}
	.ui.teal.button:hover {
		background-color: #28cec0 !important;
		cursor: pointer !important;
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
