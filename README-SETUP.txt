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
