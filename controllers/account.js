const mongoose = require("mongoose");
const request = require('request-promise');
const zlib = require('zlib');

//const User = require("../model/userModel");

//login function
async function getUserAccountDetails(req, res) {
    var requestOptions,
        requestCall,
        wiki,
        buffer,
        gunzip;

    requestOptions = {
        url: 'http://api.stackexchange.com/2.2/users/4777609?order=desc&sort=reputation&site=stackoverflow'
    };
    requestCall = request(requestOptions);

    requestCall.on('response', function (wikiRequest) {
        if (wikiRequest.statusCode === 200) {
            buffer = [];
            gunzip = zlib.createGunzip();
            wikiRequest.pipe(gunzip);
            gunzip.on('data', function (data) {
                // decompression chunk ready, add it to the buffer
                buffer.push(data.toString());
            }).on("end", function () {
                // response and decompression complete, join the buffer and return
                wiki = JSON.parse(buffer.join(''));
                //console.log(" wiki = ", wiki);
                //req.user.details = wiki.items[0];
                //req.user.email = req.body.email;
                return res.status(200).json({ wiki: wiki });
            })
        }
    })
}

module.exports = {
    getUserAccountDetails
};
