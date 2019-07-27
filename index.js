const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const webpush = require('web-push');
const fetch = require('node-fetch');
const { publicVapidKey, privateVapidKey, webPushContact } = require('./config');
const app = express();

/**
 * CORS
 */
var allowedOrigins = ['http://localhost:3000',
    'http://localhost:5000',
    'https://badairday.netlify.com/'];
app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin 
        // (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));

/**
 * JSON
 */
app.use(bodyParser.json())

/**
 * WEB PUSH
 */
webpush.setVapidDetails(webPushContact,
    publicVapidKey,
    privateVapidKey);

/**
 * GET
 */
app.get('/', (req, res) => {
    res.send('Hello world!')
})

app.get('/notifications/send', (req, res) => {
    const payload = JSON.stringify({
        title: 'Hallo, willkommen bei BadAirDay!',
        body: 'Bei Grenzwertüberschreitungen erhalten Sie eine Benachrichtigung.',
    })

    fetch('https://badairday22.firebaseio.com/subscriptions.json')
        .then(function (response) {
            return response.json();
        })
        .then(function (myJson) {
            let subscriptions = Object.entries(myJson);

            subscriptions.map(subscription => {
                webpush.sendNotification(subscription[1].subscription, payload)
                    .then(result => console.log(result))
                    .catch(e => {
                        switch (e.statusCode) {
                            // if the subscription is invalid, delete it
                            case 410:
                                fetch(`https://badairday22.firebaseio.com/subscriptions/${subscription[0]}.json`, {
                                    method: 'DELETE'
                                })
                                    .then(res => res.json())
                                    .then(response => {
                                        console.log("Deleted Subscription: ", subscription[0]);
                                    })
                                    .catch(err => console.log(err))
                                break;
                            default:
                                break;
                        }
                    })
            })

            res.status(200).json({ 'success': true });
        })
        .catch(err => { console.log(err) });
})

/**
 * POST
 */
app.post('/notifications/subscribe', (req, res) => {
    const subscription = req.body;

    console.log("Subscription: ", subscription);

    const payload = JSON.stringify({
        title: 'Hallo, willkommen bei BadAirDay!',
        body: 'Bei Grenzwertüberschreitungen erhalten Sie eine Benachrichtigung.',
    })

    webpush.sendNotification(subscription, payload)
        .then(result => console.log(result))
        .catch(e => console.log(e.stack))

    res.status(200).json({ 'success': true })
});

app.listen(9000, () => console.log('The server has been started on the port 9000'))