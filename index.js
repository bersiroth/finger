const express = require('express');
const bodyParser = require('body-parser');

let httpApi = express();
httpApi.use(bodyParser.json());
httpApi.use(bodyParser.urlencoded({extended: true}));
httpApi.post('/finger-new-player', handleNewPlayer);
httpApi.listen(5000);

console.log('init server');
async function handleNewPlayer(req, res) {

	console.log('new player');
	let result = '';
	try {
		// await createEval(req.body.channel_id, req.body.user_id, req.body.text);
		console.log(req.body.channel_id);
		console.log(req.body.user_id);
	} catch(e) {
		result = e;
	} finally {
		res.status(200).send(result);
	}
}
