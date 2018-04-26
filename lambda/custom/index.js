var Alexa = require('alexa-sdk');
var http = require('http');

exports.handler = function(event, context, callback){
  var alexa = Alexa.handler(event, context);
  alexa.registerHandlers(newSessionHandlers, startSearchHandlers);
  alexa.execute();
};

const states = {
	SEARCHMODE: "_SEARCHMODE",
	DESCRIPTION: "_DESCRIPTION",
	MULTIPLE_RESULTS: "_MULTIPLE_RESULTS"
};

const newSessionHandlers = {
  "LaunchRequest": function() {
    this.handler.state = states.SEARCHMODE;
    this.response.speak("welcom to show neo").listen("say user username to link account");
		this.emit(':responseReady');
  },
  'GetAstros': function() {

    getAstrosHttp((data) => {

      var outputSpeech = `There are currently ${data.people.length} astronauts in space. `;
      for (var i=0;i<data.people.length;i++){
        if (i === 0) {
          //first record
          outputSpeech = outputSpeech + 'Their names are: ' + data.people[i].name + ', '
        } else if (i === data.people.length-1) {
          //last record
          outputSpeech = outputSpeech + 'and ' + data.people[i].name + '.'
        } else {
          //middle record(s)
          outputSpeech = outputSpeech + data.people[i].name + ', '
        }
      }

      this.emit(':tell', outputSpeech);
    }
    );
  }
}

let startSearchHandlers = Alexa.CreateStateHandler(states.SEARCHMODE, {

  'ConnectUserDeviceIntent': function () {
    this.response.speak("connect user").listen("say connect user");
		this.emit(':responseReady');
  },

  'AMAZON.HelpIntent': function () {
      this.emit(':ask', "What can I help you with?", "How can I help?");
  },
  'AMAZON.CancelIntent': function () {
      this.emit(':tell', "Okay!");
  },
  'AMAZON.StopIntent': function () {
      this.emit(':tell', "Goodbye!");
  }
}
);


function getAstrosHttp(callback) {
  //http://api.open-notify.org/astros.json
  var options = {
    host: 'api.open-notify.org',
    port: 80,
    path: '/astros.json',
    method: 'GET'
  };

  var req = http.request(options, res => {
      res.setEncoding('utf8');
      var returnData = "";

      res.on('data', chunk => {
          returnData = returnData + chunk;
      });

      res.on('end', () => {
        var result = JSON.parse(returnData);

        callback(result);

      });

  });
  req.end();
}
