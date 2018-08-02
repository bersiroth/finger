const Express = require('express');
const bodyParser = require('body-parser');
const AsciiTable = require('ascii-table');
const pg = require('pg');

const client = new pg.Client({
	connectionString: process.env.DATABASE_URL || 'postgres://postgres:azerty@localhost:5432/postgres',
});

client.connect();

client.query('CREATE TABLE IF NOT EXISTS items(id SERIAL PRIMARY KEY, text VARCHAR(40) not null, complete BOOLEAN)');

client.query('SELECT NOW() as now', (err, res) => {
	if (err) {
		console.log(err.stack)
	} else {
		console.log(res.rows[0])
	}
});

let httpApi = Express();
httpApi.use(bodyParser.json());
httpApi.use(bodyParser.urlencoded({extended: true}));
httpApi.post('/finger-new-player', handleNewPlayer);
httpApi.post('/finger-players', handlePlayers);
httpApi.post('/finger-point', handlePoint);
httpApi.listen(process.env.PORT);

console.log(' -- init server --');

let channels = [];

async function handlePoint(req, res) {

	console.log(' -- point --');

	res.status(200).send({
		text : "New point !"
	});
}

async function handlePlayers(req, res) {

	console.log(' -- players --');

	let players;

	try {
		players = channelToString(req.body.channel_id);
		console.log(players);
	} catch(e) {
		players = e;
	} finally {
		res.status(200).send({
			text : players
		});
	}

}

async function handleNewPlayer(req, res) {

	console.log(' -- new player --');
	console.log(req.body.user_name);

	let result;

	try {
		console.log(' -- channel id --');
		console.log(req.body.channel_id);
		console.log(' -- user id --');
		console.log(req.body.user_id);

		let channel = channels[req.body.channel_id];

		if(channel === undefined) {
			channel = [];
		}

		if (channel.length < 2) {
			if (channel.length === 0 || (channel.length === 1 && channel[0].user_id !== req.body.user_id)) {
				channel.push({
					user_id : req.body.user_id,
					user_name : req.body.user_name,
					point : 0
				});

				channels[req.body.channel_id] = channel;

				result = channelToString(req.body.channel_id);
			} else {
				console.log(' -- already --');
				console.log(channel);
				result = "You are already in this game";
			}
		} else {
			console.log(' -- full --');
			console.log(channel);
			result = "This game is full";
		}

	} catch(e) {
		result = e;
	} finally {
		res.status(200).send({
			text : result
        });
	}
}

function channelToString(channel_id) {

	let table = new AsciiTable();
	table.setHeading("id","name","point");

    for (let i = 0, len = channels[channel_id].length; i < len; i++) {
    	console.log(channels[channel_id][i]);
        table.addRow(channels[channel_id][i].user_id, channels[channel_id][i].user_name, channels[channel_id][i].point);
    }

    return '```' + table.toString() + '```';
}
