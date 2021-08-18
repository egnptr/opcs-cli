# opcs-cli

A command-line interface to interact with [UPH OPCS](http://web.academic.uph.edu/).

## Example

Get your latest GPA score

```bash
$ node index.js -u "xxx123@xxxxx.com" -p "password" gpa
```

Get your weekly schedule as an image

```bash
$ node index.js -u "xxx123@xxxxx.com" -p "password" schedule
```

Get a PDF of your course history for your transcript

```bash
$ node index.js -u "xxx123@xxxxx.com" -p "password" transcript
```
