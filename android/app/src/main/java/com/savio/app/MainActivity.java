package com.savio.app;

import android.os.Bundle;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(SaveToDownloadsPlugin.class);
        registerPlugin(AppExitPlugin.class);
        super.onCreate(savedInstanceState);

        // اعتراض زر الرجوع ومنع الـ WebView من عمل goBack تلقائي
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (bridge != null && bridge.getWebView() != null) {
                    bridge.getWebView().evaluateJavascript(
                        "if (window.handleHardwareBack) { window.handleHardwareBack(); }",
                        null
                    );
                }
            }
        });
    }

    @Override
    public void onBackPressed() {
        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().evaluateJavascript(
                "if (window.handleHardwareBack) { window.handleHardwareBack(); }",
                null
            );
        }
    }
}