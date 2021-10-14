export function onFormReadyMailTemplate(
    email: string,
    practice_name: string,
    first_name: string,
    last_name: string,
    accredEndDate: string,
    link,
  ) {
    const template = `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    
    <body>
        <div style="width: 100%; height: 100%;
            box-sizing: border-box;">
            <table style="width: 100%; height: 100%; border-collapse: separate;
            border-spacing: 0 .5em;">
                <tr style="vertical-align: top;">
                    <td>
                        <p>Dear ${first_name} ${last_name},<p>
                        <p>EV records show that ${practice_name} has an EV accreditation expiry date of ${accredEndDate}.</p>
                        <p>EV have just implemented a new online application process for reaccreditation and your practice is one whose expiry date falls into the first batch to be processed.</p>
                        <p>This new process has streamlined many of the usual requirements and we hope you find it easy to use, but of course, please feel free to contact us if you need support and assistance.</p>
                        <p>To Access the form follow this <a href="${link}" target="_blank">Click here</a>, and log in with your Okta Credentials.</p>
                        <p>Unfortunately due to some issues in development, the form completion was delayed, which has resulted in less time than would usually be provided for this to be filled in.  Apologies for the inconvenience, but it is hoped that the delay has resulted in a quicker and easier experience for practices participating.</p>
                        <p>Completed application forms need to be received back here at EV no later than 29 October 2021 (earlier if possible).</p>
                        <p>The completed application will then be reviewed and processed by an Accreditor and submitted to the Accreditation Panel.   As part of the review, Accreditors may require time with the Practice Manager and/or Principal Educational Supervisor to discuss aspects of the application.  They will be in contact shortly to arrange a convenient time. </p>
                        <p>If the completed application is received after the date above, there may be insufficient time for the Accreditor to undertake a review before the date of the next Accreditation Panel and accordingly, accreditation for the practice will expire.   </p>
                        <p>In this event, registrars would not be able to work until the situation is resolved.</p>
                        <p>Please contact us at <a href='mailto:accreditation@evgptraining.com.au'>accreditation@evgptraining.com.au</a> if you have any questions.</p>
                        <p>Kind Regards</p>
                    </td>
                </tr>
            </table>
        </div>
    </body>
    
    </html>`;
    return template;
  }
  