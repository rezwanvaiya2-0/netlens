<template>
  <div class="hero-install-terminal install-terminal" data-install-terminal>
    <div class="install-terminal-bar">
      <span></span><span></span><span></span>
      <b>netlens install</b>
      <button type="button" data-copy-install aria-label="Copy install commands">Copy</button>
    </div>
    <div class="install-terminal-body">
      <div><i>$</i> <code data-install-line="git clone https://github.com/rezwanvaiya2-0/netlens.git"></code></div>
      <div><i>$</i> <code data-install-line="cd netlens"></code></div>
      <div><i>$</i> <code data-install-line="sudo ./install.sh"></code><strong data-install-cursor></strong></div>
    </div>
  </div>
</template>
