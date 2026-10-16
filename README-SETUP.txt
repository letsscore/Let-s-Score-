LET'S SCORE — Mandatory Student Registration & Course Access

Upload all files in this folder to the root of your GitHub Pages repository. This is a multi-page site: normal navigation links redirect to their own HTML pages, while each page contains the functionality for that part of the student journey.

STUDENT FLOW
1. Homepage remains public. Admin login is linked from the homepage only.
2. Every student must register before opening a free or paid course. Registration captures name, contact email, 10-digit mobile number, Assam district, class/course level and medium.
3. The site generates a username and password. The student must copy/save the credentials shown after registration.
4. Students log in using username and generated password, then choose a course.
5. Free course resources are available after registration/login.
6. For a paid course, the student chooses ₹299 study materials or ₹999 materials + recorded video lectures, pays through UPI, and submits the UTR on the course page.
7. The admin opens Teacher Control on the homepage, selects the course, checks the UTR together with the student's username, and approves/rejects access. Approval grants access to the selected course/package; the admin can revoke it later.

FIREBASE SETUP
- Enable Firebase Authentication → Sign-in method → Email/Password.
- Publish database.rules.json under Firebase Realtime Database → Rules.
- Admin account must have UID q8Ybthhc3jQEhQf4e5EAFpYIaDv1 and email abidurhussain2@gmail.com.
- Student registration stores the generated username and profile in studentProfiles. Paid requests include username, student name, contact email, UTR, course ID and package details.
- UPI number: 7636047997 (QR code and UPI ID removed); receipt WhatsApp: 7002137940.
- Package IDs: notes = ₹299, videos = ₹999.
- Free course ID: class10-assamese-free.
- Recorded video lecture language: Assamese-medium paid course — Assamese; English-medium paid course — Assamese-English combination.

CREDENTIAL NOTE
Generated login uses a Firebase Auth alias of the form username@accounts.letsscore.online. The actual contact email is collected in the profile but is not the authentication identifier for newly registered accounts. Students must save the generated password; automated password-reset by contact email is not included.

IMPORTANT
The ZIP only prepares the files; it does not deploy them. Back up your current repository, upload the files, publish the database rules, and test with a new test account and a dummy UTR before accepting real payments. Do not make paid resources or database writes public.
