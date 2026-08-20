---
layout: home
hero:
  name: NetLens
  text: Network visibility, without the stack tax.
  tagline: Dockerized NfSen NetFlow Analyzer for capture, storage, visualization, and retention.
  actions:
    - theme: brand
      text: Install NetLens
      link: /guide/installation
    - theme: alt
      text: Read the LibreNMS guide
      link: /integration/librenms
    - theme: alt
      text: View on GitHub
      link: https://github.com/rezwanvaiya2-0/netlens
---

<div class="home-hero">

<div class="vp-doc home-install">

<div class="install-kicker">Quick start</div>
<h2>Deploy NetLens in minutes</h2>

<div class="install-terminal" data-install-terminal>
  <div class="install-terminal-bar"><span></span><span></span><span></span><b>netlens install</b><button type="button" data-copy-install aria-label="Copy install commands">Copy</button></div>
  <div class="install-terminal-body">
    <div><i>$</i> <code data-install-line="git clone https://github.com/rezwanvaiya2-0/netlens.git"></code></div>
    <div><i>$</i> <code data-install-line="cd netlens"></code></div>
    <div><i>$</i> <code data-install-line="sudo ./install.sh"></code><strong data-install-cursor></strong></div>
  </div>
</div>

<p class="install-note">One Dockerized stack for capture, storage, visualization, and retention.</p>

[See the installation checklist →](/guide/installation)

</div>

<div class="feature-grid">
  <div class="feature-card"><div class="feature-kicker">01 / Capture</div><h3>Collect flows</h3><p>Receive NetFlow v5, v9, and IPFIX from routers, firewalls, and edge devices.</p></div>
  <div class="feature-card"><div class="feature-kicker">02 / Store</div><h3>Keep ownership</h3><p>Use visible bind-mounted folders that are easy to inspect, back up, and rebuild.</p></div>
  <div class="feature-card"><div class="feature-kicker">03 / Visualize</div><h3>See the signal</h3><p>Turn raw flow data into NfSen graphs and Top-N traffic summaries.</p></div>
  <div class="feature-card"><div class="feature-kicker">04 / Retain</div><h3>Control growth</h3><p>Apply retention windows and storage caps from the NfSen profile UI.</p></div>
</div>

<div class="vp-doc" style="max-width: 760px; margin: 0 auto; padding: 0 24px;">

## How it works

</div>

<div class="pipeline">
  <div class="pipeline-step"><strong>Router</strong><span>exports NetFlow</span></div><div class="pipeline-arrow">→</div>
  <div class="pipeline-step"><strong>nfcapd</strong><span>writes raw flows</span></div><div class="pipeline-arrow">→</div>
  <div class="pipeline-step"><strong>NfSen</strong><span>builds graphs</span></div>
</div>

<div class="vp-doc" style="max-width: 760px; margin: 0 auto; padding: 0 24px;">

## Start with the docs

[Install NetLens](/guide/installation) to get the service running, then use [Operations](/guide/data-folders) to connect exporters and manage storage. For a separate monitoring host, follow the full [LibreNMS integration guide](/integration/librenms).

</div>

</div>
