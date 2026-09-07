#!/usr/bin/env bash
# Copy the three runtime secrets from .env.local into the linked Vercel project.
#
# Values are piped on stdin so they never appear in argv (and so never in `ps`
# output or shell history). Run after `npx vercel login && npx vercel link`.
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env.local ]; then
  echo "no .env.local here" >&2
  exit 1
fi

for key in DATABASE_URL OPENROUTER_API_KEY EVE_CHAT_PASSWORD; do
  # Take the last definition, strip the key, then strip surrounding quotes.
  value=$(grep "^${key}=" .env.local | tail -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//')

  if [ -z "$value" ]; then
    echo "!! ${key} is empty or missing in .env.local — skipping" >&2
    continue
  fi

  for env in production preview development; do
    # Ignore "already exists"; re-running this script should be safe.
    printf '%s' "$value" | npx vercel env add "$key" "$env" >/dev/null 2>&1 \
      && echo "  set ${key} (${env})" \
      || echo "  ${key} (${env}) already set — skipped"
  done
done

echo
echo "Done. Redeploy so the new values are picked up:"
echo "  npx vercel --prod"
