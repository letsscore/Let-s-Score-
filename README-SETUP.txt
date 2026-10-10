LET'S SCORE — upgraded static website package

Files:
- index.html: new course showcase homepage, no Demo section.
- student.html: phone-number/password registration and login UI, course descriptions, UPI and WhatsApp receipt flow, access request submission, resource listing.
- course.html: retained existing course resource page (legacy).
- teacher-control.html: existing teacher control with Demo video panel/code removed.
- course-materials-banner.png: generated educational visual.

Deployment: upload these files and image to the same GitHub Pages repository/root.

IMPORTANT CONFIGURATION / SECURITY NOTES:
1. This static site uses the existing Firebase project. Enable Email/Password in Firebase Authentication. Phone number is mapped to an email-shaped identifier for Firebase Email/Password login; it does NOT verify ownership by SMS OTP. Do not describe it as phone OTP authentication.
2. Configure Firebase Realtime Database security rules before launch. Public read/write rules are unsafe. Rules must permit a signed-in student to read/write only their own profile and own access request, and must restrict courseAccess/resources writes to the authorized teacher/admin.
3. Teacher approval workflow in the old dashboard may use a different path/data structure than the new student flow; test and align it before accepting real payments. Never grant access based only on a client-side UTR. Verify the payment in the UPI account first.
4. Student-facing package prices are set to ₹299 for study materials without recorded video lectures and ₹999 for study materials with recorded video lectures. Both packages are available for each paid course. Confirm that your teacher dashboard/admin approval process records the selected package and verifies the amount actually received before granting access.
5. Upload resources in Realtime Database under courseResources/{courseId}/notes, solutions, questions, papers, each item containing title and url. IDs used: class10-assamese-free, class10-assamese-paid, class10-english, class11-physics, class12-physics.
6. Free course reads resources from courseResources/class10-assamese-free/notes. Populate it with notes only.
7. Only the courses listed in the user request are included. The final phrase “class...” was incomplete, so no additional courses were invented.

7. PACKAGE PRICING:
   - ₹299: chapter-wise notes, NCERT solutions and question & answer bank; no recorded video lectures.
   - ₹999: same study materials plus recorded video lectures.
   - The student access request records the selected package and amount. Make sure teacher approval checks this package and the actual UPI payment before unlocking resources.
