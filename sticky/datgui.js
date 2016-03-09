var config = { "tick": true, "friction": .9, "linkStrength": 1, "linkDistance": 150, "charge": .6, "gravity": .01, "theta": .8 }
var gui = new dat.GUI()

var fl = gui.addFolder("Force Layout")
fl.open()

var tickChanger = fl.add(config, "tick")
tickChanger.onChange(function(value) {
  value ? force.start() : force.stop()
})

var frictionChanger = fl.add(config, "friction", 0, 1)
frictionChanger.onChange(function(value) {
  force.friction(value)
  force.start()
})

var linkDistanceChanger = fl.add(config, "linkDistance", 0, 50)
linkDistanceChanger.onChange(function(value) {
  force.linkDistance(value)
  force.start()
})

var linkStrengthChanger = fl.add(config, "linkStrength", 0, 1)
linkStrengthChanger.onChange(function(value) {
  force.linkStrength(value)
  force.start()
})

var chargeChanger = fl.add(config,"charge", 0, 5)
chargeChanger.onChange(function(value) {
  force.charge(-value)
  force.start()
})

var gravityChanger = fl.add(config,"gravity", 0, 1)
gravityChanger.onChange(function(value) {
  force.gravity(value)
  force.start()
})

var thetaChanger = fl.add(config,"theta", 0, 1)
thetaChanger.onChange(function(value) {
  force.theta(value)
  force.start()
})