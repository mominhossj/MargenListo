#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
for f in app/src/main/assets/*.js; do node --check "$f"; done
node tests/ledger-core.spec.js
node tests/financial-precision.spec.js
node tests/ledger-import.spec.js
node tests/reporting.spec.js
node tests/performance_v6.spec.js
node tests/data_integrity.spec.js
for f in tests/check_*.py; do python3 "$f"; done
mkdir -p build/jvm-tests
javac -d build/jvm-tests \
  app/src/main/java/app/margenlisto/mobile/OfflineRouteResolver.java \
  app/src/main/java/app/margenlisto/mobile/BackupJsonReader.java \
  tests/OfflineRoutesTest.java tests/BackupJsonReaderTest.java
java -cp build/jvm-tests OfflineRoutesTest
java -cp build/jvm-tests BackupJsonReaderTest
python3 scripts/verify-package.py
python3 tests/verify_apk_spec.py
python3 tests/v6_permissions.py
python3 tests/v6_android_config.py
