package app.margenlisto.mobile;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/** Pure offline URL resolver. Does not access Android or the network. */
public final class OfflineRouteResolver {
    private OfflineRouteResolver() {}
    private static final Set<String> BUNDLED_ASSETS = Collections.unmodifiableSet(
            new HashSet<>(Arrays.asList(
                "/app.js",
                "/apple-touch-icon-pwa.png",
                "/apple-touch-icon.png",
                "/calc.js",
                "/calculadora-descuentos-rentables/index.html",
                "/calculadora-precio-de-venta/index.html",
                "/favicon.png",
                "/favicon.svg",
                "/guias.css",
                "/herramientas.css",
                "/herramientas.js",
                "/icon-192.png",
                "/icon-512.png",
                "/icon-maskable-512.png",
                "/index.html",
                "/ledger-core.js",
                "/ledger.css",
                "/ledger.js",
                "/logo-margenlisto.webp",
                "/margen-vs-recargo/index.html",
                "/margenlisto-compartir.jpg",
                "/precio-venta-instagram/index.html",
                "/registro-ventas/index.html",
                "/styles.css"
            )));

    /** Maps site-style URLs to packaged HTML; rejects unknown and unsafe paths. */
    public static String resolve(String rawPath) {
        if (rawPath == null || !rawPath.startsWith("/") || rawPath.contains("\\")
                || rawPath.contains("%") || rawPath.contains("..")
                || rawPath.contains("//") || rawPath.indexOf('\0') >= 0) return null;
        String path = rawPath;
        if ("/".equals(path)) path = "/index.html";
        else if (path.endsWith("/")) path += "index.html";
        else if (BUNDLED_ASSETS.contains(path + "/index.html")) path += "/index.html";
        return BUNDLED_ASSETS.contains(path) ? path : null;
    }
}
