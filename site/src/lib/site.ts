export const SITE = {
  name: "NetLens",
  description:
    "Dockerized NfSen NetFlow Analyzer — collect, store, and visualize NetFlow data in one self-contained container (NfSen 1.3.6p1 + NfDump 1.6.17).",
  url: "https://netlens.rezwan.bro.bd",
  github: "https://github.com/rezwanvaiya2-0/netlens",
  githubRepo: "rezwanvaiya2-0/netlens",
  installCommands: [
    "git clone https://github.com/rezwanvaiya2-0/netlens.git",
    "cd netlens",
    "sudo ./install.sh",
  ],
} as const;
