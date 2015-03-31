# chat
An Angular & Node chat application

# install
All node and bower dependencies have been included, 
simply git clone repository and run 
$ node app.js

# dependencies
The application uses an angular front end with bootrap for responsive layout.  
Lum.x http://ui.lumapps.com/ used for message toasts and tooltips.
Socket.io is used to interact real-time with the backend.
Icons taken from http://materialdesignicons.com/

# angular
Application is located in:
public/javascripts/app.js
public/index.html

Application is separated into one containing controller handling the chat and
messaging, view located in partials/home.html
Directives created for the user login, rooms list, and styled input box. 
io Service interfaces to socket.io.  

# node
Application root is in app.js with code separated functionally into components
under modules/
Data is persited in json files under modules/data.js.  Writing is done every 
N minutes so as to minimise disc writes (improving performance).
Only the last 50 messages per chat room are saved to reduce file size.
Rooms can be found under modules/data/rooms.json, rooms can be added/removed here.
Users are stored with name, password and access (was hoping to add some moderation)
under modules/data/users.json
Data is cached in memory using a singleton with api to set and get nodes. These
are initialised in modules/data.js
_admin user password is "a"