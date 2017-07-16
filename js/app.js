var db;
var seite = "";
var myApp = {
    horse: {
        name: "horse",
        title: "Pferde",
        menu: true,
        fields: {
            name: {
                name: "name",
                title: "Name"
            },
            official: {
                name: "official",
                title: "Official"
            },
            city: {
                name: "city",
                title: "City",
                select: "city",
                field: "city"
            }
        }
    },
    persons: {
        name: "persons",
        title: "Beteiligte",
        menu: true,
        header: {
            horse: {
                name: "horse",
                title: "Pferd",
                select: "horse",
                field: "name"
            }
        },
        fields: {
            job: {
                name: "job",
                title: "Job",
                select: "jobs",
                field: "job"
            },
            name: {
                name: "lastName",
                title: "Name",
                select: "students",
                field: "lastName"
            }
        }
    },
    students: {
        name: "students",
        title: "Kontakte",
        menu: true,
        fields: {
            firstName: {
                name: "firstName",
                title: "FirstName"
            },
            lastName: {
                name: "lastName",
                title: "Name"
            },
            job: {
                name: "job",
                title: "Job",
                select: "jobs",
                field: "job"
            },
            city: {
                name: "city",
                title: "City",
                select: "city",
                field: "city"
            },
            mobile: {
                name: "mobile",
                title: "Mobile"
            }
        }
    },
    jobs: {
        name: "jobs",
        title: "Jobs",
        menu: true,
        fields: {
            job: {
                name: "job",
                title: "Job"
            }
        },
        data: []
    },
    city: {
        name: "city",
        title: "Cities",
        menu: true,
        fields: {
            city: {
                name: "city",
                title: "City"
            }
        },
        data: []
    },
    todo: {
        name: "todo",
        title: "ToDo",
        menu: true,
        fields: {
            horse: {
                name: "horse",
                title: "Pferd",
                select: "horse",
                field: "name"
            },
            job: {
                name: "job",
                title: "Job",
                select: "jobs",
                field: "job"
            },
            name: {
                name: "lastName",
                title: "Name",
                select: "students",
                field: "lastName"
            },
            todo: {
                name: "title",
                title: "ToDo"
            },
            begin: {
                name: "begin",
                title: "Beginn"
            },
            costs: {
                name: "costs",
                title: "Kosten"
            },
            done: {
                name: "done",
                title: "Erledigt",
                type: "checkbox"
            }
        },
        data: []
    },
    login: {
        name: "login",
        title: "Params",
        menu: true,
        fields: {
            dbServer: {
                name: "dbServer",
                title: "Server"
            },
            dbPort: {
                name: "dbPort",
                title: "Port"
            },
            dbName: {
                name: "dbName",
                title: "Datenbank"
            },
            dbUser: {
                name: "dbUser",
                title: "User"
            },
            dbPass: {
                name: "dbPass",
                title: "Pass"
            },
            dbId: {
                name: "dbId",
                title: "Prefix"
            },
            appTitle: {
                name: "appTitle",
                title: "Titel"
            },
            appHorsename: {
                name: "appHorsename",
                title: "Thema"
            }
        },
        data: []
    },
    sync: {
        name: "sync",
        title: "Syncronisation",
        fields: {
            table: {
                name: "table",
                title: "Table"
            },
            ClientTimestamp: {
                name: "ClientTimestamp",
                title: "ClientTimestamp",
                f_unc: function (f) {
                    return date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
                }
            },
            ServerTimestamp: {
                name: "ServerTimestamp",
                title: "ServerTimestamp",
                f_unc: function (f) {
                    return date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
                }
            }
        },
        data: []
    },
    parameter: {
        name: "parameter",
        title: "Parameter",
        fields: {
            couchdb: {
                name: "couchdb",
                title: "couchdb"
            },
            version: {
                name: "version",
                title: "version"
            }
        },
        data: []
    }

};

var dbName = 'p-todo';
/*var dbServer = 'http://fhem.fritz.box';
var dbPort = '5984';
var dbUser = 'p-todo';
var dbPass = 'demo01';*/
var dbServer = '';
var dbPort = '';
var dbUser = '';
var dbPass = '';

