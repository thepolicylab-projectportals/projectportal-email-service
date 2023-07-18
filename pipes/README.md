# Pipes and JSON Objects

We can process JS objects passed using in JSON notation. 

We can load objects representing Project Portal projects from the GitHub API using:
```shell
./fetch-projects.js
```

Note: this requires environment variables or a `.env` file to be defined with some variables. 
See [.env.template](.env.template) for the required fields.  

The projects can be prettified.
The [json-to-string.js](./json-to-string.js) script converts the flat (minified) stream of JSON 
objects into a more readable format.
```shell
echo '[{"title":"a", "topic":"1"}]' | ./json-to-string.js
```

... outputs: 
```
[
  {
    "title": "a",
    "topic": "1"
  }
]%
```

The projects can be filtered. 

The [filter-fields.js](./filter-fields.js) script filters the projects' fields, passing only 
those fields which are requested. You could get just the fields `title` and `main-contact` from 
all the projects by running:
```shell
./fetch-projects.js | ./filter-fields.js --keys title mainContact
```

The [filter-stale.js](./filter-stale.js) script passes only those projects which are stale, and 
adds additional information about the particular problems with those files. You could list all 
the stale projects by running:
```shell
./fetch-projects.js | ./filter-stale.js | ./filter-fields.js --keys title mainContact
```
Note: this script has some error and breaks in the `filter-fields` command.

The filtered list can be wrapped in HTML using the [format-mail.js](./format-mail.js) script.
This converts the JSON objects to HTML.

Together, we can run the following to load projects, filter them, format the message and show it 
in a browser (requires the `browser` package – `brew install browser`)
```shell
./fetch-projects.js | ./filter-stale.js | ./format-mail.js | browser
```

./fetch-projects.js | ./filter-stale.js | ./filter-fields.js --keys title problems | ./json-to-string.js
