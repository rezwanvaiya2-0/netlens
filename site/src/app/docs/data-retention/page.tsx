import type { Metadata } from "next";
import { DocsPageLayout } from "@/components/docs-layout";
import { PageHeader } from "@/components/page-header";
import { Callout } from "@/components/callout";

export const metadata: Metadata = {
  title: "Data Retention",
  description:
    "Set expiration and max-size rules from the NfSen web UI or the command line to keep the disk from filling up.",
};

export default function DataRetentionPage() {
  return (
    <DocsPageLayout href="/docs/data-retention">
      <PageHeader
        kicker="Docs"
        title="Data Retention"
        description="No commands or config file changes needed — NfSen's data retention is set from the GUI. Expire old data by age, cap it by disk size, or use both for a safe two-tier approach."
      />

      <div className="docs">
        <h2>Set retention from the Web UI</h2>
        <ol>
          <li>
            Log in to the Web UI (<code>http://&lt;YOUR_IP&gt;:8070/</code>).
          </li>
          <li>
            Click <strong>Profile Admin</strong> in the top menu.
          </li>
          <li>
            In the <strong>live</strong> profile row, click <strong>Edit</strong>.
          </li>
          <li>
            Set <strong>Expire</strong> (how long to keep data) and{" "}
            <strong>Max size</strong> (hard disk cap), then <strong>Save</strong>.
          </li>
        </ol>
        <p>
          The <code>nfsend</code> daemon applies it automatically within a few
          minutes — no restart needed, and it covers every router.
        </p>

        <h2>Expire vs Max size</h2>
        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>What it does</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Expire</strong>
              </td>
              <td>
                Max <strong>age</strong> of data to keep — deletes the oldest
                whole 5-minute files once they are older than this value.
              </td>
              <td>
                <code>3d</code> = keep 3 days
              </td>
            </tr>
            <tr>
              <td>
                <strong>Max size</strong>
              </td>
              <td>
                Max <strong>disk size</strong> of the profile's flow data —
                deletes oldest files until under the cap.
              </td>
              <td>
                <code>44G</code> = never exceed 44 GB
              </td>
            </tr>
          </tbody>
        </table>
        <p>
          <code>Expire</code> alone can still fill the disk on heavy traffic
          (it ignores file size). <code>Max size</code> guarantees it never
          does — on heavy traffic it just keeps less history. Setting both is
          the recommended approach. Only the oldest whole 5-minute files are
          ever removed; the file currently being written is never touched, and
          collection never stops.
        </p>

        <h2>Set retention from the command line</h2>
        <p>
          The GUI writes to the same per-profile config, so you can set it with
          one command instead — useful for scripting:
        </p>
        <table>
          <thead>
            <tr>
              <th>Command</th>
              <th>Effect</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>nfsen --modify-profile live expire=30d maxsize=15G</code>
              </td>
              <td>30 days of history, max 15 GB of flow data</td>
            </tr>
          </tbody>
        </table>

        <Callout type="info" title="NfSen 1.3.6p1 retention note">
          In this version, retention is a <strong>per-profile setting</strong>{" "}
          (the <code>live</code> profile). The global <code>%expire</code> /{" "}
          <code>timelimit</code> keys only exist in newer NfSen (1.3.7+). And{" "}
          <code>$profiletimout</code> in <code>nfsen.conf</code> is{" "}
          <strong>not</strong> retention — it is just the profile refresh
          timeout (default 60 s) and frees no disk space.
        </Callout>

        <h2>Storage planning</h2>
        <p>
          Raw flow files are the fastest-growing part of the stack. Watch disk
          usage after the first busy collection window and choose retention
          from observed volume. A good rule for a 20 GB disk:{" "}
          <code>expire=30d maxsize=15G</code>.
        </p>
      </div>
    </DocsPageLayout>
  );
}