var dbIdPublic;        //couchdb
var dbIdPrivate;       //pouchdb
var remote;            //couchdb

(function () {

    'use strict';
    var dbNameLocal = 'p-todo'; //pouchdb
    var appTitle = 'Horse:: Diary';
    $('#appTitle').html(appTitle);

    var ENTER_KEY = 13;
    var syncDom = document.getElementById('sync-wrapper');
    // EDITING STARTS HERE (you dont need to edit anything above this line)
    db = new PouchDB(dbName);
    dbIdPrivate = cookie('dbId');
    if (dbIdPrivate === null) {
        dbIdPrivate = Math.random();
        cookie('dbId', dbIdPrivate, 3650);
    }
    db.get(dbIdPrivate + '_login').then(function (doc) {
        if (doc !== null) {
            dbServer = doc.dbServer;
            dbPort = doc.dbPort;
            dbName = doc.dbName;
            dbUser = doc.dbUser;
            dbPass = doc.dbPass;
            dbIdPublic = doc.dbId;
            appTitle = doc.appTitle;
            myApp.horse.title = doc.appHorsename;
            $('#appTitle').html(appTitle);
            $('#m_horse').val(myApp.horse.title);
            remoteLogin();
        }
    }).catch(function (err) {
// Login-Formular    
        db.put({
            _id: dbIdPrivate + '_login',
            type: 'db',
            dbServer: dbServer,
            dbPort: dbPort,
            dbName: dbName,
            dbUser: dbUser,
            dbPass: dbPass,
            dbId: dbIdPublic,
            title: dbIdPublic + '_login'
        }).then(function (response) {
            // handle response
            remoteLogin();
        }).catch(function (err) {
            console.log(err);
        });
    });
    
    db.changes({
        since: 'now',
        live: true
    }).on('change', showDocs);
    

    // Show the current list of todos by reading them from the database
    function showDocs() {
/*        db.allDocs({
            include_docs: true,
            descending: true,
            startkey: dbIdPublic + '_todo3',
            endkey: dbIdPublic + '_todo'},
                function (err, doc) {
                    redrawUI('todo-list', doc.rows);
                });
        db.allDocs({
            include_docs: true,
            descending: true,
            startkey: dbIdPrivate + '_para3',
            endkey: dbIdPrivate + '_para'},
                function (err, doc) {
                    redrawUI('para-list', doc.rows);
                });
*/
    }
    
    function remoteLogin() {
        remote = new PouchDB(dbServer + ':' + dbPort + '/' + dbName, {skip_setup: true});
        remote.login(dbUser, dbPass, function (err, response) {
            if (err) {
                if (err.name === 'unauthorized') {
                    // name or password incorrect
                } else {
                    // cosmic rays, a meteor, etc.
                }
            } else {
                sync();
            }
        });        
    }
    
    // Initialise a sync with the remote server
    function sync() {
        syncDom.setAttribute('data-sync-state', 'syncing');
        remote.sync(db, {live: true, retry: true
        }).on('change', function (info) {
            syncDom.innerHTML = 'change ' + info;
        }).on('paused', function (err) {
            syncDom.innerHTML = 'paused ' + (err ? err : '');
        }).on('active', function () {
            syncDom.innerHTML = 'active ';
        }).on('denied', function (err) {
            syncDom.innerHTML = 'denied ' + err;
        }).on('error', function (err) {
            syncDom.setAttribute('data-sync-state', 'error');
            syncDom.innerHTML = 'error ' + err;
        }).on('complete', function (info) {
            syncDom.setAttribute('data-sync-state', 'insync');
            syncDom.innerHTML = 'complete ' + info;
        });
    }
    // EDITING STARTS HERE (you dont need to edit anything below this line)

    // There was some form or error syncing
    function syncError() {
        syncDom.setAttribute('data-sync-state', 'error');
    }
    
    
    
    // Code for Add New Record in IndexedDB
    $("#addBtn").click(function () {
        //debugger;
        var myObj = {};
        setSync(myObj, 'add');
        $.each(myApp[seite].header, function () {
            if(this.type === "checkbox")
                myObj[this.name] = $('#' + seite + '_' + this.name).prop( "checked" );
            else
                myObj[this.name] = $('#' + seite + '_' + this.name).val();
        });
        $.each(myApp[seite].fields, function () {
            if(this.type === "checkbox")
                myObj[this.name] = $('#' + seite + '_' + this.name).prop( "checked" );
            else
                myObj[this.name] = $('#' + seite + '_' + this.name).val();
        });
        //var myDoc = array2json(myObj);
        console.log(myObj);
        db.put(myObj).then(function (doc) {
            console.log(doc);

            ClearTextBox();
            show_all(seite);
        }).catch(function (err) {
            console.log(err);
        });

    });
    // Code for Read Data from Indexed on for edit(Single Record)
    $('#btnShow').click(function () {
        var id = $('#txtSearch').val();
        show_data(id);
    });
    // Code for Clear text Box
    $('#clearBtn').click(function () {
        ClearTextBox();
    });
    // Code for Update record on IndexedDB
    $('#updateBtn').click(function () {

        var _id = $('#_id').html();
        db.get(_id).then(function (doc) {
            console.log(doc);
            // handle doc
            if (doc) {
                $.each(myApp[seite].header, function () {
                    if(this.type === "checkbox")
                        doc[this.name] = $('#' + seite + '_' + this.name).prop( "checked" );
                    else
                        doc[this.name] = $('#' + seite + '_' + this.name).val();
                });
                $.each(myApp[seite].fields, function () {
                    if(this.type === "checkbox")
                        doc[this.name] = $('#' + seite + '_' + this.name).prop( "checked" );
                    else
                        doc[this.name] = $('#' + seite + '_' + this.name).val();
                });
                setSync(doc, 'upd');
                if (seite === "login") {
                    dbIdPublic = doc.dbId;
                    appTitle = doc.appTitle;
                    myApp.horse.title = doc.appHorsename;
                    $('#appTitle').html(appTitle);
                    $('#m_horse').val(myApp.horse.title);
                }
                db.put(doc).then(function (doc2) {
                    console.log(doc2);

                    $('#result').html('Record No. ' + _id + ' Updated Successfully');
                    show_all(seite);
                }).catch(function (err) {
                    console.log(err);
                });
            }
        });
    });
    //Code for Deleting record from indexedDB
    $('#deleteBtn').click(function () {
        var _id = $('#_id').html();
        db.get(_id).then(function (doc) {
            // handle doc
            if (doc) {
                setSync(doc, 'del');
                doc.DBdeleted = true;
                db.put(doc).then(function (doc2) {
                    // handle doc
                    if (doc2) {
                        $('#result').html('Record No. ' + doc._id + ' Deleted Successfully');
                        show_all(seite);
                    }
                    ;
                }).catch(function (err) {
                    console.log(err);
                });
                ;
            }
            ;
        }).catch(function (err) {
            console.log(err);
        });
    });
    $('#btnShowAll').click(function () {
        //Calling funtin for show all data from IndexedDB
        show_all();
    });
    function mainmenu() {
        var result = "";
        $.each(myApp, function () {
            //debugger;
            show_seite(this.name);
            if (this.menu) {
                result += '<input type="button" name="m_' + this.name + '" value="' + this.title + '" id="m_' + this.name +
                        '" onclick="show_element(\'' + this.name + '\')" />';
            }
        });
        result += '<br /><br />';
        /*
        result += '<input type="button" value="Parameter" onclick="show_element(\'parameter\')" />';
        result += '<input type="button" value="Syncronisation" onclick="show_element(\'sync\')" />';
        result += '<input type="button" name="m_send" value="Send to Server" id="m_send" onclick="CouchdbStoreWrite()" />';
        result += '<input type="button" name="m_read" value="Read from Server" id="m_read" onclick="CouchdbStoreRead()" />';
        */
        result += '<input type="checkbox" id="showDeleted" onchange="show_element(\'\')"> showDeleted';
        $("#mainmenu").html(result);
    }


    mainmenu();
    if (syncDom) {
        
    }

})();
function ClearTextBox() {
    $.each(myApp[seite].fields, function () {
        $('#' + seite + '_' + this.name).val('');
    });
    $('#txtSearch').val('');
    $('#DBTimestamp').html('');
    $('#DBServertime').html('');
    $('#DBstate').html('');
    $('#_id').html('');
    $('#_rev').html('');
    $('#DBversion').html('');
}

