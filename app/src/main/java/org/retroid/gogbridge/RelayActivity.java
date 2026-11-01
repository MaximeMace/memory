package org.retroid.gogbridge;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ContentResolver;
import android.content.Intent;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.net.Uri;
import android.os.Bundle;
import android.provider.DocumentsContract;
import android.view.Gravity;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Locale;

/** Android trampoline: Retroid -> read numeric GOG file -> GameNative. */
public final class RelayActivity extends Activity {
    private static final int PICK_DIRECTORY = 204;
    private static final String KEY_TREE = "rom_folder_uri";
    private String selectedPath;

    @Override public void onCreate(Bundle saved) {
        super.onCreate(saved);
        if (saved != null) selectedPath = saved.getString("selectedPath");
        if (selectedPath == null) selectedPath = pathFromIntent(getIntent());
        attemptLaunch();
    }

    @Override protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        selectedPath = pathFromIntent(intent);
        attemptLaunch();
    }

    @Override protected void onSaveInstanceState(Bundle state) {
        state.putString("selectedPath", selectedPath);
        super.onSaveInstanceState(state);
    }

    private String pathFromIntent(Intent intent) {
        if (intent == null) return null;
        for (String key : new String[] { "rom_path", "game_file", "file_path", "LaunchPath", "ROM" }) {
            String value = intent.getStringExtra(key);
            if (value != null && !value.trim().isEmpty()) return value.trim();
        }
        Uri data = intent.getData();
        return data == null ? null : data.toString();
    }

    private void attemptLaunch() {
        if (selectedPath == null || selectedPath.isEmpty()) {
            showMessage("Aucun chemin reçu. Config Retroid : rom_path = {file.path}", false);
            return;
        }
        String name = filename(selectedPath);
        if (name == null) {
            showMessage("Chemin invalide : " + selectedPath + " (fichier .gog attendu)", false);
            return;
        }
        try (InputStream input = openGog(selectedPath, name)) {
            int id = GogIdParser.parse(input);
            Intent launch = new Intent("app.gamenative.LAUNCH_GAME");
            launch.setClassName("app.gamenative", "app.gamenative.MainActivity");
            launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            launch.putExtra("app_id", id); 
            launch.putExtra("game_source", "GOG");
            startActivity(launch);
            finish();
        } catch (ActivityNotFoundException e) {
            showMessage("GameNative est introuvable.", false);
        } catch (SecurityException e) {
            showMessage("Accès au fichier refusé. Choisis ROMs/PC.", true);
        } catch (IOException e) {
            showMessage("Lecture impossible de " + name + ": " + e.getMessage(), true);
        } catch (RuntimeException e) {
            showMessage("Erreur: " + e.getMessage(), true);
        }
    }

    private static String filename(String path) {
        String name = (path.startsWith("content://") || path.startsWith("file://"))
            ? Uri.parse(path).getLastPathSegment() : new File(path).getName();
        if (name == null || !name.toLowerCase(Locale.ROOT).endsWith(".gog")
            || name.contains("/") || name.contains("\\") || name.equals(".gog")) return null;
        return name;
    }

    private InputStream openGog(String path, String name) throws IOException {
        String tree = getSharedPreferences("bridge", MODE_PRIVATE).getString(KEY_TREE, null);
        if (tree != null) {
            try {
                InputStream stream = fromTree(Uri.parse(tree), name);
                if (stream != null) return stream;
            } catch (Exception ignored) { }
        }
        if (path.startsWith("content://")) {
            InputStream stream = getContentResolver().openInputStream(Uri.parse(path));
            if (stream == null) throw new IOException("URI inaccessible");
            return stream;
        }
        File file = new File(path.startsWith("file://") ? Uri.parse(path).getPath() : path);
        if (!file.isFile()) throw new IOException("Fichier introuvable / accès refusé");
        return new FileInputStream(file);
    }

    private InputStream fromTree(Uri tree, String name) throws IOException {
        ContentResolver resolver = getContentResolver();
        String root = DocumentsContract.getTreeDocumentId(tree);
        Uri children = DocumentsContract.buildChildDocumentsUriUsingTree(tree, root);
        try (Cursor cursor = resolver.query(children,
            new String[] { DocumentsContract.Document.COLUMN_DOCUMENT_ID,
                           DocumentsContract.Document.COLUMN_DISPLAY_NAME }, null, null, null)) {
            if (cursor == null) throw new IOException("Dossier inaccessible");
            while (cursor.moveToNext()) {
                if (name.equals(cursor.getString(1))) {
                    Uri child = DocumentsContract.buildDocumentUriUsingTree(tree, cursor.getString(0));
                    InputStream input = resolver.openInputStream(child);
                    if (input == null) throw new IOException("Fichier inaccessible");
                    return input;
                }
            }
        }
        return null;
    }

    private void chooseFolder() {
        Intent picker = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
        picker.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION
            | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
        try { startActivityForResult(picker, PICK_DIRECTORY); }
        catch (ActivityNotFoundException e) { showMessage("Sélecteur Android indisponible", false); }
    }

    @Override protected void onActivityResult(int code, int result, Intent data) {
        super.onActivityResult(code, result, data);
        if (code != PICK_DIRECTORY || result != RESULT_OK || data == null || data.getData() == null) return;
        Uri tree = data.getData();
        try {
            getContentResolver().takePersistableUriPermission(tree, Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getSharedPreferences("bridge", MODE_PRIVATE).edit().putString(KEY_TREE, tree.toString()).apply();
            attemptLaunch();
        } catch (SecurityException e) {
            showMessage("Autorisation du dossier refusée", true);
        }
    }

    private void showMessage(String message, boolean allowFolder) {
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(42, 50, 42, 42);
        layout.setGravity(Gravity.CENTER_VERTICAL);
        TextView title = new TextView(this);
        title.setText("GameNative GOG Bridge");
        title.setTextSize(23);
        layout.addView(title);
        TextView info = new TextView(this);
        info.setText(message);
        info.setTextSize(16);
        info.setPadding(0, 28, 0, 28);
        layout.addView(info);
        if (allowFolder) {
            Button select = new Button(this);
            select.setText("Choisir le dossier ROMs/PC (une seule fois)");
            select.setOnClickListener(v -> chooseFolder());
            layout.addView(select);
        }
        Button close = new Button(this);
        close.setText("Fermer");
        close.setOnClickListener(v -> finish());
        layout.addView(close);
        setContentView(layout);
    }
}
