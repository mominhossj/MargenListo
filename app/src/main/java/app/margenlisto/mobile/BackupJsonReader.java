package app.margenlisto.mobile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;

/** Strict, bounded UTF-8 reader for an explicitly user-selected JSON backup. */
public final class BackupJsonReader {
    private BackupJsonReader() {}

    public static String read(InputStream stream, int maxBytes) throws IOException {
        if (stream == null) throw new IOException("No backup file selected");
        if (maxBytes < 1) throw new IllegalArgumentException("Invalid size limit");
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        byte[] buffer = new byte[8192];
        int length = 0;
        for (int count; (count = stream.read(buffer)) != -1;) {
            length += count;
            if (length > maxBytes) throw new IOException("Backup exceeds size limit");
            output.write(buffer, 0, count);
        }
        final String text = StandardCharsets.UTF_8.newDecoder()
                .onMalformedInput(CodingErrorAction.REPORT)
                .onUnmappableCharacter(CodingErrorAction.REPORT)
                .decode(ByteBuffer.wrap(output.toByteArray())).toString();
        if (text.isEmpty()) throw new IOException("Backup is empty");
        return text.startsWith("\uFEFF") ? text.substring(1) : text;
    }
}
