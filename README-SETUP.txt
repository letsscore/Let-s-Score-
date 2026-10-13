LET’S SCORE — Student Journey Update

Upload all files in this folder to the root of your GitHub Pages repository.

Student flow:
1. student.html — register with email/password or log in.
2. courses.html — choose a course.
3. course.html?id=COURSE_ID — free-course access or paid package payment and UTR submission.
4. Admin approves payment in teacher-control.html.
5. The paid course page checks approval automatically and redirects to materials.html?id=COURSE_ID.
6. materials.html only displays resources for the selected course and approved package.

Firebase:
- Enable Authentication > Email/Password.
- Publish database.rules.json under Realtime Database > Rules.
- Admin account must have UID q8Ybthhc3jQEhQf4e5EAFpYIaDv1 and email abidurhussain2@gmail.com.
- The teacher dashboard now stores the approved package in courseAccess.
- Payment: UPI 9678945621; receipt WhatsApp 7002137940.
- Package IDs: notes = ₹299, videos = ₹999.
- Free course ID: class10-assamese-free.

Test in Firebase's emulator or a staging project before relying on these rules in production.
