#!/bin/bash
# =============================================================================
# NfSen startup banner.
#
# A colorful popup (100% pure ANSI escape codes - zero external tools, works on
# any terminal AND in `docker compose logs`) shown when:
#   - install.sh runs on the VPS before the Docker build
#   - the container starts (entrypoint -> docker logs)
#
# Design:
#   - sharp-corner frame (┌─┐ └─┘) with a green gradient border
#   - big NFSEN letters in a deep-green -> bright-green gradient
#   - REQUIRES a UTF-8 locale: padding uses ${#s}, which counts characters
#     in UTF-8 and bytes otherwise (would un-square the box). Fine on macOS,
#     Windows Terminal and the Ubuntu container (defaults to C.UTF-8).
#
# Usage:
#   banner.sh            print the popup (no pause)
#   banner.sh <seconds>  print the popup, then pause for <seconds> so the whole
#                        box stays fully visible (5s minimum recommended)
# =============================================================================

W=69   # inner width - block letters are exactly W wide; text rows are padded to W

# ---- ANSI helpers -----------------------------------------------------------
_rst=$(printf '\033[0m')
_fg()  { printf '\033[38;2;%d;%d;%dm' "$1" "$2" "$3"; }    # 24-bit truecolor fg

# Print a string with a smooth color gradient:  grad "text" r1 g1 b1 r2 g2 b2
grad() {
    local t="$1" r1=$2 g1=$3 b1=$4 r2=$5 g2=$6 b2=$7
    local n=${#t} last=$(( ${#t} - 1 )) i c r g b
    if [ "$n" -le 1 ]; then
        _fg "$r1" "$g1" "$b1"; printf '%s' "$t"; printf '%s' "$_rst"; return
    fi
    for (( i = 0; i < n; i++ )); do
        c="${t:$i:1}"
        r=$(( r1 + (r2 - r1) * i / last ))
        g=$(( g1 + (g2 - g1) * i / last ))
        b=$(( b1 + (b2 - b1) * i / last ))
        _fg "$r" "$g" "$b"; printf '%s' "$c"
    done
    printf '%s' "$_rst"
}

# ---- NFSEN block letters (figlet "standard" font, embedded) -----------------
N1='███╗   ██╗'; N2='████╗  ██║'; N3='██╔██╗ ██║'; N4='██║╚██╗██║'; N5='██║ ╚████║'; N6='╚═╝  ╚═══╝'
F1='███████╗'; F2='██╔════╝'; F3='█████╗  '; F4='██╔══╝  '; F5='██║     '; F6='╚═╝     '
S1=' ██████╗'; S2='██╔════╝'; S3='███████╗'; S4='╚════██║'; S5='███████║'; S6='╚══════╝'
E1='███████╗'; E2='██╔════╝'; E3='█████╗  '; E4='██╔══╝  '; E5='███████╗'; E6='╚══════╝'

B1="$N1$F1$S1$E1$N1"
B2="$N2$F2$S2$E2$N2"
B3="$N3$F3$S3$E3$N3"
B4="$N4$F4$S4$E4$N4"
B5="$N5$F5$S5$E5$N5"
B6="$N6$F6$S6$E6$N6"

# ---- green palette (frame + letters) ----------------------------------------
# deep green:   rgb(20,83,45)   #14532D
# mid green:    rgb(46,158,51)  #2E9E33
# bright green: rgb(64,188,61)  #40BC3D
# lime accent:  rgb(163,230,53) #A3E635

# ---- frame helpers ----------------------------------------------------------
side()  { _fg 64 188 61; printf '│'; printf '%s' "$_rst"; }       # green side bar
line()  { side; printf '%s' "$1"; side; echo; }                   # side + content + side
spacer(){ side; printf ' %.0s' $(seq 1 "$W"); side; echo; }       # full-width blank row

# Pad a plain string to the frame width. The 2nd arg is the visible width of
# any un-padded prefix (e.g. a colored "  ▸  " bullet) so the TOTAL row is
# always exactly W columns wide -> the right border stays perfectly straight.
pad() {
    local s="$1" pre="${2:-0}" i
    # NOTE: separate local statements - in a single `local a=.. b=$a` line bash
    # expands ALL values first, so $a would still be the OLD (unset) value.
    local n=${#s} t=$(( W - pre ))
    for (( i = n; i < t; i++ )); do s+=' '; done
    printf '%s' "$s"
}

brand_border() {   # sharp-corner frame with a green gradient - 'top' (default) or 'bot'
    local cl cr
    if [ "${1:-top}" = bot ]; then cl='└'; cr='┘'; else cl='┌'; cr='┐'; fi
    _fg 20 83 45; printf '%s' "$cl"
    grad "$(printf '─%.0s' $(seq 1 "$W"))" 20 83 45 163 230 53   # deep green -> lime
    _fg 163 230 53; printf '%s\n' "$cr"; printf '%s' "$_rst"
}

# =============================================================================
# The banner
# =============================================================================
brand_border top
line "$(_fg 64 188 61)$(pad '  NfSen  —  NetFlow Analyzer + NfDump')$_rst"
spacer
for i in 1 2 3 4 5 6; do                                       # deep-green -> bright-green letters
    v="B$i"
    side
    printf '%*s' 13 ''                                          # center NFSEN (44 wide) in the 69-wide frame
    grad "${!v}" 20 83 45 64 188 61
    printf '%*s' 12 ''
    side
    echo
done
spacer
line "  $(_fg 46 158 51)▸$_rst  $(pad 'Web UI: http://<host>:8070' 5)"
line "  $(_fg 64 188 61)▸$_rst  $(pad 'NetFlow collectors: UDP 2055 / 2056' 5)"
spacer
brand_border bot

# Optional pause so the popup stays on screen during the docker build
if [ -n "${1:-}" ] && [ "${1}" -gt 0 ] 2>/dev/null; then
    sleep "${1}"
fi
