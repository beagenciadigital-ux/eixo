#!/usr/bin/env sh
# Exemplo de comando para Scheduled Task no EasyPanel (cron * * * * *).
# Copia UMA das linhas curl abaixo, substitui CRON_SECRET e o URL, cola no painel.

set -eu

# --- A) HTTPS público (recomendado) ---
# curl -fsS -H "Authorization: Bearer CRON_SECRET" "https://teu-dominio.com/api/cron/turns"

# --- B) Rede Docker interna (mesmo stack; NOME_DO_SERVICO = hostname do serviço da app) ---
# curl -fsS -H "Authorization: Bearer CRON_SECRET" "http://NOME_DO_SERVICO_DA_APP:3000/api/cron/turns"

# Crons opcionais (outras expressões cron):
# */30 * * * *  →  .../api/cron/thirty
# 0 * * * *     →  .../api/cron/hourly
# 0 3 * * *     →  .../api/cron/daily

# Teste rápido (mesmo Bearer):
# curl -fsS -H "Authorization: Bearer CRON_SECRET" "https://teu-dominio.com/api/cron/test"

exit 0
