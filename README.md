# Corporate Compliance Training Portal (Azure)CORPORATE COMPLIANCE TRAINING PORTAL
Built for Microsoft Azure

WHAT THIS PROJECT IS
This is a web portal where employees complete mandatory compliance training. An employee signs in with their employee ID and password, sees which training modules are assigned to them, watches the training, takes a short quiz, and receives a certificate when they pass. Administrators can see how far each employee has progressed.
The portal has five screens:
Login. The employee enters their employee ID and password.
Dashboard. Shows a welcome message, the employee's profile, an overall progress bar, the list of assigned training modules with their status (Completed, In Progress or Not Started), upcoming deadlines and recent notifications.
Training. Shows one module with its video, a description, the learning objectives, a button to download a PDF resource, and a button to start the quiz.
Quiz. Five multiple-choice questions. The employee needs 60 percent or more to pass. After submitting, they see their score and whether they passed.
Certificate. A Certificate of Completion with the employee's name, the module, the date, the score and a unique certificate ID. It can be printed or saved as a PDF from the browser.
An Admin screen is also included. It shows how many employees are assigned, how many are fully compliant, the average completion, and a table of progress per employee. Only users with the admin role can see it.

HOW THE PROJECT IS ORGANISED
The project has three parts that work together.
The website is the file index.html. It contains all the screens and runs in the employee's browser.
The backend is the folder named api. It runs on Azure Functions. It checks logins, decides which modules each employee has finished, grades quizzes and creates certificates. The quiz answers are stored only here, never in the browser, so employees cannot look them up.
The database is Azure Cosmos DB. It stores three things: the list of employees, each employee's progress, and the certificates that have been issued.
Other files in the folder:
staticwebapp.config.json tells Azure how to route web addresses and adds security settings.
The scripts folder contains seed.js, a one-time helper that creates the database tables and adds the first employees.
The api folder contains the backend code. Inside it, src/functions/api.js holds all the backend actions, and the src/lib folder holds the helpers for the database, for sign-in, and for the list of modules and quiz questions.

DEMO MODE AND LIVE MODE
The website has a single setting called API_BASE near the bottom of index.html.
When the setting is empty (null), the website runs entirely on built-in demo data. Nothing is saved. This is useful for looking at the design and trying the screens. Any employee ID in the form EMP-12345 with a password of four or more characters will sign in.
When the setting is changed to /api, the website talks to the real backend and database on Azure. This is the live mode that real employees would use.

WHICH AZURE SERVICES ARE USED
Azure Static Web Apps hosts the website and the backend together under one web address. It also redeploys automatically whenever new code is pushed to GitHub.
Azure Functions runs the backend code. It is included inside Static Web Apps, so it does not need to be set up separately.
Azure Cosmos DB stores the data. The serverless option is the cheapest choice for a training portal, because you pay only for what is used.
GitHub holds the project files. Azure reads them from there.
Optional services worth adding later: Key Vault for storing secrets safely, Application Insights for monitoring, Blob Storage for the PDF resources and videos, and Microsoft Entra ID for single sign-on.

HOW TO PUT IT ON AZURE, IN PLAIN STEPS
Put the project on GitHub. Create a repository and upload the contents of this folder so that index.html and the api folder sit at the top level.
Create the database. In the Azure portal, create an Azure Cosmos DB account for NoSQL using the serverless option. When it is ready, open its Keys page and copy the primary connection string.
Create the hosting. In the Azure portal, create a Static Web App on the Standard plan. Connect it to your GitHub repository. Set the app location to a single slash and the API location to the word api.
Give the backend its settings. Open the Static Web App, go to Environment variables, and add three settings. The first is COSMOS_CONNECTION_STRING, with the connection string from step 2. The second is COSMOS_DB, with the value compliance. The third is JWT_SECRET, with a long random piece of text that only you know. Save the changes.
Add the first employees. Run the seed script once from your computer, supplying the connection string. It creates the database tables and a demo administrator with the employee ID EMP-45102. The password it sets is ChangeMe!2026, which you must change straight away.
Switch the website to live mode. In index.html, change the API_BASE setting from null to /api and upload the change to GitHub. Azure republishes the site within a few minutes.
Open the web address shown on the Static Web App page in the Azure portal and sign in.

HOW THE BACKEND ACTIONS WORK
Sign in: checks the employee ID and password against the database and returns a sign-in token that lasts eight hours. The same error message is shown whether the ID or the password is wrong, so nobody can find out which IDs exist.
Get my details: returns the employee's profile, the list of modules with the status of each, and notifications.
Start a module: records that the employee has opened a module, which changes its status to In Progress.
Get quiz: returns the questions without the correct answers.
Submit quiz: checks that every question was answered, grades the quiz, and if the score is 60 percent or more marks the module as completed and creates a certificate with a unique ID. Passing a module a second time does not create a second certificate.
Get certificate: returns the employee's certificate for a module, if one exists.
Admin summary: returns progress for all employees. It refuses anyone who is not an administrator.

HOW TO CHANGE THE CONTENT
Training modules and quiz questions are defined in api/src/lib/catalog.js. To add a module, add an entry with a title, description, length in minutes and an icon. To change the quiz, edit the questions, the answer options and the number that marks the correct option. The first option is number 0, the second is 1, and so on. The pass mark is also set in that file.
Employees are stored in the database. To add one, add a record to the employees table with an ID, name, email, department and a hashed password. The seed script shows how.

BEFORE REAL EMPLOYEES USE IT
Single sign-on. The login page says it is protected by the organisation's identity provider. For a real deployment, replace the password login with Microsoft Entra ID, which Static Web Apps supports built in. Employees would then sign in with their work accounts and no passwords would be stored.
Secrets. Keep the connection string and the sign-in secret in Azure Key Vault instead of plain settings, or let the backend use a managed identity to reach the database.
Login protection. Add limits on repeated failed logins, for example with Azure Front Door and its web application firewall.
Monitoring. Turn on Application Insights so errors and usage can be seen.
Videos and PDFs. Store them in Azure Blob Storage and add the links to each module record. The Play and Download PDF buttons are placeholders until this is done.
Sessions. In live mode the sign-in token is kept in the browser's memory only, so refreshing the page signs the employee out. Using Static Web Apps built-in sign-in removes this limitation.

COMMON PROBLEMS
If sign-in shows a server error, one of the three settings in step 4 is missing or has a typo.
If sign-in says the ID or password is wrong for everyone, the seed script was not run, or it was run against a different database.
If the backend addresses return not found, the API location was not set to api, or the deployment has not finished yet. Check the Actions tab on GitHub to see its progress.
If the site still shows demo data, the API_BASE change was not uploaded to GitHub yet.
If only some files appear on GitHub, the upload dropped files. Use GitHub Desktop to upload the project instead.
