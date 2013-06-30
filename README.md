# Leave me Alone

This is a game whose object is to be alone. In order to achieve that you have to kick other players off the game by tapping their areas faster than they tap yours!

Once two or more players join the game (just by entering the site), you can hit their areas (those that do not have a YOU written in it).

Each player starts the game with an amount of points. Your area is proportional to your points. Tapping/clicking a players area (including yours) reduces your points.

## Instructions

1. Install npm (in linux ubuntu, just `sudo apt-get install npm`)
2. Go to the app dir and run `npm install`
3. Change the IP/domain of the server hosting the game ('localhost if running locally') in the game.js file. Search for `var socket = io.connect('http://192.168.2.10');`
4. Start the server with `node server`. If on port 80 then `sudo !!` ;)

## Caution

Do not try to understand the code. I've written it drunk in a weekend. Good luck.

More info, look at a blog [post](http://ineverfinishanyth.in/2013/03/28/mesa-e-cadeira-with-rafael-rozendaal/) about the process of building it.

:heart:
