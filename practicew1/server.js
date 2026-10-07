
const connectbtn = document.getElementById("connectbtn");
const dissconnectbtn = document.getElementById("disconnect");
const statusbtn = document.getElementById("status")
let offline = "offline";
let online = "online";
const chatinput = document.getElementById("chatinput");
const messagebtn = document.getElementById("message");
const chatbox = document.getElementById("chatbotmessage");

let chatmessage = [];

statusbtn.innerHTML = `<h1>${offline}</h1>`


for(let i = 0; i < chatmessage.length; i++){
  const message =    document.createElement("p")
    message.innerText = chatmessage[i];
    chatbox.appendChild(message)
}



let socket = null;

 chatinput.addEventListener("input",(e)=>{
     e.target.value;
})



// CONNECT
connectbtn.addEventListener("click", () => {


    socket = new WebSocket("ws://localhost:8080");

    socket.addEventListener("open", (event) => {
            statusbtn.innerHTML = `<h1>${online}</h1>`
        

        socket.send("user1 is connected");
    });


    // SERVER SENT MESSAGE
    socket.addEventListener("message", (event) => {
          const message = document.createElement("p");

    message.innerText = event.data;

    chatbox.appendChild(message);
    });


    // CONNECTION CLOSED
    socket.addEventListener("close", () => {
        console.log("The connection has been closed successfully.");
    });


    // ERROR
    socket.addEventListener("error", (event) => {
      console.log(e)
    });

});


messagebtn.addEventListener("click", () => {

    if (!socket) {
        console.log("Connect first");
        return;
    }
    chatmessage.push(chatinput.value);

    console.log(chatmessage);

    const message = document.createElement("p");

    message.innerText = chatinput.value;

    chatbox.appendChild(message);

    socket.send(JSON.stringify({
        message: chatinput.value
    }));

    chatinput.value = "";
});


// DISCONNECT
dissconnectbtn.addEventListener("click", () => {
   
    if (!socket) {
        console.log("No connection");
        return;
    }
            statusbtn.innerHTML = `<h1>${"disconneted"}</h1>`
   
    socket.close();
    socket = null;
});