require('dotenv').load();
const nodemailer = require('nodemailer');
const emailStyles = `
<style>
	@import url('https://fonts.googleapis.com/css?family=Lato:400,700');
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
align-items: center;
		background-color: rgb(113, 106, 202);
		border-bottom-color: rgb(113, 106, 202);
		border-bottom-style: solid;
		border-bottom-width: 1px;
		border-image-outset: 0;
		border-image-repeat: stretch;
		border-image-slice: 100%;
		border-image-source: none;
		border-image-width: 1;
		border-left-color: rgb(113, 106, 202);
		border-left-style: solid;
		border-left-width: 1px;
		border-right-color: rgb(113, 106, 202);
		border-right-style: solid;
		border-right-width: 1px;
		border-top-color: rgb(113, 106, 202);
		border-top-style: solid;
		border-top-width: 1px;
		box-shadow: rgba(0, 0, 0, 0.043) 0px 2px 0px 0px;
		box-sizing: border-box;
		border-radius: 4px;
		color: rgb(255, 255, 255);
		cursor: pointer;
		display: inline-block;
		font-family: "Work Sans", sans-serif;
		font-feature-settings: normal;
		font-size: 14px;
		font-variant: normal;
		font-variant-alternates: normal;
		font-variant-caps: normal;
		font-variant-east-asian: normal;
		font-variant-ligatures: normal;
		font-variant-numeric: normal;
		font-variant-position: normal;
		font-weight: 400;
		height: 32px;
		line-height: 20.9833px;
		list-style-image: none;
		list-style-position: outside;
		list-style-type: none;
		margin-bottom: 0px;
		margin-left: 0px;
		margin-right: 0px;
		margin-top: 0px;
		outline-color: rgb(255, 255, 255);
		outline-style: none;
		outline-width: 0px;
		overflow: visible;
		overflow-x: visible;
		overflow-y: visible;
		padding-bottom: 0px;
		padding-left: 15px;
		padding-right: 15px;
		padding-top: 0px;
		position: relative;
		text-align: center;
		text-shadow: rgba(0, 0, 0, 0.12) 0px -1px 0px;
		text-transform: none;
		touch-action: manipulation;
		transition-delay: 0s;
		transition-duration: 0.3s;
		transition-property: all;
		transition-timing-function: cubic-bezier(0.645, 0.045, 0.355, 1);
		white-space: nowrap;
		-moz-appearance: button;
		-moz-user-select: none;
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
