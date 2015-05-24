
// Water Springs
//
// Made by BASICS09
// http://basics09.de

(function($){

	"use strict";

	var mypaper;

	$(document).ready(function() {

		// initialize the paper animation
		mypaper = new PaperWrap( $('#water-spring')[0] );
		
	});

	function PaperWrap( canvasElement ) {

		var mypaper = new paper.PaperScope();
		mypaper.setup( canvasElement );

    var view = mypaper.view,
      Point = mypaper.Point,
      Path = mypaper.Path,
      Group = mypaper.Group,
      Tool = mypaper.Tool,
      Item = mypaper.Item;

    // Values for the spring
    var values = {
      friction: 0.9,
      timeStep: 0.01,
      mass: 2
    };
    values.invMass = 1 / values.mass;
    var springs = [];

    var pendulumForce = 1 - values.friction * values.timeStep;

    var Spring = function(a, b, strength, restLength) {
      this.a = a;
      this.b = b;
      this.restLength = restLength;
      this.strength = strength;
      this.mamb = values.invMass * values.invMass;
    };

    Spring.prototype.update = function() {
      var delta = this.b.subtract( this.a );
      var dist = delta.length;
      var normDistStrength = (dist - this.restLength) / (dist * this.mamb) * this.strength;
      delta = delta.multiply( normDistStrength * values.invMass * 0.2 );
      if ( !this.a.fixed ) {
        this.a.y += delta.y;
      }
      if ( !this.b.fixed ) {
        this.b.y -= delta.y;
      }
    };

    // Surface
    var surface = new Path();
        
    function createSurface() {
      if( surface ) {
        surface.remove();
      }
      surface = new Path();
      // surface.fullySelected = true;
      surface.fillColor = "#000";
      var margin = -300;
      var waterDepth = view.size.height;

      surface.add( new Point(margin, view.size.height / 2) );
      surface.add( new Point(view.size.width - margin, view.size.height / 2) );

      var segmentAmount = 30;
      var segmentWidth = Math.floor( surface.length / segmentAmount) ;
      // Add Segments every 100 px
      surface.flatten(segmentWidth);

      // Save the point positions in the point objects
      for( var i = 0; i < surface.segments.length; i++ ) {
        var segment = surface.segments[i];
        var point = segment.point;
        point.anchor = new Point(point.x, point.y);
        
        point.px = point.x;
        point.py = point.y;

        point.fixed = false;

        if( i > 0 ) {
          var spring = new Spring(segment.previous.point, point, 0.75, segmentWidth * 0.5);
          springs.push(spring);
        }

      }
      surface.firstSegment.point.fixed = true;
      surface.lastSegment.point.fixed = true;


      surface.add( new Point(view.size.width - margin, view.size.height / 2 + waterDepth) );
      surface.lastSegment.point.fixed = true;
      surface.add( new Point(margin, view.size.height / 2 + waterDepth) );
      surface.lastSegment.point.fixed = true;
      surface.closePath();
    }
    createSurface();

    // Mouse Path
    var mousePos = view.center.add( new Point(200, 100) );
    var lastMousePos = view.center.add( new Point(-300, -100) );

    var mousePath = new Path( lastMousePos, mousePos );
        mousePath.strokeColor = '#ccc';
        mousePath.fullySelected = false;
    
    var mouseVector = new Point(0,0);

    function resetLastMousePos() {
      
      //setTimeout( resetLastMousePos, 200 );
    }
    resetLastMousePos();

    var tool = new Tool();
    tool.onMouseMove = function( event ) {
      mousePos = event.point;
    };

    view.onFrame = function(event) {

      // Adjust the Mouse Path
      //lastMousePos = lastMousePos.add( mousePos.subtract( lastMousePos ).divide(12) );
      mousePath.removeSegments();
      mousePath.addSegments( [lastMousePos, mousePos] );
      mouseVector = mousePos.subtract( lastMousePos );

      lastMousePos = mousePos;
      // disable the x coordinate on the vector
      mouseVector.x = 0;

      for( var i = 0; i < surface.segments.length; i++ ) {
        if( i > 0 && i < surface.segments.length - 1 ) {
          //surface.segments[i].selected = false;
        } else {
          //surface.segments[i].selected = true;
        }
        // surface.segments[i].selected = true;
        
      }
      //console.log( mousePath.angle );
      var intersections = surface.getIntersections( mousePath );
      if( intersections.length ) {
        var hitLocation = intersections[0];
        var segment = hitLocation.segment || hitLocation._segment1;

        if( "undefined" === typeof segment ) {
          segment = hitLocation.segment1;
        }
        
        if( !segment.point.fixed  ) {
          segment.point = segment.point.add( mouseVector.divide(1.01) );
        }
        var next = segment.next;
        var previous = segment.previous;
        if( next && !next.point.fixed) {
          next.point = next.point.add( mouseVector.divide(6) );
        }
        if( previous && !previous.point.fixed) {
          previous.point = previous.point.add( mouseVector.divide(6) );
        }
      }


      var surfaceLength = surface.firstSegment.point.getDistance( surface.lastSegment.point );
      var maxDist = view.size.height / 2;

      for( i = 0; i < surface.segments.length; i++ ) {
        var point = surface.segments[i].point;
        var anchor = point.anchor;

        if( !point.fixed ) {

          var dy = (point.y - point.py) * pendulumForce;
          point.py = point.y;
          point.y = Math.min( point.anchor.y + maxDist, Math.max(point.anchor.y - maxDist, point.y + dy) );

          
          // Uncomment this if you want to have a more jelly-like behaviour
          // point.y += ( anchor.y - point.y) / 80;
        }
      }

      for (var j = 0; j < springs.length; j++) {
        springs[j].update();
      }

      surface.smooth();
      

    };

    view.onResize = function() {
      createSurface();
    };

    var fit = this.fit = function() {

      var $canvas = $( view.element );

      var canvasWidth = $canvas.width();
      var canvasHeight = $canvas.height();

      $canvas
        .attr("width", canvasWidth)
        .attr("height", canvasHeight);
      
      mypaper.view.viewSize = new mypaper.Size( canvasWidth, canvasHeight);

    };
	}
  
  // Utilities

  function fitPaperWraps() {
    mypaper.fit();
  }

  $(window).resize(function() {
    waitForFinalEvent(fitPaperWraps, 150, "resizing-papers");
  });

  var waitForFinalEvent = (function () {
    var timers = {};
      return function (callback, ms, uniqueId) {
    if (!uniqueId) {
      uniqueId = "Don't call this twice without a uniqueId";
    }
    if (timers[uniqueId]) {
      clearTimeout (timers[uniqueId]);
    }
    timers[uniqueId] = setTimeout(callback, ms);
    };
  })();

})(jQuery);

