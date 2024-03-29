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

<img width="655" alt="Screenshot 2023-08-31 at 11 55 59 AM" src="https://github.com/halfdreamt/HDApps/assets/31080937/67426a18-fbba-476c-86ad-cc312a2f09d2">

</br>

<img width="265" alt="Screenshot 2023-08-31 at 11 55 50 AM" src="https://github.com/halfdreamt/HDApps/assets/31080937/a615e907-ef61-4894-9223-53c13d2aa91c">

</br>

<img width="263" alt="Screenshot 2023-08-31 at 11 57 32 AM" src="https://github.com/halfdreamt/HDApps/assets/31080937/a9db95f3-e793-42c7-8573-ba8276b743d0">



## License

[MIT](https://choosealicense.com/licenses/mit/)
