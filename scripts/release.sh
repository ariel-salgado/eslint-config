#!/bin/sh
set -e

pnpm exec bumpp --no-commit --no-tag --yes

VERSION=$(node -p "require('../package.json').version")

echo "📦 Preparing to publish version $VERSION..."

if pnpm publish "$@"; then
  echo "✅ Publish succeeded! Creating git commit and tag..."
  git add package.json
  git commit -m "release: v$VERSION"
  git tag "v$VERSION"
  git push
  git push --tags
else
  echo "❌ Publish failed. Reverting version bump..."
  git checkout -- package.json
  exit 1
fi
