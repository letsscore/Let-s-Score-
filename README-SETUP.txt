LET’S SCORE — email account + professional navigation update

Files included:
- index.html: focused homepage; no same-page anchor navigation.
- courses.html: dedicated course catalogue page.
- how-it-works.html: dedicated enrolment guide.
- student.html: email/password registration and login, course access, payment request flow.
- teacher-control.html: admin dashboard, restricted in code to the configured admin UID and email.
- course.html: retained legacy course page.
- course-materials-banner.png: course artwork.
- database.rules.json: Firebase Realtime Database rules for the current page paths.

Admin account expected by the page:
Email: abidurhussain2@gmail.com
UID allowlist: q8Ybthhc3jQEhQf4e5EAFpYIaDv1
The Firebase Authentication account must already exist and have that exact UID. Frontend allowlisting is not a replacement for database rules.

Firebase setup:
1. In Firebase Console > Authentication > Sign-in method, enable Email/Password.
2. Add your GitHub Pages domain under Authentication > Settings > Authorized domains if needed.
3. Review database.rules.json, then publish its contents in Realtime Database > Rules.
4. Test account creation, login, course resources, student requests and admin approvals before launch.
5. The registration page saves a profile with name, email and createdAt. Existing accounts created with the former synthetic phone-based login will not automatically become email-based accounts. Students should register with their real email or use Firebase account recovery/migration as appropriate.
6. Admin UID in the file is the UID present in the existing teacher dashboard code; verify it in Firebase Authentication. Admin email and UID must match the actual account.
7. UPI payments are manually verified. Do not approve a request based only on the submitted UTR. External/public file URLs can still be shared directly outside Firebase.

Packages: ₹299 for study materials without recorded videos; ₹999 for materials plus recorded video lectures. Free course: Class X Science Assamese medium, notes only.
