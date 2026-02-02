# Add project specific ProGuard rules here.
# Keep JavaScript interface
-keepclassmembers class com.storytime.app.MainActivity$WebAppInterface {
    public *;
}

# Keep WebView JS interface
-keepattributes JavascriptInterface
