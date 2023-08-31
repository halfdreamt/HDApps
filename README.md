# HD Apps

HD Apps is designed to be a central loading page for a variety of different web apps. Currently MTG Generator is the only app. HD Apps allows for user sign and and registration. 

MTG Generator allows the user to provide a character name and have a custom Magic: The Gathering card generated within seconds. Previously generated game cards can also be viewed.

## Installation

After downloading the repo, run npm install in the directory (Node.js must be installed prior).

```bash
npm install
```
In order to access OpenAI's API (required for the MTG Generator) OPENAI_API_KEY must be setup as an environment variable on your system, if running locally. Visit OpenAI's website to obtain a key (API charges will apply).


## Usage

Run the app.js file.

```bash
node app.js
```

The page can be accessed from http://localhost:3000 by default. After creating an account (currently data is only stored locally, if running locally) MTG Generator can be selected from the menu. From there, the user can enter a desired card name or design, and the card will be displayed in a new tab. Older cards can also be opened from this initial page.

## License

[MIT](https://choosealicense.com/licenses/mit/)