function show_all_header(s) {
    var table = '<table>';
    $.each(myApp[seite].header, function () {
        table += '<tr>';
        table += '<th>' + this.title + '</th><td>';
        if (s) {
            table += myApp[this.select]["data"][s[this.name]];
        }
        table += '</td></tr>';
    });
    table += '</table>';
    table += '<table><thead>';
    //table += '<th>ID</th>';
    //var cb = $('#showDeleted');
    if ($('#showDeleted').is(':checked')) {
        table += '<th id="disabled">Deleted?</th>';
    } else {
        table += '<th id="disabled"></th>'
    }
    $.each(myApp[seite].fields, function () {
        table += '<th>' + this.title + '</th>';
    });
    table += '</thead><tbody>';
    return table;
}

function show_all(table) {
    var dbId;
    if (table =="login") {
        dbId = dbIdPrivate;
    } else {
        dbId = dbIdPublic;
    }
    console.log(dbId + '_' + table);
//    db.allDocs({
//        include_docs: true
//        , descending: true
//        , startkey: dbIdPublic + '_' + table + '3'//+ table 
//        , endkey: dbIdPublic + '_' + table  //+ table
//    PouchDB.debug.enable('pouchdb:find');
    
    var mySelektor = {
            _id: {$gte: dbId + '_' + table, $lte: dbId + '_' + table +'3'}
        };
    if (!$('#showDeleted').is(':checked')) {
        mySelektor.DBdeleted = {$exists: false};
    }
    db.find({
        selector: mySelektor
    }).then(function (result) {
        var first = true;
        var table = "";
        $.each(result.docs, function () {
            var s = this;
            //console.log(s);
            if (first) {
                first = false;
                table = show_all_header(s);
            }
            table += '<tr>';
            if ($('#showDeleted').is(':checked')) {
                table += '<td>' + (this.DBdeleted ? '*' : '&nbsp') + '</td>';
            } else {
                table += '<td>&nbsp;</td>';
            }
            $.each(myApp[seite].fields, function () {
                if (this.select) {
                    table += '<td onclick="show_data(\'' + s['_id'] + '\')" >' + myApp[this.select]["data"][s[this.name]] + '</td>';
                } else if (this.func) {
                    table += '<td onclick="show_data(\'' + s['_id'] + '\')" >' + s[this.name] + '</td>';
                    //	table += '<td onclick="show_data(\'' + s['_id'] + '\')" >' + myApp[this.func](s[this.name]) + '</td>';
                } else if (this.type === "checkbox") {
                    table += '<td onclick="show_data(\'' + s['_id'] + '\')" ><input type="' + this.type + '"' + (s[this.name] ? 'checked' : '') + ' disabled></td>';
                } else {
                    table += '<td onclick="show_data(\'' + s['_id'] + '\')" >' + s[this.name] + '</td>';
                }
            });
            table += '</tr>';
        });
        if (first) {
            table = show_all_header(null);
        }
        table += '</tbody></table>';
        //alert(table);
        //return table;
        $("#datalist").html(table);
    }).catch(function (err) {
        console.log(err);
    });
}

