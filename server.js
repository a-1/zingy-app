var express = require('express'),
  app = express();


//configure the app
app.configure(function() {

  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());


});

app.listen(process.env.PORT || 3000);