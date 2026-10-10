LET'S SCORE — Admin/Student Integration Fix

Important fix:
- Teacher-control reads accessRequests/{courseId} as a parent node.
- Realtime Database rules now grant read access at /accessRequests only to the authorised admin UID + email.
- Students can still read their own request only.
- Admin-only database operations require both the configured UID and email.

Deploy:
1. Upload all files in this folder to the root of your GitHub Pages repository.
2. Firebase Console > Realtime Database > Rules: publish database.rules.json.
3. Firebase Console > Authentication: enable Email/Password.
4. Confirm admin account UID is q8Ybthhc3jQEhQf4e5EAFpYIaDv1 and email is abidurhussain2@gmail.com.
5. Test with a student account: register/login -> choose course -> submit UTR -> admin sees request -> approve -> student course page redirects to materials.

Course package conventions:
- notes = ₹299 materials only
- videos = ₹999 materials + recorded videos
- Free course ID: class10-assamese-free

Security note:
- Manual admin approval is not automated UPI verification.
- External URLs (for example public Drive links) may be shared outside this website; database rules cannot revoke an already-public file link.
- Test with a staging account before launch.


ADMIN COURSE MANAGEMENT UPDATE
- Teacher dashboard now displays student name/email, selected course, package, fee, UTR, status and actions in the payment approval table.
- Added filter by pending/approved/rejected/revoked and a refresh button.
- Approval also writes a course enrollment record.
- Added direct file upload to Firebase Storage for notes, solutions, model papers and video lectures.
- Publish database.rules.json in Realtime Database > Rules.
- Publish storage.rules in Firebase Console > Storage > Rules.
- Storage upload requires Firebase Storage enabled. Large videos may require a billing-enabled project; upload limit in this UI is 100 MB.


FREE-PLAN STORAGE NOTE (updated 10 October 2026)
This version does NOT use Firebase Storage and contains no Firebase Storage upload code or Storage rules. Do not enable/configure Firebase Storage for this site.

To publish learning resources without Firebase Storage:
1. Upload PDF/notes to Google Drive and set link access to Anyone with the link (or publish HTML files on GitHub Pages).
2. Upload recorded lessons to YouTube as Unlisted, if using the video package.
3. Sign in to Teacher Control and paste each resource's title and shareable URL into the relevant resource section.
4. Keep Firebase Authentication and Realtime Database on your chosen free Spark plan. This package does not require enabling Blaze or adding billing for file uploads.

Important: A public/shareable Drive or YouTube link can be copied by anyone who obtains it. Firebase Database rules protect the resource records, but cannot revoke access to a file that has been made publicly shareable.
