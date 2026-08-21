import type { Metadata } from "next";
import { CopyButton } from "@/components/copy-button";
import { DocsPageLayout } from "@/components/docs-layout";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Commands Cheatsheet",
  description:
    "Every useful docker exec, docker compose, and utility command for NetLens in one place.",
};

type CommandItem = { cmd: string; desc: string };
type CommandGroup = { title: string; items: CommandItem[] };

const groups: CommandGroup[] = [
  {
    title: "Deploy and start",
    items: [
      {
        cmd: "sudo ./install.sh",
        desc: "Build the image and start the stack (first run only).",
      },
      {
        cmd: "docker compose up -d",
        desc: "Start the stack without rebuilding.",
      },
      {
        cmd: "docker compose up -d --build",
        desc: "Rebuild the image and start.",
      },
      {
        cmd: "docker compose down",
        desc: "Stop the container and release the bind mounts.",
      },
      {
        cmd: "docker stop netlens",
        desc: "Quick stop that keeps the mounts.",
      },
      {
        cmd: "docker start netlens",
        desc: "Quick start.",
      },
      {
        cmd: "docker restart netlens",
        desc: "Restart the container.",
      },
      {
        cmd: "docker compose ps",
        desc: "Check container status.",
      },
      {
        cmd: "docker logs --tail=50 netlens",
        desc: "View the last 50 lines of container logs.",
      },
    ],
  },
  {
    title: "NfSen daemon",
    items: [
      {
        cmd: "docker exec netlens /var/nfsen/bin/nfsen status",
        desc: "Check whether the NfSen daemon is running.",
      },
      {
        cmd: "docker exec netlens /var/nfsen/bin/nfsen start",
        desc: "Start the NfSen daemon.",
      },
      {
        cmd: "docker exec netlens /var/nfsen/bin/nfsen stop",
        desc: "Stop the NfSen daemon.",
      },
      {
        cmd: "docker exec netlens /var/nfsen/bin/nfsen restart",
        desc: "Restart the NfSen daemon.",
      },
      {
        cmd: "docker exec netlens /var/nfsen/bin/nfsen reconfig",
        desc: "Apply config changes to the running daemon.",
      },
    ],
  },
  {
    title: "Router sources",
    items: [
      {
        cmd: "docker exec netlens grep -A 20 '%sources' /var/nfsen/etc/nfsen.conf",
        desc: "List all configured sources.",
      },
      {
        cmd: `docker exec netlens bash -c "sed -i \\"/^);$/i\\\\    'NAME' => { 'port' => '2055', 'IP' => 'IP_ADDRESS', 'col' => '#COLOR', 'type' => 'netflow' },\\" /var/nfsen/etc/nfsen.conf && /var/nfsen/bin/nfsen reconfig && echo 'Done'"`,
        desc: "Add a source with an IP (replace NAME, IP_ADDRESS, COLOR).",
      },
      {
        cmd: `docker exec netlens bash -c "sed -i \\"/'NAME' =>/d\\" /var/nfsen/etc/nfsen.conf && /var/nfsen/bin/nfsen reconfig && echo 'Removed'"`,
        desc: "Remove a source (replace NAME).",
      },
      {
        cmd: `docker exec netlens bash -c "sed -i \\"/'router1' =>/d\\" /var/nfsen/etc/nfsen.conf && /var/nfsen/bin/nfsen reconfig && echo 'Removed'"`,
        desc: "Remove the demo router1 source.",
      },
    ],
  },
  {
    title: "Password management",
    items: [
      {
        cmd: "docker exec netlens htpasswd -b /var/nfsen/etc/.htpasswd admin <newpass>",
        desc: "Change the admin password — instant, no restart.",
      },
    ],
  },
  {
    title: "Data retention",
    items: [
      {
        cmd: "docker exec netlens /var/nfsen/bin/nfsen --modify-profile live expire=30d maxsize=15G",
        desc: "Set retention from the command line (30 days / 15 GB example).",
      },
    ],
  },
  {
    title: "Disk recovery",
    items: [
      {
        cmd: "docker system prune -f",
        desc: "Free Docker disk space.",
      },
      {
        cmd: "docker builder prune -f",
        desc: "Free Docker build cache.",
      },
      {
        cmd: "sudo journalctl --vacuum-time=1d",
        desc: "Clean system logs when the disk is full.",
      },
      {
        cmd: `docker exec netlens bash -c "rm -rf /var/nfsen/profiles-data/live/* /var/nfsen/profiles-stat/live/*"`,
        desc: "Delete all flow data and graphs (frees the most space).",
      },
      {
        cmd: 'docker exec netlens bash -c "truncate -s 0 /var/nfsen/var/nfsen.log"',
        desc: "Truncate the NfSen log file.",
      },
    ],
  },
  {
    title: "LibreNMS integration",
    items: [
      {
        cmd: "sudo apt install -y nfs-kernel-server",
        desc: "Install the NFS server (run on the NetLens VPS).",
      },
      {
        cmd: "sudo apt install -y nfs-common",
        desc: "Install the NFS client (run on the LibreNMS server).",
      },
      {
        cmd: "sudo mount -t nfs4 <VPS_IP>:<path>/nfsen-data /var/nfsen/profiles-data",
        desc: "Mount the NFS data share on the LibreNMS server.",
      },
      {
        cmd: "/usr/local/bin/nfdump -V",
        desc: "Verify the nfdump version (must be 1.6.25).",
      },
      {
        cmd: "lnms config:set nfsen_enable true",
        desc: "Enable the Netflow tab in LibreNMS.",
      },
      {
        cmd: "lnms config:set nfsen_suffix '_none'",
        desc: "Set the required non-empty suffix (never leave empty).",
      },
    ],
  },
  {
    title: "Utility",
    items: [
      {
        cmd: "ss -lunp | grep -E '2055|2056|8070'",
        desc: "Check that the UDP listeners and web UI port are active.",
      },
      {
        cmd: "tar czf nfsen-backup.tar.gz nfsen-data nfsen-stat nfsen-var nfsen-etc",
        desc: "Back up all four data folders.",
      },
      {
        cmd: "docker inspect netlens",
        desc: "Inspect the container (see the Mounts section for bind mounts).",
      },
      {
        cmd: "df -h /",
        desc: "Check available disk space.",
      },
    ],
  },
];

function CommandList({ items }: { items: CommandItem[] }) {
  return (
    <div className="my-4 space-y-3 first:mt-0 last:mb-0">
      {items.map((item, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
        >
          <div className="flex items-start justify-between gap-3 border-b border-border/70 bg-muted/40 px-4 py-2.5">
            <code className="min-w-0 break-all font-mono text-[0.8rem] leading-5 text-foreground">
              {item.cmd}
            </code>
            <CopyButton text={item.cmd} />
          </div>
          <p className="px-4 py-2 text-sm text-muted-foreground">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}

export default function CommandsPage() {
  return (
    <DocsPageLayout href="/reference/commands">
      <PageHeader
        kicker="Reference"
        title="Commands Cheatsheet"
        description="Every useful command for NetLens — from daily operations to full recovery — collected in one place. Click the copy button on any command to copy it."
      />

      <div className="docs">
        {groups.map((group) => (
          <section key={group.title}>
            <h2>{group.title}</h2>
            <CommandList items={group.items} />
          </section>
        ))}
      </div>
    </DocsPageLayout>
  );
}
