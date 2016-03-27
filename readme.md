# downloadr-cli [![Build Status](https://travis-ci.org/slinto/downloadr-cli.svg?branch=master)](https://travis-ci.org/slinto/downloadr-cli)

> CLI single / multiple data downloader.


## Install

```
$ npm install --save downloadr-cli
```


## Usage

```
$ downloadr --help

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
```


## License

MIT © [Tomáš Stankovič](http://slinto.sk)
