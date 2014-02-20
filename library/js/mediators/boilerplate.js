define(
    [
        'jquery',
        'moddef',
        'physicsjs',
        'json!data/faces.json'
    ],
    function(
        $,
        M,
        Physics,
        faces
    ) {

        'use strict';

        /**
         * PhysicsJS by Jasper Palfree <wellcaffeinated.net>
         * http://wellcaffeinated.net/PhysicsJS
         *
         * Supermarket catastrophy
         */
        Physics.behavior('demo-mouse-events', function (parent) {

            return {

                init: function (options) {

                    var self = this;

                    this.mousePos = Physics.vector();
                    this.mousePosOld = Physics.vector();
                    this.offset = Physics.vector();
                    this.strength = options.strength || 0.001;

                    this.el = $(options.el).on({
                        mousedown: function (e) {

                            var offset = $(this).offset();
                            self.mousePos.set(e.pageX - offset.left, e.pageY - offset.top);

                            var body = self._world.findOne({
                                $at: self.mousePos
                            });
                            if (body) {

                                // we're trying to grab a body

                                // fix the body in place
                                body.fixed = true;
                                // remember the currently grabbed body
                                self.body = body;
                                // remember the mouse offset
                                self.offset.clone(self.mousePos).vsub(body.state.pos);
                                return;
                            }

                            self.mouseDown = true;
                        },
                        mousemove: function (e) {
                            var offset = $(this).offset();
                            self.mousePosOld.clone(self.mousePos);
                            // get new mouse position
                            self.mousePos.set(e.pageX - offset.left, e.pageY - offset.top);
                        },
                        mouseup: function (e) {
                            var offset = $(this).offset();
                            self.mousePosOld.clone(self.mousePos);
                            self.mousePos.set(e.pageX - offset.left, e.pageY - offset.top);

                            // release the body
                            if (self.body) {
                                self.body.fixed = false;
                                self.body = false;
                            }
                            self.mouseDown = false;
                        }
                    });
                },

                connect: function (world) {

                    // subscribe the .behave() method to the position integration step
                    world.subscribe('integrate:positions', this.behave, this);
                },

                disconnect: function (world) {

                    // unsubscribe when disconnected
                    world.unsubscribe('integrate:positions', this.behave);
                },

                behave: function (data) {

                    if (this.body) {

                        // if we have a body, we need to move it the the new mouse position.
                        // we'll also track the velocity of the mouse movement so that when it's released
                        // the body can be "thrown"
                        this.body.state.pos.clone(this.mousePos).vsub(this.offset);
                        this.body.state.vel.clone(this.body.state.pos).vsub(this.mousePosOld).vadd(this.offset).mult(1 / 30);
                        this.body.state.vel.clamp({
                            x: -1,
                            y: -1
                        }, {
                            x: 1,
                            y: 1
                        });
                        return;
                    }

                    if (!this.mouseDown) {
                        return;
                    }

                    // if we don't have a body, then just accelerate
                    // all bodies towards the current mouse position

                    var bodies = data.bodies
                        // use a scratchpad to speed up calculations
                        ,scratch = Physics.scratchpad()
                        ,v = scratch.vector()
                        ,body
                        ;

                    for (var i = 0, l = bodies.length; i < l; ++i) {

                        body = bodies[i];

                        // simple linear acceleration law towards the mouse position
                        v.clone(this.mousePos)
                            .vsub(body.state.pos)
                            .normalize()
                            .mult(this.strength);

                        body.accelerate(v);
                    }

                    scratch.done();
                }
            };
        });

        function ballPit(world, Physics){
            var $win = $(window)
                ,viewWidth = $win.width()
                ,viewHeight = $win.height()
                ,renderer = Physics.renderer('dom', {
                    el: 'ball-pit',
                    width: viewWidth,
                    height: viewHeight,
                    meta: true
                })
                ,edgeBounce
                // bounds of the window
                ,viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight)
                ;

            // constrain objects to these bounds
            edgeBounce = Physics.behavior('edge-collision-detection', {
                aabb: viewportBounds,
                restitution: 0.2,
                cof: 0.8
            });

            // resize events
            $(window).on('resize', function () {

                viewWidth = $('body').width();
                viewHeight = $('body').height();

                renderer.el.width = viewWidth;
                renderer.el.height = viewHeight;

                renderer.options.width = viewWidth;
                renderer.options.height = viewHeight;

                viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight);
                edgeBounce.setAABB(viewportBounds);

            });

            // add the renderer
            world.add(renderer);
            // render on each step
            world.subscribe('step', function () {
                world.render();
            });

            world.add(Physics.behavior('demo-mouse-events', {
                el: '#ball-pit',
                strength: 0.002
            }));

            var balls = [];
            Physics.util.each(faces, function( data ){

                var b = Physics.body('circle', {
                    radius: 60,
                    x: Math.random() * viewWidth + 50,
                    y: Math.random() * viewHeight + 50,
                    vx: 0,
                    cof: 0.99,
                    restitution: 0.99,
                    fixed: false
                });

                b.view = renderer.createView( b.geometry );
                b.view.style.backgroundImage = 'url(library/images/faces/'+data.img+')';
                if (data.position){
                    b.view.style.backgroundPosition = data.position;
                }

                if (data.name){
                    $(b.view).data('name', data.name);
                }

                balls.push( b );
            });

            world.add(balls);

            world.add([
                Physics.behavior('body-collision-detection', {
                    checkAll: false
                })
                ,Physics.behavior('sweep-prune')
                ,Physics.behavior('body-impulse-response')
                ,edgeBounce
                // add gravity
                ,Physics.behavior('constant-acceleration', { acc: { x: 0, y: 0.001 } })
            ]);

            // subscribe to ticker to advance the simulation
            Physics.util.ticker.subscribe(function (time, dt) {

                world.step(time);
            });

            // start the ticker
            Physics.util.ticker.start();

            $(function () {
                $win.trigger('resize');
            });
        }

        /**
         * Page-level Mediator
         * @module Boilerplate
         * @implements {Stapes}
         */
        var Mediator = M({

            /**
             * Mediator Constructor
             * @return {void}
             */
            constructor : function(){

                var self = this;
                self.initEvents();

                $(function(){
                    self.resolve('domready');
                });

                self.after('domready').then(function(){
                    self.onDomReady();
                }).otherwise(function(){
                    // console.log(arguments)
                });
            },

            /**
             * Initialize events
             * @return {void}
             */
            initEvents : function(){

                var self = this
                    ,origText
                    ;

                $(document).on('mouseenter', '.pjs-circle', function(){
                    var $this = $(this)
                        ,name = $this.data('name')
                        ,$rep = $('#replace')
                        ;


                    if ( name ){
                        origText = origText || $rep.text();
                        $rep.attr('data-text', name);
                        $rep.width($rep.width());
                    }
                });
                $(document).on('mouseleave', '.pjs-circle', function(){
                    var $this = $(this)
                        ,$rep = $('#replace')
                        ;

                    if ( origText ){
                        $rep.attr('data-text', origText);
                    }
                });
            },

            /**
             * DomReady Callback
             * @return {void}
             */
            onDomReady : function(){

                var self = this;

                self.world = Physics( ballPit );
            }

        }, ['events']);

        return new Mediator();
    }
);




