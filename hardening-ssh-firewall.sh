#!/usr/bin/env bash
set -euo pipefail

NEW_SSH_PORT="2251"
ALLOWED_SSH_IP="179.247.242.32"
# IP de emergencia opcional (deixe vazio para desativado)
# Exemplo: EMERGENCY_SSH_IP="200.200.200.200"
EMERGENCY_SSH_IP=""
ADMIN_USER_NAME="fsnext"
ADMIN_USER_PASSWORD="45mkO6pEkro4"
if [[ "${EUID}" -ne 0 ]]; then
  echo "Execute como root: sudo bash hardening-ssh-firewall.sh"
  exit 1
fi

if [[ ! -f /etc/ssh/sshd_config ]]; then
  echo "Arquivo /etc/ssh/sshd_config nao encontrado."
  exit 1
fi

cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak.$(date +%Y%m%d%H%M%S)

if grep -Eq "^[#[:space:]]*Port[[:space:]]+" /etc/ssh/sshd_config; then
  sed -i -E "s/^[#[:space:]]*Port[[:space:]]+.*/Port ${NEW_SSH_PORT}/" /etc/ssh/sshd_config
else
  printf "\nPort %s\n" "${NEW_SSH_PORT}" >> /etc/ssh/sshd_config
fi

if grep -Eq "^[#[:space:]]*PermitRootLogin[[:space:]]+" /etc/ssh/sshd_config; then
  sed -i -E "s/^[#[:space:]]*PermitRootLogin[[:space:]]+.*/PermitRootLogin no/" /etc/ssh/sshd_config
else
  printf "PermitRootLogin no\n" >> /etc/ssh/sshd_config
fi

if grep -Eq "^[#[:space:]]*PasswordAuthentication[[:space:]]+" /etc/ssh/sshd_config; then
  sed -i -E "s/^[#[:space:]]*PasswordAuthentication[[:space:]]+.*/PasswordAuthentication yes/" /etc/ssh/sshd_config
else
  printf "PasswordAuthentication yes\n" >> /etc/ssh/sshd_config
fi

if grep -Eq "^[#[:space:]]*PubkeyAuthentication[[:space:]]+" /etc/ssh/sshd_config; then
  sed -i -E "s/^[#[:space:]]*PubkeyAuthentication[[:space:]]+.*/PubkeyAuthentication yes/" /etc/ssh/sshd_config
else
  printf "PubkeyAuthentication yes\n" >> /etc/ssh/sshd_config
fi

if grep -Eq "^[#[:space:]]*KbdInteractiveAuthentication[[:space:]]+" /etc/ssh/sshd_config; then
  sed -i -E "s/^[#[:space:]]*KbdInteractiveAuthentication[[:space:]]+.*/KbdInteractiveAuthentication no/" /etc/ssh/sshd_config
else
  printf "KbdInteractiveAuthentication no\n" >> /etc/ssh/sshd_config
fi

if grep -Eq "^[#[:space:]]*ChallengeResponseAuthentication[[:space:]]+" /etc/ssh/sshd_config; then
  sed -i -E "s/^[#[:space:]]*ChallengeResponseAuthentication[[:space:]]+.*/ChallengeResponseAuthentication no/" /etc/ssh/sshd_config
else
  printf "ChallengeResponseAuthentication no\n" >> /etc/ssh/sshd_config
fi

if ! id "${ADMIN_USER_NAME}" >/dev/null 2>&1; then
  useradd -m -s /bin/bash "${ADMIN_USER_NAME}"
fi

echo "${ADMIN_USER_NAME}:${ADMIN_USER_PASSWORD}" | chpasswd
usermod -aG sudo "${ADMIN_USER_NAME}"

cat >/etc/sudoers.d/99-${ADMIN_USER_NAME} <<EOF
${ADMIN_USER_NAME} ALL=(ALL) NOPASSWD:ALL
EOF
chmod 440 /etc/sudoers.d/99-${ADMIN_USER_NAME}

sshd -t
ufw delete allow "${NEW_SSH_PORT}/tcp" >/dev/null 2>&1 || true
ufw allow from "${ALLOWED_SSH_IP}" to any port "${NEW_SSH_PORT}" proto tcp
if [[ -n "${EMERGENCY_SSH_IP}" ]]; then
  ufw allow from "${EMERGENCY_SSH_IP}" to any port "${NEW_SSH_PORT}" proto tcp
fi
ufw allow 80/tcp
ufw allow 443/tcp
ufw delete allow 22/tcp >/dev/null 2>&1 || true
ufw default deny incoming
ufw default allow outgoing
ufw --force enable
systemctl restart ssh || systemctl restart sshd

echo "Configuracao aplicada com sucesso."
echo "Porta SSH: ${NEW_SSH_PORT}"
echo "SSH permitido somente do IP: ${ALLOWED_SSH_IP}"
if [[ -n "${EMERGENCY_SSH_IP}" ]]; then
  echo "IP de emergencia SSH habilitado: ${EMERGENCY_SSH_IP}"
else
  echo "IP de emergencia SSH: desativado"
fi
echo "Portas liberadas no firewall: ${NEW_SSH_PORT} (restrita por IP), 80, 443"
echo "Root remoto bloqueado."
echo "Usuario administrativo criado/atualizado: ${ADMIN_USER_NAME}"
echo "Teste agora em outro terminal: ssh -p ${NEW_SSH_PORT} ${ADMIN_USER_NAME}@SEU_IP"
