var express = require('express')
var bp = require('body-parser')
var app = express()
var server = require('http').createServer(app)
var cors = require('cors')
var port = process.env.PORT || 3000


var whitelist = ['http://localhost:8080', 'http://onwheels.herokuapp.com'];
var corsOptions = {
  origin: function (origin, callback) {
    var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
		callback(null, originIsWhitelisted);
	},
	credentials: true
};
app.use(cors(corsOptions))

// Fire up database connection
require('./server-assets/db/mlab-config')

app.use(express.static(__dirname + '/../www/dist'))

// REGISTER MIDDLEWEAR
app.use(bp.json())
app.use(bp.urlencoded({
  extended: true
}))

let auth = require('./auth/routes')
app.use(auth.session)
app.use(auth.router)

var trucks = require('./server-assets/routes/Trucks')
app.use(trucks.router)

app.use((req,res,next)=>{
  if(!req.session.uid){
    return res.status(401).send({
      error: 'please login to continue'
    })
  }
  next()
})

var owners = require('./server-assets/routes/Owners')
app.use(owners.router)

let goog = require('./server-assets/routes/Gapi')
app.use(goog.router)


app.get('*', (req, res, next) => {
  res.status(404).send({
    error: 'No matching routes'
  })
})


app.listen(port, () => {
  console.log('server running on port', port)
})