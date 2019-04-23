// ms_service.js, Athan Walker and Samantha Callicutt, CSC337, Spring 2019


const express = require("express");
const app = express();
const fs = require("fs");

app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers",
               "Origin, X-Requested-With, Content-Type, Accept");
        next();
});

app.use(express.static('public'));


const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

app.post('/', jsonParser, function (req, res) {
        let index = req.body.index;
        let filecontent = index + "\n";
	if(index == -1) {
		fs.writeFile('ms.txt', '', function(){console.log('done')});
		return;
	}
        fs.appendFile("ms.txt", filecontent, function(err) {
                if(err) {
                        return console.log(err);
                }
        });
        res.send("Sent successful");

});

app.get('/', function (req, res) {
        res.header("Access-Control-Allow-Origin", "*");
        let to_send = "";
        to_send = getMines();
        res.send(to_send);
})
app.listen(process.env.PORT);

/**
 ** getMines
 ** Purpose: To retrieve the mine index's stored in ms.txt and send them to client
 **
 ** Arguments: None
 **
 ** Returns:
 ** to_send - the stringified JSON of all the mine indices sent
 **/
function getMines(){
        let data = {};
        let list = [];
        let ind = 0;
        let file = fs.readFileSync("ms.txt", 'utf8');
        let lines = file.split("\n");

        for(let i = 0; i < lines.length; i++) {
                list[ind] = lines[i];
                ind += 1;
        }

        data["mines"] = list;

        let to_send = JSON.stringify(data);
        return to_send;
}
