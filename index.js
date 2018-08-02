const express = require('express');
const bodyParser = require('body-parser');

let httpApi = express();
httpApi.use(bodyParser.json());
httpApi.use(bodyParser.urlencoded({extended: true}));
httpApi.post('/finger-new-player', handleNewPlayer);
httpApi.listen(process.env.PORT);

console.log('init server ! ');

let channels = [];

async function handleNewPlayer(req, res) {

	console.log('new player : ' + req.body.user_name);

	let result;
	try {
		console.log(req.body.channel_id);
		console.log(req.body.user_id);

        channels[req.body.channel_id] = [];
		channels[req.body.channel_id].push({
        	user_id : req.body.user_id,
        	user_name : req.body.user_name,
			point : 0
		});

		result = channelToString(req.body.channel_id);
	} catch(e) {
		result = e;
	} finally {
		res.status(200).send({
			text : result
        });
		//console.log(result);
	}
}

function channelToString(channel_id) {
	let string = "```| " + "id".padEnd(20) + " | " + "name".padEnd(20) + " | " + "point".padEnd(20) + " | \n";

    for (let i = 0, len = channels[channel_id].length; i < len; i++) {
    	console.log(channels[channel_id][i]);
        string += "| " + channels[channel_id][i].user_id.toString().toLowerCase().padEnd(20) + " | " + channels[channel_id][i].user_name.toLowerCase().padEnd(20) + " | " + channels[channel_id][i].point.toString().toLowerCase().padEnd(20) + " | \n";
    }

    string += "```";
    return string;
}

/*
handleNewPlayer({
    body : {
        channel_id : 1,
        user_id : '12',
        user_name : 'bernard',
	}
}, null); */
