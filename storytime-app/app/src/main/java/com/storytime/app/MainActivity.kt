package com.storytime.app

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.media.MediaPlayer
import android.net.Uri
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.AdView
import com.google.android.gms.ads.MobileAds
import org.json.JSONArray
import java.io.File
import java.io.FileOutputStream
import java.net.URL
import android.util.Log
import java.util.Locale
import kotlin.concurrent.thread

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var adView: AdView
    private var speechRecognizer: SpeechRecognizer? = null
    private var mediaPlayer: MediaPlayer? = null
    private var isListening = false
    private var isPrepared = false
    private var backPressedTime: Long = 0

    companion object {
        private const val PERMISSION_REQUEST_RECORD_AUDIO = 1001
        private const val TAG = "StoryTime"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        setupWebView()
        setupAdMob()
        checkAudioPermission()
        cleanOldAudioCache()
    }

    // Clean cached audio files older than 7 days
    private fun cleanOldAudioCache() {
        thread {
            try {
                val cacheDir = File(cacheDir, "audio_cache")
                if (cacheDir.exists()) {
                    val sevenDaysAgo = System.currentTimeMillis() - (7 * 24 * 60 * 60 * 1000)
                    cacheDir.listFiles()?.forEach { file ->
                        if (file.lastModified() < sevenDaysAgo) {
                            file.delete()
                        }
                    }
                }
            } catch (e: Exception) {
                // Ignore cache cleanup errors
            }
        }
    }

    private fun setupAdMob() {
        // Initialize Mobile Ads SDK
        MobileAds.initialize(this) {}

        // Load banner ad
        adView = findViewById(R.id.adView)
        val adRequest = AdRequest.Builder().build()
        adView.loadAd(adRequest)
    }

    private fun setupWebView() {
        webView = findViewById(R.id.webView)

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            mediaPlaybackRequiresUserGesture = false
            loadWithOverviewMode = true
            useWideViewPort = true
            // Allow mixed content (HTTP from HTTPS or file://)
            mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            // Allow cross-origin requests
            allowUniversalAccessFromFileURLs = true
            allowFileAccessFromFileURLs = true
        }

        webView.webViewClient = WebViewClient()
        webView.webChromeClient = WebChromeClient()

        // Add JavaScript interface
        webView.addJavascriptInterface(WebAppInterface(), "Android")

        // Load the main HTML page
        webView.loadUrl("file:///android_asset/index.html")
    }

    private fun checkAudioPermission() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
            != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(Manifest.permission.RECORD_AUDIO),
                PERMISSION_REQUEST_RECORD_AUDIO
            )
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        when (requestCode) {
            PERMISSION_REQUEST_RECORD_AUDIO -> {
                if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    // Permission granted
                    runOnUiThread {
                        webView.evaluateJavascript("onPermissionGranted()", null)
                    }
                } else {
                    Toast.makeText(this, "Permission micro requise pour enregistrer", Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    // JavaScript Interface for communication between WebView and Android
    inner class WebAppInterface {

        @JavascriptInterface
        fun startSpeechRecognition(lang: String) {
            runOnUiThread {
                startListening(lang)
            }
        }

        @JavascriptInterface
        fun stopSpeechRecognition() {
            runOnUiThread {
                stopListening()
            }
        }

        @JavascriptInterface
        fun playAudio(url: String) {
            runOnUiThread {
                playAudioFile(url)
            }
        }

        @JavascriptInterface
        fun pauseAudio() {
            runOnUiThread {
                pauseAudioFile()
            }
        }

        @JavascriptInterface
        fun resumeAudio() {
            runOnUiThread {
                resumeAudioFile()
            }
        }

        @JavascriptInterface
        fun stopAudio() {
            runOnUiThread {
                stopAudioFile()
            }
        }

        @JavascriptInterface
        fun seekAudio(position: Int) {
            runOnUiThread {
                seekAudioFile(position)
            }
        }

        @JavascriptInterface
        fun getAudioDuration(): Int {
            return mediaPlayer?.duration ?: 0
        }

        @JavascriptInterface
        fun getAudioPosition(): Int {
            return mediaPlayer?.currentPosition ?: 0
        }

        @JavascriptInterface
        fun isAudioPlaying(): Boolean {
            return mediaPlayer?.isPlaying ?: false
        }

        @JavascriptInterface
        fun showToast(message: String) {
            runOnUiThread {
                Toast.makeText(this@MainActivity, message, Toast.LENGTH_SHORT).show()
            }
        }

        @JavascriptInterface
        fun shareText(text: String) {
            runOnUiThread {
                val shareIntent = Intent(Intent.ACTION_SEND)
                shareIntent.type = "text/plain"
                shareIntent.putExtra(Intent.EXTRA_TEXT, text)
                startActivity(Intent.createChooser(shareIntent, "Partager"))
            }
        }

        @JavascriptInterface
        fun shareAudio(audioUrl: String, title: String) {
            runOnUiThread {
                shareAudioFile(audioUrl, title)
            }
        }

        @JavascriptInterface
        fun hasAudioPermission(): Boolean {
            return ContextCompat.checkSelfPermission(
                this@MainActivity,
                Manifest.permission.RECORD_AUDIO
            ) == PackageManager.PERMISSION_GRANTED
        }

        @JavascriptInterface
        fun requestAudioPermission() {
            runOnUiThread {
                checkAudioPermission()
            }
        }

        @JavascriptInterface
        fun makeApiCall(url: String, method: String, body: String, apiKey: String): String {
            // Make HTTP request from native code to bypass WebView restrictions
            return try {
                Log.d(TAG, "Making API call to: $url")
                val connection = URL(url).openConnection() as java.net.HttpURLConnection
                connection.requestMethod = method
                connection.connectTimeout = 300000  // 5 minutes
                connection.readTimeout = 300000    // 5 minutes
                connection.setRequestProperty("Content-Type", "application/json")
                connection.setRequestProperty("X-API-Key", apiKey)
                connection.setRequestProperty("Accept", "application/json")
                connection.setRequestProperty("Connection", "keep-alive")
                connection.setRequestProperty("Keep-Alive", "timeout=300")

                if (method == "POST" && body.isNotEmpty()) {
                    connection.doOutput = true
                    connection.outputStream.use { os ->
                        os.write(body.toByteArray(Charsets.UTF_8))
                    }
                }

                val responseCode = connection.responseCode
                Log.d(TAG, "API Response code: $responseCode")

                val response = if (responseCode >= 400) {
                    connection.errorStream?.bufferedReader()?.use { it.readText() } ?: "Error"
                } else {
                    connection.inputStream.bufferedReader().use { it.readText() }
                }

                Log.d(TAG, "API Response: ${response.take(200)}")

                // Return JSON with status and response
                "{\"status\":$responseCode,\"data\":$response}"
            } catch (e: Exception) {
                Log.e(TAG, "API call error", e)
                "{\"status\":-1,\"error\":\"${e.message?.replace("\"", "'") ?: "Unknown error"}\"}"
            }
        }
    }

    // Speech Recognition
    private fun startListening(lang: String) {
        if (!SpeechRecognizer.isRecognitionAvailable(this)) {
            Toast.makeText(this, "Reconnaissance vocale non disponible", Toast.LENGTH_SHORT).show()
            webView.evaluateJavascript("onSpeechError('not_available')", null)
            return
        }

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
            != PackageManager.PERMISSION_GRANTED) {
            checkAudioPermission()
            return
        }

        // If already listening, stop first
        if (isListening) {
            stopListening()
            // Add a small delay before restarting
            android.os.Handler(mainLooper).postDelayed({
                startListeningInternal(lang)
            }, 300)
        } else {
            startListeningInternal(lang)
        }
    }

    private fun startListeningInternal(lang: String) {
        // Always destroy and recreate to avoid busy state
        speechRecognizer?.destroy()
        speechRecognizer = null

        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this)

        speechRecognizer?.setRecognitionListener(object : RecognitionListener {
            override fun onReadyForSpeech(params: Bundle?) {
                isListening = true
                webView.evaluateJavascript("onSpeechStart()", null)
            }

            override fun onBeginningOfSpeech() {}

            override fun onRmsChanged(rmsdB: Float) {
                // Send audio level to web for visualization
                webView.evaluateJavascript("onAudioLevel($rmsdB)", null)
            }

            override fun onBufferReceived(buffer: ByteArray?) {}

            override fun onEndOfSpeech() {
                isListening = false
            }

            override fun onError(error: Int) {
                isListening = false
                // Destroy recognizer on error to ensure clean state next time
                speechRecognizer?.destroy()
                speechRecognizer = null

                val errorMessage = when (error) {
                    SpeechRecognizer.ERROR_NO_MATCH -> "no_match"
                    SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "timeout"
                    SpeechRecognizer.ERROR_AUDIO -> "audio_error"
                    SpeechRecognizer.ERROR_NETWORK -> "network_error"
                    SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "busy"
                    SpeechRecognizer.ERROR_CLIENT -> "client_error"
                    else -> "error_$error"
                }
                webView.evaluateJavascript("onSpeechError('$errorMessage')", null)
            }

            override fun onResults(results: Bundle?) {
                isListening = false
                // Destroy recognizer after results to ensure clean state
                speechRecognizer?.destroy()
                speechRecognizer = null

                val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                if (!matches.isNullOrEmpty()) {
                    val jsonArray = JSONArray(matches)
                    webView.evaluateJavascript("onSpeechResults($jsonArray)", null)
                }
            }

            override fun onPartialResults(partialResults: Bundle?) {
                val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                if (!matches.isNullOrEmpty()) {
                    val text = matches[0]
                    webView.evaluateJavascript("onSpeechPartial('${text.replace("'", "\\'")}')", null)
                }
            }

            override fun onEvent(eventType: Int, params: Bundle?) {}
        })

        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, if (lang == "en") Locale.ENGLISH else Locale.FRENCH)
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5)
        }

        speechRecognizer?.startListening(intent)
    }

    private fun stopListening() {
        speechRecognizer?.stopListening()
        speechRecognizer?.destroy()
        speechRecognizer = null
        isListening = false
        webView.evaluateJavascript("onSpeechStop()", null)
    }

    // Audio Player - Download to cache first for reliability with large files
    private fun playAudioFile(url: String) {
        Log.d(TAG, "playAudioFile called with URL: $url")

        thread {
            try {
                // Download audio to cache for reliable playback
                val cacheDir = File(cacheDir, "audio_cache")
                cacheDir.mkdirs()
                Log.d(TAG, "Cache dir: ${cacheDir.absolutePath}")

                // Use hash of URL as filename
                val fileName = "audio_${url.hashCode()}.mp3"
                val audioFile = File(cacheDir, fileName)
                Log.d(TAG, "Audio file: ${audioFile.absolutePath}")

                // Download if not already cached
                if (!audioFile.exists() || audioFile.length() == 0L) {
                    Log.d(TAG, "Starting download...")
                    runOnUiThread {
                        webView.evaluateJavascript("console.log('Downloading audio...')", null)
                    }

                    val connection = URL(url).openConnection() as java.net.HttpURLConnection
                    connection.connectTimeout = 60000  // 60 seconds
                    connection.readTimeout = 180000    // 3 minutes for large files
                    connection.setRequestProperty("Connection", "close")
                    connection.connect()

                    val responseCode = connection.responseCode
                    Log.d(TAG, "HTTP Response code: $responseCode")

                    if (responseCode != 200) {
                        throw Exception("HTTP error: $responseCode")
                    }

                    val contentLength = connection.contentLength
                    Log.d(TAG, "Content length: $contentLength bytes")

                    var downloadedBytes = 0L
                    connection.inputStream.use { input ->
                        FileOutputStream(audioFile).use { output ->
                            val buffer = ByteArray(8192)
                            var bytesRead: Int
                            while (input.read(buffer).also { bytesRead = it } != -1) {
                                output.write(buffer, 0, bytesRead)
                                downloadedBytes += bytesRead
                            }
                        }
                    }
                    Log.d(TAG, "Download complete: $downloadedBytes bytes")
                    connection.disconnect()
                } else {
                    Log.d(TAG, "Using cached file: ${audioFile.length()} bytes")
                }

                // Play from local file
                Log.d(TAG, "Starting playback from local file")
                runOnUiThread {
                    try {
                        mediaPlayer?.release()
                        isPrepared = false
                        mediaPlayer = MediaPlayer().apply {
                            setDataSource(audioFile.absolutePath)
                            setOnPreparedListener {
                                Log.d(TAG, "MediaPlayer prepared, duration: ${it.duration}ms")
                                isPrepared = true
                                it.start()
                                webView.evaluateJavascript("onAudioPlay(${it.duration})", null)
                                startProgressUpdate()
                            }
                            setOnCompletionListener {
                                Log.d(TAG, "Playback complete")
                                webView.evaluateJavascript("onAudioComplete()", null)
                            }
                            setOnErrorListener { _, what, extra ->
                                Log.e(TAG, "MediaPlayer error: what=$what, extra=$extra")
                                isPrepared = false
                                webView.evaluateJavascript("onAudioError('player_error_${what}_${extra}')", null)
                                true
                            }
                            prepareAsync()
                        }
                    } catch (e: Exception) {
                        Log.e(TAG, "MediaPlayer setup error", e)
                        isPrepared = false
                        webView.evaluateJavascript("onAudioError('setup_error: ${e.message?.replace("'", "\\'")}')", null)
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Download error", e)
                runOnUiThread {
                    isPrepared = false
                    webView.evaluateJavascript("onAudioError('download_failed: ${e.message?.replace("'", "\\'")}')", null)
                }
            }
        }
    }

    private fun pauseAudioFile() {
        if (isPrepared) {
            mediaPlayer?.pause()
            webView.evaluateJavascript("onAudioPause()", null)
        }
    }

    private fun resumeAudioFile() {
        if (isPrepared) {
            mediaPlayer?.start()
            webView.evaluateJavascript("onAudioResume()", null)
            startProgressUpdate()
        }
    }

    private fun stopAudioFile() {
        isPrepared = false
        mediaPlayer?.stop()
        mediaPlayer?.release()
        mediaPlayer = null
        webView.evaluateJavascript("onAudioStop()", null)
    }

    private fun seekAudioFile(position: Int) {
        mediaPlayer?.seekTo(position)
    }

    private fun startProgressUpdate() {
        val handler = android.os.Handler(mainLooper)
        val runnable = object : Runnable {
            override fun run() {
                mediaPlayer?.let { player ->
                    if (player.isPlaying) {
                        webView.evaluateJavascript(
                            "onAudioProgress(${player.currentPosition}, ${player.duration})",
                            null
                        )
                        handler.postDelayed(this, 500)
                    }
                }
            }
        }
        handler.post(runnable)
    }

    // Share audio file
    private fun shareAudioFile(audioUrl: String, title: String) {
        thread {
            try {
                // Download audio file to cache directory
                val cacheDir = File(cacheDir, "shared_audio")
                cacheDir.mkdirs()

                val safeTitle = title.replace(Regex("[^a-zA-Z0-9\\s]"), "").take(30)
                val audioFile = File(cacheDir, "${safeTitle}.mp3")

                URL(audioUrl).openStream().use { input ->
                    FileOutputStream(audioFile).use { output ->
                        input.copyTo(output)
                    }
                }

                runOnUiThread {
                    try {
                        val uri = FileProvider.getUriForFile(
                            this,
                            "${packageName}.fileprovider",
                            audioFile
                        )

                        val shareIntent = Intent(Intent.ACTION_SEND).apply {
                            type = "audio/mpeg"
                            putExtra(Intent.EXTRA_STREAM, uri)
                            putExtra(Intent.EXTRA_SUBJECT, title)
                            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                        }
                        startActivity(Intent.createChooser(shareIntent, "Partager l'histoire"))
                    } catch (e: Exception) {
                        Toast.makeText(this, "Erreur de partage: ${e.message}", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                runOnUiThread {
                    Toast.makeText(this, "Erreur de telechargement: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    // Handle back button
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            if (backPressedTime + 2000 > System.currentTimeMillis()) {
                super.onBackPressed()
            } else {
                Toast.makeText(this, "Appuie encore pour quitter", Toast.LENGTH_SHORT).show()
            }
            backPressedTime = System.currentTimeMillis()
        }
    }

    override fun onPause() {
        adView.pause()
        super.onPause()
    }

    override fun onResume() {
        super.onResume()
        adView.resume()
    }

    override fun onDestroy() {
        adView.destroy()
        speechRecognizer?.destroy()
        mediaPlayer?.release()
        super.onDestroy()
    }
}
