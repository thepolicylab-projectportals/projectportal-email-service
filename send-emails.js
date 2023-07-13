const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { document } = (new JSDOM(`...`)).window;
const nodemailer = require("nodemailer");

export function sendStaleMail(jsonArr, to) {

    const today = new Date();
    const greetingDiv = document.createElement("div");
    const projectDiv =  document.createElement("div");
    const endingDiv =  document.createElement("div");

    let numberStales = 0;

    for (let i = 0; i < (jsonArr).length; i++) {

        let status = jsonArr[i].status;
        let closeDate = Date.parse(jsonArr[i].opportunityCloses);
        let startDate = Date.parse(jsonArr[i].startDate);
        let endDate = Date.parse(jsonArr[i].endDate);
        let modifyDate = Date.parse(jsonArr[i].lastModified);

        let problems = [];

        switch (status) {
            default:
                break;
            case "open":
                if (closeDate < today){
                    problems.push("The opportunity date has passed, but project is marked open.");
                }
                if (startDate < today){
                    problems.push("The start date has passed, but project is marked open.");
                }
                if((today - modifyDate) > 90){
                    problems.push("It has been over 90 days since project's last modification.");
                }
                if (endDate < today){
                    problems.push("The project has ended, but is marked as open.");
                }
                break;
            case "ongoing":
                if((today - modifyDate) > 90){
                    problems.push("It has been over 90 days since project's last modification.");
                }
                if (endDate < today){
                    problems.push("The project has ended, but is marked as ongoing.");
                }
                break;
        }

        if (problems.length > 0){
            addElement(`Project Title: ${jsonArr[i].title}`, projectDiv);
            addElement(`Contact Name: ${jsonArr[i].mainContact.name}`, projectDiv);
            addElement(`Contact Email: ${jsonArr[i].mainContact.email}`, projectDiv);
            addElement(`URL: ${site}/${jsonArr[i].slug}`, projectDiv);
            addElement(`Possible Problems: ${problems.join(' ')}`, projectDiv);
            projectDiv.append(document.createElement("br"));
            numberStales++;
        }

    }

    addElement("Hello!", greetingDiv);
    greetingDiv.append(document.createElement("br"));

    let body = `${greetingDiv.outerHTML}${projectDiv.outerHTML}${endingDiv.outerHTML}`
    if (numberStales > 0){
        addElement("Please reach out to the appropriate contacts for the following projects and confirm that the information within its CMS site is not out-of-date.", greetingDiv);
        greetingDiv.append(document.createElement("br"));
    } else {
        addElement("All good here! No projects seem to be out-of-date.", greetingDiv);
        greetingDiv.append(document.createElement("br"));
    }
    sendNodeMail(to, "Project Portal Update: Out of Date Projects", body);

}

//function for new projs
export function sendNewMail(jsonArr, to, time) {
    // all emails need
    const greetingDiv = document.createElement("div");
    const projectDiv =  document.createElement("div");
    const endingDiv =  document.createElement("div");

    const dateOffset = (24*60*60*1000) * time;
    let dateLastSent = new Date();
    dateLastSent.setTime(dateLastSent.getTime() - dateOffset);

    const newProjects = jsonArr.filter(proj => Date.parse(proj.created) < dateLastSent);
    let numberNew = 0;

    for (let i = 0; i <= (newProjects).length; i++) {
        addElement(`Project Title: ${newProjects[i].title}`, projectDiv);
        addElement(`Contact Name: ${newProjects[i].mainContact.name}`, projectDiv);
        addElement(`Contact Email: ${newProjects[i].mainContact.email}`, projectDiv);
        addElement(`URL: ${site}/${newProjects[i].slug}`, projectDiv);
        addElement(`Possible Problems: ${problems.join(' ')}`, projectDiv);
        projectDiv.append(document.createElement("br"));
        numberNew++;

    }

    addElement("Hello!", greetingDiv);
    greetingDiv.append(document.createElement("br"));
    if (numberNew > 0){
        addElement(`Within the past ${time} days, the following projects have recently been added to the project portal.`, greetingDiv);
        greetingDiv.append(document.createElement("br"));

    } else {
        addElement(`No new projects have been added to the project portal in the past ${time} days.`);
        greetingDiv.append(document.createElement("br"));
    }

    let body = `${greetingDiv.outerHTML}${projectDiv.outerHTML}${endingDiv.outerHTML}`

    sendNodeMail(to, "Project Portal Update: New Projects", body);
}

// return to, subject, body

async function sendNodeMail(to, subject, body){

    // This smtp was set up by Brown OIT unix team -- this will only work on Brown internal network (such as BKE)
    // Auth not needed at this time
    let EMAIL_SMTP = "smtp://mail-relay.brown.edu:25";
    let transporter;
    // Initiate transporter
    if (EMAIL_SMTP !== undefined) {
        transporter = nodemailer.createTransport(EMAIL_SMTP);
    } else {
        let testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });
    }

    await transporter.sendMail({
        from: '"Brown Policy Lab" <no-reply@brown.edu>', // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        html: body, // html body
    });

}

function addElement(text, div) {

    const newContent = document.createElement("p");
    newContent.innerHTML = text;
    div.appendChild(newContent);
}