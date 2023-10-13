function makeInteractive(svgElement) {
  var xmlnsSvg = "http://www.w3.org/2000/svg";

	var screenSize = {
    width: 0,
    height: 0,
  }

  var controls = {
  	mouse: {
  		isPressed: false,
  		movementDistance: 0,
      previousPressedPosition: null,
      initialPressedPosition: null,
      initialShift: false,
      initialAlt: false,
      initialCtrl: false,
  	},
    wheel: {
      time: null,
    },
  	touch: {
  		ids: [],
      positions: [],
      previousDistance: null,
      previousAngle: null,
      previousCenterLocal: null,
      previousCenterGlobal: null,
      initialDistance: null,
      initialAngle: null,
      initialCenterLocal: null,
      initialCenterGlobal: null,
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

  var softBounds = {
    width: Infinity,
    height: Infinity,
    minX: -Infinity,
    maxX: Infinity,
    minY: -Infinity,
    maxY: Infinity,
    minZoom: -Infinity,
    maxZoom: Infinity,
    minAngle: -Infinity,
    maxAngle: Infinity,
  };

  var hardBounds = {
    width: Infinity,
    height: Infinity,
    minX: -Infinity,
    maxX: Infinity,
    minY: -Infinity,
    maxY: Infinity,
    minZoom: -Infinity,
    maxZoom: Infinity,
    minAngle: -Infinity,
    maxAngle: Infinity,
  };

  function setupDebugger(containerElement) {
    function createDebugCircle(color = 'magenta', radius = 50) {
      var _cx = 0, _cy = 0, _show = false;

      var circle = containerElement.ownerDocument.createElementNS(xmlnsSvg, 'circle')
      circle.classList.add('debug-helper')
      circle.setAttribute('r', radius)
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

    var touchPositions = [];
    var debugTouchScale = createDebugScale('cyan')
    var debugMouseWheel = createDebugAngle()
    var debugMousePointerInitial = createDebugCircle('pink', 40)
    var debugMousePointer = createDebugCircle('magenta', 20)
    var debugTouchCenter = createDebugCircle('red')
    var debugTouchCenterInitial = createDebugCircle('green')
    var debugTouchAngle = createDebugAngle(200, 'magenta')
    var debugTouchAngleText = createDebugText('purple', 100)
    var debugTouchCount = createDebugText('purple', -100)

    return {
      accumulatedAngle: 0,
      accumulatedScale: 1,
      accumulatedOffsetX: 0,
      accumulatedOffsetY: 0,
      accumulatedWheel: 0,
      accumulatedMouseX: 0,
      accumulatedMouseY: 0,
      refresh() {
        debugMouseWheel.setVisible(true)
        debugMouseWheel.setValue(deg2Rad(this.accumulatedWheel) * 2)

        while(touchPositions.length < controls.touch.positions.length) {
          var newCircle = createDebugCircle()
          touchPositions.push(newCircle)
        }

        debugMousePointer.setVisible(controls.mouse.isPressed)
        debugMousePointerInitial.setVisible(controls.mouse.isPressed)
        if(controls.mouse.initialPressedPosition) {
          debugMousePointerInitial.setPosition(controls.mouse.initialPressedPosition.x, controls.mouse.initialPressedPosition.y)
        }
        if(controls.mouse.previousPressedPosition) {
          debugMousePointer.setPosition(controls.mouse.previousPressedPosition.x, controls.mouse.previousPressedPosition.y)
        }

        touchPositions.forEach(t => t.setVisible(false))

        for(var t=0;t<controls.touch.positions.length;t++) {
          var p = controls.touch.positions[t];
          touchPositions[t].setVisible(true)
          touchPositions[t].setPosition(p.x, p.y)
        }

        debugTouchCenter.setVisible(controls.touch.positions.length > 1)
        debugTouchCenterInitial.setVisible(controls.touch.positions.length > 1)
        debugTouchAngle.setVisible(controls.touch.positions.length > 1)
        debugTouchAngleText.setVisible(controls.touch.positions.length > 1)
        debugTouchScale.setVisible(controls.touch.positions.length > 1)
        debugTouchCount.setVisible(controls.touch.positions.length > 0)
        debugTouchCount.setValue(controls.touch.positions.length)

        if(controls.touch.previousCenterLocal) {
          debugTouchCenter.setPosition(controls.touch.previousCenterLocal.x, controls.touch.previousCenterLocal.y)
        }

        if(controls.touch.initialCenterLocal) {
          debugTouchCenterInitial.setPosition(controls.touch.initialCenterLocal.x, controls.touch.initialCenterLocal.y)
        }

        if(controls.touch.previousDistance) {
          debugTouchScale.setValue(controls.touch.previousDistance)
        }

        debugTouchAngle.setValue(this.accumulatedAngle)
        debugTouchAngleText.setValue(Math.round(rad2Deg(controls.touch.previousAngle)))

        touchPositions.forEach(t => t.refresh())
        debugMouseWheel.refresh()
        debugMousePointer.refresh()
        debugMousePointerInitial.refresh()
        debugTouchCenter.refresh()
        debugTouchCenterInitial.refresh()
        debugTouchAngle.refresh()
        debugTouchAngleText.refresh()
        debugTouchScale.refresh()
        debugTouchCount.refresh()
      }
    }
  }

  function setSoftBounds(minX, minY, maxX, maxY) {
    softBounds.width = isFinite(minX) && isFinite(maxX) ? (maxX - minX) : Infinity
    softBounds.height = isFinite(minX) && isFinite(maxX) ? (maxY - minY) : Infinity
    softBounds.minX = minX
    softBounds.minY = minY
    softBounds.maxX = maxX
    softBounds.maxY = maxY
    softBounds.minAngle = -Infinity
    softBounds.maxAngle = Infinity
    softBounds.minZoom = -1
    softBounds.maxZoom = 4
  }

  function setHardBounds(minX, minY, maxX, maxY) {
    hardBounds.width = isFinite(minX) && isFinite(maxX) ? (maxX - minX) : Infinity
    hardBounds.height = isFinite(minX) && isFinite(maxX) ? (maxY - minY) : Infinity
    hardBounds.minX = minX
    hardBounds.minY = minY
    hardBounds.maxX = maxX
    hardBounds.maxY = maxY
  }

  function clamp(v, min=-Infinity, max=Infinity) {
    return Math.max(min, Math.min(max, v))
  }

  function softClamp(v, a, b, stiffness = 0.9) {
    var min = Math.min(a, b)
    var max = Math.max(a, b)
    var softness = 1-stiffness;
    var clamped = clamp(v, min, max)

    return clamped * stiffness + v * softness
  }

  function clamp2d(x, y, minX=-Infinity, minY=-Infinity, maxX=Infinity, maxY=Infinity, angle = 0) {
    var width = maxX - minX
    var height = maxY - minY
    var boundsCenterX = (minX + maxX) / 2
    var boundsCenterY = (minY + maxY) / 2
    var boundsHalfWidth = width / 2
    var boundsHalfHeight = height / 2

    var sin_a = Math.sin(-angle);
    var cos_a = Math.cos(-angle);
    var xA = (cos_a * boundsHalfWidth) - (sin_a * boundsHalfHeight)
    var yA = (sin_a * boundsHalfWidth) + (cos_a * boundsHalfHeight)
    var xB = (cos_a * -boundsHalfWidth) - (sin_a * boundsHalfHeight)
    var yB = (sin_a * -boundsHalfWidth) + (cos_a * boundsHalfHeight)
    var xC = (cos_a * boundsHalfWidth) - (sin_a * -boundsHalfHeight)
    var yC = (sin_a * boundsHalfWidth) + (cos_a * -boundsHalfHeight)
    var xD = (cos_a * -boundsHalfWidth) - (sin_a * -boundsHalfHeight)
    var yD = (sin_a * -boundsHalfWidth) + (cos_a * -boundsHalfHeight)

    var halfWidth = Math.max(Math.abs(xA), Math.abs(xB), Math.abs(xC), Math.abs(xD))
    var halfHeight = Math.max(Math.abs(yA), Math.abs(yB), Math.abs(yC), Math.abs(yD))

    var fromCenterX = x-boundsCenterX
    var fromCenterY = y-boundsCenterY

    var rotatedX = cos_a*fromCenterX - -sin_a*fromCenterY
    var rotatedY = -sin_a*fromCenterX + cos_a*fromCenterY

    var camClampedX = clamp(rotatedX, -halfWidth, +halfWidth)
    var camClampedY = clamp(rotatedY, -halfHeight, +halfHeight)

    var invRotX = cos_a*camClampedX - sin_a*camClampedY
    var invRotY = sin_a*camClampedX + cos_a*camClampedY

    var clampedX = boundsCenterX + invRotX
    var clampedY = boundsCenterY + invRotY

    return {
      x: isFinite(width) ? clampedX : x,
      y: isFinite(height) ? clampedY : y,
    }
  }

  function softClamp2d(x, y, minX, minY, maxX, maxY, angle = 0, stiffness = 0.9) {
    var softness = 1-stiffness;
    var clamped = clamp2d(x, y, minX, minY, maxX, maxY, angle)

    return {
      x: clamped.x * stiffness + x * softness,
      y: clamped.y * stiffness + y * softness,
    }
  }

  function performZoom(pivotX, pivotY, factor) {
    if(factor === 1) {
      return
    }

    var newZoom = camera.target.zoom * factor
    var clampedZoom = clamp(newZoom, hardBounds.minZoom, hardBounds.maxZoom)
    var realFactor = clampZoom(newZoom) / clampZoom(camera.target.zoom)
    camera.target.zoom = clampedZoom

    var panFactor = 1 - 1 / realFactor;

    var newX = camera.target.x + (pivotX - camera.target.x) * panFactor
    var newY = camera.target.y + (pivotY - camera.target.y) * panFactor
    var dx = newX - camera.target.x
    var dy = newY - camera.target.y
   
    performPan(dx, dy)
  }

  function performPan(deltaX, deltaY) {
    if(deltaX === 0 && deltaY === 0) {
      return
    }

    var newX = camera.target.x + deltaX
    var newY = camera.target.y + deltaY

    var clampedXY = clamp2d(newX, newY, hardBounds.minX, hardBounds.minY,hardBounds.maxX,hardBounds.maxY, camera.target.angle)

    camera.target.x = clampedXY.x
    camera.target.y = clampedXY.y
  }

  function performRotation(pivotX, pivotY, angleRad) {
    if(angleRad === 0) {
      return 0
    }
    var newAngle = camera.target.angle + angleRad

    var clampedAngle = clamp(newAngle, hardBounds.minAngle, hardBounds.maxAngle)
    var angleDelta = clampedAngle - camera.target.angle

    camera.target.angle = clampedAngle

    var dxPivot = camera.target.x - pivotX;
    var dyPivot = camera.target.y - pivotY;
    var sin = Math.sin(-angleDelta)
    var cos = Math.cos(-angleDelta)

    var newX = pivotX + (cos * dxPivot - sin * dyPivot)
    var newY = pivotY + (sin * dxPivot + cos * dyPivot)

    var dx = newX - camera.target.x
    var dy = newY - camera.target.y
   
    performPan(dx, dy)
  }

  function performGesture(gesture) {
    performZoom(gesture.pivot.x, gesture.pivot.y, gesture.scale)
    performRotation(gesture.pivot.x, gesture.pivot.y, gesture.angle)
    performPan(gesture.panX, gesture.panY)
  }

  function retargetCamera() {
    
  }

  function retargetCameraInverse() {
    
  }

  //--

  function render() {
    if(elRotator) {
      elRotator.setAttribute('transform', 
        (canPan ? ('translate('+(-camera.current.x)+','+(-camera.current.y)+') ') : '') +
        (canRotate ? ('rotate('+rad2Deg(camera.current.angle)+' '+camera.current.x+' '+camera.current.y+') ') : '') +
        (canPan ? ('translate('+(camera.current.x)+','+(camera.current.y)+') ') : '') +
        (canZoom ? ('scale('+(camera.current.zoom)+')') : '') 
        + (canPan ? ('translate('+(-camera.current.x)+','+(-camera.current.y)+') ') : '')
       )
    }
  }

  function runSubTick(dt, last) {
    var boundsWidthHalf = (softBounds.maxX - softBounds.minX) / 2
    var boundsHeightHalf = (softBounds.maxY - softBounds.minY) / 2
    var boundsCX = (softBounds.maxX + softBounds.minX) / 2
    var boundsCY = (softBounds.maxY + softBounds.minY) / 2
    var b = 1/Math.min(camera.current.zoom*1.41, 1/1.41)

    var clampedXY = softClamp2d(
      camera.target.x, camera.target.y, 
      boundsCX - boundsWidthHalf*b, boundsCY - boundsHeightHalf*b, 
      boundsCX + boundsWidthHalf*b, boundsCY + boundsHeightHalf*b,
      camera.target.angle,
      0.5
    )

    camera.current.zoom = clampZoom(camera.target.zoom)
    camera.current.x = clampedXY.x
    camera.current.y = clampedXY.y
    camera.current.angle = softClamp(camera.target.angle, softBounds.minAngle, softBounds.maxAngle, 0.9)

    if(!controls.mouse.isPressed) {
      camera.target.zoom = Math.exp(Math.log(camera.current.zoom)*0.1+Math.log(camera.target.zoom)*0.9)
      camera.target.x = (camera.current.x*0.1+camera.target.x*0.9)
      camera.target.y = (camera.current.y*0.1+camera.target.y*0.9)
      camera.target.angle = (camera.current.angle*0.1+camera.target.angle*0.9)
    }
  }

  function clampZoom(target) {
    return Math.exp(softClamp(Math.log(target), softBounds.minZoom, softBounds.maxZoom, 0.9))
  }

  function runTick(dt) {
    var targetFrameLength = 4
    var subFrames = Math.floor(dt / targetFrameLength)
    for(var i=1;i<=subFrames;i++) {
      runSubTick(dt/subFrames, i===subFrames)
    }
    debug.refresh()
    render()
  }

  function onAnimationFrame(prevTime, time) {
    runTick(time - prevTime)
    requestNextFrame(time)
  }

  //--

  function onWheel(evt) {
    evt.preventDefault()
    const targetRect = svgElement.getBoundingClientRect();
    var local = screenToSVG(
      evt.clientX, evt.clientY,
      targetRect, 
      svgElement.clientWidth, svgElement.clientHeight, 
      viewBox
    )

    var d = (evt.deltaY || evt.deltaX) / -38
    debug.accumulatedWheel += d

    if(!controls.mouse.isPressed) {
      if(evt.ctrlKey) {
        performGesture({
          pivot: svgToCamera(local),
          panX: 0,
          panY: 0,
          angle: d / 20,
          scale: 1,
        })
      } else {
        performGesture({
          pivot: svgToCamera(local),
          panX: 0,
          panY: 0,
          angle: 0,
          scale: Math.exp(d / 20),
        })
      }
    } else {
      if(!controls.mouse.initialCtrl && !controls.mouse.initialShift) {
        performGesture({
          pivot: svgToCamera(local),
          panX: 0,
          panY: 0,
          angle: 0,
          scale: Math.exp(d / 20),
        })
      } else if(!controls.mouse.initialCtrl && controls.mouse.initialShift) {
        performGesture({
          pivot: svgToCamera(controls.mouse.initialPressedPosition),
          panX: 0,
          panY: 0,
          angle: d / 20,
          scale: 1,
        })
      } else {
        performGesture({
          pivot: svgToCamera(controls.mouse.initialPressedPosition),
          panX: 0,
          panY: 0,
          angle: 0,
          scale: Math.exp(d / 20),
        })
      }
    }
  }

  //--

  function onContextMenu(evt) {
    evt.preventDefault()
  }

  function onMouseDown(evt) {
    if(!controls.mouse.isPressed) {
      controls.mouse.isPressed = true
      onMouseMovePressed(evt, true)
    }
  }

  function onMouseMove(evt) {
    if(!controls.mouse.isPressed) {
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
      controls.mouse.initialPressedPosition = local
      controls.mouse.initialAlt = evt.altKey
      controls.mouse.initialShift = evt.shiftKey
      controls.mouse.initialMeta = evt.metaKey
      controls.mouse.initialCtrl = evt.ctrlKey
    } else if(controls.mouse.previousPressedPosition) {
      var translationDeltaX = controls.mouse.previousPressedPosition.x - local.x
      var translationDeltaY = controls.mouse.previousPressedPosition.y - local.y

      debug.accumulatedMouseX = debug.accumulatedMouseX - translationDeltaX
      debug.accumulatedMouseY = debug.accumulatedMouseY - translationDeltaY

      var dxA = controls.mouse.previousPressedPosition.x - controls.mouse.initialPressedPosition.x
      var dyA = controls.mouse.previousPressedPosition.y - controls.mouse.initialPressedPosition.y
      var dxB = local.x - controls.mouse.initialPressedPosition.x
      var dyB = local.y - controls.mouse.initialPressedPosition.y
      var rotA = Math.atan2(dyA, dxA)
      var rotB = Math.atan2(dyB, dxB)

      if(controls.mouse.initialShift && controls.mouse.initialCtrl) {
        performGesture({
          pivot: svgToCamera(controls.mouse.initialPressedPosition),
          panX: 0,
          panY: 0,
          angle: Math.hypot(dxB, dyB) > 30 ? rotationDelta(rotB, rotA, 1) : 0,
          scale: Math.exp((Math.hypot(dxB, dyB)-Math.hypot(dxA, dyA))/500),
          //angle: (dxB-dxA)/300,
          //scale: Math.exp((dyB-dyA)/300),
        })
      } else if(controls.mouse.initialCtrl) {
        if(Math.hypot(dxB, dyB) > 30) {
          performGesture({
            pivot: svgToCamera(controls.mouse.initialPressedPosition),
            panX: 0,
            panY: 0,
            angle: rotationDelta(rotB, rotA, 1),
            scale: 1,
            //scale: Math.exp((Math.hypot(dxB, dyB)-Math.hypot(dxA, dyA))/500),
            //angle: (dxB-dxA)/300,
            //scale: Math.exp((dyB-dyA)/300),
          })
        }
      } else if(controls.mouse.initialShift) {
        var dxA = controls.mouse.previousPressedPosition.x - controls.mouse.initialPressedPosition.x
        var dyA = controls.mouse.previousPressedPosition.y - controls.mouse.initialPressedPosition.y
        var dxB = local.x - controls.mouse.initialPressedPosition.x
        var dyB = local.y - controls.mouse.initialPressedPosition.y
        var rotA = Math.atan2(dyA, dxA)
        var rotB = Math.atan2(dyB, dxB)

        if(Math.hypot(dxB, dyB) > 30) {
          performGesture({
            pivot: svgToCamera(controls.mouse.initialPressedPosition),
            panX: 0,
            panY: 0,
            angle: 0,
            scale: Math.exp(((dxB-dxA) + (dyA-dyB))/500),
            // alternative translation:
            //angle: (dxB-dxA)/300,
            //scale: Math.exp((dyB-dyA)/300),
          })
        }
      } else {
        performGesture({
          pivot: svgToCamera(controls.mouse.initialPressedPosition),
          panX: 1/camera.current.zoom * (Math.cos(-camera.current.angle) * translationDeltaX - Math.sin(-camera.current.angle) * translationDeltaY),
          panY: 1/camera.current.zoom * (Math.sin(-camera.current.angle) * translationDeltaX + Math.cos(-camera.current.angle) * translationDeltaY),
          angle: 0,
          scale: 1,
        })
      }
    }

    controls.mouse.previousPressedPosition = local
  }

  function onMouseUp(evt) {
    if(controls.mouse.isPressed) {
      controls.mouse.isPressed = false

      onMousePressedUp(evt)

      controls.mouse.movementDistance = 0
      controls.mouse.previousPressedPosition = null
      controls.mouse.initialPressedPosition = null
      controls.mouse.initialAlt = false
      controls.mouse.initialShift = false
      controls.mouse.initialMeta = false
      controls.mouse.initialCtrl = false
    }
  }

  function onMousePressedUp(evt) {

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

    controls.touch.positions.length = currentTouches.length

    for(var t=currentTouches.length;t--;t>=0) {
      var clientX = currentTouches[t].clientX
      var clientY = currentTouches[t].clientY

      var local = screenToSVG(
        clientX, clientY,
        targetRect, 
        svgElement.clientWidth, svgElement.clientHeight, 
        viewBox
      )

      controls.touch.positions[t] = local
    }

    if(currentTouches.length > 1) {
      var touchCenterGlobal = getTouchCenter(currentTouches)
      var prevCenterGlobal = initial ? touchCenterGlobal : controls.touch.previousCenterGlobal
      var initialCenterGlobal = initial ? touchCenterGlobal : controls.touch.initialCenterGlobal
      var touchRadius = getTouchRadius(currentTouches, prevCenterGlobal)
      var touchAngle = getTouchAngle(currentTouches, prevCenterGlobal)

      var touchCenterLocal = screenToSVG(
        touchCenterGlobal.x, touchCenterGlobal.y,
        targetRect, 
        svgElement.clientWidth, svgElement.clientHeight, 
        viewBox
      );

      var initialCenterLocal = screenToSVG(
        initialCenterGlobal.x, initialCenterGlobal.y,
        targetRect, 
        svgElement.clientWidth, svgElement.clientHeight, 
        viewBox
      );

      if(!initial && controls.touch.previousAngle !== null && touchAngle !== null) {
        var angleDela = rotationDelta(touchAngle, controls.touch.previousAngle, currentTouches.length)
        var scaleFactor = touchRadius/controls.touch.previousDistance;
        var translationDeltaX = controls.touch.previousCenterLocal.x - touchCenterLocal.x
        var translationDeltaY = controls.touch.previousCenterLocal.y - touchCenterLocal.y

        performGesture({
          pivot: svgToCamera(controls.touch.previousCenterLocal),
          panX: 1/camera.current.zoom * (Math.cos(-camera.current.angle) * translationDeltaX - Math.sin(-camera.current.angle) * translationDeltaY),
          panY: 1/camera.current.zoom * (Math.sin(-camera.current.angle) * translationDeltaX + Math.cos(-camera.current.angle) * translationDeltaY),
          angle: angleDela,
          scale: scaleFactor,
        })

        debug.accumulatedAngle = sumAngle(debug.accumulatedAngle, angleDela)
        debug.accumulatedScale = debug.accumulatedScale * scaleFactor
        debug.accumulatedOffsetX = debug.accumulatedOffsetX - translationDeltaX
        debug.accumulatedOffsetY = debug.accumulatedOffsetY - translationDeltaY
      } else if(initial) {
        controls.touch.initialAngle = touchAngle
        controls.touch.initialDistance = touchRadius

        controls.touch.initialCenterGlobal = initialCenterGlobal
        controls.touch.initialCenterLocal = touchCenterLocal

        debug.accumulatedAngle = 0
        debug.accumulatedScale = 1
        debug.accumulatedOffsetX = 0
        debug.accumulatedOffsetY = 0
      }

      controls.touch.previousAngle = touchAngle
      controls.touch.previousDistance = touchRadius
      controls.touch.previousCenterGlobal = touchCenterGlobal
      controls.touch.previousCenterLocal = touchCenterLocal
    }
  }

  function onTouchEnd(evt) {
    var removedIds = Array.prototype.map.call(evt.changedTouches, t => t.identifier)
    controls.touch.ids = controls.touch.ids.filter(id => removedIds.indexOf(id) < 0)

    onTouchUpdate(evt, true)
  }

  function onTouchCancel(evt) {
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
  var prevAniationTime = null

  function requestNextFrame(prevTime) {
    if(animationRunning) {
      animationFrame = requestAnimationFrame(onAnimationFrame.bind(null, prevTime))
    }
  }

  function attachAnimation() {
    animationRunning = true
    requestNextFrame(performance.now())
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

  function svgToCamera(pos) {
    var camCos = Math.cos(-camera.current.angle)
    var camSin = Math.sin(-camera.current.angle)

    return {
      x: camera.current.x + (camCos * (pos.x) - camSin * (pos.y)) / camera.current.zoom,
      y: camera.current.y + (camSin * (pos.x) + camCos * (pos.y)) / camera.current.zoom,
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
  setSoftBounds(viewBox.minX, viewBox.minY, viewBox.minX + viewBox.width, viewBox.minY + viewBox.height)

  // console.log(
  // 	!!viewBoxPan,
	// 	!!viewBoxZoom,
	// 	!!viewBoxBounds,
	// 	!!elRotator,
	// 	!!elBounds,
  //   viewBox
  // )

	svgElement.classList.toggle('is-zoomable', canZoom)
	svgElement.classList.toggle('is-rotatable', canRotate)
	svgElement.classList.toggle('is-draggable', canPan)

  var debug = setupDebugger(elDebugger)



  attachEventHandlers()
  attachAnimation()
}