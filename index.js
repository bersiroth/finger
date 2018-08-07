const Express = require('express');
const bodyParser = require('body-parser');
const AsciiTable = require('ascii-table');
const pg = require('pg');

const client = new pg.Client({
	connectionString: process.env.DATABASE_URL || 'postgres://postgres:azerty@localhost:5432/postgres',
});

client.connect();

client.query('CREATE TABLE IF NOT EXISTS players(id SERIAL PRIMARY KEY, user_id varchar(55), name varchar(255))', (err, res) => {
	if (err) {
		console.log(err)
	} else {
		console.log(' -- table players created -- ');
	}
});
client.query('CREATE TABLE IF NOT EXISTS games(id SERIAL PRIMARY KEY, channel_id varchar(55), player_id varchar(55), player_point smallint, date date)', (err, res) => {
	if (err) {
		console.log(err)
	} else {
		console.log(' -- table games created -- ');
	}
});


let httpApi = Express();
httpApi.use(bodyParser.json());
httpApi.use(bodyParser.urlencoded({extended: true}));
httpApi.post('/finger-new-player', handleNewPlayer);
httpApi.post('/finger-players', handlePlayers);
httpApi.post('/finger-new-game', handleNewGame);
httpApi.post('/finger-point', handlePoint);
httpApi.listen(process.env.PORT || '1234');

console.log(' -- init server --');

async function handleNewGame(req, res) {
	console.log(' -- new-game --');

	const channel_id = req.body.channel_id;
	const user_id = req.body.user_id;
	const user_name = req.body.user_name;

	await createPlayer(user_id, user_name);
	await createGame(channel_id, user_id);

	res.status(200).send({
		text : gameToString(await getGame(channel_id))
	});
}

async function handlePlayers(req, res) {
	console.log(' -- players --');

	res.status(200).send({
		text : "Players !"
	});
}

async function handlePoint(req, res) {
	console.log(' -- point --');

	res.status(200).send({
		text : "New point !"
	});
}

async function handleNewPlayer(req, res) {
	console.log(' -- new player --');

	res.status(200).send({
		text : "New player !"
	});
}

async function getPlayer(user_id) {
	const res = await client.query('SELECT * FROM players WHERE user_id = $1', [user_id]);
	return res.rows;
}

async function createPlayer(user_id, user_name) {
	let result;
	let players = await getPlayer(user_id);

	if (players.length === 0) {
		await client.query('INSERT INTO players(user_id, name) Values($1, $2)', [user_id, user_name]);
		result = 'Player has been created';
	} else {
		result = 'Player already exist ' + user_name;
	}

	console.log(result);

	return result;
}

async function getGame(channel_id, user_id = null) {
	let query, params;

	query =
		'SELECT ' +
			'games.player_id, ' +
			'players.name, ' +
			'games.player_point, ' +
			'games.date ' +
		'FROM ' +
			'games, ' +
			'players ' +
		'WHERE ' +
			'games.player_id = players.user_id ' +
			'AND games.channel_id = $1 ' +
			'AND games.date = CURRENT_DATE';

	if (user_id !== null) {
		query += ' AND games.player_id = $2';
		params = [channel_id, user_id];
	} else {
		params = [channel_id];
	}

	const res = await client.query(query, params);
	return res.rows;
}

async function createGame(channel_id, user_id) {
	let result;
	let games = await getGame(channel_id, user_id);

	if (games.length === 0) {
		await client.query('INSERT INTO games(channel_id, player_id, player_point, date) Values($1, $2, 0, CURRENT_DATE)', [channel_id, user_id]);
		result = 'Game has been created';
	} else {
		result = 'Game already exist on the channel ' + channel_id;
	}

	console.log(result);

	return result;
}

function gameToString(game) {

	let table = new AsciiTable();
	table.setHeading("id","player id","player name","player point","date");

    for (let i = 0, len = game.length; i < len; i++) {
        table.addRow(game[i].id, game[i].player_id, game[i].name, game[i].player_point, game[i].date);
    }

    return '```' + table.toString() + '```';
}
