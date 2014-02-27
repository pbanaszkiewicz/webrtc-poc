window.AudioContext = window.AudioContext || window.webkitAudioContext;
window.URL = window.URL || window.webkitURL;

var stream_handle = null
var microphone = null
var recorder = null
var audio_context = null

if (getUserMedia) {
    console.log("getUserMedia() is supported in your browser")

    function userMedia_success(stream) {
        console.log("Successfully enabled microphone.")

        $("#mic").removeClass("turned-off")
        $("#mic").addClass("turned-on")

        $("#mic > i").removeClass("fa-microphone-slash")
        $("#mic > i").addClass("fa-microphone")

        $("#start-recording").removeAttr("disabled")

        stream_handle = stream
    }

    function userMedia_error(error) {
        console.log("Error: microphone wasn't enabled.", error)

        $("#mic").removeClass("turned-on")
        $("#mic").addClass("turned-off")

        $("#mic > i").removeClass("fa-microphone")
        $("#mic > i").addClass("fa-microphone-slash")

        $("#start-recording").attr("disabled", "disabled")

        stream_handle = null
    }

    $(document).ready(function() {
        getUserMedia({audio: true}, userMedia_success, userMedia_error)
    })
} else {
    console.log("getUserMedia() is not supported!")
}

if (window.AudioContext) {
    console.log("AudioContext is supported in your browser!")
    audio_context = new AudioContext()

    $("#start-recording").click(function() {
        microphone = audio_context.createMediaStreamSource(stream_handle)
        recorder = new Recorder(microphone, {workerPath: "recorderWorker.js"})
        // no need to connect to speakers. Only recording.
        // microphone.connect(audio_context.destination)
        recorder && recorder.record()

        $("#start-recording").toggleClass("hidden")
        $("#stop-recording").toggleClass("hidden")

        console.log("Recording started")

        li = document.createElement("li")
        i_el = document.createElement("i")
        i_el.className = "fa fa-circle"
        li.appendChild(document.createTextNode("recording "))
        li.appendChild(i_el)
        recordings.appendChild(li)
    })

    $("#stop-recording").click(function() {
        $("#start-recording").toggleClass("hidden")
        $("#stop-recording").toggleClass("hidden")
        recorder.stop()
        recorder.exportWAV(function(blob) {
            url = URL.createObjectURL(blob)

            li = document.getElementById("recordings").lastChild

            audio_element = document.createElement('audio')
            audio_element.controls = true
            audio_element.src = url

            anchor = document.createElement('a')
            anchor.href = url
            anchor.download = new Date().toISOString() + '.wav'
            anchor.innerHTML = "Download recording"

            li.removeChild(li.lastChild)
            li.removeChild(li.lastChild)

            li.appendChild(audio_element)
            li.appendChild(document.createElement("br"))
            li.appendChild(anchor)
            recordings.appendChild(li)
        })

        console.log("Recording stopped")
    })
} else {
    console.log("AudioContext is not supported!")
}
