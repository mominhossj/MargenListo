"""Static security invariants for Android's backup picker (not device tests)."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
java=(root/'app/src/main/java/app/margenlisto/mobile/MainActivity.java').read_text()
reader=(root/'app/src/main/java/app/margenlisto/mobile/BackupJsonReader.java').read_text()
ledger=(root/'app/src/main/assets/ledger.js').read_text()
checks={
  'No general WebView file access': 'settings.setAllowFileAccess(false)' in java,
  'No general WebView content access': 'settings.setAllowContentAccess(false)' in java,
  'Document selection only': 'Intent.ACTION_OPEN_DOCUMENT' in java,
  'Explicit user file URI': 'data.getData()' in java,
  'Bounded input size': 'BackupJsonReader.read(stream, MAX_BACKUP_BYTES)' in java,
  'Non-blocking file read': 'new Thread(() -> {' in java,
  'UI-thread JS callback': 'runOnUiThread(() -> {' in java and 'webView.evaluateJavascript(' in java,
  'JS string is quoted': 'JSONObject.quote(text)' in java,
  'Reader strict UTF8': 'CodingErrorAction.REPORT' in reader,
  'Reader bounded': 'length > maxBytes' in reader,
  'Target only ledger': 'isLedgerPageOpen()' in java,
  'JS validates backup': 'core.parseBackup(text)' in ledger,
  'JS restores on failed save': 'if(!persist()){entries=previous;return;}' in ledger,
}
fail=[n for n,yes in checks.items() if not yes]
if fail: raise AssertionError('; '.join(fail))
print('Backup picker static: '+str(len(checks))+' invariants OK (not Android compilation)')
