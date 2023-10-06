function makeInteractive(svgElement) {
  var xmlnsSvg = "http://www.w3.org/2000/svg";

	var screenSize = {
    width: 0,
    height: 0,
  }

  var controls = {
  	mouse: {
  		pressed: false,
  		movementDistance: 0,
  	},
  	touch: {
  		ids: [],
      previousDistance: null,
      previousAngle: null,
      previousCenter: null,
      initialDistance: null,
      initialAngle: null,
      initialCenter: null,
  	},
  	tap: {
  		pageX: null,
  		pageY: null,
  		time: null,
  	},
  };

  var camera = {
  	defaults: {
  		x: 0,
  		y: 0,
  		angle: 0,
  		zoom: 1,
  	},
  	current: {
  		x: 0,
  		y: 0,
  		angle: 0,
  		zoom: 1,
  	},
  	target: {
  		x: 0,
  		y: 0,
  		angle: 0,
  		zoom: 1,
  	},
  	velocity: {
  		x: 0,
  		y: 0,
  		angle: 0,
  		zoom: 0,
  	},
  	tracking: {
  		pan: {
  			x: 0,
  			y: 0,
  			time: null,
  		},
  		zoom: {
  			value: 0,
  			time: null,
  		},
  		rotation: {
  			value: 0,
  			time: null,
  		},
  	}
  }

  var physicsConfig = {
    maxTrackingTime: 160,
    minVelocity: 0.5,
    friction: 0.05,
    acceleration: 0.08,
    deceleration: 0.03,
    stiffness: 0.5,
    frameLength:4,
    stopVelocity: 0.001,
    normalizer: 16,
  }


  var doubleTabRadius = 100;

  var bounds = {
    width: Infinity,
    height: Infinity,
    minX: -Infinity,
    maxX: Infinity,
    minY: -Infinity,
    maxY: Infinity,
  };

  var debug = {
    touches: [],
    debugMousePointer: createDebugCircle(),
    debugTouchCenter: createDebugCircle('green'),
    debugTouchCenterInitial: createDebugCircle('cyan'),
    debugTouchAngle: createDebugAngle(200, 'blue'),
    debugTouchAngleText: createDebugText('blue', 100),
    debugTouchScale: createDebugScale('blue'),
    debugTouchCount: createDebugText('blue', -100),
    accumulatedAngle: 0
  }

  function createDebugCircle(color = 'red') {
    var circle = svgElement.ownerDocument.createElementNS(xmlnsSvg, 'circle')
    circle.classList.add('debug-helper')
    circle.setAttribute('r', 50)
    circle.setAttribute('cx', 0)
    circle.setAttribute('cy', 0)
    circle.setAttribute('pointer-events', 'none')
    circle.setAttribute('fill', color)
    circle.setAttribute('fill-opacity', 0.5)
    circle.style.display = 'none'
    svgElement.appendChild(circle)

    return {
      setPosition(x,y) {
        circle.setAttribute('cx', x)
        circle.setAttribute('cy', y)
      },
      setVisible(show) {
        circle.style.display = show ? 'initial' : 'none'
      },
      remove() {
        svgElement.removeChild(circle)
      }
    };
  }

  function createDebugAngle(length = 200, color = 'red') {
    var line = svgElement.ownerDocument.createElementNS(xmlnsSvg, 'line')
    line.classList.add('debug-helper')
    line.setAttribute('x1', 0)
    line.setAttribute('y1', 0)
    line.setAttribute('pointer-events', 'none')
    line.setAttribute('stroke', color)
    line.setAttribute('stroke-width', 20)
    line.setAttribute('stroke-opacity', 0.5)
    line.style.display = 'none'
    svgElement.appendChild(line)

    return {
      setValue(rad) {
        line.setAttribute('x2', length*Math.cos(rad))
        line.setAttribute('y2', length*Math.sin(rad))
      },
      setVisible(show) {
        line.style.display = show ? 'initial' : 'none'
      },
      remove() {
        svgElement.removeChild(line)
      }
    };
  }

  function createDebugScale(color = 'red') {
    var circle = svgElement.ownerDocument.createElementNS(xmlnsSvg, 'circle')
    circle.classList.add('debug-helper')
    circle.setAttribute('r', 0)
    circle.setAttribute('cx', 0)
    circle.setAttribute('cy', 0)
    circle.setAttribute('pointer-events', 'none')
    circle.setAttribute('fill', color)
    circle.setAttribute('fill-opacity', 0.5)
    circle.style.display = 'none'
    svgElement.appendChild(circle)

    return {
      setValue(v) {
        circle.setAttribute('r', v)
      },
      setVisible(show) {
        circle.style.display = show ? 'initial' : 'none'
      },
      remove() {
        svgElement.removeChild(circle)
      }
    };
  }

  function createDebugText(color = 'red', offset = 0) {
    var text = svgElement.ownerDocument.createElementNS(xmlnsSvg, 'text')
    text.classList.add('debug-helper')
    text.setAttribute('x', 0)
    text.setAttribute('y', offset)
    text.setAttribute('font-size', 150)
    text.setAttribute('pointer-events', 'none')
    text.setAttribute('fill', color)
    text.setAttribute('fill-opacity', 0.5)
    text.setAttribute('text-anchor', 'middle')
    text.setAttribute('dominant-baseline', 'middle')
    text.style.display = 'none'
    text.appendChild(document.createTextNode(''))
    svgElement.appendChild(text)

    return {
      setValue(v) {
        text.removeChild(text.lastChild)
        text.appendChild(document.createTextNode(""+v))
      },
      setVisible(show) {
        text.style.display = show ? 'initial' : 'none'
      },
      remove() {
        svgElement.removeChild(text)
      }
    };
  }

  function setBounds(minX, minY, maxX, maxY) {
    bounds.width = isFinite(minX) && isFinite(maxX) ? (maxX - minX) : Infinity
    bounds.height = isFinite(minX) && isFinite(maxX) ? (maxY - minY) : Infinity
    bounds.minX = minX
    bounds.minY = minY
    bounds.maxX = maxX
    bounds.maxY = maxY
  }

  function performZoom(pivotX, pivotY, factor) {

  }

  function performPan(deltaX, deltaY) {

  }

  function performRotation(pivotX, pivotY, angleDegree) {

  }

  function performGesture(gesture) {

  }

  function retargetCamera() {
    
  }

  function retargetCameraInverse() {
    
  }

  //--

  function runSubTick() {

  }

  function runTick() {

  }

  function onAnimationFrame() {

  }

  //--

  function onContextMenu(evt) {
    evt.preventDefault()
  }

  function onMouseDown(evt) {
    if(!controls.mouse.pressed) {
      controls.mouse.pressed = true
      onMouseMovePressed(evt, true)
    }
  }

  function onMouseMove(evt) {
    if(!controls.mouse.pressed) {
      return
    }

    onMouseMovePressed(evt, false)
  }

  function onMouseMovePressed(evt, initial) {
    const targetRect = svgElement.getBoundingClientRect();
    var local = screenToSVG(
      evt.clientX, evt.clientY,
      targetRect.left, targetRect.top, 
      targetRect.width, targetRect.height, 
      svgElement.clientWidth, svgElement.clientHeight, 
      viewBox
    )

    if(initial) {
      debug.debugMousePointer.setVisible(true)
    }

    debug.debugMousePointer.setPosition(local.x, local.y)
  }

  function onMouseUp(evt) {
    if(controls.mouse.pressed) {
      controls.mouse.pressed = false
      onMousePressedUp(evt)
    }
  }

  function onMousePressedUp(evt) {
      debug.debugMousePointer.setVisible(false)
  }

  function onClick(evt) {
    
  }

  function onDblClick(evt) {
    
  }

  //--

  function getTouchCenter(touches) {
    var len = touches.length
    var xSum = 0
    var ySum = 0

    for(var t=len;t--;t>=0) {
      xSum += touches[t].clientX
      ySum += touches[t].clientY
    }

    return {
      x: xSum / len,
      y: ySum / len
    }
  }

  function getTouchAngle(touches, center, normalize = false) {
    if (touches.length < 2) {
      return null
    }
    center = center || getTouchCenter(touches)

    var angleSum = 0
    var xSum = 0
    var ySum = 0
    var distanceSum = 0
    var maxA = -Infinity

    for(var i = touches.length-1;i>=0;i--) {
      var dx = (touches[i].clientX - center.x)
      var dy = (touches[i].clientY - center.y)
      var a = Math.atan2(dy, dx);
      var d = Math.hypot(dy, dx);
      maxA = Math.max(a, maxA)

      if(a<=0) {
        a += Math.PI*2
      }
      angleSum += a
      xSum += Math.cos(a)
      ySum += Math.sin(a)
      distanceSum += d
    }

    return normalize ? angleSum/touches.length : angleSum
  }


  function getTouchRadius(touches, center) {
    center = center || getTouchCenter(touches)

    var sum = 0

    for(var i = touches.length-1;i>=0;i--) {
      sum += Math.hypot(touches[i].clientY - center.y, touches[i].clientX - center.x);
    }

    return sum / touches.length
  }

  function onTouchStart(evt) {
    evt.preventDefault()
    var len = evt.changedTouches.length;
    while(len--) {
      debug.touches.push(createDebugCircle())
    }

    onTouchUpdate(evt, true)
  }

  function onTouchMove(evt) {
    onTouchUpdate(evt)
    
  }

  function normalizeAngle(a) {
    while(a<-Math.PI) {
      a+= Math.PI*2
    }
    while(a>Math.PI) {
      a-= Math.PI*2
    }

    return a
  }

  function rotationDelta(angleA, angleB) {
    return normalizeAngle(angleA - angleB) / 2
  }

  function sumAngle(a, b) {
    var sum = a+b;

    while(sum<0) {
      sum += Math.PI*2
    }

    while(sum>Math.PI*2) {
      sum -= Math.PI*2
    }

    return sum
  }

  function onTouchUpdate(evt, initial) {
    const targetRect = svgElement.getBoundingClientRect();

    for(var t=evt.touches.length;t--;t>=0) {
      var clientX = evt.touches[t].clientX
      var clientY = evt.touches[t].clientY

      var local = screenToSVG(
        clientX, clientY,
        targetRect.left, targetRect.top, 
        targetRect.width, targetRect.height, 
        svgElement.clientWidth, svgElement.clientHeight, 
        viewBox
      )

      debug.touches[t].setVisible(true)
      debug.touches[t].setPosition(local.x, local.y)
    }

    debug.debugTouchCenter.setVisible(evt.touches.length > 1)
    debug.debugTouchCenterInitial.setVisible(evt.touches.length > 1)
    debug.debugTouchAngle.setVisible(evt.touches.length > 1)
    debug.debugTouchAngleText.setVisible(evt.touches.length > 1)
    debug.debugTouchScale.setVisible(evt.touches.length > 1)
    if(evt.touches.length > 1) {
      var touchCenter = getTouchCenter(evt.touches)
      var prevCenter = initial ? touchCenter : controls.touch.previousCenter
      var initialCenter = initial ? touchCenter : controls.touch.initialCenter
      var touchRadius = getTouchRadius(evt.touches, prevCenter)
      var touchAngle = getTouchAngle(evt.touches, prevCenter)

      var localCenter = screenToSVG(
        touchCenter.x, touchCenter.y,
        targetRect.left, targetRect.top, 
        targetRect.width, targetRect.height, 
        svgElement.clientWidth, svgElement.clientHeight, 
        viewBox
      );

      var localCenterInitial = screenToSVG(
        initialCenter.x, initialCenter.y,
        targetRect.left, targetRect.top, 
        targetRect.width, targetRect.height, 
        svgElement.clientWidth, svgElement.clientHeight, 
        viewBox
      );

      if(!initial && controls.touch.previousAngle !== null && touchAngle !== null) {
        var angleDela = rotationDelta(touchAngle, controls.touch.previousAngle)
        debug.accumulatedAngle = sumAngle(debug.accumulatedAngle, angleDela)
      }

      debug.debugTouchCenter.setPosition(localCenter.x, localCenter.y)
      debug.debugTouchCenterInitial.setPosition(localCenterInitial.x, localCenterInitial.y)
      debug.debugTouchAngle.setValue(debug.accumulatedAngle)
      debug.debugTouchAngleText.setValue(Math.round(debug.accumulatedAngle*10)/10)
      debug.debugTouchScale.setValue(touchRadius)

      controls.touch.previousAngle = touchAngle
      controls.touch.previousDistance = touchRadius
      controls.touch.previousCenter = touchCenter

      if(initial) {
        controls.touch.initialAngle = touchAngle
        controls.touch.initialDistance = touchRadius
        controls.touch.initialCenter = touchCenter
      }
    }
    debug.debugTouchCount.setVisible(evt.touches.length > 0)
    debug.debugTouchCount.setValue(evt.touches.length)
   
  }

  function onTouchEnd(evt) {
    var len = evt.changedTouches.length;
    while(len--) {
      var t = debug.touches.pop()
      t.remove()
    }

    onTouchUpdate(evt, true)
  }

  function onTouchCancel(evt) {
    var len = evt.changedTouches.length;
    while(len--) {
      var t = debug.touches.pop()
      t.remove()
    }

    onTouchUpdate(evt, true)
  }

  //--

  function onPointerDown(evt) {
    
  }

  function onPointerMove(evt) {
    
  }

  function onPointerUp(evt) {
    
  }

  //--

  function onGestureStart(evt) {
    
  }

  function onGestureChange(evt) {
    
  }

  function onGestureEnd(evt) {
    
  }

  //--

  //--

  function attachAnimation() {
    
  }

  function detachAnimation() {
    
  }

  function attachEventHandlers() {
    svgElement.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('contextmenu', onContextMenu)


    svgElement.addEventListener('touchstart', onTouchStart)
    window.addEventListener('touchmove', onTouchMove)
    window.addEventListener('touchend', onTouchEnd)
    window.addEventListener('touchcancel', onTouchCancel)
  }

  function detachEventHandlers() {
    
  }

  function scaleViewBox(viewBox, elementWidth, elementHeight) {
    if(viewBox.scaling === 'none') {
      return {
        minX: viewBox.minX,
        minY: viewBox.minY,
        width: viewBox.width,
        height: viewBox.height,
      }
    } else {
      const relWidth = viewBox.width/elementWidth
      const relHeight = viewBox.height/elementHeight
      
      const factor = {
        'meet': Math.max,
        'slice': Math.min
      }[viewBox.scaling].call(Math, relWidth, relHeight)

      const actualWidth = elementWidth * factor
      const actualHeight = elementHeight * factor
      const extraWidth = actualWidth - viewBox.width
      const extraHeight = actualHeight - viewBox.height

      const alignmentWeights = {
        'Min': 0,
        'Mid': 0.5,
        'Max': 1,
      };
      
      const extraWeightingX = alignmentWeights[viewBox.alignmentX];
      const extraWeightingY = alignmentWeights[viewBox.alignmentY];

      return {
        minX:  viewBox.minX - extraWeightingX * extraWidth,
        minY: viewBox.minY - extraWeightingY * extraHeight,
        width: actualWidth,
        height: actualHeight,
      }
    }
  }

  function screenToSVG(x, y, elementX, elementY, elementWidth, elementHeight, localWidth, localHeight, viewBox) {
    const offsetX = x - elementX
    const offsetY = y - elementY
    const relativeX = offsetX / elementWidth
    const relativeY = offsetY / elementHeight

    const scaledVB = scaleViewBox(viewBox, localWidth, localHeight)
    return {
      x: scaledVB.minX + scaledVB.width * relativeX,
      y: scaledVB.minY + scaledVB.height * relativeY,
    }
  }

  function updateDebug() {
    
  }

  var aspectRatioSyntax = new RegExp('^x(Min|Mid|Max)Y(Min|Mid|Max) (meet|slice)$','');
  function parseViewBox(viewBox, aspectRatio) {
    var [minX, minY, width, height] = viewBox.split(/\s+/).map((n) => parseFloat(n, 10))
    var [alignmentX, alignmentY, scaling] = aspectRatio.match(aspectRatioSyntax).slice(1)

    return {
      minX,
      width,
      minY,
      height,
      alignmentX,
      alignmentY,
      scaling,
    }
  }

  var viewBoxPan = svgElement.hasAttribute('can-pan')
  var viewBoxZoom = svgElement.hasAttribute('can-magnify')
  var viewBoxBounds = svgElement.hasAttribute('use-bounds')
  var elRotator = svgElement.querySelector('[can-rotate]')
  var elPanner = svgElement.querySelector('[can-pan]')
  var elZoomer = svgElement.querySelector('[can-magnify]')
  var elBounds = svgElement.querySelector('[use-bounds]')

  var canZoom = !!viewBoxZoom || !!elZoomer
  var canPan = !!viewBoxPan || !!elPanner
  var canRotate = !!elRotator

  var viewBox = parseViewBox(svgElement.getAttribute('viewBox'), svgElement.getAttribute('preserveAspectRatio'))

  console.log(
  	!!viewBoxPan,
		!!viewBoxZoom,
		!!viewBoxBounds,
		!!elRotator,
		!!elBounds,
    viewBox
  )

	svgElement.classList.toggle('is-zoomable', canZoom)
	svgElement.classList.toggle('is-rotatable', canRotate)
	svgElement.classList.toggle('is-draggable', canPan)

  attachEventHandlers()
}