function show_element(aktiveSeite) {
    if (aktiveSeite !== seite) {
        if (aktiveSeite !== "") {
            $('#t_' + seite).hide();
            seite = aktiveSeite;
            $('#t_' + seite).show();
        }
        $.each(myApp[seite].header, function () {
            if (this.select) {
                select(this.select, seite, this.name, this.field);
            }
        });
        $.each(myApp[seite].fields, function () {
            if (this.select) {
                select(this.select, seite, this.name, this.field);
            }
        });
        show_all(seite);
    }
}

function show_seite(aktiveSeite) {
    var result = '<div id="t_' + aktiveSeite + '" name="t_' + aktiveSeite + '" class="t_seite"><table>';
    $.each(myApp[aktiveSeite].header, function () {
        result += '<tr>';
        if (this.select) {
            result += '<td>' + this.title + '</td><td><select type="text" name="' + aktiveSeite + '_' + this.name + '" id="' + aktiveSeite + '_' + this.name + '" class="' + aktiveSeite + '"></select></td>';
        } else if (this.type) {
            result += '<td>' + this.title + '</td><td><input type="'+this.type+'" name="' + aktiveSeite + '_' + this.name + '" id="' + aktiveSeite + '_' + this.name + '" /></td>';
        } else {
            result += '<td>' + this.title + '</td><td><input type="text" name="' + aktiveSeite + '_' + this.name + '" id="' + aktiveSeite + '_' + this.name + '" /></td>';
        }
        result += '</tr>';
    });
    if (myApp[aktiveSeite].header) {
        result += '<tr><td colspan="2"<hr /></td></tr>';
    }
    $.each(myApp[aktiveSeite].fields, function () {
        result += '<tr>';
        if (this.select) {
            result += '<td>' + this.title + '</td><td><select type="text" name="' + aktiveSeite + '_' + this.name + '" id="' + aktiveSeite + '_' + this.name + '" class="' + aktiveSeite + '"></select></td>';
        } else if (this.type) {
            result += '<td>' + this.title + '</td><td><input type="'+this.type+'" name="' + aktiveSeite + '_' + this.name + '" id="' + aktiveSeite + '_' + this.name + '" /></td>';
        } else {
            result += '<td>' + this.title + '</td><td><input type="text" name="' + aktiveSeite + '_' + this.name + '" id="' + aktiveSeite + '_' + this.name + '" /></td>';
        }
        result += '</tr>';
    });
    result += '</table></div>';
    $('#table').append(result);
}


