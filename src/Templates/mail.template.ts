export function mailTemplate(
  email: string,
  practice_name: string,
  event_name: string,
  first_name: string,
  last_name: string,
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
                      Hi ${first_name} ${last_name},<br><br>
                      Please be aware that the Reaccreditation form for ${practice_name} requires your attention to
                      complete ${event_name}.
                      To Access the form follow this <a href="${link}" target="_blank">Click here</a>, and log in with your Okta Credentials.
                  </td>
              </tr>
          </table>
      </div>
  </body>
  
  </html>`;
  return template;
}
