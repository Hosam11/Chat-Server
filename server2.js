const SocketServer = require('websocket').server
const http = require('http')
var mysql = require('mysql');
var values = new Array();

var con = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "together2"
});

const server = http.createServer((req, res) => { })

server.listen(3000, () => {
  console.log("Listening on port 3000...")
})

wsServer = new SocketServer({ httpServer: server })

const connections = []

wsServer.on('request', (req) => {
  const connection = req.accept()

  console.log('new con')
  connections.push(connection)

  connection.on('message', (mes) => {
    console.log('msg >> ', mes);
    message = mes.utf8Data;
    var messJson = JSON.parse(message)
    var userId = messJson.user_id
    var groupId = messJson.group_id
    var message = messJson.message
    var id = messJson.msg_id

    console.log('content >> ' + message)
    console.log('userId >> ' + userId)
    console.log('groupId >> ' + groupId)
    console.log('message >> ' + message)

    // con.connect(function (err) {
    con.getConnection(function (err, connection) {
      //   if (err) throw err;
      console.log("Connected!");
      var sql = "INSERT INTO messages (id,content,user_id,group_id) VALUES ('" + id + "','" + message + "','" + userId + "','" + groupId + "')";
      // var sql = "INSERT INTO messages"  + " (name, age) VALUES ('" + _name + "', '" + _age + "' );"
      connection.query(sql, function (err, result) {
        connection.release();
        if (err) throw err;
        console.log("1 record inserted");
      });

    });

    connections.forEach(element => {
      if (element != connection)
        element.sendUTF(mes.utf8Data)
    })
  })

  connection.on('close', (resCode, des) => {
    console.log('resCode >> ', resCode)
    console.log('resCode >> ', des)
    console.log('connection closed')
    connections.splice(connections.indexOf(connection), 1)
  })

})