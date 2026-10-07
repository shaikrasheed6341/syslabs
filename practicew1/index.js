import express from "express";
import { WebSocketServer } from "ws";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }))


const hashmap = new Map();
const wss = new WebSocketServer({ port: 8080 })

const clients = new Set();

wss.on("connection", (ws) => {

    clients.add(ws);
    console.log(clients.size + "this sieze");

    ws.send(`welconme to back to mychannel ${ws}  `)


    ws.on("message", (data) => {
      
        for(const client of clients){
            if(client.readyState === WebSocket.OPEN){
            client.send(data.toString())
 
             }
        }
       
    })
    

})





app.listen(3000, () => {
    console.log("it working fine")
})