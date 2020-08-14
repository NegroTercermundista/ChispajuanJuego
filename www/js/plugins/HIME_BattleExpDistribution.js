/*:
-------------------------------------------------------------------------
@title Battle Exp Distribution
@author Hime --> HimeWorks (http://himeworks.com)
@version 1.0
@date Jan 2, 2016
@filename HIME_BattleExpDistribution.js
@url http://himeworks.com/2016/01/battle-exp-distribution/

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
@plugindesc v1.0 - distributes EXP between all alive party members equally.
@help 
-------------------------------------------------------------------------------
== Description ==

In RPG Maker, when you defeat enemies in battle, everyone that's alive will
receive some EXP.

So for example, if you defeated a slime, and the slime is worth 100 EXP, then
every party member that is alive will receive 100 EXP. If you had one member,
that member would receive 100 EXP. If you had four members, then all four
members would receive 100 EXP.

However, this means there is no incentive to try to challenge yourself to have
one party member solo the battle, because there's no difference whether you
bring your entire party or not.

This plugin changes the way EXP is rewarded. Instead of simply giving everyone
the same amount of EXP, the total EXP is divided among all of the party
members.

For now, the EXP is divided equally, so if an enemy gives 100 EXP and you
bring three other party members with you, then everyone will only receive 25.
However, if you decided to solo the enemy yourself, you will get the full 100.

== Terms of Use ==

- Free for use in non-commercial projects with credits
- Free for use in commercial projects, but it would be nice to let me know
- Please provide credits to HimeWorks

== Change Log ==

1.0 - Jan 2, 2016
 - initial release

== Usage ==

Plug and Play.


-------------------------------------------------------------------------------
 */ 
var Imported = Imported || {} ;
var TH = TH || {};
Imported.TH_BattleExpDistribution = 1;
TH.BattleExpDistribution = TH.BattleExpDistribution || {};

(function ($) {

  var TH_GameTroop_expTotal = Game_Troop.prototype.expTotal;
  Game_Troop.prototype.expTotal = function() {
    var total = TH_GameTroop_expTotal.call(this);
    total = this.applyTotalExpModifiers(total);
    return total;
  };
  
  Game_Troop.prototype.applyTotalExpModifiers = function(total) {
    total = this.applyPartyCountExpModifier(total);
    return total;
  };
  
  Game_Troop.prototype.applyPartyCountExpModifier = function(total) {
    total = Math.floor(total / $gameParty.aliveMembers().length);
    return total;
  };

})(TH.BattleExpDistribution);