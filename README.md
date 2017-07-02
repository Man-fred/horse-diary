horse-diary
============================
 forked from [daleharvey/pouchdb-getting-started-todo](daleharvey/pouchdb-getting-started-todo): The source repository for the getting started tutorial for PouchDB
# Installation
Webserver und Couchdb werden vorausgesetzt und die Einrichtung hier nicht weiter beschrieben. 
1. Dateien auf den Webserver kopieren
1. Dtenbank in Coucgdb einrichten und User/Passwort zuweisen
1. Programm im Webbrowser starten
1. Im Menü **Params** aufrufen und die Verbindung zur Couchdb-Datenbank setzen

# Offline first
Wenn kein Kontakt zum Server besteht, dann können trotzdem Eingaben zugefügt oder geändert werden. Beim nächsten Kontakt zum Couchdb-Server werden alle Änderungen synchronisiert.

# Sicherheit
Der db-Prefix, der auf der **Params**-Seite eingestellt werden kann, gibt den Zugriff auf die zugehörigen Daten über das Programm frei. Synchronisiert werden aber alle Daten der Datenbank des Couchdb-Servers! Ein Schutz zwischen getrennten Benutzergruppen ist nur vorhanden, wenn verschiedene Datenbanken angesprochen werden und die mit verschiedenen Benutzern gesichert sind.
