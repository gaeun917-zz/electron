//packaging
//add scripts on package.json ->  npm run pack


var $ = jQuery = require('jquery');
var _ = require('lodash');
var bootstrap = require('bootstrap');
var fs = eRequire('fs');
var loadApts = JSON.parse(fs.readFileSync(dataLocation));

var electron = eRequire('electron');
var ipc = electron.ipcRenderer;

// sudo npm install electron-packager -g
// electron-packager ./petAppointmentApp
var React = require('react');
var ReactDOM = require('react-dom');
var AptList = require('./AptList');
var Toolbar = require('./Toolbar');
var AddAppointment = require('./AddAppointment');
var HeaderNav = require('./HeaderNav');

var MainInterface = React.createClass({
    getInitialState: function () {
        return {
            aptBodyVisible: false,
            myAppointments: loadApts,
            queryText: '',
            orderBy: 'petName',
            orderDir: 'asc'
        }//return
    }, //getInitialState

    componentDidMount: function () {
      ipc.on('addAppointment', function (event, message) {
          // set body
          this.toggleAptDisplay()
      }.bind(this)); // when gets event always bind
    },
    //removing event
    componentWillUnMount: function () {
        ipc.removeListener('addAppointment', function (event, message) {
            // set body
            this.toggleAptDisplay()
        }.bind(this)); // when gets event always bind
    },


    componentDidUpdate: function () {
        fs.writeFile(dataLocation, JSON.stringify(this.state.myAppointments), 'utf8', function (err) {
            if (err) {
                console.log(err);
            }
        });//writeFile
    }, //componentDidUpdate




    toggleAptDisplay: function () {
        var tempVisibility = !this.state.aptBodyVisible;
        this.setState({
            aptBodyVisible: tempVisibility
        }); //setState
    }, //toggleAptDisplay

    showAbout: function () {
        ipc.sendSync('openInfoWindow');
    }, //showAbout

    addItem: function (tempItem) {
        var tempApts = this.state.myAppointments;
        tempApts.push(tempItem);
        this.setState({
            myAppointments: tempApts,
            aptBodyVisible: false
        })
    },

    deleteMessage: function (item) {
        var allApts = this.state.myAppointments;
        var newApts = _.without(allApts, item);
        this.setState({
            myAppointments: newApts
        });
    },
    // pass input text to state, add queryText on original state
    searchApts: function (query) {
        this.setState({
            queryText: query
        })
    },
    reOrder: function (orderBy, orderDir) {
        this.setState({
            orderBy: orderBy,
            orderDir: orderDir
        })
    },
    render: function () {

        var myAppointments = this.state.myAppointments;

        var filteredApts = [];
        var queryText = this.state.queryText;

        var orderBy = this.state.orderBy;
        var orderDir = this.state.orderDir; // get it from state -> lodash


        if (this.state.aptBodyVisible === true) {
            $('#addAppointment').modal('show');
        } else {
            $('#addAppointment').modal('hide');
        }
        // go through current apt
        for(var i=0; i<myAppointments.length; i++){
            // indexOf returns 1 or -1
            if(
             myAppointments[i].petName.toLowerCase().indexOf(queryText) !== -1 ||
            myAppointments[i].ownerName.toLowerCase().indexOf(queryText) !== -1 ||
            myAppointments[i].aptDate.toLowerCase().indexOf(queryText) !== -1 ||
            myAppointments[i].aptNotes.toLowerCase().indexOf(queryText) !== -1
         ) {
             filteredApts.push(myAppointments[i]);

         }
        }
        // lodash handle ordering
        filteredApts = _.orderBy(filteredApts, function (item) {
            return item[orderBy].toLowerCase();// item[petName]
        }, orderDir);

        myAppointments = filteredApts.map(function (item, index) {
            return (
                <AptList key={index}
                         singleItem={item}
                         whichItem={item}
                         onDelete={this.deleteMessage}
                />
            ) // return
        }.bind(this)); //Appointments.map
        return (
            <div className="application">

                <HeaderNav
                    onSearch={this.searchApts}
                    onReOrder={this.reOrder}
                    orderBy ={this.state.orderBy}
                    orderDir={this.state.orderDir}/>

                <div className="interface">

                    <Toolbar
                        handleToggle={this.toggleAptDisplay}
                        handleAbout={this.showAbout}/>

                    <AddAppointment
                        handleToggle={this.toggleAptDisplay}
                        addApt={this.addItem}/>

                    <div className="container">
                        <div className="row">
                            <div className="appointments col-sm-12">
                                <h2 className="appointments-headline">Current Appointments</h2>
                                <ul className="item-list media-list">{myAppointments}</ul>
                            </div>
                            {/* col-sm-12 */}
                        </div>
                        {/* row */}
                    </div>
                    {/* container */}
                </div>
                {/* interface */}
            </div>
        );
    } //render
});//MainInterface

ReactDOM.render(
    <MainInterface/>,
    document.getElementById('petAppointments')
); //render
