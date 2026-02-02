package com.storytime.app

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.media.MediaPlayer
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
import org.json.JSONArray
import java.util.Locale

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private var speechRecognizer: SpeechRecognizer? = null
    private var mediaPlayer: MediaPlayer? = null
    private var isListening = false
    private var backPressedTime: Long = 0

    companion object {
        private const val PERMISSION_REQUEST_RECORD_AUDIO = 1001
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        setupWebView()
        checkAudioPermission()
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

        speechRecognizer?.destroy()
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
                val errorMessage = when (error) {
                    SpeechRecognizer.ERROR_NO_MATCH -> "no_match"
                    SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "timeout"
                    SpeechRecognizer.ERROR_AUDIO -> "audio_error"
                    SpeechRecognizer.ERROR_NETWORK -> "network_error"
                    else -> "error_$error"
                }
                webView.evaluateJavascript("onSpeechError('$errorMessage')", null)
            }

            override fun onResults(results: Bundle?) {
                isListening = false
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
        isListening = false
        webView.evaluateJavascript("onSpeechStop()", null)
    }

    // Audio Player
    private fun playAudioFile(url: String) {
        try {
            mediaPlayer?.release()
            mediaPlayer = MediaPlayer().apply {
                setDataSource(url)
                setOnPreparedListener {
                    it.start()
                    webView.evaluateJavascript("onAudioPlay(${it.duration})", null)
                    startProgressUpdate()
                }
                setOnCompletionListener {
                    webView.evaluateJavascript("onAudioComplete()", null)
                }
                setOnErrorListener { _, what, extra ->
                    webView.evaluateJavascript("onAudioError('error_${what}_${extra}')", null)
                    true
                }
                prepareAsync()
            }
        } catch (e: Exception) {
            webView.evaluateJavascript("onAudioError('${e.message?.replace("'", "\\'")}')", null)
        }
    }

    private fun pauseAudioFile() {
        mediaPlayer?.pause()
        webView.evaluateJavascript("onAudioPause()", null)
    }

    private fun resumeAudioFile() {
        mediaPlayer?.start()
        webView.evaluateJavascript("onAudioResume()", null)
        startProgressUpdate()
    }

    private fun stopAudioFile() {
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

    override fun onDestroy() {
        speechRecognizer?.destroy()
        mediaPlayer?.release()
        super.onDestroy()
    }
}
