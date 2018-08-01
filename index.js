const express = require('express');
const bodyParser = require('body-parser');

let httpApi = express();
httpApi.use(bodyParser.json());
httpApi.use(bodyParser.urlencoded({extended: true}));
httpApi.post('/finger-new-player', handleNewPlayer);
httpApi.listen(process.env.PORT);

console.log('init server');

let channels = [];

async function handleNewPlayer(req, res) {

	console.log('new player' + req.body.user_name);

	let result;
	try {
		console.log(req.body.channel_id);
		console.log(req.body.user_id);

        channels[req.body.channel_id] = [];
		channels[req.body.channel_id][req.body.user_id] = {
        	user_id : req.body.channel_id,
        	user_name : req.body.user_name,
			point : 0
		};

		result = channelToString(req.body.channel_id);
	} catch(e) {
		result = e;
	} finally {
		res.status(200).send(result);
		//console.log(result);
	}
}

function channelToString(channel_id) {
	let string = "| " + "id".padEnd(10) + " | " + "name".padEnd(10) + " | " + "point".padEnd(10) + " | \n";

    channels[channel_id].forEach(function (channel) {
        string += "| " + channel['user_id'].toString().padEnd(10) + " | " + channel['user_name'].padEnd(10) + " | " + channel['point'].toString().padEnd(10) + " | \n";
	});

    return string;
}
/*
handleNewPlayer({
    body : {
        channel_id : 1,
        user_id : '12',
        user_name : 'bernard',
	}
}, null);*/