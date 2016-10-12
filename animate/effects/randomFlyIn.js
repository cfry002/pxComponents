// randomFlyIn.js
// applies a random fly in animation on the PxImage

px.import({
    imageRenderer:'../../image/imageRenderer.js',
    math:'../../math.js'
}).then(function importsAreReady(imports) {

    var imageRenderer = imports.imageRenderer,
        math = imports.math()

    module.exports = function(uiImage,scene,callback) {

        // setup the image starting location - outside the view area, as we want the image to 'fly-in' from
        // outside the view port
        uiImage.config.x = (math.randomInt(0,1)==0)?-1000:scene.w+2000
        uiImage.config.y = math.randomInt(-200, 800)
        
        var effects = uiImage.effects.effects

        // first render the image to the random location out of the viewport and then move it into the scene
        imageRenderer(scene).render(uiImage,function(uiImage){

            var picture = uiImage["container"]
            var image = uiImage["image"]

            var targetSx = uiImage.originalSx,
                targetSy = uiImage.originalSy,
                x = math.randomInt(50,scene.w-(image.resource.w*uiImage.originalSx)-50),
                y = math.randomInt(50,scene.h-(image.resource.h*uiImage.originalSy)-50)

            picture.sx = 2
            picture.sy = 2

            // we need to do more math to determine random X/Y targets if the image
            // supports polaroid effect
            if (effects['polaroid']) {
                targetSy = targetSx = 1
                var polaroidWidth = effects['polaroid'].w

                var sidePadding = effects['polaroid'].sidePadding
                var topPadding = effects['polaroid'].topPadding
                var bottomPadding = effects['polaroid'].bottomPadding

                // pick a random number - in this case either 15 or 11
                // I settled on these two angles because currently it doesn't appear
                // anti aliasing is supported in PxScene, and these give me the least 
                // amount of jagged edges (45 degrees is not an ideal value for 
                // viewing photos)
                var rotation = math.randomIntFromList([-15,11])
                // Support turning off rotation 
                if( uiImage.config.rotation == 0) {
                  rotation = 0;
                }

                x = math.randomInt(50,scene.root.w - polaroidWidth - (sidePadding*2))

                // here we set the Y range for the random function
                var ymin = bottomPadding / 2 + topPadding / 2,
                    ymax = 0.25 * effects['polaroid'].w - topPadding    // 0.25 is arrived by Sin(15/Sin(90)

                // if the angle rotation is positive the bottom of the polaroid may be cropped,
                // therefore adjust the ymin and ymax
                if (rotation >= 0) {
                    ymin = 0
                    ymax = topPadding
                }
                y = math.randomInt(ymin,ymax)
            }

            // apply the animation and invoke the callback when the promise is returned
            picture.animateTo({
                            x   :   x,
                            y   :   y, 
                            r   :   rotation,
                            sx  :   targetSx,
                            sy  :   targetSy
                        },2,scene.animation.TWEEN_STOP,scene.animation.OPTION_LOOP, 1)
                    .then(function(){
                        callback(uiImage)
                    })
        })
    }
})
