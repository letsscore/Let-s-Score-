LET'S SCORE — REVISIONARY TEST V2

FILES
1. supabase-config.js
2. revisionary-test.css
3. revisionary-test.js
4. revisionary-test.html
5. take-test.js
6. take-test.html
7. teacher.js
8. teacher.html
9. revisionary-test-schema.sql

GITHUB
Upload all files to the repository root. Keep the filenames exactly as shown.

IMPORTANT HTML SCRIPT ORDER
revisionary-test.html:
<script src="./supabase-config.js"></script>
<script src="./revisionary-test.js"></script>

take-test.html:
<script src="./supabase-config.js"></script>
<script src="./take-test.js"></script>

teacher.html:
<script src="./supabase-config.js"></script>
<script src="./teacher.js"></script>

SUPABASE SETUP
1. Run revisionary-test-schema.sql in Supabase SQL Editor.
2. Create the teacher account in Authentication > Users.
3. Copy that user's Auth UID.
4. Run:
   insert into public.teacher_profiles(user_id) values ('YOUR-UID');

SECURITY
The browser receives only the Supabase publishable key. Never put a secret/service-role key in GitHub.
Teacher editing is protected by Supabase Authentication + teacher_profiles + RLS.
Student test submission is allowed anonymously, but only the fields required by the test are accepted.

WORKFLOW
Teacher opens teacher.html.
Select class → enter title/duration/questions → Save Test.
When ready, press Save & Start.
Students then see TEST LIVE and can enter the test.
Press Stop Test when finished.
