import type { Metadata } from "next";
import { DocsPageLayout } from "@/components/docs-layout";
import { PageHeader } from "@/components/page-header";
import { Callout } from "@/components/callout";
import { CodeBlock } from "@/components/code-block";

export const metadata: Metadata = {
  title: "Password Protection",
  description:
    "The styled login page, first-login credentials, session behavior, and how to customize defaults.",
};

export default function PasswordProtectionPage() {
  return (
    <DocsPageLayout href="/docs/password-protection">
      <PageHeader
        kicker="Docs"
        title="Password Protection"
        description="The entire web UI is protected by a styled HTML login page (Apache mod_auth_form). Nobody can view the graphs, the raw flow data, or any NfSen page without signing in."
      />

      <div className="docs">
        <h2>First login</h2>
        <p>
          Open <code>http://&lt;YOUR_IP&gt;:8070/</code> — you'll be asked to
          sign in:
        </p>
        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Username</td>
              <td>
                <code>admin</code>
              </td>
            </tr>
            <tr>
              <td>Password</td>
              <td>
                <code>change-me-now</code>
              </td>
            </tr>
          </tbody>
        </table>
        <Callout type="danger" title="Change the password immediately">
          One command, takes effect instantly, no restart needed:
        </Callout>
        <CodeBlock
          lang="bash"
          title="set new password"
          code={`docker exec netlens htpasswd -b /var/nfsen/etc/.htpasswd admin YourNewPass123`}
        />

        <h2>Log out</h2>
        <p>Visit <code>http://&lt;YOUR_IP&gt;:8070/logout</code>.</p>

        <h2>Customize the default credentials (first boot only)</h2>
        <p>
          Set these in <code>docker-compose.yml</code> — they only apply while{" "}
          <code>.htpasswd</code> doesn't exist yet:
        </p>
        <CodeBlock
          lang="yaml"
          title="docker-compose.yml"
          code={`environment:
  - NFSEN_ADMIN_USER=admin
  - NFSEN_ADMIN_PASSWORD=change-me-now`}
        />

        <h2>How sessions work</h2>
        <ul>
          <li>
            <strong>Login sessions end when you close the browser.</strong> The
            login cookie is a browser-session cookie (no expiry), so closing
            the browser and reopening the site shows the login page again.
          </li>
          <li>
            <strong>Sessions auto-expire after 1 hour of inactivity.</strong>{" "}
            Enforced by <code>session-guard.php</code>, which runs before every
            NfSen page (<code>auto_prepend_file</code>). Staying on the login
            page never logs you out. To change the limit, edit{" "}
            <code>NFSEN_LOGIN_MAX_AGE</code> at the top of{" "}
            <code>session-guard.php</code> (value in seconds) and rebuild.
          </li>
          <li>
            The activity-timer cookie is <strong>HttpOnly + SameSite=Lax</strong>{" "}
            (set by <code>session-guard.php</code>). Note: the Apache session
            cookie itself can't be marked HttpOnly on Ubuntu 20.04's Apache
            2.4.41 (that needs Apache 2.4.43+) — so keep the UI behind HTTPS
            and log out when you're done.
          </li>
        </ul>

        <Callout type="warn" title="What is NOT protected">
          Only the Web UI is protected. The NetFlow UDP collection ports
          (2055, 2056, …) are unaffected. Firewall those ports to only your
          routers' IPs (see the{" "}
          <a href="/reference/security">security notes</a>).
        </Callout>

        <h2>Remove the login page (optional)</h2>
        <p>
          Need the login page removed again? Delete the auth block from{" "}
          <code>config/000-default.conf</code> and rebuild.
        </p>
      </div>
    </DocsPageLayout>
  );
}
