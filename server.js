const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

async function crawlPage(baseUrl, endpoint = '', usedInternals = []) {
    const url = `${baseUrl}${endpoint}`;
    const res = await axios.get(url);

    let external = [];
    let internal = [];

    if (res.status === 200) {
        let $ = cheerio.load(res.data);

        $('a').each((key, value) => {
            const hrefValue = value.attribs.href || '';

            if (hrefValue.startsWith('http')) {
                external.push(hrefValue);
            } else {
                const nextLink = `${baseUrl}${hrefValue}`;

                if (usedInternals.indexOf(nextLink) === -1) {
                    usedInternals.push(nextLink);
                    internal.push(hrefValue);
                }
            }
        });

        internal.forEach(_url => {
            const data = crawlPage(baseUrl, _url, usedInternals);

            external = [...external, ...data.external || []];
            internal = [...internal, ...data.internal || []];
        });

        return {
            internal,
            external
        }
    }

    return {
        internal: [],
        external: []
    }
}

app.get('/', (req, res) => {
    const { link } = req.query;

    if (!link) {
        return res.status(403).send({
            message: 'You forgot to send link'
        });
    }

    crawlPage(link).then(resp => {
        res.status(200).send(resp);
    }).catch(err => {
        console.log(err);
        res.status(403).send(err);
    });
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Running on http://localhost:${PORT}`);
});