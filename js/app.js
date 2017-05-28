(function () {

    'use strict';

    var ENTER_KEY = 13;
    var newTodoDom = document.getElementById('new-todo');
    var syncDom = document.getElementById('sync-wrapper');

    // EDITING STARTS HERE (you dont need to edit anything above this line)
    var dbName = 'p-todo';
    var db = new PouchDB(dbName);
    var remote = new PouchDB('http://fhem.fritz.box:5984/' + dbName, {skip_setup: true});
    remote.login('p-todo', 'demo01', function (err, response) {
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
    }).on('change', showTodos);

    // We have to create a new todo document and enter it in the database
    function addTodo(text) {
        var todo = {
            _id: new Date().toISOString(),
            title: text,
            completed: false
        };
        db.put(todo, function callback(err, result) {
            if (!err) {
                console.log('Successfully posted a todo!');
            }
        });
    }

    // Show the current list of todos by reading them from the database
    function showTodos() {
        db.allDocs({include_docs: true, descending: true}, function (err, doc) {
            redrawTodosUI(doc.rows);
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

    function redrawTodosUI(todos) {
        var ul = document.getElementById('todo-list');
        ul.innerHTML = '';
        todos.forEach(function (todo) {
            ul.appendChild(createTodoListItem(todo.doc));
        });
    }

    function newTodoKeyPressHandler(event) {
        if (event.keyCode === ENTER_KEY) {
            addTodo(newTodoDom.value);
            newTodoDom.value = '';
        }
    }

    function addEventListeners() {
        if (newTodoDom) {
            newTodoDom.addEventListener('keypress', newTodoKeyPressHandler, false);
        }
    }

    addEventListeners();
    showTodos();
    if (syncDom) {
        if (remote) {
            sync();
        } else {
            syncError();
        }
    }

  // Host that the couch-persona server is running on
  var authHost = 'http://127.0.0.1:3000';

  var loggedIn = function(result) {
    console.log('logged in:', result);
    remoteCouch = result.dbUrl;
    cookie = result.authToken.replace('HttpOnly', '');
    sync();
  };

  var loggedOut = function() {
    console.log('logged out!');
  };

  function simpleXhrSentinel(xhr) {
    return function() {
      if (xhr.readyState !== 4) {
        return;
      }
      if (xhr.status == 200) {
        var result = {};
        try {
          result = JSON.parse(xhr.responseText);
        } catch(e) {}
        loggedIn(result);
      } else {
        navigator.id.logout();
        loggedOut();
      }
    };
    }

  function verifyAssertion(assertion) {
    var xhr = new XMLHttpRequest();
    var param = 'assert=' + assertion;
    xhr.open('POST', authHost + '/persona/sign-in', true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Content-length", param.length);
    xhr.setRequestHeader("Connection", "close");
    xhr.send(param);
    xhr.onreadystatechange = simpleXhrSentinel(xhr);
  }

  function signoutUser() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", authHost + '/persona/sign-out', true);
    xhr.send(null);
    xhr.onreadystatechange = simpleXhrSentinel(xhr);
  }

  navigator.id.watch({
    onlogin: verifyAssertion,
    onlogout: signoutUser
  });

  var signinLink = document.getElementById('signin');
  var signoutLink = document.getElementById('signout');
  signinLink.onclick = function() { navigator.id.request(); };
  signoutLink.onclick = function() { navigator.id.logout(); };

})();
