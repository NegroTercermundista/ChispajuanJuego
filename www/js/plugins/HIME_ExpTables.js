/*:
-------------------------------------------------------------------------------
@title Exp Tables
@author Hime --> HimeWorks (http://himeworks.com)
@version 1.1
@date Jun 8, 2016
@filename HIME_ExpTables.js
@url http://himeworks.com/2015/12/exp-tables-mv/

If you enjoy my work, consider supporting me on Patreon!

* https://www.patreon.com/himeworks

If you have any questions or concerns, you can contact me at any of
the following sites:

* Main Website: http://himeworks.com
* Facebook: https://www.facebook.com/himeworkscom/
* Twitter: https://twitter.com/HimeWorks
* Youtube: https://www.youtube.com/c/HimeWorks
* Tumblr: http://himeworks.tumblr.com/
-------------------------------------------------------------------------------
@plugindesc v1.1 - Set up the amount of experience required to level using
spreadsheets
@help 
-------------------------------------------------------------------------------
== Description ==

RPG Maker allows your actors to level up by reaching the amount of
experience points required. The amount of exp required is determined by 
the actor's level for their current class, and the class' exp curve.

Exp curves are generated using a pre-determined formula, and you only
have the ability to adjust different parameters. In some cases, your
desired exp curve is simply impossible to achieve with RPG Maker's
own exp curves.

With this plugin, you have full control over exp values requires for 
each level. For example, if you wanted to make it so that every level
required 1000 EXP, you could simply set the exp required at intervals
of 1000, without having to figure out how to adjust the curve.

You can manage your exp tables in a spreadsheet as well, allowing you
to take advantage of spreadsheet software to manage your data.

== Terms of Use ==

- Free for use in non-commercial projects with credits
- Contact me for commercial use

== Change Log ==

1.1 - Jun 8, 2016
  * No longer uses JSON. Just use the CSV directly
  * Added support for class exp tables.
1.0 - Dec 16, 2015
  * Initial release
 
== Usage == 

In the plugin parameters, specify the names of the files that will
hold your exp tables.

If you don't want to use it, leave it blank.

-- Getting Started with Actor Exp Tables --

Start by downloading the "template" CSV file that provides a sample
exp table for the first 4 actors.

Alternatively, you can also create your own CSV file. 
Here is an example you can copy into notepad or spreadsheet software:

Level,Actor1,Actor2,Actor3,Actor6
1,0,0,0,0
2,100,100,100,150
3,200,200,200,300
4,300,300,300,400

The first row consists of the headers. This file is only for actors.
Each actor is specified by writing "Actor", followed by their ID.

Each row after indicates the level, and how much exp is required for
each actor. Each value represents the total exp required to reach that
level. This means that from level 2 to level 3, 100 EXP is required.

-- Class Exp Tables --

You can use this plugin to manage exp tables for your classes.
It is similar to the actor table, except instead of writing "Actor" you would
write "Class" in the headers.

Create a CSV file with the following format

Level,Class1,Class2,Class3,Class6, ...
1,0,0,0,0
2,100,100,100,150
3,200,200,200,300
4,300,300,300,400

-------------------------------------------------------------------------------
@param Actor Exp Filename
@desc Name of the file that holds Actor EXP
@default actor_exp.csv

@param Class Exp Filename
@desc Name of the file that holds Class EXP
@default class_exp.csv
-------------------------------------------------------------------------------
 */  
var Imported = Imported || {} ;
var TH = TH || {};
Imported.ExpTables = 1;
TH.ExpTables = TH.ExpTables || {};

(function ($) {

  $.params = PluginManager.parameters("HIME_ExpTables");
  $.actorFilename = $.params["Actor Exp Filename"].trim();
  $.classFilename = $.params["Class Exp Filename"].trim();
  
  $.hasExpTable = function(obj) {
    return !!obj.expTable    
  };
  
  var TH_DataManager_loadDataFile = DataManager.loadDataFile;
  DataManager.loadExpTable = function(type, src) {
    if (src === "") {
      $.actorExpTableLoaded = true;
      return;
    }
    var xhr = new XMLHttpRequest();
    var url = 'data/' + src;
    xhr.open('GET', url);
    xhr.overrideMimeType('application/csv');
    xhr.onload = function() {
      if (xhr.status < 400) {
        var data = xhr.responseText
        DataManager.onLoadExpTable(data);
      }
    };
    xhr.onerror = function() {
      DataManager._errorUrl = DataManager._errorUrl || url;        
    };
    xhr.send();
  };  
  
  DataManager.onLoadExpTable = function(data) {    
    data = data.split("\n");
    $.actorExpTableLoaded = true;
    
    // get headers
    var objs = [];
    var headers = data[0].split(",");
    for (var i = 1; i < headers.length; i++) {
      var header = headers[i].toUpperCase();
      if (header.contains("ACTOR")) {
        var id = Math.floor(header.substring(5));
        objs[i] = $dataActors[id]
      }
      else if (header.contains("CLASS")) {
        var id = Math.floor(header.substring(5));
        objs[i] = $dataClasses[id]
      }
    }
    // get body
    for (var i = 1; i < data.length; i++) {
      var entry = data[i].split(",");
      var level = Math.floor(entry[0]);
      for (var j = 1; j < entry.length; j++) {
        var obj = objs[j];
        obj.expTable = obj.expTable || {};
        obj.expTable[level] = Math.floor(entry[j]);
      }
    }    
  };
  
  var TH_DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
  DataManager.isDatabaseLoaded = function() {
    var res = TH_DataManager_isDatabaseLoaded.call(this);
    if (res) {      
      if (!$.actorExpTableLoaded) {
        this.loadExpTable("actor", $.actorFilename);
        this.loadExpTable("class", $.classFilename);
        res = false;
      }
    }
    return res;
  };
  
  var TH_ExpTables_GameActor_expForLevel = Game_Actor.prototype.expForLevel;
  Game_Actor.prototype.expForLevel = function(level) {      
    
    // Actor tables takes priority
    var actor = this.actor();
    if ($.hasExpTable(actor)) {
      return actor.expTable[level];
    }
    // No actor exp table, check for class exp table
    else if ($.hasExpTable(this.currentClass())) {    
      return this.currentClass().expTable[level];
    }
    // No exp tables. Just use default
    else {
      return TH_ExpTables_GameActor_expForLevel.call(this, level);
    }
  };
})(TH.ExpTables);