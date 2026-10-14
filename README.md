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

