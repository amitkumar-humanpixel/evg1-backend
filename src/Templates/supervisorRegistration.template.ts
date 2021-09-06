export function mailTemplateForSupervisorRegistor(
  reciverFirstName: string,
  reciverLastName: string,
  senderFirstName: string,
  senderLastName: string,
  email: string,
  firstName: string,
  lastName: string,
) {
  const template = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
    
      <body>
        <div style="width: 100%; height: 100%; box-sizing: border-box">
          <table
            style="
              width: 100%;
              height: 100%;
              border-collapse: separate;
              border-spacing: 0 0.5em;
            "
          >
            <tr style="vertical-align: top">
              <td>
                Hi ${reciverFirstName} ${reciverLastName},<br /><br />
                You have got this new request to add supervisor into the system from
                ${senderFirstName} ${senderLastName}. Please find the following details:<br><br>
                First Name : ${firstName}<br>
                Last Name : ${lastName}<br>
                Email : ${email}
              </td>
            </tr>
          </table>
        </div>
      </body>
    </html>`;
  return template;
}
