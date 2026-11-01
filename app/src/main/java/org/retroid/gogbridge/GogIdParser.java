package org.retroid.gogbridge;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
public final class GogIdParser {
    private GogIdParser() { }
    public static int parse(InputStream source) throws IOException {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        byte[] block = new byte[64];
        int count;
        while ((count = source.read(block)) != -1) {
            if (buffer.size() + count > 128) throw new IOException("Fichier .gog trop long");
            buffer.write(block, 0, count);
        }
        String text = new String(buffer.toByteArray(), StandardCharsets.UTF_8)
                .replace("\uFEFF", "").trim();
        if (!text.matches("[0-9]+")) throw new IOException("ID GOG non numérique");
        try {
            int id = Integer.parseInt(text);
            if (id <= 0) throw new NumberFormatException();
            return id;
        } catch (NumberFormatException e) {
            throw new IOException("ID GOG invalide", e);
        }
    }
}
