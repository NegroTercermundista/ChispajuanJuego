/*:
-------------------------------------------------------------------------
@title Formula Effects
@author Hime --> HimeWorks (http://himeworks.com)
@date Feb 11, 2015
@version 1.0
@filename HIME_FormulaEffects.js
@url http://himeworks.com/2016/02/formula-effects-mv/

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
@plugindesc v1.0 - Allows you to execute any formula as an effect
@help 
-------------------------------------------------------------------------------
== Description ==

All items and skills in RPG Maker come with additional "effects".

Effects include gaining HP, learning a skill, gaining a buff in a parameter,
or running a common event.

However, what if you would like a skill to do something that isn't provided
by default?

You could use the damage formula, but what if you would like to create
conditions on those effects? You could include those conditions in the formula
as well, but the problem here is you may end up with a very complex damage
formula.

Instead of using the damage formula for everything, you can create custom
effects that support formulas. If you already knew how to write the formula,
then you can just move it from the damage formula into this formula effect.

Because a formula effect is just another effect, it supports other plugins
that work with effects, such as Conditional Effects, which allows you to
determine whether an effect should be executed based on a condition.

== Terms of Use ==

- Free for use in non-commercial projects with credits
- Contact me for commercial use

== Change Log ==

Feb 11, 2015 -  initial release

== Usage ==

To create a formula effect, note-tag items or skills with

  <formula effect>
    FORMULA
  </formula effect>
  
Where the FORMULA will be evaluated during skill execution and the behavior
is determined by what you write in the formula.

The following formula variables are available

  a - attacker
  b - target
  i - current item or skill
  v - game variables
  s - game switches
  t - game troop
  p - game party
  
So for example, if you wanted to reduce the target's HP by 100, you could
use the formula

  b.gainHp(-100);

You can access the result of the action on the target using

  var r = b.result()
  
With this, you can then check how much HP damage or MP damage was dealt

  r.hpDamage
  r.mpDamage
  
And then use this in your effect calculations.

Anything that is defined in the code can be used as an effect.

-------------------------------------------------------------------------------
 */ 
var Imported = Imported || {} ;
var TH = TH || {};
Imported.FormulaEffects = 1;
TH.FormulaEffects = TH.FormulaEffects || {};

(function ($) {

  $.Code = "TH_FORMULA_EFFECT";
  $.Regex = /<formula[-_ ]effect:\s*(\w+)\s*\/>/img
  $.ExtRegex = /<formula[-_ ]effect>([\s\S]*?)<\/formula[-_ ]effect>/img

  $.loadEffects = function(obj) {
    if (obj.thFormulaEffectsLoaded) {
      return;
    }
    obj.thFormulaEffectsLoaded = true;
    var res;
    while (res = $.ExtRegex.exec(obj.note)) {
      var formula = res[1];
      var eff = {
        code: $.Code,
        dataId: 0,
        value1: formula,
        value2: 0
      };
      obj.effects.push(eff);
    }
  };
  
  var TH_GameAction_applyItemEffect = Game_Action.prototype.applyItemEffect;
  Game_Action.prototype.applyItemEffect = function(target, effect) {
    if (effect.code === $.Code) {
      this.itemEffectFormulaEffect(target, effect);
    }
    else {
      TH_GameAction_applyItemEffect.call(this, target, effect);
    }
  };
  
  /* Apply custom formula effect to user or target */
  Game_Action.prototype.itemEffectFormulaEffect = function(target, effect) {
    var formula = effect.value1;
    var a = this.subject();
    var b = target;
    var i = this.item();
    var v = $gameVariables;
    var s = $gameSwitches;    
    var p = $gameParty;
    var t = $gameTroop;
    eval(formula);
    this.makeSuccess(target);
  };

  var TH_DataManager_onLoad = DataManager.onLoad;  
  DataManager.onLoad = function(object) {
    TH_DataManager_onLoad.call(this, object);
    if (object[1] && object[1].effects !== undefined) {
      for (var i = 1, len = object.length; i < len; i++) {        
        $.loadEffects(object[i])
      };
    };
  };
})(TH.FormulaEffects);