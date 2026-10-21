package app.margenlisto.mobile;

import android.app.Activity;
import android.app.AlertDialog;
import android.graphics.Color;
import android.os.Build;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.window.OnBackInvokedCallback;
import android.window.OnBackInvokedDispatcher;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.core.content.FileProvider;
import androidx.webkit.WebViewAssetLoader;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import org.json.JSONObject;
import java.io.File;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;

/** Offline calculator + sales ledger. No INTERNET permission and no ad SDK. */
public final class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final int PICK_BACKUP = 902;
    private static final int MAX_EXPORT_CHARS = 750000;
    private static final int MAX_BACKUP_BYTES = 750000;
    private ValueCallback<Uri[]> pendingPicker;
    private WebView webView;
    private OnBackInvokedCallback systemBackCallback;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/", new WebViewAssetLoader.AssetsPathHandler(this)).build();
        webView = new WebView(this);
        // Keep the WebView outside status/navigation bars on Android 15/16.
        // Insets are consumed at the parent so WebView does not double-pad them.
        FrameLayout container = new FrameLayout(this);
        container.setBackgroundColor(Color.rgb(11, 13, 12));
        webView.setBackgroundColor(Color.rgb(11, 13, 12));
        container.addView(webView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        ViewCompat.setOnApplyWindowInsetsListener(container, (view, windowInsets) -> {
            int types = WindowInsetsCompat.Type.systemBars()
                    | WindowInsetsCompat.Type.displayCutout();
            Insets safe = windowInsets.getInsets(types);
            view.setPadding(safe.left, safe.top, safe.right, safe.bottom);
            // Parent padding is already applied. Pass through IME insets, zero system bars.
            return new WindowInsetsCompat.Builder(windowInsets)
                    .setInsets(types, Insets.NONE)
                    .build();
        });
        setContentView(container);
        if (Build.VERSION.SDK_INT >= 33) {
            // Android 16 target 36 does not invoke Activity.onBackPressed().
            systemBackCallback = () -> navigateBackOrExit();
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                    OnBackInvokedDispatcher.PRIORITY_DEFAULT, systemBackCallback);
        }
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        WebView.setWebContentsDebuggingEnabled(false);
        android.webkit.CookieManager.getInstance().setAcceptCookie(false);
        android.webkit.CookieManager.getInstance().setAcceptThirdPartyCookies(webView, false);
        // Minimal bridge: the HTML is bundled and remote resources are rejected below.
        webView.addJavascriptInterface(new ExportBridge(), "MargenListoBridge");
        webView.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                Uri uri = req.getUrl();
                if (!"https".equals(uri.getScheme()) || !HOST.equals(uri.getHost())) {
                    return new WebResourceResponse("text/plain", "UTF-8", 403, "Forbidden",
                          java.util.Collections.emptyMap(), new ByteArrayInputStream(new byte[0]));
                }
                // Static sites use /folder/ routes; WebViewAssetLoader doesn't
                // automatically turn these into /folder/index.html.
                // Reject unknown paths instead of accidentally falling back to network.
                String encodedPath = uri.getEncodedPath();
                String bundledPath = OfflineRouteResolver.resolve(encodedPath);
                if (bundledPath == null) {
                    return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found",
                            java.util.Collections.emptyMap(), new ByteArrayInputStream(new byte[0]));
                }
                Uri assetUri = uri.buildUpon().encodedPath(bundledPath).build();
                WebResourceResponse asset = assetLoader.shouldInterceptRequest(assetUri);
                if (asset != null) return asset;
                return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found",
                        java.util.Collections.emptyMap(), new ByteArrayInputStream(new byte[0]));
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri uri = req.getUrl();
                if ("https".equals(uri.getScheme()) && HOST.equals(uri.getHost())) return false;
                // No remote website is loaded into the privileged WebView.
                if (req.isForMainFrame() && "https".equals(uri.getScheme())) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); }
                    catch (Exception ignored) { /* No external browser installed. */ }
                }
                return true;
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onJsConfirm(WebView view, String url, String message,
                                                  android.webkit.JsResult result) {
                new AlertDialog.Builder(MainActivity.this).setMessage(message)
                        .setPositiveButton("Aceptar", (d, w) -> result.confirm())
                        .setNegativeButton("Cancelar", (d, w) -> result.cancel()).show();
                return true;
            }
            @Override public boolean onShowFileChooser(WebView view,
                          ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (pendingPicker != null) pendingPicker.onReceiveValue(null);
                pendingPicker = callback;
                try {
                    Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                    intent.addCategory(Intent.CATEGORY_OPENABLE);
                    intent.setType("application/json");
                    intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    startActivityForResult(intent, PICK_BACKUP);
                } catch (Exception error) { pendingPicker.onReceiveValue(null); pendingPicker = null; }
                return true;
            }
        });
        webView.loadUrl("https://" + HOST + "/index.html");
    }

    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (request == PICK_BACKUP && pendingPicker != null) {
            // Never hand arbitrary content:// URLs to a JavaScript-enabled WebView.
            // The native Activity reads only a user-selected JSON document, bounded
            // to 750 KB, then passes its text to the local ledger for validation.
            pendingPicker.onReceiveValue(null);
            pendingPicker = null;
            if (result == RESULT_OK && data != null && data.getData() != null) {
                importBackupFromDocument(data.getData());
            }
        }
    }

    private boolean isLedgerPageOpen() {
        if (webView == null) return false;
        String url = webView.getUrl();
        return url != null && (url.equals("https://" + HOST + "/registro-ventas")
                || url.startsWith("https://" + HOST + "/registro-ventas/"));
    }

    private void importBackupFromDocument(Uri uri) {
        if (!isLedgerPageOpen()) return;
        // A user-selected document can be served by a slow content provider.
        // Read on a worker thread to avoid freezing the main UI thread.
        new Thread(() -> {
            try (InputStream stream = getContentResolver().openInputStream(uri)) {
                if (stream == null) throw new java.io.IOException("Cannot open selected file");
                String text = BackupJsonReader.read(stream, MAX_BACKUP_BYTES);
                runOnUiThread(() -> {
                    if (!isLedgerPageOpen()) return;
                    // Quote as a *single JavaScript string*, never inline as executable data.
                    webView.evaluateJavascript("window.MargenListoNativeImportBackup && "
                            + "window.MargenListoNativeImportBackup(" + JSONObject.quote(text) + ")", null);
                });
            } catch (Exception error) {
                runOnUiThread(() -> android.widget.Toast.makeText(this,
                        "No se pudo leer el respaldo. Elegí un JSON válido de hasta 750 KB.",
                        android.widget.Toast.LENGTH_LONG).show());
            }
        }, "MargenListoBackupReader").start();
    }
    private void navigateBackOrExit() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else finish();
    }
    @SuppressWarnings("deprecation")
    @Override public void onBackPressed() {
        if (Build.VERSION.SDK_INT >= 33) {
            // Back dispatcher handles modern devices; this is only a defensive fallback.
            navigateBackOrExit();
        } else if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
    @Override protected void onDestroy() {
        if (Build.VERSION.SDK_INT >= 33 && systemBackCallback != null) {
            getOnBackInvokedDispatcher().unregisterOnBackInvokedCallback(systemBackCallback);
        }
        if (webView != null) {
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }

    private final class ExportBridge {
        @JavascriptInterface public void exportCsv(String body) { share(body, "margenlisto-ventas.csv", "text/csv"); }
        @JavascriptInterface public void exportFilteredCsv(String body) { share(body, "margenlisto-vista-filtrada.csv", "text/csv"); }
        @JavascriptInterface public void exportBackup(String body) { share(body, "margenlisto-respaldo.json", "application/json"); }
        private void share(String body, String name, String mime) {
            if (body == null || body.length() > MAX_EXPORT_CHARS) return;
            runOnUiThread(() -> {
                try {
                    File dir = new File(getCacheDir(), "exports");
                    if (!dir.exists() && !dir.mkdirs()) return;
                    File file = new File(dir, name);
                    try (FileOutputStream stream = new FileOutputStream(file)) {
                        stream.write(body.getBytes(StandardCharsets.UTF_8));
                    }
                    Uri uri = FileProvider.getUriForFile(MainActivity.this,
                            getPackageName() + ".fileprovider", file);
                    Intent send = new Intent(Intent.ACTION_SEND);
                    send.setType(mime);
                    send.putExtra(Intent.EXTRA_STREAM, uri);
                    send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    startActivity(Intent.createChooser(send, "Guardar o compartir respaldo"));
                } catch (Exception ignored) { /* Exports are optional; no sensitive logs. */ }
            });
        }
    }
}
