import app.margenlisto.mobile.OfflineRouteResolver;

public final class OfflineRoutesTest {
    private static int checked=0;
    private static void test(String input, String output) {
        checked++;
        String actual=OfflineRouteResolver.resolve(input);
        if (output == null ? actual != null : !output.equals(actual)) {
            throw new AssertionError(input + " expected=" + output + " actual=" + actual);
        }
    }
    public static void main(String[] args) {
        test("/", "/index.html");
        test("/index.html", "/index.html");
        test("/registro-ventas/", "/registro-ventas/index.html");
        test("/registro-ventas", "/registro-ventas/index.html");
        test("/margen-vs-recargo/", "/margen-vs-recargo/index.html");
        test("/precio-venta-instagram/", "/precio-venta-instagram/index.html");
        test("/calculadora-precio-de-venta/", "/calculadora-precio-de-venta/index.html");
        test("/calculadora-descuentos-rentables/", "/calculadora-descuentos-rentables/index.html");
        test("/app.js", "/app.js");
        test("/ledger.js", "/ledger.js");
        test("/styles.css", "/styles.css");
        test("/favicon.png", "/favicon.png");
        test("/logo-margenlisto.webp", "/logo-margenlisto.webp");
        test("/unknown", null);
        test("/registro-ventas/../../../etc/passwd", null);
        test("/%%2e%%2e/", null);
        test("//evil", null);
        test("http://example.com", null);
        test("\\etc", null);
        test(null, null);
        System.out.println("Offline routes: " + checked + " checks OK");
    }
}
