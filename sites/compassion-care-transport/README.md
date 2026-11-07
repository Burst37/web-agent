# Compassion Care Transport

Serve `dist/` as the website root. The homepage includes seven full-screen, silent service films, a 12-second hero and a 15-second animated company explainer. Each film opens service details, with a separate crawlable service page.

Confirmed business contact: **214-566-3869**, **Compassioncaretransport@yahoo.com**. No physical address is published. The mission statement is preserved verbatim.

The ride form validates required fields and future arrival dates, then prepares an email in the visitor's email app. The visitor must send the email. A request is not a confirmed ride. The call buttons dial the business directly.

The website assistant answers from the service guide. Optional microphone input and device speech playback depend on browser support and user microphone permission. It does not use a connected Google voice API. It does not answer telephone calls or book calendar appointments.

Phone answering and the manager's calendar are intentionally disconnected pending customer account access and booking rules. The website contains no API credentials.

`python3 build.py --full` rebuilds the homepage and seven service pages using the optimized local service imagery. `dist/style.css`, `dist/app.js` and `dist/voice.js` are the static website assets. `company-explainer/` contains the editable GSAP composition.

Films pause offscreen, when the tab is hidden, and when the user pauses motion. Reduced-motion preferences are respected. Videos are silent and loaded on demand.
