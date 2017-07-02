var db;
var dbIdPublic;
var dbIdPrivate;
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
                title: "Horse",
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
                title: "LastName"
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
                title: "Begin"
            },
            costs: {
                name: "costs",
                title: "Costs"
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
                title: "db"
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

(function () {

    'use strict';
    var ENTER_KEY = 13;
    var newTodoDom = document.getElementById('new-todo');
    var newParaDom = document.getElementById('new-para');
    var syncDom = document.getElementById('sync-wrapper');
    // EDITING STARTS HERE (you dont need to edit anything above this line)
    var dbServer = 'http://fhem.fritz.box';
    var dbPort = '5984';
    var dbName = 'p-todo';
    var dbUser = 'p-todo';
    var dbPass = 'demo01';
    db = new PouchDB(dbName);
    dbIdPrivate = cookie('dbId');
    if (dbIdPrivate === null) {
        dbIdPrivate = Math.random();
        cookie('dbId', dbIdPrivate, 3650)
    }
    db.get(dbIdPrivate + '_login').then(function (doc) {
        if (doc !== null) {
            dbUser = doc.dbUser;
            dbPass = doc.dbPass;
            dbIdPublic = doc.dbId;
        }
    }).catch(function (err) {
// Login-Formular    
        db.put({
            _id: dbIdPrivate + '_login',
            type: 'db',
            dbServer: dbServer,
            dbPort: dbPort,
            dbUser: dbUser,
            dbPass: dbPass,
            dbId: dbIdPublic,
            title: dbIdPublic + '_login'
        }).then(function (response) {
// handle response
        }).catch(function (err) {
            console.log(err);
        });
    });
    var remote = new PouchDB(dbServer + ':' + dbPort + '/' + dbName, {skip_setup: true});
    remote.login(dbUser, dbPass, function (err, response) {
        if (err) {
            if (err.name === 'unauthorized') {
                // name or password incorrect
            } else {
                // cosmic rays, a meteor, etc.
            }
        }
    });
    db.changes({
        since: 'now',
        live: true
    }).on('change', showDocs);
    // We have to create a new todo document and enter it in the database
    function addTodo(text) {
        var id = new Date().toISOString();
        var doc = {
            _id: dbIdPublic + '_todo' + id,
            title: text,
            completed: false
        };
        db.put(doc, function callback(err, result) {
            if (!err) {
                console.log('Successfully posted a document!');
            }
        });
    }

    // Show the current list of todos by reading them from the database
    function showDocs() {
        db.allDocs({
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
    }

    function checkboxChanged(todo, event) {
        todo.completed = event.target.checked;
        db.put(todo);
    }

    // User pressed the delete button for a todo, delete it
    function deleteButtonPressed(todo) {
        db.remove(todo);
    }

    // The input box when editing a todo has blurred, we should save
    // the new title or delete the todo if the title is empty
    function todoBlurred(todo, event) {
        var trimmedText = event.target.value.trim();
        if (!trimmedText) {
            db.remove(todo);
        } else {
            todo.title = trimmedText;
            db.put(todo);
        }
    }

    // Initialise a sync with the remote server
    function sync() {
        syncDom.setAttribute('data-sync-state', 'syncing');
        remote.sync(db, {live: true, retry: true
        }).on('change', function (info) {
            syncDom.innerHTML = 'change ' + info;
        }).on('paused', function (err) {
            syncDom.innerHTML = 'paused ' + err;
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

    // User has double clicked a todo, display an input so they can edit the title
    function todoDblClicked(todo) {
        var div = document.getElementById('li_' + todo._id);
        var inputEditTodo = document.getElementById('input_' + todo._id);
        div.className = 'editing';
        inputEditTodo.focus();
    }

    // If they press enter while editing an entry, blur it to trigger save
    // (or delete)
    function todoKeyPressed(todo, event) {
        if (event.keyCode === ENTER_KEY) {
            var inputEditTodo = document.getElementById('input_' + todo._id);
            inputEditTodo.blur();
        }
    }

    // Given an object representing a todo, this will create a list item
    // to display it.
    function createTodoListItem(todo) {
        var checkbox = document.createElement('input');
        checkbox.className = 'toggle';
        checkbox.type = 'checkbox';
        checkbox.addEventListener('change', checkboxChanged.bind(this, todo));
        var label = document.createElement('label');
        label.appendChild(document.createTextNode(todo.title));
        label.addEventListener('dblclick', todoDblClicked.bind(this, todo));
        var deleteLink = document.createElement('button');
        deleteLink.className = 'destroy';
        deleteLink.addEventListener('click', deleteButtonPressed.bind(this, todo));
        var divDisplay = document.createElement('div');
        divDisplay.className = 'view';
        divDisplay.appendChild(checkbox);
        divDisplay.appendChild(label);
        divDisplay.appendChild(deleteLink);
        var inputEditTodo = document.createElement('input');
        inputEditTodo.id = 'input_' + todo._id;
        inputEditTodo.className = 'edit';
        inputEditTodo.value = todo.title;
        inputEditTodo.addEventListener('keypress', todoKeyPressed.bind(this, todo));
        inputEditTodo.addEventListener('blur', todoBlurred.bind(this, todo));
        var li = document.createElement('li');
        li.id = 'li_' + todo._id;
        li.appendChild(divDisplay);
        li.appendChild(inputEditTodo);
        if (todo.completed) {
            li.className += 'complete';
            checkbox.checked = true;
        }

        return li;
    }

    function redrawUI(section, docs) {
        var ul = document.getElementById(section);
        ul.innerHTML = '';
        docs.forEach(function (doc) {
            ul.appendChild(createTodoListItem(doc.doc));
        });
    }

    function newTodoKeyPressHandler(event) {
        if (event.keyCode === ENTER_KEY) {
            addTodo(newTodoDom.value);
            newTodoDom.value = '';
        }
    }
    function newParaKeyPressHandler(event) {
        if (event.keyCode === ENTER_KEY) {
            addTodo(newParaDom.value);
            newParaDom.value = '';
        }
    }

    function addEventListeners() {
        /*if (newTodoDom) {
         newTodoDom.addEventListener('keypress', newTodoKeyPressHandler, false);
         }
         if (newParaDom) {
         newParaDom.addEventListener('keypress', newParaKeyPressHandler, false);
         }*/
    }

    // Code for Add New Record in IndexedDB
    $("#addBtn").click(function () {
        //debugger;
        var myObj = {};
        setSync(myObj, 'add');
        $.each(myApp[seite].header, function () {
            myObj[this.name] = $('#' + seite + '_' + this.name).val();
        });
        $.each(myApp[seite].fields, function () {
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
                    doc[this.name] = $('#' + seite + '_' + this.name).val();
                });
                $.each(myApp[seite].fields, function () {
                    doc[this.name] = $('#' + seite + '_' + this.name).val();
                });
                setSync(doc, 'upd');
                if (seite === "login") {
                    dbIdPublic = doc.dbId;
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
    addEventListeners();
    showDocs();
    if (syncDom) {
        sync();
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
        table += '<th>Deleted?</th>';
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
            //, DBdeleted: {$exists: false}
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
            console.log(s);
            if (first) {
                first = false;
                table = show_all_header(s);
            }
            table += '<tr>';
            if ($('#showDeleted').is(':checked')) {
                table += '<td>' + (this.DBdeleted ? '*' : '&nbsp') + '</td>';
            }
            $.each(myApp[seite].fields, function () {
                if (this.select) {
                    table += '<td onclick="show_data(\'' + s['_id'] + '\')" >' + myApp[this.select]["data"][s[this.name]] + '</td>';
                } else if (this.func) {
                    table += '<td onclick="show_data(\'' + s['_id'] + '\')" >' + s[this.name] + '</td>';
                    //	table += '<td onclick="show_data(\'' + s['_id'] + '\')" >' + myApp[this.func](s[this.name]) + '</td>';
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

