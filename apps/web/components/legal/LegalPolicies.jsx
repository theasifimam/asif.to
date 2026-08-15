import Link from "next/link";
import { Mail } from "lucide-react";

const H2 = ({ children }) => <h2 className="pt-4 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">{children}</h2>;
const H3 = ({ children }) => <h3 className="pt-2 text-base font-extrabold text-foreground sm:text-lg">{children}</h3>;
const List = ({ children }) => <ul className="list-disc space-y-2 pl-6">{children}</ul>;
const Contact = () => <div className="w-fit rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 font-bold text-blue-600 dark:text-blue-400"><a href="mailto:support@asif.to" className="flex items-center gap-2"><Mail className="h-4 w-4"/>support@asif.to</a></div>;

export function PrivacyPolicy() {
  return <div className="space-y-6 text-sm font-medium leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-base">
    <p>This Privacy Policy explains how <strong>asif.to</strong> (“asif.to”, “we”, “us”, or “our”) collects, uses, shares, stores, and protects personal data when you visit <a href="https://asif.to" className="font-bold text-blue-600 dark:text-blue-400">asif.to</a>, create an account, contact us, or use our courses, articles, quizzes, playgrounds, bookmarks, revision tools, and related services (collectively, the “Service”).</p>
    <p>By using the Service, you acknowledge the practices described here. Where consent is required by applicable law, we will rely on consent rather than this acknowledgement. This Policy does not apply to third-party websites or services that we do not control.</p>

    <H2>1. Who is responsible for your data</H2>
    <p>asif.to is the data controller or data fiduciary for personal data processed for its own purposes. Privacy questions, rights requests, and grievances may be sent to <a href="mailto:support@asif.to" className="font-bold text-blue-600 dark:text-blue-400">support@asif.to</a>.</p>

    <H2>2. Information we collect</H2>
    <H3>Information you provide</H3>
    <List>
      <li><strong>Account information:</strong> name, username, email address, password hash, avatar, profile biography, professional links, and other profile fields you choose to provide.</li>
      <li><strong>Learning and account activity:</strong> bookmarks, saved content, quiz or practice activity, visibility choices, and other interactions connected to your account where those features are enabled.</li>
      <li><strong>Communications:</strong> your name, email address, subject, message, support requests, feedback, and related correspondence.</li>
      <li><strong>User content:</strong> code, text, profile information, or other material you submit through interactive or publishing features.</li>
      <li><strong>Subscription preferences:</strong> your email address and communication choices if you request updates.</li>
    </List>
    <H3>Information collected automatically</H3>
    <List>
      <li><strong>Usage data:</strong> pages viewed, timestamps, referring page, session and visitor identifiers, interactions, and approximate engagement time.</li>
      <li><strong>Device data:</strong> browser type, device category, operating environment, language, screen characteristics, and similar technical information.</li>
      <li><strong>Network and approximate location data:</strong> IP address used for security, delivery, and approximate geographic reporting. Google states that GA4 uses IP addresses to derive location and discards them before logging them.</li>
      <li><strong>Cookies and local storage:</strong> authentication tokens, theme preferences, bookmarks or recent-search information, session identifiers, and analytics identifiers.</li>
    </List>
    <H3>Information from other sources</H3>
    <p>We may receive aggregated reporting from Google Analytics and Google Search Console, and technical or security information from hosting, email, and infrastructure providers. We do not receive your Google account password from these services.</p>

    <H2>3. Why we use information</H2>
    <List>
      <li>Provide, personalize, maintain, and secure the Service.</li>
      <li>Create and authenticate accounts, recover access, and prevent unauthorized use.</li>
      <li>Save user preferences and learning-related activity.</li>
      <li>Operate code playgrounds, quizzes, search, bookmarks, and interactive features.</li>
      <li>Respond to questions, support requests, feedback, and legal inquiries.</li>
      <li>Send transactional messages such as verification, security, and account emails.</li>
      <li>Send optional updates only where permitted and allow you to opt out of promotional messages.</li>
      <li>Measure traffic, search visibility, content performance, and feature usage.</li>
      <li>Debug errors, protect against abuse, enforce our Terms, and comply with law.</li>
      <li>Create aggregated or de-identified statistics that do not reasonably identify an individual.</li>
    </List>

    <H2>4. Legal bases</H2>
    <p>Depending on where you live, we process personal data because it is necessary to provide the Service or perform our agreement with you; because you consented; to comply with legal obligations; or for legitimate interests such as security, service improvement, fraud prevention, and understanding content performance, where those interests are not overridden by your rights. You may withdraw consent at any time, without affecting earlier lawful processing.</p>

    <H2>5. Analytics, cookies, and similar technologies</H2>
    <p>We use essential browser storage for authentication, security, preferences, and requested features. We also use privacy-conscious first-party analytics and may use Google Analytics 4 (“GA4”) to understand users, sessions, page views, acquisition, approximate country, device category, browser, engagement, and events.</p>
    <p>GA4 commonly uses the <code>_ga</code> first-party cookie or similar identifiers. Google processes analytics data under its own terms and privacy documentation. You can restrict non-essential cookies using available consent controls, browser settings, blocking tools, or Google’s Analytics opt-out tools. Blocking storage may affect account or preference features. See our <Link href="/legal/cookie-usage" className="font-bold text-blue-600 dark:text-blue-400">Cookie Policy</Link> for more detail.</p>
    <p>Some browsers transmit “Do Not Track” or Global Privacy Control signals. Because standards and legal requirements vary, the Service may not respond uniformly to every signal. We honor legally required opt-out signals where applicable.</p>

    <H2>6. When we share information</H2>
    <p>We do not sell personal data. We may disclose limited information:</p>
    <List>
      <li>To hosting, database, analytics, email, security, and infrastructure providers that process it for us under appropriate restrictions.</li>
      <li>When you direct us to share information or make profile/activity information public.</li>
      <li>To comply with law, legal process, or valid government requests; protect rights, safety, and security; or investigate abuse.</li>
      <li>In connection with a merger, financing, acquisition, reorganization, or sale of assets, subject to appropriate notice and safeguards.</li>
      <li>In aggregated or de-identified form that does not reasonably identify you.</li>
    </List>
    <p>Third-party links and embedded resources are governed by the third party’s policies. We are not responsible for their independent practices.</p>

    <H2>7. International data transfers</H2>
    <p>Our providers may process data in India, the United States, or other countries. Those countries may have different privacy laws. Where required, we use lawful transfer mechanisms and appropriate contractual or organizational safeguards.</p>

    <H2>8. Data retention</H2>
    <p>We retain personal data only for as long as reasonably necessary for the purposes described above, including providing an active account, maintaining security, resolving disputes, enforcing agreements, and meeting legal obligations. Retention varies by data type. Account data is generally kept while your account is active; support and security records may be retained afterward when reasonably necessary. Analytics may be retained according to configured provider retention periods. We may retain aggregated or de-identified data longer.</p>

    <H2>9. Security</H2>
    <p>We use reasonable administrative, technical, and organizational safeguards, including HTTPS, access controls, password hashing, restricted server-side credentials, and monitoring. No internet transmission or storage system is completely secure, so we cannot guarantee absolute security. You are responsible for using a strong unique password and protecting your devices and credentials. Contact us promptly if you suspect unauthorized account access.</p>

    <H2>10. Your choices and rights</H2>
    <p>Subject to applicable law, you may have rights to access, correct, update, delete, or obtain a copy of personal data; withdraw consent; object to or restrict processing; opt out of certain sharing or communications; nominate another person to exercise rights where applicable; and complain to a regulator.</p>
    <p>You may update certain profile information through account settings and unsubscribe through an email’s instructions where available. To exercise another right, email us from the address associated with your account. We may verify your identity and may retain information where law permits or requires. You may also have a right to appeal or submit a grievance if you disagree with our response.</p>

    <H2>11. Children’s privacy</H2>
    <p>The Service is a general-audience learning platform and is not directed to children under 13. We do not knowingly collect personal data from a child under 13 without legally required parental authorization. If you believe a child has provided personal data improperly, contact us and we will investigate and delete it where required. Users below the age at which they may independently consent in their country should use the Service only with a parent or guardian’s permission.</p>

    <H2>12. Automated decision-making</H2>
    <p>We do not currently use personal data to make solely automated decisions that produce legal or similarly significant effects. Rankings, recommendations, search ordering, or analytics summaries may be generated automatically but are intended to organize content and operate the Service.</p>

    <H2>13. Changes to this Policy</H2>
    <p>We may update this Policy to reflect changes in the Service, providers, or law. We will post the revised version with a new “Last updated” date and provide additional notice where required. Material changes apply prospectively unless law permits otherwise.</p>

    <H2>14. Contact and grievance requests</H2>
    <p>Include enough information for us to understand your request, but do not send passwords or sensitive identity documents unless we specifically request them through a secure method.</p>
    <Contact/>
  </div>;
}

