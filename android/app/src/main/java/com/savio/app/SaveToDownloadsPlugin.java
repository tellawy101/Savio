package com.savio.app;

import android.Manifest;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
@CapacitorPlugin(
    name = "SaveToDownloads",
    permissions = {
        @Permission(strings = { Manifest.permission.WRITE_EXTERNAL_STORAGE }, alias = "storage")
    }
)
public class SaveToDownloadsPlugin extends Plugin {

    @PluginMethod
    public void save(PluginCall call) {
        String fileName = call.getString("fileName");
        String content = call.getString("content");

        if (fileName == null || content == null) {
            call.reject("fileName and content are required");
            return;
        }

        // أندرويد 23–28 محتاج إذن تخزين وقت التشغيل
        boolean needsRuntimePermission =
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                && Build.VERSION.SDK_INT < Build.VERSION_CODES.Q;

        if (needsRuntimePermission && getPermissionState("storage") != PermissionState.GRANTED) {
            requestPermissionForAlias("storage", call, "storagePermissionCallback");
            return;
        }

        doSave(call);
    }

    @PermissionCallback
    private void storagePermissionCallback(PluginCall call) {
        if (getPermissionState("storage") == PermissionState.GRANTED) {
            doSave(call);
        } else {
            call.reject("Storage permission denied");
        }
    }

    private void doSave(PluginCall call) {
        String fileName = sanitizeFileName(call.getString("fileName"));
        String content = call.getString("content");

        if (fileName.isEmpty() || content == null) {
            call.reject("Invalid fileName or content");
            return;
        }

        byte[] data = content.getBytes(StandardCharsets.UTF_8);

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                saveWithMediaStore(getContext(), fileName, data);
            } else {
                saveLegacy(fileName, data);
            }

            JSObject ret = new JSObject();
            ret.put("saved", true);
            call.resolve(ret);

        } catch (Exception e) {
            call.reject("Failed to save file: " + e.getMessage(), e);
        }
    }

    private void saveWithMediaStore(Context context, String fileName, byte[] data) throws IOException {
        ContentResolver resolver = context.getContentResolver();

        ContentValues values = new ContentValues();
        values.put(MediaStore.Downloads.DISPLAY_NAME, fileName);
        values.put(MediaStore.Downloads.MIME_TYPE, "application/json");
        values.put(MediaStore.Downloads.IS_PENDING, 1);

        Uri itemUri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
        if (itemUri == null) {
            throw new IOException("Could not create file in Downloads");
        }

        try {
            try (OutputStream out = resolver.openOutputStream(itemUri)) {
                if (out == null) {
                    throw new IOException("Could not open output stream");
                }
                out.write(data);
            }

            values.clear();
            values.put(MediaStore.Downloads.IS_PENDING, 0);
            resolver.update(itemUri, values, null, null);

        } catch (IOException | RuntimeException e) {
            // حذف السجل اليتيم (IS_PENDING=1) لو حصل فشل
            resolver.delete(itemUri, null, null);
            throw e;
        }
    }

    private void saveLegacy(String fileName, byte[] data) throws IOException {
        File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
        if (!downloadsDir.exists() && !downloadsDir.mkdirs()) {
            throw new IOException("Could not create Downloads directory");
        }

        File file = new File(downloadsDir, fileName);
        try (FileOutputStream fos = new FileOutputStream(file)) {
            fos.write(data);
        }
    }

    // بيشيل أي مسار (../ أو /) ويسيب اسم الملف بس
    private String sanitizeFileName(String name) {
        if (name == null) return "";
        String n = name.replace("\\", "/");
        int idx = n.lastIndexOf('/');
        if (idx >= 0) n = n.substring(idx + 1);
        return n.replace("..", "").trim();
    }
}