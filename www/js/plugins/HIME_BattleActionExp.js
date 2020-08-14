/*:
-------------------------------------------------------------------------------
@title Battle Action Exp
@author Hime --> HimeWorks (http://himeworks.com)
@version 1.1
@date Feb 25, 2016
@filename HIME_BattleActionExp.js
@url http://himeworks.com/2016/02/battle-action-exp/

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
@plugindesc v1.1 - Gain Exp after performing an action, instead of at the end
of battle.
@help 
-------------------------------------------------------------------------------
== Description ==

In RPG Maker, actors can receive exp by defeating enemies in battle.
When all enemies are defeated, the victory processing will occur, and actors
will receive exp from the battle.

However, this means that if you were to escape before the battle was over,
your actors would not receive any exp even if they defeated some enemies.

This plugin changes the way exp is obtained. Instead of only on battle end,
exp is received whenever you perform an action.

For example, if an actor attacks an enemy, exp calculation will occur and
if the actor earns exp from that attack, the actor will receive that exp
immediately, and potentially level up on the spot.

Action exp can also be obtained outside of battle, depending on the rules
you have set up for your exp calculations.

With this plugin, actors will be rewarded immediately for their actions,
which provides you with some additional mechanics that you can use.

== Terms of Use ==

- Free for use in non-commercial projects with credits
- Free for use in commercial projects, but it would be nice to let me know
- Please provide credits to HimeWorks

== Change Log ==

1.1 - Feb 25, 2016
 * added support for receiving action exp outside of battle
1.0 - Feb 24, 2016
 * initial release

== Usage ==

In the plugin parameters, set the default action EXP formula that you would
like to use.

By default, you only receive EXP when you defeat the enemy.
This is the default formula:

  b.isEnemy() && b.isDead() ? b.exp() : 0
  
This means

  IF the target of the action is an enemy, and the target is dead,
  THEN the amount of EXP gained is equal to the enemy's EXP.
  OTHERWISE, no EXP
  
This means that if an actor targets another actor, no EXP is gained.

It is important to check whether the target is an actor or enemy in certain
situations, since certain properties may not exist for all battlers.

The following formula variables are available:

  a - user of the action
  b - target of the action
  v - game variables
  s - game switches
  
  -- Examples --
  
Let's say that instead of only receiving exp when an enemy is defeated, you
wanted to receive exp based on the amount of damage you deal, as a percentage
of the enemy's exp.

That is to say, if the enemy has 100 HP and gives a total of 100 exp, and you
deal 20 damage, then you will receive 20% exp from the enemy, or 20 exp.

To accomplish this, you can retrieve the damage dealt from the action result
object for the target:

   b.result()
  
From there, you can ask for the HP Damage:

   b.result().hpDamage
  
To get the ratio, you would take that and divide it by the target's max HP

   b.result().hpDamage / b.mhp
   
Which would give you the percentage of damage that you dealt relative to
the target's total HP.

Finally, you can multiply this percentage with the enemy's total EXP, to
determine the fraction of EXP that the attacker receives:

   (b.result().hpDamage / b.mhp) * b.exp()
   
Again, because only enemy's have EXP by default, you may need to check if
the target is actually an enemy:

   b.isEnemy() ? (b.result().hpDamage / b.mhp) * b.exp() : 0
   
Which means if you target an actor, you receive no exp.

Now, what happens if the amount of damage you deal is greater than the
amount of HP the enemy has left? For example, if you deal 200 damage to
an enemy with only 100 HP.

Unfortunately, with this plugin alone, you don't have access to the enemy's
HP BEFORE the action was applied, but if you had such a plugin, and it stored
this information in a property called `oldHp` in the action result, you could
say this:

   b.isEnemy() ? (Math.min(b.result().hpDamage, b.result().oldHp) / b.mhp) * b.exp() : 0
          

-------------------------------------------------------------------------------
@param Default Action Exp Formula
@desc Formula use to use when calculating EXP gained from an action
@default b.isEnemy() && b.isDead() ? b.exp() : 0
-------------------------------------------------------------------------------
 */ 
var Imported = Imported || {} ;
var TH = TH || {};
Imported.TH_BattleActionExp = 1;
TH.BattleActionExp = TH.BattleActionExp || {};

(function ($) {

  $.params = PluginManager.parameters("HIME_BattleActionExp");
  $.formula = $.params["Default Action Exp Formula"];

  BattleManager.gainExp = function() {    
    /* No */
  };
    
  BattleManager.displayExp = function() {
    /* No */
  };
  
  /* Assume exp is gained on action end */
  var TH_BattleManager_endAction = BattleManager.endAction;
  BattleManager.endAction = function() {
    TH_BattleManager_endAction.call(this);
    $gameParty.applyActionExp();
    $gameTroop.applyActionExp();
  };
  
  /***************************************************************************/
  
  var TH_GameAction_apply = Game_Action.prototype.apply;
  Game_Action.prototype.apply = function(target) {
    TH_GameAction_apply.call(this, target);
    this.calculateActionExp(target);
  };
  
  Game_Action.prototype.calculateActionExp = function(target) {
    if (this.subject().isActor()) {
      var a = this.subject();
      var b = target;
      var v = $gameVariables;
      var s = $gameSwitches;
      var exp = eval($.formula)
      this.addActionExp(exp);
    }
  };
  
  Game_Action.prototype.addActionExp = function(exp) {
    this.subject().gainActionExp(exp);
  };
  
  /***************************************************************************/
  
  var TH_GameActionResult_clear = Game_ActionResult.prototype.clear;
  Game_ActionResult.prototype.clear = function() {
    TH_GameActionResult_clear.call(this);
    this.gainedExp = 0;
  };
  
  Game_ActionResult.prototype.gainExp = function(exp) {
    this.gainedExp += exp;
  };
  
  /***************************************************************************/
  
  var TH_GameBattler_initMembers = Game_Battler.prototype.initMembers;
  Game_Battler.prototype.initMembers = function() {
    TH_GameBattler_initMembers.call(this);
    this.clearActionExp();
  };
  
  var TH_GameBattler_onBattleStart = Game_Battler.prototype.onBattleStart;
  Game_Battler.prototype.onBattleStart = function() {
    TH_GameBattler_onBattleStart.call(this);
    this.clearActionExp();
  };
    
  /* Store exp gained through battle. It is up to the plugin to add it to
     the battler */
  Game_Battler.prototype.clearActionExp = function() {
    this._gainedActionExp = 0;
  };
  
  Game_Battler.prototype.gainActionExp = function(exp) {
    this.result().gainExp(exp);
    this._gainedActionExp += exp;
  };
  
  Game_Battler.prototype.applyActionExp = function() {
  };
  
  /***************************************************************************/
  
  /* Outside of battle, apply exp immediately upon gain */
  Game_Actor.prototype.gainActionExp = function(exp) {
    Game_Battler.prototype.gainActionExp.call(this, exp);
    if (!this.friendsUnit().inBattle()) {
      this.applyActionExp();
    }
  };
  
  Game_Actor.prototype.applyActionExp = function() {
    Game_Battler.prototype.applyActionExp.call(this);    
    this.gainExp(this._gainedActionExp);
  };
  
  /***************************************************************************/
  
  Game_Unit.prototype.applyActionExp = function() {
  };
  
  Game_Party.prototype.applyActionExp = function() {
    var members = this.members();
    for (var i = 0; i < members.length; i++) {
      var member = members[i];
      member.applyActionExp();
      member.clearActionExp();
    }
  }
})(TH.BattleActionExp);