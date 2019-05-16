const request = require('request');
const cheerio = require('cheerio');
const express = require('express');

const app = express();

app.get('/', (req, res) => {
    const { link } = req.query;

    if (!link) {
        return res.status(403).send({
            message: 'You forgot to send link'
        });
    }

    request(link, function (err, _res, body) { 
        if(err) {
            res.status(403).send({
                message: 'something went wrong',
                detail: err,
            }); 
        } else { 
            const external = [];
            const internal = [];

            let $ = cheerio.load(body);

            $('a').each((key, value) => {
                const hrefValue = value.attribs.href;
                if (hrefValue.startsWith('http')) {
                    external.push(hrefValue);
                } else {
                    internal.push(hrefValue);
                }
            });

            res.status(200).send({
                external,
                internal
            });
        }
    });   
})

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Running on http://localhost:${PORT}`);
});