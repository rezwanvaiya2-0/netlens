# Contributing to NetLens

Thanks for taking the time to contribute! This project is a small, focused Docker image for NfSen + NfDump, and every contribution helps.

## Ways to contribute

### Reporting bugs

Open an issue at https://github.com/rezwanvaiya2-0/netlens/issues and include:

- What you expected to happen and what actually happened
- Steps to reproduce
- Your environment: host OS, Docker version (`docker --version`), compose version
- Relevant logs: `docker logs netlens --tail 50` (or the container name you used)
- Any changes you made to `docker-compose.yml`, `config/nfsen.conf`, or the data folders

### Requesting features

Open an issue describing the problem you are trying to solve, your proposed solution, and any alternatives you considered. The more concrete the use case, the easier it is to evaluate.

### Submitting code (pull requests)

1. Fork the repository and create a branch: `git checkout -b my-change`
2. Make your change, keeping it as small and focused as possible
3. Test it: rebuild and start the container with `./install.sh`, and make sure the Web UI, collectors, and login page still work
4. Commit with a clear message describing what and why
5. Open a pull request against `main` and describe what you changed and how you tested it

## Project conventions

- Keep dependencies to zero: this image is intentionally self-contained (no new packages unless required).
- `bash` scripts and PHP config follow the existing style in the repo — minimal, commented, readable.
- Do not break the data-folder (bind mount) layout: `nfsen-data/`, `nfsen-stat/`, `nfsen-var/`, `nfsen-etc/` must keep working on existing installs.
- The login page is brand-neutral — keep it that way.

## Getting help

The project is maintained by a single person; responses may take a little while. Please be patient and provide as much detail as possible up front.
