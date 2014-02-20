/**
 * PhysicsJS v0.5.4 - 2014-02-03
 * A modular, extendable, and easy-to-use physics engine for javascript
 * http://wellcaffeinated.net/PhysicsJS
 *
 * Copyright (c) 2014 Jasper Palfree <jasper@wellcaffeinated.net>
 * Licensed MIT
 */

(function(e,t){typeof define=="function"&&define.amd?define(["physicsjs"],t):typeof exports=="object"?module.exports=t.apply(e,["physicsjs"].map(require)):t.call(e,e.Physics)})(this,function(e){return e.behavior("body-collision-detection",function(t){var n="collisions:candidates",r="collisions:detected",i=function(n,r){var i;return i=function(t){var s=e.scratchpad(),o=s.transform().setTranslation(n.state.pos).setRotation(n.state.angular.pos),u=s.transform().setTranslation(r.state.pos).setRotation(r.state.angular.pos),a=s.vector(),f=s.vector(),l=i.useCore?"getFarthestCorePoint":"getFarthestHullPoint",c=i.marginA,h=i.marginB,p;return a=n.geometry[l](t.rotateInv(o),a,c).transform(o),f=r.geometry[l](t.rotate(o).rotateInv(u).negate(),f,h).transform(u),t.negate().rotate(u),p={a:a.values(),b:f.values(),pt:a.vsub(f).values()},s.done(),p},i.useCore=!1,i.margin=0,i},s=function(n,r){var s=e.scratchpad(),o=s.vector(),u=s.vector(),a,f,l,c=!1,h=n.aabb(),p=Math.min(h.halfWidth,h.halfHeight),d=r.aabb(),v=Math.min(d.halfWidth,d.halfHeight);l=i(n,r),o.clone(n.state.pos).vsub(r.state.pos),f=e.gjk(l,o,!0);if(f.overlap){c={bodyA:n,bodyB:r},l.useCore=!0,l.marginA=0,l.marginB=0;while(f.overlap&&(l.marginA<p||l.marginB<v))l.marginA<p&&(l.marginA+=1),l.marginB<v&&(l.marginB+=1),f=e.gjk(l,o);if(f.overlap||f.maxIterationsReached)return s.done(),!1;a=Math.max(0,l.marginA+l.marginB-f.distance),c.overlap=a,c.norm=o.clone(f.closest.b).vsub(u.clone(f.closest.a)).normalize().values(),c.mtv=o.mult(a).values(),c.pos=o.clone(c.norm).mult(l.margin).vadd(u.clone(f.closest.a)).vsub(n.state.pos).values()}return s.done(),c},o=function(n,r){var i=e.scratchpad(),s=i.vector(),o=i.vector(),u,a=!1;return s.clone(r.state.pos).vsub(n.state.pos),u=s.norm()-(n.geometry.radius+r.geometry.radius),s.equals(e.vector.zero)&&s.set(1,0),u<=0&&(a={bodyA:n,bodyB:r,norm:s.normalize().values(),mtv:s.mult(-u).values(),pos:s.normalize().mult(n.geometry.radius).values(),overlap:-u}),i.done(),a},u=function(t,n){return t.geometry.name==="circle"&&n.geometry.name==="circle"?o(t,n):s(t,n)},a={checkAll:!1};return{init:function(n){t.init.call(this,n),this.options=e.util.extend({},this.options,a,n)},connect:function(e){this.options.checkAll?e.subscribe("integrate:velocities",this.checkAll,this):e.subscribe(n,this.check,this)},disconnect:function(e){this.options.checkAll?e.unsubscribe("integrate:velocities",this.checkAll):e.unsubscribe(n,this.check)},check:function(e){var t=e.candidates,n,i=[],s;for(var o=0,a=t.length;o<a;++o)n=t[o],s=u(n.bodyA,n.bodyB),s&&i.push(s);i.length&&this._world.publish({topic:r,collisions:i})},checkAll:function(e){var t=e.bodies,n=e.dt,i,s,o=[],a;for(var f=0,l=t.length;f<l;f++){i=t[f];for(var c=f+1;c<l;c++){s=t[c];if(!i.fixed||!s.fixed)a=u(i,s),a&&o.push(a)}}o.length&&this._world.publish({topic:r,collisions:o})}}}),e});