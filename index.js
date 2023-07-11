const ws = require('ws');

const wss = new ws.WebSocketServer({ port: 1233 });

class Client {
    constructor(id, name, ws) {
        this.id = id;
        this.ws = ws;
        this.name = name;
    }

    send(json) {
        this.ws.send(JSON.stringify(json));
    }
}

let clients = {};
let lastClientId = 1;

let buzzedID = 0;
let lockBuzz = false;

wss.on('connection', ws => {
    ws.on('error', console.error);

    ws.on('message', data => {
        data = JSON.parse(data);

        if(data.type === "remove") {
            delete clients[data['id']];
            console.log("Client %s disconnected", data['id']);

            for (const key in clients) {
                const client = clients[key];
                client.send({type: "id", id: client.id, clients: mapClients()});
            }
            return;
        }

        if(data.type === "Buzz" && !lockBuzz) {
            lockBuzz = true;

            setTimeout(() => {
                lockBuzz = false;

                for (const key in clients) {
                    const client = clients[key];
                    client.send({type: "unlock"});
                }
            }, 10000);

            buzzedID = data.id;

            for (const key in clients) {
                const client = clients[key];
                client.send({ type: "Buzz", id: data.id, name: data.name });
            }
        }

        console.log('%s: %s', clients[data.id]?.name, data.type);
    });

    clients[lastClientId] = new Client(lastClientId, "Client " + lastClientId, ws);
    ws.send(JSON.stringify({ id: lastClientId, type: "id", clients: mapClients() }));

    console.log("Client %s connected", lastClientId);
    lastClientId += 1;
});

function mapClients() {
    return Object.values(clients).map(c => ({ id: c.id, name: c.name }))
}