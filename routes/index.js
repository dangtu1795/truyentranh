const express = require('express');
const router = express.Router();

const cheerio = require('cheerio');
const url = 'http://truyentranhtuan.com/';
const request = require('request');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.get('/comic', function (req, res) {

    request(url, function (error, response, body) {
        if (error) {
            return res.send({
                code: -1,
                message: 'something went wrong'
            });

        }

        const $ = cheerio.load(body);
        var arr = [];
        $('.manga-focus').each(function (i, elem) {
            var name = $(elem).find('.easy-tooltip').text().trim();
            var chapter = $(elem).find('.chapter').text().trim();
            var date = $(elem).find('span:last-child').text().trim();
            chapter = chapter.split(' ').pop().replace('.', '-');
            var handle = $(elem).find('a').attr('href').split('/');
            handle.pop();
            handle = handle.pop();
            arr.push({
                name: name,
                chapter: chapter,
                date: date,
                handle: handle
            })
        });

        res.send({
            code: 0,
            message: 'success',
            data: arr
        });
    });
});

router.get('/comic/:chapter', function (req, res) {
    const chapter = req.params.chapter;
    request(`${url}/${chapter}`, function (error, response, body) {
        if (error) {
            return res.send({
                code: -1,
                message: 'cannot get chapter'
            });

        }

        const $ = cheerio.load(body);
        var arr = [];
        var lists = $('#manga-chapter').find('span').toArray().map(x => $(x).text().trim());
        var links = $('#manga-chapter').find('.chapter-name').toArray().map(x => {
            var handle = $(x).find('a').attr('href').split('/');
            handle.pop();
            handle = handle.pop();
            return handle
        });

        lists.splice(0, 3);
        for (i = 0; i < lists.length; i += 3) {
            arr.push({
                name: lists[i],
                group: lists[i + 1],
                date: lists[i + 2],
            });
        }
        arr = arr.map(x=> {
            x.handle= links[arr.indexOf(x)];
            return x;
        })

        res.send({
            code: 0,
            message: 'success',
            data: arr,
        });
    });
});

router.get('/comic/chapter/:link', function (req, res) {
    const link = req.params.link;
    request(`${url}/${link}`, function (error, response, body) {
        if (error) {
            return res.send({
                code: -1,
                message: 'cannot get pic'
            });

        }

        var regex = /slides_page_url_path[^\[]+[^\[\]]+[^\]]+/;
        var links = regex.exec(body)[0].replace('slides_page_url_path = [', '').trim().split(',').map(x => x.replace(/"/g, ''));
        res.send({
            code: 0,
            message: 'success',
            data: links
        });
    });
});

module.exports = router;
