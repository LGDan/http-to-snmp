const express = require('express')
const snmp = require("net-snmp");
const app = express()
const port = 3000

function handleSNMP(session, res, error, varbinds) {
    if (error) {
        if (error.name == "RequestTimedOutError") {res.send(504, error);}
        if (error.name == "RequestFailedError") {res.send(400, error);}
    } else {
        if (varbinds[0].type == 128) {res.send(404);}
        if (varbinds[0].type == 129) {res.send(400);}
        if (varbinds[0].type == 130) {res.send(404);}
        if (varbinds[0].type <= 70 ) {
            if (varbinds[0].value == null) {
                res.send(
                    [{
                        oid: varbinds[0].oid,
                        type: varbinds[0].type,
                        value: null
                    }]
                );
            }else{
                res.send(
                    [{
                        oid: varbinds[0].oid,
                        type: varbinds[0].type,
                        value: varbinds[0].value.toString()
                    }]
                );
            }
            
        } else {
            console.error(snmp.ObjectType[varbinds[0].type] + ": " + varbinds[0].oid);
        }
    }
    session.close();
}

app.listen(port, () => {
  console.log(`http-to-snmp listening on ${port}`);
})

app.get('/', (req, res) => {
    res.send('<h1>http-to-snmp</h1><p>Usage: <code>[GET] /version/v1/host/192.168.1.1/community/public/oid/1.1.1.1.1.1.1.1.1</code></p>');
})

app.get('/version/v:version/host/:address/community/:community/oid/:oid', (req, res) => {
    var options = {
        port: 161,
        retries: 1,
        timeout: 5000,
        backoff: 1.0,
        transport: "udp4",
        trapPort: 162,
        version: snmp.Version1,
        backwardsGetNexts: true,
        reportOidMismatchErrors: false,
        idBitsSize: 32
    };
    if (req.params.version == "1") {options.version = snmp.Version1;}
    if (req.params.version == "2") {options.version = snmp.Version2c;}
    if (req.params.version == "2c") {options.version = snmp.Version2c;}
    var session = snmp.createSession(req.params.address, req.params.community, options);
    var oids = [req.params.oid];
    session.get(oids, function (error, varbinds) {
        handleSNMP(session, res, error, varbinds);
    });
})

// app.get('/v3/:address/:oid', (req, res) => {
//     var options = {
//         port: 161,
//         retries: 1,
//         timeout: 5000,
//         transport: "udp4",
//         trapPort: 162,
//         version: snmp.Version3,
//         //engineID: "8000B98380XXXXXXXXXXXXXXXXXXXXXXXX", // where the X's are random hex digits
//         backwardsGetNexts: true,
//         reportOidMismatchErrors: false,
//         idBitsSize: 32,
//         context: ""
//     };
// 
//     var user = {
//         name: "username",
//         level: snmp.SecurityLevel.authPriv,
//         authProtocol: snmp.AuthProtocols.sha,
//         privProtocol: snmp.PrivProtocols.des,
//         authKey: "password",
//         privKey: "password"
//     };
// 
//     user.name = req.query.name;
//     user.authProtocol = req.query.authprotocol;
//     user.privProtocol = req.query.privprotocol;
//     user.privKey = req.query.privkey;
//     user.authKey = req.query.authkey;
// 
//     var session = snmp.createV3Session(req.params.address, user, options);
//     var oids = [req.params.oid];
//     session.get(oids, function (error, varbinds) {
//        handleSNMP(session, res, error, varbinds);
//     });
//     res.send(req.params);
// })
// 
