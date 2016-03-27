#!/usr/bin/env node
'use strict';
const logSymbols = require('log-symbols');
const meow = require('meow');
const fs = require('fs');
const request = require('request');
const mkpath = require('mkpath');
const progress = require('request-progress');

var FILE_ACTUAL_ID;
var FILE_STOP_ID;
var FILE_TYPE;

const cli = meow(`
  Usage
    $ downloadr <url>

  Options
    --dest Download destionation
    --from Start file number (Required in multple download)
    --to   Stop file number (Required in multple download)
    --type File type (Required in multple download)
    --progress Show download progress

  Examples
    Single download:
      $ downloadr http://url.com/image.jpg --progress

    Multiple download: (eg. files http://url.com/files/filename-0.pdf to http://url.com/files/filename-10.pdf)
      $ downloadr http://url.com/files/filename- --from 0 --to 10 --type jpg --dest mydir
`);

/**
 * Return true if flags object has {from, to, type} properties.
 * @param obj
 * @returns {boolean}
 */
var hasAllRequiredFlags = (obj) => {
	return Boolean(
		obj.hasOwnProperty('from') &&
		obj.hasOwnProperty('to') &&
		obj.hasOwnProperty('type'));
};

/**
 * Single file download.
 * @param uri
 */
var download = (uri) => {
	request.head(uri, (err, res) => {
		if (err) {
			return 0;
		}

		let uriSplitted = uri.split('/');
		let filename = uriSplitted[uriSplitted.length - 1];
		let dirname = cli.flags.dest || 'downloaded';

		if (res.statusCode === 404) {
			console.log(`${logSymbols.error} File ` + filename + ` doesn't exist.`);
			return 0;
		}
		mkpath(dirname, () => {
			progress(request(uri))
				.on('progress', function (state) {
					if (cli.flags.progress) {
						console.log('File ' + filename + ' download progress: ' + Math.round(state.percentage * 100) / 100 + '%');
					}
				})
				.on('error', function (e) {
					console.error(e);
				})
				.pipe(fs.createWriteStream(dirname + '/' + filename))
				.on('close', function () {
					console.log(`${logSymbols.success} File ` + filename + ` downloaded.`);

					if (FILE_ACTUAL_ID < FILE_STOP_ID) {
						download(cli.input[0] + ++FILE_ACTUAL_ID + '.' + FILE_TYPE);
					}
				});
		});
	});
};

/**
 * Delete '.' chars from begin of string.
 * @param str
 * @returns {String}
 */
var deleteFirstDots = (str) => {
	while (str.charAt(0) === '.') {
		str = str.substr(1);
	}
	return str;
};

if (cli.input.length === 0) {
	console.error('ERROR: URL required');
	process.exit(1);
} else if (hasAllRequiredFlags(cli.flags)) {
	console.log(`${logSymbols.info} Download of sequence started.`);
	FILE_TYPE = deleteFirstDots(cli.flags.type);
	FILE_ACTUAL_ID = cli.flags.from;
	FILE_STOP_ID = cli.flags.to;

	download(cli.input[0] + FILE_ACTUAL_ID + '.' + FILE_TYPE);
} else {
	if (cli.flags.from || cli.flags.to || cli.flags.type) {
		console.error('ERROR: Missing some required flags for multiple download.');
		process.exit(1);
	}
	console.log(`${logSymbols.info} Download of single file started.`);
	download(cli.input[0]);
}
