# Full-TinyMCE-Contentful-Extension
This extension allows to implement tiny mce editor into contenfull with full capabilities including
1. Uploading images to contentful assets.
2. Tables.
3. Lists.
4. Wordcount.
5. Font select.
6. ...many more.

![Contentful tiny mce upload images](https://github.com/adventec/Full-TinyMCE-Contentful-Extension/blob/master/ScreenShot00130.jpg "Contentful tiny mce upload images")

## Installation

- ### Self hosted
		If you want to host the extension by your own, clone the repo.
		Run the command `npm i` to install dependencies
		Upload the project to your hosting



## UPDATING extension.json
1. Install the Contentful Management CLI by running

   ` npm i contentful-management`
   
2. Get the extension id first by running the command: 

     `contentful extension list`
	 
3. To update extension.json run command: 

	`contentful extension.json update --id --descriptor extension.json --force`
