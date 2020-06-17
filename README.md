# Full-TinyMCE-Contentful-Extension
This extension allows to implement tiny mce editor into contenfull with full capabilities including
1. Uploading images to contentful assets.
2. Tables.
3. Lists.
4. Wordcount.
5. Font select.
6. ...many more.
a
![aaaa](https://github.com/adventec/Full-TinyMCE-Contentful-Extension/blob/master/ScreenShot00130.jpg "aaaa")
a
## Installation
- ### Self hosted
If you want to host the extension by your own, clone the repo, run the command npm i to install dependencies and then upload the project to your hosting
- ### Contentful hosted
Follow contentfull instructions

## UPDATING extension.json
Get the extension id first by running the command: 
`contentful extension list`

To update extension.json run command: 
`contentful extension.json update --id --descriptor extension.json --force`
