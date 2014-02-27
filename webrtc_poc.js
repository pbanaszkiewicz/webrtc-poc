window.AudioContext = window.AudioContext || window.webkitAudioContext;
window.URL = window.URL || window.webkitURL;

var stream_handle = null
var microphone = null
var filter = null
var recorder = null

function success_callback(stream) {
    console.log("Successfully enabled microphone.")

    $("#mic").removeClass("turned-off")
    $("#mic").addClass("turned-on")

    $("#mic > i").removeClass("fa-microphone-slash")
    $("#mic > i").addClass("fa-microphone")

    $("#start-recording").removeAttr("disabled")

    $("#allow-mic-hint").css("text-decoration", "line-through")

    stream_handle = stream
}

function error_callback(error) {
    console.log("Error: microphone wasn't enabled.", error)

    $("#mic").removeClass("turned-on")
    $("#mic").addClass("turned-off")

    $("#mic > i").removeClass("fa-microphone")
    $("#mic > i").addClass("fa-microphone-slash")

    $("#start-recording").attr("disabled", "disabled")

    $("#allow-mic-hint").css("text-decoration", "none")

    stream_handle = null
}

if (getUserMedia) {
    console.log("getUserMedia() is supported in your browser")

    $(document).ready(function() {
        getUserMedia({audio: true}, success_callback, error_callback)
    })
} else {
    console.log("getUserMedia() is not supported!")
}

if (window.AudioContext) {
    console.log("AudioContext is supported in your browser!")

    $("#start-recording").click(function() {
        // this init could be moved to other init callback
        context = new AudioContext()
        microphone = context.createMediaStreamSource(stream_handle)

        recorder = new Recorder(microphone, {workerPath: "recorderWorker.js"})
        // no need to connect to speakers. Only recording.
        // microphone.connect(context.destination)
        recorder && recorder.record()

        $("#start-recording").toggleClass("hidden")
        $("#stop-recording").toggleClass("hidden")
        $("#start-recording-hint").css("text-decoration", "line-through")

        console.log("Recording started")
    })

    $("#stop-recording").click(function() {
        $("#start-recording").toggleClass("hidden")
        $("#stop-recording").toggleClass("hidden")
        $("#start-recording-hint").css("text-decoration", "none")
        recorder.stop()
        recorder.exportWAV(function(blob) {
            var url = URL.createObjectURL(blob);
            var li = document.createElement('li');
            var audio_element = document.createElement('audio');
            var anchor = document.createElement('a');

            audio_element.controls = true;
            audio_element.src = url;
            anchor.href = url;
            anchor.download = new Date().toISOString() + '.wav';
            anchor.innerHTML = "Download";
            li.appendChild(audio_element);
            li.appendChild(anchor);
            recordings.appendChild(li);
        })

        console.log("Recording stopped")
    })
} else {
    console.log("AudioContext is not supported!")
}
