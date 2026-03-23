#!/usr/bin/env bash

APP_SERVICE="${APP_SERVICE:-fsnext}"
DB_SERVICE="${DB_SERVICE:-postgresql@16-main}"
WEB_SERVICE="${WEB_SERVICE:-nginx}"
DOMAIN="${DOMAIN:-fs.adelbr.tech}"
HEALTH_URL="${HEALTH_URL:-https://${DOMAIN}/api/health}"

now() {
  date +"%Y-%m-%d %H:%M:%S %Z"
}

print_title() {
  printf "\n[%s] %s\n" "$(now)" "$1"
}

print_cmd() {
  printf "> %s\n" "$1"
}

run_check() {
  local label="$1"
  local cmd="$2"
  print_title "$label"
  print_cmd "$cmd"
  bash -lc "$cmd" || true
}

print_title "CHECK DIARIO VPS"
echo "HOST: $(hostname)"
echo "KERNEL: $(uname -r)"

run_check "STATUS SERVICOS" "systemctl is-active ${APP_SERVICE} ${WEB_SERVICE} ${DB_SERVICE}"
run_check "STATUS DETALHADO APP" "systemctl status ${APP_SERVICE} --no-pager -l | sed -n '1,25p'"
run_check "STATUS DETALHADO NGINX" "systemctl status ${WEB_SERVICE} --no-pager -l | sed -n '1,20p'"
run_check "STATUS DETALHADO POSTGRES" "systemctl status ${DB_SERVICE} --no-pager -l | sed -n '1,20p'"
run_check "HEALTHCHECK APP" "curl -fsS -m 10 -I ${HEALTH_URL}"
run_check "MEMORIA E SWAP" "free -h"
run_check "TOP 15 PROCESSOS RAM" "ps -eo pid,ppid,user,cmd,%mem,rss --sort=-rss | sed -n '1,15p'"
run_check "DISCO" "df -h /"
run_check "FAIL2BAN" "fail2ban-client status"
run_check "RESTARTS APP" "systemctl show ${APP_SERVICE} -p NRestarts -p MemoryCurrent -p MemoryMax -p TasksCurrent"
run_check "ULTIMOS LOGS APP" "journalctl -u ${APP_SERVICE} -n 40 --no-pager"
run_check "EVENTOS OOM" "dmesg -T | grep -Ei 'oom|out of memory|killed process' | tail -n 20"

print_title "FIM CHECK DIARIO"
