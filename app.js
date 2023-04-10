const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { db, createUserTable, createCardTable} = require('./database');
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const app = express();
const PORT = process.env.PORT || 3000;

const insertCard = (cardData, callback) => {
  const {
    name,
    manaCost,
    cmc,
    colors,
    types,
    subtypes,
    text,
    power,
    toughness,
    flavorText,
  } = cardData;

  const query = `
    INSERT INTO mtg_cards (name, manaCost, cmc, colors, types, subtypes, text, power, toughness, flavorText)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [name, manaCost, cmc, JSON.stringify(colors), JSON.stringify(types), JSON.stringify(subtypes), text, power, toughness, flavorText],
    callback
  );
};

const hasExpectedFormat = (response) => {
  const expectedKeys = [
    'name',
    'manaCost',
    'cmc',
    'colors',
    'types',
    'subtypes',
    'text',
    'power',
    'toughness',
    'flavorText',
  ];

  return (
    response &&
    typeof response === 'object' &&
    expectedKeys.every((key) => Object.prototype.hasOwnProperty.call(response, key))
  );
};

const getValidCardData = async () => {
  let response;

  do {
    response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: AIMessages,
    });
    console.log('We made it this far');
    response = response.data.choices[0].message.content;
    response = JSON.parse(response);
  } while (!hasExpectedFormat(response));

  return response;
};

let card = {
  name: "All Might, Symbol of Peace",
  manaCost: "{3}{W}{U}{R}",
  cmc: 6,
  colors: ["White", "Blue", "Red"],
  types: ["Legendary", "Creature"],
  subtypes: ["Human", "Hero"],
  text: "Vigilance, trample. All Might, Symbol of Peace gets +1/+1 for each creature you control. {X}{W}{U}{R}: All Might, Symbol of Peace deals X damage divided as you choose among any number of target creatures. Whenever a creature dealt damage this way dies this turn, draw a card.",
  power: "*",
  toughness: "*",
  flavorText: "Go beyond, Plus Ultra!",
};

const AIMessages = [
  {
    "role": "system",
    "content": "You are an AI used to generate Magic: The Gathering card concepts. You will return cards in the following JSON format, with no additional text or explanation: {\"name\": \"Card Name\", \"manaCost\": \"{1}{B}{G}\", \"cmc\": 3, \"colors\": [\"Black\", \"Green\"], \"types\": [\"Creature\"], \"subtypes\": [\"Zombie\", \"Plant\"], \"text\": \"Some text describing the card's effect.\", \"power\": 2, \"toughness\": 2, \"flavorText\": \"The zombies rose from the ground, their vines tangling with those of the plants. Together they made an unstoppable force.\"}"
  },
  {
    "role": "user",
    "content": "Generate a card based on a valkyrie from Norse mythology."
  },
  {
    "role": "assistant",
    "content": "{\"name\": \"Valkyrie's Charge\", \"manaCost\": \"{3}{W}{B}\", \"cmc\": 5, \"colors\": [\"White\", \"Black\"], \"types\": [\"Creature\"], \"subtypes\": [\"Valkyrie\"], \"text\": \"Flying, lifelink. Whenever Valkyrie's Charge attacks, choose one - \\n• Creatures you control gain indestructible until end of turn. \\n• Each opponent loses 2 life and you gain 2 life.\", \"power\": 3, \"toughness\": 3, \"flavorText\": \"In battle, the Valkyries swoop down from the skies to claim the souls of the worthy.\"}"
  }
];

function getBackgroundColor(colors) {
  const COLOR_MAPPING = {
    "White": "white",
    "Blue": "lightblue",
    "Black": "gray",
    "Red": "lightcoral",
    "Green": "palegreen"
  };

  if (colors.length === 0) {
    return "silver";
  }

  if (colors.length > 1) {
    return "gold";
  }

  return COLOR_MAPPING[colors[0]];
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('login');
});

app.get('/home', (req, res) => {
  if (req.session.user) {
    res.render('home', { user: req.session.user });
  } else {
    res.redirect('/');
  }
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.get('/MTGGen', (req, res) => {
  if (req.session.user) {
    // Fetch data from the mtg_cards table
    const query = 'SELECT * FROM mtg_cards';
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error(err.message);
      }

      // Render the view and pass the fetched data
      res.render('MTGGen/MTGGen', { mtg_cards: rows });
    });
  } else {
    res.redirect('/');
  }
});

app.get('/card', (req, res) => {
  if (req.session.user) {
    backgroundColor = getBackgroundColor(card.colors);
    res.render('MTGGen/card', { card, backgroundColor });
  } else {
    res.redirect('/');
  }
});

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  // Check if the user already exists
  const existingUser = await new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });

  if (existingUser) {
    // If the user already exists, redirect back to the signup page with an error message
    res.render('signup', { error: 'Username is already taken' });
  } else {
    // If the user doesn't already exist, create a new user in the database
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], (err) => {
      if (err) {
        console.error('Error creating user:', err);
        res.render('signup', { error: 'Error creating user' });
      } else {
        console.log('User created:', username);
        res.redirect('/');
      }
    });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
    if (row && await bcrypt.compare(password, row.password)) {
      req.session.user = row;
      res.redirect('/home');
    } else {
      res.redirect('/');
    }
  });
});

app.post('/MTGGen', async (req, res) => {
  const cardIdea = req.body.cardIdea;

  AIMessages.push({
    role: 'user',
    content: cardIdea,
  });

  try {
    const cardData = await getValidCardData();

    insertCard(cardData, (err) => {
      if (err) {
        console.error('Error inserting card:', err);
        res.status(500).json({ message: 'Error inserting card into the database.' });
      } else {
        AIMessages.push({
          role: 'assistant',
          content: JSON.stringify(cardData),
        });
        console.log('Card inserted:', cardData.name);
        card = cardData;
        res.redirect('/card');
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred while processing your request.' });
  }
});

app.post('/opencard', async (req, res) => {
  const cardName = req.body.cardName;

  // Fetch card data from the database
  const query = 'SELECT * FROM mtg_cards WHERE name = ?';
  db.get(query, [cardName], (err, row) => {
    if (err) {
      console.error(err.message);
    }
    card = row;
    if (card) {
      if (typeof card.types === 'string') {
        card.types = JSON.parse(card.types);
      }
      if (typeof card.subtypes === 'string') {
        card.subtypes = JSON.parse(card.subtypes);
      }
      if (typeof card.colors === 'string') {
        card.colors = JSON.parse(card.colors);
      }
    }
    // Render the card details in a new view
    if (req.session.user) {
      backgroundColor = getBackgroundColor(card.colors);
      res.render('MTGGen/card', { card, backgroundColor });
    } else {
      res.redirect('/');
    }
  });
});
  
app.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);
  await createUserTable();
  await createCardTable();
});