navigator.getUserMedia  = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia;

window.AudioContext = window.AudioContext ||
                      window.webkitAudioContext;

var stream_handle = null
var microphone = null
var filter = null

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

if (navigator.getUserMedia) {
    console.log("getUserMedia() is supported in your browser")

    $(document).ready(function() {
        navigator.getUserMedia({audio: true}, success_callback, error_callback)
    })
} else {
    console.log("getUserMedia() is not supported!")
}

if (window.AudioContext) {
    console.log("AudioContext is supported in your browser!")

    $("#start-recording").click(function() {
        context = new AudioContext()
        microphone = context.createMediaStreamSource(stream_handle)
        filter = context.createBiquadFilter()
        // microphone -> filter -> destination.
        microphone.connect(filter)
        filter.connect(context.destination)

        $("#start-recording").toggleClass("hidden")
        $("#stop-recording").toggleClass("hidden")

        console.log("Recording started")
    })

    $("#stop-recording").click(function() {
        $("#start-recording").toggleClass("hidden")
        $("#stop-recording").toggleClass("hidden")
        filter.disconnect()
        microphone.disconnect()

        console.log("Recording stopped")
    })
} else {
    console.log("AudioContext is not supported!")
}
