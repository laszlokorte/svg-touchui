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
      previousPressed: null,
      initialPressed: null,
  	},
    wheel: {
      time: null,
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

  function setupDebugger(containerElement) {
    function createDebugCircle(color = 'magenta') {
      var _cx = 0, _cy = 0, _show = false;

      var circle = containerElement.ownerDocument.createElementNS(xmlnsSvg, 'circle')
      circle.classList.add('debug-helper')
      circle.setAttribute('r', 50)
      circle.setAttribute('cx', 0)
      circle.setAttribute('cy', 0)
      circle.setAttribute('pointer-events', 'none')
      circle.setAttribute('fill', color)
      circle.setAttribute('fill-opacity', 0.9)
      circle.style.display = 'none'
      containerElement.appendChild(circle)

      return {
        setPosition(x,y) {
          _cx = x
          _cy = y
        },
        setVisible(show) {
          _show = show
        },
        remove() {
          containerElement.removeChild(circle)
        },
        refresh() {
          circle.setAttribute('cx', _cx)
          circle.setAttribute('cy', _cy)
          circle.style.display = _show ? 'initial' : 'none'
        },
      };
    }

    function createDebugAngle(length = 200, color = 'magenta') {
      var _rad = 0
      var _show = false
      var line = containerElement.ownerDocument.createElementNS(xmlnsSvg, 'line')
      line.classList.add('debug-helper')
      line.setAttribute('x1', 0)
      line.setAttribute('y1', 0)
      line.setAttribute('pointer-events', 'none')
      line.setAttribute('stroke', color)
      line.setAttribute('stroke-width', 20)
      line.setAttribute('stroke-opacity', 0.9)
      line.style.display = 'none'
      containerElement.appendChild(line)

      return {
        setValue(rad) {
          _rad = rad
        },
        setVisible(show) {
          _show = show
        },
        remove() {
          containerElement.removeChild(line)
        },
        refresh() {
          line.setAttribute('x2', length*Math.cos(_rad))
          line.setAttribute('y2', length*Math.sin(_rad))
          line.style.display = _show ? 'initial' : 'none'
        },
      };
    }

    function createDebugScale(color = 'magenta') {
      var _value = 0
      var _show = false
      var circle = containerElement.ownerDocument.createElementNS(xmlnsSvg, 'circle')
      circle.classList.add('debug-helper')
      circle.setAttribute('r', 0)
      circle.setAttribute('cx', 0)
      circle.setAttribute('cy', 0)
      circle.setAttribute('pointer-events', 'none')
      circle.setAttribute('fill', color)
      circle.setAttribute('fill-opacity', 0.9)
      circle.style.display = 'none'
      containerElement.appendChild(circle)

      return {
        setValue(v) {
          _value = v
        },
        setVisible(show) {
          _show = show
        },
        remove() {
          containerElement.removeChild(circle)
        },
        refresh() {
          circle.setAttribute('r', _value)
          circle.style.display = _show ? 'initial' : 'none'
        },
      };
    }

    function createDebugText(color = 'magenta', offset = 0) {
      var text = containerElement.ownerDocument.createElementNS(xmlnsSvg, 'text')
      var _textNode = document.createTextNode("")
      var _show = false
      text.classList.add('debug-helper')
      text.setAttribute('x', 0)
      text.setAttribute('y', offset)
      text.setAttribute('font-size', 150)
      text.setAttribute('pointer-events', 'none')
      text.setAttribute('fill', color)
      text.setAttribute('fill-opacity', 0.9)
      text.setAttribute('text-anchor', 'middle')
      text.setAttribute('dominant-baseline', 'middle')
      text.style.display = 'none'
      text.appendChild(document.createTextNode(''))
      containerElement.appendChild(text)

      return {
        setValue(v) {
          _textNode = document.createTextNode(""+v)
        },
        setVisible(show) {
          _show = show
        },
        remove() {
          containerElement.removeChild(text)
        },
        refresh() {
          text.removeChild(text.lastChild)
          text.appendChild(_textNode)
          text.style.display = _show ? 'initial' : 'none'
        },
      };
    }

    return {
      touches: [],
      debugTouchScale: createDebugScale('cyan'),
      debugMouseWheel: createDebugAngle(),
      debugMousePointer: createDebugCircle(),
      debugMousePointerInitial: createDebugCircle(),
      debugTouchCenter: createDebugCircle('red'),
      debugTouchCenterInitial: createDebugCircle('green'),
      debugTouchAngle: createDebugAngle(200, 'magenta'),
      debugTouchAngleText: createDebugText('purple', 100),
      debugTouchCount: createDebugText('purple', -100),
      accumulatedAngle: 0,
      accumulatedScale: 1,
      accumulatedOffsetX: 0,
      accumulatedOffsetY: 0,
      accumulatedWheel: 0,
      accumulatedMouseX: 0,
      accumulatedMouseY: 0,
      createDebugCircle: createDebugCircle,
      createDebugAngle: createDebugAngle,
      createDebugScale: createDebugScale,
      createDebugText: createDebugText,
      refresh() {
        this.touches.forEach(t => t.refresh())
        this.debugMouseWheel.refresh()
        this.debugMousePointer.refresh()
        this.debugMousePointerInitial.refresh()
        this.debugTouchCenter.refresh()
        this.debugTouchCenterInitial.refresh()
        this.debugTouchAngle.refresh()
        this.debugTouchAngleText.refresh()
        this.debugTouchScale.refresh()
        this.debugTouchCount.refresh()
      }
    }
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

  function render() {
    if(elRotator) {
      elRotator.setAttribute('transform', 
        'translate('+(debug.accumulatedMouseX+debug.accumulatedOffsetX)+','+(debug.accumulatedMouseY+debug.accumulatedOffsetY)+')' + ' ' +
        'rotate('+rad2Deg(debug.accumulatedAngle)+')' + ' ' +
        'scale('+(Math.exp(debug.accumulatedWheel/100)*debug.accumulatedScale)+')'
       )
    }
  }

  function runSubTick() {

  }

  function runTick() {
    runSubTick()
    for(var t=0;t<4;t++) {
      runSubTick()
    }
    debug.refresh()
    render()
  }

  function onAnimationFrame() {
    runTick()
    requestNextFrame()
  }

  //--

  function onWheel(evt) {
    evt.preventDefault()
    debug.debugMouseWheel.setVisible(true)
    debug.accumulatedWheel += (evt.deltaY || evt.deltaX) / -20
    debug.debugMouseWheel.setValue(rad2Deg(debug.accumulatedWheel))
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
      targetRect, 
      svgElement.clientWidth, svgElement.clientHeight, 
      viewBox
    )



    if(initial) {
      controls.mouse.initialPressed = local

      debug.debugMousePointer.setVisible(true)
      debug.debugMousePointerInitial.setVisible(true)
      debug.debugMousePointerInitial.setPosition(local.x, local.y)
    } else if(controls.mouse.previousPressed) {
      var translationDeltaX = controls.mouse.previousPressed.x - local.x
      var translationDeltaY = controls.mouse.previousPressed.y - local.y


      debug.accumulatedMouseX = debug.accumulatedMouseX - translationDeltaX
      debug.accumulatedMouseY = debug.accumulatedMouseY - translationDeltaY
    }

    debug.debugMousePointer.setPosition(local.x, local.y)
    controls.mouse.previousPressed = local
  }

  function onMouseUp(evt) {
    if(controls.mouse.pressed) {
      controls.mouse.pressed = false
      onMousePressedUp(evt)
    }
  }

  function onMousePressedUp(evt) {
      debug.debugMousePointer.setVisible(false)
      debug.debugMousePointerInitial.setVisible(false)
  }

  function onClick(evt) {
    
  }

  function onDoubleClick(evt) {
    
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

  function normalizeAngle(a) {
    while(a<-Math.PI) {
      a+= Math.PI*2
    }
    while(a>Math.PI) {
      a-= Math.PI*2
    }

    return a
  }

  function rotationDelta(angleA, angleB, count = 1) {
    return normalizeAngle(angleA - angleB) / count
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

  function rad2Deg(rad) {
    return rad * 180 / Math.PI
  }

  function deg2Rad(rad) {
    return rad * Math.PI / 180
  }

  function roundDigits(num, digs) {
    var factor = (2<<digs)
    return Math.round(num * factor) / factor
  }

  function onTouchStart(evt) {
    evt.preventDefault()
    var len = evt.changedTouches.length;
    while(len--) {
      debug.touches.push(debug.createDebugCircle())
    }

    var newIds = Array.prototype.map.call(evt.changedTouches, t => t.identifier)
    controls.touch.ids.push(...newIds)

    onTouchUpdate(evt, true)
  }

  function onTouchMove(evt) {
    onTouchUpdate(evt)
  }

  function onTouchUpdate(evt, initial) {
    const targetRect = svgElement.getBoundingClientRect();
    var currentTouches = Array.prototype.filter.call(evt.touches, t => controls.touch.ids.indexOf(t.identifier) > -1)

    for(var t=currentTouches.length;t--;t>=0) {
      var clientX = currentTouches[t].clientX
      var clientY = currentTouches[t].clientY

      var local = screenToSVG(
        clientX, clientY,
        targetRect, 
        svgElement.clientWidth, svgElement.clientHeight, 
        viewBox
      )
      debug.touches[t].setVisible(true)
      debug.touches[t].setPosition(local.x, local.y)
    }

    debug.debugTouchCenter.setVisible(currentTouches.length > 1)
    debug.debugTouchCenterInitial.setVisible(currentTouches.length > 1)
    debug.debugTouchAngle.setVisible(currentTouches.length > 1)
    debug.debugTouchAngleText.setVisible(currentTouches.length > 1)
    debug.debugTouchScale.setVisible(currentTouches.length > 1)
    if(currentTouches.length > 1) {
      var touchCenter = getTouchCenter(currentTouches)
      var prevCenter = initial ? touchCenter : controls.touch.previousCenter
      var initialCenter = initial ? touchCenter : controls.touch.initialCenter
      var touchRadius = getTouchRadius(currentTouches, prevCenter)
      var touchAngle = getTouchAngle(currentTouches, prevCenter)

      var localCenter = screenToSVG(
        touchCenter.x, touchCenter.y,
        targetRect, 
        svgElement.clientWidth, svgElement.clientHeight, 
        viewBox
      );

      var localCenterInitial = screenToSVG(
        initialCenter.x, initialCenter.y,
        targetRect, 
        svgElement.clientWidth, svgElement.clientHeight, 
        viewBox
      );

      if(!initial && controls.touch.previousAngle !== null && touchAngle !== null) {
        var angleDela = rotationDelta(touchAngle, controls.touch.previousAngle, currentTouches.length)
        debug.accumulatedAngle = sumAngle(debug.accumulatedAngle, angleDela)
        var scaleFactor = touchRadius/controls.touch.previousDistance;
        debug.accumulatedScale = debug.accumulatedScale * scaleFactor
        var translationDeltaX = controls.touch.previousCenter.x - touchCenter.x
        var translationDeltaY = controls.touch.previousCenter.y - touchCenter.y
        debug.accumulatedOffsetX = debug.accumulatedOffsetX - translationDeltaX
        debug.accumulatedOffsetY = debug.accumulatedOffsetY - translationDeltaY
      }
      controls.touch.previousAngle = touchAngle
      controls.touch.previousDistance = touchRadius
      controls.touch.previousCenter = touchCenter

      if(initial) {
        controls.touch.initialAngle = touchAngle
        controls.touch.initialDistance = touchRadius
        controls.touch.initialCenter = touchCenter
      }
    }
    debug.debugTouchCount.setVisible(currentTouches.length > 0)
    debug.debugTouchCount.setValue(currentTouches.length)
    debug.debugTouchCenter.setPosition(localCenter.x, localCenter.y)
    debug.debugTouchCenterInitial.setPosition(localCenterInitial.x, localCenterInitial.y)
    debug.debugTouchAngle.setValue(debug.accumulatedAngle)
    debug.debugTouchAngleText.setValue(Math.round(debug.accumulatedAngle*10)/10)
    debug.debugTouchScale.setValue(touchRadius)
  }

  function onTouchEnd(evt) {
    var removedIds = Array.prototype.map.call(evt.changedTouches, t => t.identifier)
    controls.touch.ids = controls.touch.ids.filter(id => removedIds.indexOf(id) < 0)

    while(debug.touches.length > controls.touch.ids.length) {
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

  var animationFrame = null
  var animationRunning = false

  function requestNextFrame() {
    if(animationRunning) {
      animationFrame = requestAnimationFrame(onAnimationFrame)
    }
  }

  function attachAnimation() {
    animationRunning = true
    requestNextFrame()
  }

  function detachAnimation() {
    animationRunning = false
    cancelAnimationFrame(animationFrame)
  }

  function attachEventHandlers() {
    svgElement.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('click', onClick)
    window.addEventListener('dblclick', onDoubleClick)
    svgElement.addEventListener('contextmenu', onContextMenu)

    svgElement.addEventListener('wheel', onWheel)


    svgElement.addEventListener('touchstart', onTouchStart)
    window.addEventListener('touchmove', onTouchMove)
    window.addEventListener('touchend', onTouchEnd)
    window.addEventListener('touchcancel', onTouchCancel)
  }

  function detachEventHandlers() {
    window.removeEventListener('touchcancel', onTouchCancel)
    window.removeEventListener('touchend', onTouchEnd)
    window.removeEventListener('touchmove', onTouchMove)
    svgElement.removeEventListener('touchstart', onTouchStart)


    svgElement.removeEventListener('wheel', onWheel)

    svgElement.removeEventListener('contextmenu', onContextMenu)
    window.removeEventListener('dblclick', onDoubleClick)
    window.removeEventListener('click', onClick)
    window.removeEventListener('mouseup', onMouseUp)
    window.removeEventListener('mousemove', onMouseMove)
    svgElement.removeEventListener('mousedown', onMouseDown)
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

  function screenToSVG(x, y, rect, localWidth, localHeight, viewBox) {
    const offsetX = x - rect.left
    const offsetY = y - rect.top
    const relativeX = offsetX / rect.width
    const relativeY = offsetY / rect.height

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
  var elDebugger = svgElement.querySelector('[show-debug]')

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

  var debug = setupDebugger(elDebugger)



  attachEventHandlers()
  attachAnimation()
}