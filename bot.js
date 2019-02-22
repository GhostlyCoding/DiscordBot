var http = require('http');
var auth = require('./auth.json');
var url = require('url');
var fs = require('fs');
var strip = require("stripchar").StripChar;
var request = require('request');

const {
  Client,
  RichEmbed
} = require('discord.js');
const botjs = new Client();

botjs.on('ready', () => {
  console.log("Ghost Bot: I'm online and ready!");
  const g = botjs.guilds.get("526111037573955584");

  http.createServer((req, res) => {
    console.log("HTTP request received");
    var q = url.parse(req.url, true).query;
    console.log(q);
    //botjs.channels.get(q.ch).send(q.un+"\n"+q.title+"\n"+q.desc+"\n"+q.link);
    botjs.channels.get(q.ch).send({
      embed: {
        author: {
          name: "Ghost Bot",
          icon_url: g.iconURL
        },
        title: q.title,
        url: q.link,
        description: q.desc,
        fields: [{
            name: "Filesize: ",
            value: q.fs
          },
          {
            name: "Filename: ",
            value: q.fn
          },
          {
            name: "Uploader: ",
            value: q.un
          }
        ],
        timestamp: new Date(),
        footer: {
          icon_url: botjs.user.avatarURL,
          text: "Ghost Bot | Made by <@395612767136251904> "
        }
      }
    });
  }).listen(8788);
  console.log("HTTP Server Listening On Port 8788");
});

function signup(u, p, uid) {

  var g = botjs.guilds.get("526111037573955584");
  console.log("Stripping username");
  var un = strip.RSExceptUnsAlpNum(u);
  console.log(un);
  fs.appendFile("I:/xampp/AuthFiles/DiscordApp/users", "\n" + un + "::" + p + "::" + uid, "utf8", (err) => {
    if (err) {
      return "ERROR: " + err;
    }

    console.log('Ghost Bot: Created a new user! [' + un + ']');
  });
  return true;
}

botjs.on('message', message => {

var g = botjs.guilds.get("526111037573955584");

  if (message.author.bot)
    return;
	console.log("Message Event");
	var files = (message.attachments).array();
	
  if (message.channel.type == "dm") {
    var args = message.content.split(" ");
     console.log("Command Received ", args);
      if (args[0] == "!getpass") {
        console.log(message.author.username.toLowerCase() + ": password command");
        fs.readFile("I:/xampp/AuthFiles/DiscordApp/users", "utf8", (err, data) => {
          data.split("\n").forEach((val, i) => {
          var un = val.split("::")[0];
          var p = val.split("::")[1];
            if (val.split("::")[2] == message.author.id) {
              message.author.createDM().then((DMC) => {
                DMC.send("Your Pisscord.org account credentials:\nUsername: "+un+"\nPassword: "+p);
              });
            } else if (i == data.split("\n").length) {
              message.author.createDM().then((DMC) => {
                DMC.send("You do not have an account made currently. Please message @Ghost to register an account");
              });
            }
          });
        });

      } else if (args[0] == "!registerMembers") {
       //console.log("Register members command ", message.author.id);
        if (false === true) {
         console.log("registering members");
          var members = g.roles.find(role => role.name === "Pisscord Member").members;
          members.forEach((user) => {
            fs.readFile("wordlist", 'utf8', (err, data) => { 
              var min = 0;
              var max = data.split(",").length;
              var i1 = Math.floor(Math.random() * (+max - +min)) + min;
              var i2 = Math.floor(Math.random() * (+max - +min)) + min;

              var words = data.split(",");
              var word1 = words[i1].trim();
              var word2 = words[i2].trim();
		console.log("registering "+user.user.username);
              signup(user.user.username, word1 + word2, user.id);
            });
          });
        }
      } else if (args[0] == "!getuser") {
      console.log("User info command", message.author);
        if (message.author.id == "395612767136251904") {
        console.log("User lookup validated");
          fs.readFile("I:/xampp/AuthFiles/DiscordApp/users", "utf8", (err, data) => {
            var users = data.split("\n");
            users.forEach((u) => {
              var userdetails = u.split("::");
              if (args[1] == userdetails[0].toLowerCase()) {
                message.author.createDM().then((DMC) => {
                  DMC.send("Username: " + userdetails[0] + "\nPassword: " + userdetails[1] + "\nID: " + userdetails[2]);
                  return;
                });
              }
            });
          });
        }
      } else if (args[0] == "!attachments") {
				g.channels.find(channel => channel.name === args[1]).fetchMessages().then((messages) => {
					messages.forEach((msg) => {
						var att = (msg.attachments).array();
						if (att.length) {
							att.forEach((a) => {
								console.log("Attachment: "+a.filename);
								request(a.url).pipe(fs.createWriteStream("M:/Pisscord/attachments/"+a.filename));
							});
						}
					});
				}).catch(console.error);
			}
    } else {
			if (files.length) {
				files.forEach((a) => {
					console.log("Attachment: "+a.url);
					request(a.url).pipe(fs.createWriteStream("M:/Pisscord/attachments/"+a.filename));
					var url = 'pisscord.org/attachments.php?fn='+a.filename+'&uid='+a.client+'&desc='+a.message.content+'&ch='+a.message.channel.id;
					request(url, (err, req, body) => {
						console.log(err);
						console.log(req);
						console.log(body);
					});
				});
			}
		}
});

botjs.on('guildMemberUpdate', function (old, newuser) {
  console.log("Member Update Event");
  var oldroles = [];
  var newroles = [];

  old.roles.forEach((role, key) => {
    oldroles[role.id] = true;
  });
  newuser.roles.forEach((role, key) => {
    newroles[role.id] = true;
  });

  if (oldroles["526113421943504927"] === true) {
    return;
  } else {
    if (newroles["526113421943504927"] === true) {
      fs.readFile("I:/xampp/AuthFiles/DiscordApp/users", "utf8", (err, data) => {
        console.log("User file read");
        if (err) {
          console.log(err);
        }
        data.split("\n").forEach((val, i) => {
          if (val.split("::")[0] == newuser.user.username) {
            console.log("Ghost Bot: User already has active account");
            return false;
          }
        });
        newuser.createDM().then((DMC) => {
          fs.readFile("wordlist", 'utf8', (err, data) => {
            var min = 0;
            var max = data.split(",").length;
            var i1 = Math.floor(Math.random() * (+max - +min)) + min;
            var i2 = Math.floor(Math.random() * (+max - +min)) + min;

            var words = data.split(",");
            var word1 = words[i1].trim();
            var word2 = words[i2].trim();

            DMC.send("Congratulations on becoming a Pisscord Member!\nYou now have the ability to upload files! To do so head over to https://pisscord.org/ and signin using these credentials:\nUsername: " + newuser.user.username + "\nPassword: " + word1 + word2 + "\n\nHappy Posting ;)");

            console.log("Calling sign-up function");
            signup(newuser.user.username, word1 + word2, newuser.user.id);
          });
        });
      });
    }
  }
});

botjs.login(auth.token);