function select(table, id, name, field) {
    db.find({
        selector: {
            _id: {$gte: dbIdPublic + '_' + table, $lte: dbIdPublic + '_' + table +'3'},
            DBdeleted: {$exists: false}
        }

    }).then(function (result) {
        $("#" + id + '_' + name).empty();
        myApp[table].data = [];
        $("#" + id + '_' + name).append($('<option></option>'));
        $.each(result.docs, function () {
                    $("#" + id + '_' + name).append($('<option></option>').val(this['_id']).text(this[field])); //  selected="selected"
                    myApp[table].data[this['_id']] = this[field];
        });
    }).catch(function (err) {
        console.log(err);
    });
}

function show_data(id) {
    db.get(id).then(function (doc) {
        // handle doc
        if (doc) {
            $.each(myApp[seite].header, function () {
                $('#' + seite + '_' + this.name).val(doc[this.name]);
            });
            $.each(myApp[seite].fields, function () {
                if (this.type === "checkbox")
                    $('#' + seite + '_' + this.name).prop( "checked", (doc[this.name] === true) );//(doc[this.name]);
                else
                    $('#' + seite + '_' + this.name).val(doc[this.name]);
            });
            $('#DBTimestamp').html(doc.DBTimestamp);
            $('#DBstate').html(doc.DBstate);
            $('#DBversion').html(doc.DBversion);
            $('#DBok').html(doc.DBok);
            $('#DBreason').html(doc.DBreason);
            //$('#txtSearch').html(r._id);
            $('#_id').html(doc._id);
            $('#_rev').html(doc._rev);
        } else {
            ClearTextBox();
            alert('Record Does not exist');
        }
    }).catch(function (err) {
        console.log(err);
    });
};

function setSync(myObj, state) {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    myObj.DBTimestamp = Math.floor(Date.now() / 1000);
    myObj.DBstate = state;
    if (!myObj.DBversion) {
        myObj.DBversion = 1;
    } else {
        myObj.DBversion += 1;
    }

    if (!myObj._id)
        myObj._id = dbIdPublic + '_' + seite + '2' + (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
}