export function TermsOfService() {
  return <div className="space-y-6 text-sm font-medium leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-base">
    <p>These Terms of Service (“Terms”) govern access to and use of <a href="https://asif.to" className="font-bold text-blue-600 dark:text-blue-400">asif.to</a> and its courses, tutorials, articles, code examples, quizzes, playgrounds, account features, and related services (the “Service”). “asif.to”, “we”, “us”, and “our” refer to the operator of the Service. By accessing or using the Service, you agree to these Terms and our <Link href="/privacy" className="font-bold text-blue-600 dark:text-blue-400">Privacy Policy</Link>. If you do not agree, do not use the Service.</p>

    <H2>1. Eligibility</H2>
    <p>You must be legally capable of entering into these Terms. If you are below the age of legal majority where you live, a parent or legal guardian must review and agree to these Terms and supervise your use. The Service is not directed to children under 13.</p>

    <H2>2. Accounts</H2>
    <List>
      <li>Provide accurate information and keep it current.</li>
      <li>Keep your password and access tokens confidential and do not share or transfer your account.</li>
      <li>You are responsible for activity conducted through your account unless caused by our breach.</li>
      <li>Notify us promptly at <a href="mailto:support@asif.to" className="font-bold text-blue-600 dark:text-blue-400">support@asif.to</a> if you suspect unauthorized access.</li>
      <li>We may reject usernames, require verification, or suspend access when reasonably necessary for security or compliance.</li>
    </List>

    <H2>3. Educational purpose</H2>
    <p>The Service provides general educational information. It is not professional, legal, financial, cybersecurity, employment, or other regulated advice, and it does not guarantee examination results, employment, certification, income, or any particular outcome. You remain responsible for verifying information and deciding whether code or guidance is appropriate for your situation.</p>

    <H2>4. License to use the Service</H2>
    <p>Subject to these Terms, we grant you a limited, personal, non-exclusive, non-transferable, non-sublicensable, revocable license to access the Service and use its content for lawful personal learning. This license does not transfer ownership.</p>
    <p>You may adapt short code examples for your own lawful projects unless a page states a different license. You may not reproduce or redistribute substantial parts of courses, articles, databases, branding, page designs, or compilations; sell access; publish mirrors; remove notices; or create competing datasets without written permission.</p>

    <H2>5. Intellectual property</H2>
    <p>The Service, including its original text, course structure, graphics, design, software, trademarks, and compilation, is owned by or licensed to asif.to and protected by applicable intellectual-property laws. Third-party names, libraries, code, and materials remain the property of their respective owners and may be subject to separate licenses.</p>

    <H2>6. User content</H2>
    <p>You retain ownership of content you submit. You grant us a worldwide, non-exclusive, royalty-free license to host, store, reproduce, format, display, and process that content only as reasonably necessary to operate, secure, improve, and provide the Service. For content you intentionally make public, the license also permits us to display and distribute it through the Service. This license ends when the content is deleted, except for reasonable backups, legal retention, or content already shared by others.</p>
    <p>You represent that you have the rights needed to submit the content and that it does not violate law, confidentiality, intellectual property, privacy, or another person’s rights. We may remove content that violates these Terms.</p>

    <H2>7. Acceptable use</H2>
    <p>You must not:</p>
    <List>
      <li>Use the Service unlawfully, fraudulently, or to harm, harass, impersonate, exploit, or deceive anyone.</li>
      <li>Upload malware, exploit code intended to attack systems, or attempt unauthorized access to accounts, servers, APIs, databases, or networks.</li>
      <li>Interfere with availability, bypass security or rate limits, probe vulnerabilities without written authorization, or overload infrastructure.</li>
      <li>Scrape, crawl, harvest, data-mine, or systematically extract content except through an expressly permitted interface or ordinary search-engine indexing.</li>
      <li>Reverse engineer the Service except where applicable law makes that restriction unenforceable.</li>
      <li>Use bots or automation to create accounts, manipulate metrics, submit spam, or access the Service at unreasonable volume.</li>
      <li>Copy, sell, sublicense, frame, mirror, or commercially exploit the Service or substantial content without permission.</li>
      <li>Submit unlawful, infringing, defamatory, sexually exploitative, privacy-invasive, or otherwise harmful content.</li>
      <li>Misrepresent affiliation with asif.to or use our branding without permission.</li>
    </List>

    <H2>8. Code playgrounds and external execution</H2>
    <p>Interactive code features may execute code locally in your browser or through supporting runtimes. Code can fail, consume resources, produce incorrect results, or contain security risks. Do not enter secrets, production credentials, personal data, or confidential code. Review and test code in an appropriate isolated environment before using it in a real system. You are responsible for code you run, copy, download, or deploy.</p>

    <H2>9. Third-party services and links</H2>
    <p>The Service may reference third-party websites, libraries, tools, or documentation. We do not control or endorse all third-party content and are not responsible for its availability, security, accuracy, terms, or privacy practices. Your use of third-party services is governed by their terms.</p>

    <H2>10. Service changes and availability</H2>
    <p>We may add, modify, suspend, or discontinue features; impose reasonable usage limits; or perform maintenance. We do not promise uninterrupted availability or permanent storage of user content. Keep independent copies of material important to you. Where reasonably practical, we will provide notice of material discontinuation.</p>

    <H2>11. Suspension and termination</H2>
    <p>You may stop using the Service at any time and may request account deletion. We may restrict, suspend, or terminate access if we reasonably believe you violated these Terms, created security or legal risk, failed to satisfy eligibility requirements, or misused the Service. Where appropriate, we may provide notice and an opportunity to appeal. Provisions that by nature should survive—including ownership, disclaimers, liability limitations, indemnity, and dispute terms—continue after termination.</p>

    <H2>12. Copyright complaints</H2>
    <p>If you believe content on the Service infringes your copyright or other intellectual-property rights, email us with identification of the work, the allegedly infringing material and its URL, your contact information, a good-faith statement, and evidence that you are authorized to act. Knowingly false notices may create liability.</p>

    <H2>13. Disclaimers</H2>
    <p>To the maximum extent permitted by law, the Service and all content are provided “as is” and “as available.” We disclaim implied warranties of merchantability, fitness for a particular purpose, non-infringement, accuracy, and uninterrupted or error-free operation. We do not warrant that code, tutorials, answers, or external resources are complete, current, secure, or suitable for every use. Nothing in these Terms excludes warranties or consumer rights that cannot legally be excluded.</p>

    <H2>14. Limitation of liability</H2>
    <p>To the maximum extent permitted by law, asif.to and its operator, contributors, and service providers will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for loss of data, profits, goodwill, opportunity, or business interruption arising from the Service. Where liability cannot be excluded, our aggregate liability relating to the Service will not exceed the greater of the amount you paid us for the Service during the twelve months before the claim or INR 5,000. This limitation does not apply where prohibited by law or to liability that cannot legally be limited.</p>

    <H2>15. Indemnity</H2>
    <p>To the extent permitted by law, you agree to defend, indemnify, and hold harmless asif.to and its operator from third-party claims, losses, and reasonable costs arising from your unlawful use, your user content, or your material breach of these Terms. This does not require indemnification for our own unlawful conduct and does not limit non-waivable consumer rights.</p>

    <H2>16. Governing law and disputes</H2>
    <p>These Terms are governed by the laws of India, without regard to conflict-of-law principles. Before filing a claim, you and asif.to agree to attempt in good faith to resolve the dispute by emailing a written description to <a href="mailto:support@asif.to" className="font-bold text-blue-600 dark:text-blue-400">support@asif.to</a> and allowing 30 days for a response. Subject to mandatory consumer law and courts that cannot be excluded, disputes will be submitted to the competent courts in India. Nothing prevents either party from seeking urgent injunctive relief.</p>

    <H2>17. Changes to these Terms</H2>
    <p>We may update these Terms when the Service or law changes. We will post the revised Terms with a new “Last updated” date and provide additional notice where required. Material changes apply prospectively. Continued use after the effective date constitutes acceptance where permitted by law; otherwise, we will request consent.</p>

    <H2>18. General terms</H2>
    <p>These Terms and incorporated policies are the entire agreement about the Service. If a provision is unenforceable, it will be modified only as much as necessary and the remainder will continue. Failure to enforce a provision is not a waiver. You may not assign these Terms without our consent; we may assign them as part of a reorganization, financing, merger, or transfer of the Service. Headings are for convenience and do not affect interpretation.</p>

    <H2>19. Contact</H2>
    <Contact/>
  </div>;
}
