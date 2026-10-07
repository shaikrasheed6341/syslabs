const connectbtn = document.getElementById("connect");
const joinbtn = document.getElementById("join");
const camerabtn = document.getElementById("cambtn");
const offerbtn = document.getElementById("offer");

const username = document.getElementById("username");
const roomcode = document.getElementById("roomcode");

const camera = document.getElementById("cam");
const remoteVideo = document.getElementById("remoteCam");

const status = document.getElementById("status");
const meetstatus = document.getElementById("meet");
const sdptext = document.getElementById("sdp");


// -----------------------------
// WEBSOCKET
// -----------------------------

let socket = null;


// -----------------------------
// WEBRTC PEER
// -----------------------------

let peer = null;


// -----------------------------
// GET CAMERA
// -----------------------------

async function getmedia() {

    const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    });

    console.log("MY MEDIA STREAM:");
    console.log(stream);

    return stream;
}


// -----------------------------
// CREATE PEER CONNECTION
// -----------------------------

async function createPeer() {

    const configuration = {
        iceServers: [
            {
                urls: "stun:stun.l.google.com:19302"
            }
        ]
    };

    peer = new RTCPeerConnection(configuration);

    console.log("RTCPeerConnection created");

    // --------------------------------
    // REMOTE VIDEO
    // --------------------------------

    peer.ontrack = (event) => {

        console.log("REMOTE TRACK RECEIVED");

        console.log(event);

        remoteVideo.srcObject = event.streams[0];
    };


    // --------------------------------
    // ICE CANDIDATE
    // --------------------------------

    peer.onicecandidate = (event) => {

        console.log("ICE EVENT:");
        console.log(event);

        console.log("ICE CANDIDATE:");
        console.log(event.candidate);

        if (event.candidate) {

            console.log(
                "candidate string:",
                event.candidate.candidate
            );

            socket.send(JSON.stringify({
                type: "ice",
                candidate: event.candidate
            }));
        }
    };


    return peer;
}


// -----------------------------
// OPEN CAMERA
// -----------------------------

let localStream = null;

camerabtn.onclick = async function () {

    localStream = await getmedia();

    camera.srcObject = localStream;

    console.log("Camera started");
};


// -----------------------------
// CONNECT WEBSOCKET
// -----------------------------

connectbtn.onclick = function () {

    socket = new WebSocket("ws://localhost:8080");

    socket.addEventListener("open", () => {

        console.log("WebSocket connected");

        status.innerHTML = "ONLINE";
    });


    // --------------------------------
    // RECEIVE MESSAGE
    // --------------------------------

    socket.addEventListener("message", async (e) => {

        const result = JSON.parse(e.data);

        console.log("SERVER MESSAGE:");
        console.log(result);


        // -----------------------------
        // SOMEONE JOINED
        // -----------------------------

        if (result.type === "join") {

            meetstatus.innerHTML =
                `User ${result.username} joined`;

            console.log(
                `${result.username} joined`
            );
        }


        // -----------------------------
        // OFFER RECEIVED
        // -----------------------------

        if (result.type === "offer") {

            console.log("OFFER RECEIVED");

            console.log(result.message);

            sdptext.innerHTML =
                result.message.sdp;

            await handleOffer(result.message);
        }


        // -----------------------------
        // ANSWER RECEIVED
        // -----------------------------

        if (result.type === "answer") {

            console.log("ANSWER RECEIVED");

            console.log(result.message);

            await peer.setRemoteDescription(
                result.message
            );

            console.log(
                "Remote description = ANSWER"
            );
        }


        // -----------------------------
        // ICE RECEIVED
        // -----------------------------

        if (result.type === "ice") {

            console.log("ICE RECEIVED");

            console.log(result.candidate);

            await peer.addIceCandidate(
                result.candidate
            );

            console.log("ICE candidate added");
        }
    });


    socket.addEventListener("close", () => {

        console.log("WebSocket disconnected");

        status.innerHTML = "OFFLINE";
    });
};


// -----------------------------
// JOIN ROOM
// -----------------------------

joinbtn.onclick = function () {

    if (!socket) {
        console.log("Connect WebSocket first");
        return;
    }

    if (socket.readyState !== WebSocket.OPEN) {
        console.log("WebSocket is not open");
        return;
    }

    const result = JSON.stringify({

        type: "join",

        roomcode: roomcode.value,

        username: username.value

    });

    console.log("JOIN MESSAGE:");

    console.log(result);

    socket.send(result);
};


// -----------------------------
// CREATE OFFER
// -----------------------------

offerbtn.onclick = async function () {

    if (!socket) {

        console.log(
            "Connect WebSocket first"
        );

        return;
    }

    if (socket.readyState !== WebSocket.OPEN) {

        console.log(
            "WebSocket is not open"
        );

        return;
    }


    // Create peer connection
    await createPeer();


    // Get camera if not already opened
    if (!localStream) {

        localStream = await getmedia();

        camera.srcObject = localStream;
    }


    // Add camera + microphone tracks
    for (const track of localStream.getTracks()) {

        peer.addTrack(
            track,
            localStream
        );
    }


    console.log("Tracks added");


    // Create offer
    const offer = await peer.createOffer();

    console.log("OFFER:");
    console.log(offer);


    // Set our local description
    await peer.setLocalDescription(offer);

    console.log("LOCAL DESCRIPTION:");
    console.log(peer.localDescription);


    // Send offer through WebSocket
    socket.send(JSON.stringify({

        type: "offer",

        message: peer.localDescription

    }));


    console.log("OFFER SENT");
};


// -----------------------------
// HANDLE OFFER
// -----------------------------

async function handleOffer(offer) {

    console.log("Handling offer");


    // Create a peer connection
    await createPeer();


    // Put received offer into peer
    await peer.setRemoteDescription(
        offer
    );

    console.log(
        "Remote description = OFFER"
    );


    // Create answer
    const answer = await peer.createAnswer();

    console.log("ANSWER:");
    console.log(answer);


    // Set our answer as local description
    await peer.setLocalDescription(
        answer
    );


    console.log(
        "Local description = ANSWER"
    );


    // Send answer through WebSocket
    socket.send(JSON.stringify({

        type: "answer",

        message: peer.localDescription

    }));


    console.log("ANSWER SENT");
}