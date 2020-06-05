var mongoose = require('mongoose');
var url = 'mongodb://localhost/Assignment';
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}

mongoose.connect(url, options).then(() => {
        console.log('Database sucessfully connected.')
    },
    error => {
        console.log('Database not connected: ' + error)
    }
)

module.exports = mongoose;
