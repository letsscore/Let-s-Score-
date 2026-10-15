LET'S SCORE — Revisionary Test access update

Files:
- course: adds a Revisionary Test section that is visible only after active paid-course access is confirmed. It checks the matching examControl key and displays the live test title, ID and maximum marks.
- teacher-control: changes admin test class keys to match the paid course variants:
  classXAssamese, classXEnglish, classXIEnglish, classXIIEnglish.

Important:
1. Replace course and teacher-control in your GitHub Pages repository.
2. The admin must start a test using the exact course/medium option and the Test ID.
3. This update displays test availability but does not implement question delivery/submission. A student test-taking page and question schema are still required for students to actually answer questions.
4. The free Class X Assamese course does not display the Revisionary Test section.
5. Firebase Realtime Database rules must allow active paid students to read examControl/<matching-class-key>, and only admin to write it.
