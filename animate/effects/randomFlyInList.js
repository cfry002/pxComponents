// randomFlyInList.js

px.import({
    randomFlyIn : 'randomFlyIn.js',    
    fadeout     : 'fadeout.js',
    math:'../../math.js'
}).then(function importsAreReady(imports) {

    var imageRenderer = imports.imageRenderer,
        randomFlyIn = imports.randomFlyIn,
        fadeout = imports.fadeout, 
        math = imports.math()

    module.exports = function(uiImageList,config,scene,callback) {

        // a stack to keep track of all the image rendered to the screen
        var animateStack = []

        // recursive function that applies animation to a list of function
        // the animation is sequential
        var animateImageFromList = function(index) {

            // render all the animation in the list and afterward invoke the callback
            if (index < uiImageList.length) {
				uiImageList[index].config.rotation=config.rotation;
                // TODO - nice to have pre-loading of a certain set of images prior
                randomFlyIn(uiImageList[index],scene,function(uiImage){

                    // record the image into the stack
                    animateStack.push(uiImage.container)

                    // reset the index, if the settings call for looping
                    if (config.loop) {

                        if (index+1 == uiImageList.length) {
                            index = -1                      // set the index
                        } 

                        // TODO : the following operations should probably be
                        // part of some cleanup function

                        // get rid of the oldest image on the screen by fade out
                        // If we are looping, just hide the image so we don't have 
                        // to recreate a new one the next time we loop through to show it
                        if (animateStack.length > config.maxImagesOnScreen - 1) {
                            var container = animateStack.shift()
                            fadeout(container,scene,function(c){
                                c.a = 0;
                                c.x = (math.randomInt(0,1)==0)?-1000:c.parent.w+2000;
                                c.y = (math.randomInt(0,1)==0)?c.parent.h-4000:c.parent.h+2000;
                                c.sx = 2;
                                c.sy = 2;
                                //console.log("c x = "+c.x);
                                //console.log("c y = "+c.y);
                            })
                        }
                    }

                    animateImageFromList(index + 1)         // recurse
                })
            } else {
                // final callback - when all animations have been applied
                callback()
            }
        }

        // start the recursion
        animateImageFromList(0)
    }
})
