// pxImageRenderer.js

px.import({
    topShadow:'effects/topShadow.js',
    dropShadow:'effects/dropShadow.js',
    polaroid:'effects/polaroid.js',
    reflection:'effects/reflection.js',
    border:'effects/border.js',

}).then(function importsAreReady(imports) {

    var defaultUrl = "http://www.pxscene.org/examples/px-reference/gallery/images/sparkle_small.png"
    var effectFunctions = { 
        topShadow   : imports.topShadow,
        dropShadow  : imports.dropShadow,
        polaroid    : imports.polaroid,
        reflection  : imports.reflection,
        border      : imports.border,
    }
   
    var preEffects = ['dropShadow','polaroid','border']
    var postEffects = ['topShadow','reflection']

    module.exports = function(scene) { 

        return {
            // renders a single image and returns a Promise
            render  : function(uiImage,callback) {

                if (uiImage.effects)

                    return this._renderWithEffects(uiImage, callback)
                else {

                    var image = scene.create(uiImage.config)

                    return image.ready.then(function(image){
                        console.log('image is loaded')
                        uiImage['image'] = image 
                        callback(uiImage)
                    })  
                }         
            },
            // renders a list of images
            renderList  : function(uiImageList,callback,finalCallback){

                var promises =[]
                var p = {}
                for (var i = 0;i < uiImageList.length; i++) {
                    var image = this.render(uiImageList[i],function(uiImage){
                        p[uiImage.config.url] = uiImage
                        callback(uiImage)                        
                    })
                    promises.push(image)
                }
                Promise.all(promises).then(function(promises){
                    var imgList = []
                    for (var k = 0; k < uiImageList.length;k++) {
                        imgList.push(p[uiImageList[k].config.url])
                    }
                    finalCallback(imgList)
                })
            },
            _renderWithEffects : function(uiImage,callback) {
                
                var effects = uiImage.effects.effects

                var callbackList = []
                var applyEffectFunction = function(effect){
                    if (effects[effect]) {
                        effectFunctions[effect](scene,uiImage,callbackList)
                    }
                }

                // first create the container, NOTE - this creates an 'object' type pxscene object
                // so it will not be visible. It is merely a container
                var container = scene.create(uiImage.config)

                uiImage['container'] = container

                preEffects.forEach(applyEffectFunction)

                // then create the image, with the container above as parent
                var imageConfig = {t:'image',url:uiImage.config.url,parent:container}
                // if the image is a rectangle then use the original config
                if (uiImage.originalT == 'rect'){
                    imageConfig.w = uiImage.config.w
                    imageConfig.h = uiImage.config.h
                    imageConfig.t = 'rect'
                    imageConfig.parent = container
                }

                var defaultImageConfig = {t:'image',url:defaultUrl,parent:container}

                if (uiImage.config.w && uiImage.config.h) {
                    imageConfig.w = uiImage.config.w
                    imageConfig.h = uiImage.config.h
                    defaultImageConfig.w = uiImage.config.w
                    defaultImageConfig.h = uiImage.config.h
                }
                if (uiImage.config.stretchX && uiImage.config.stretchY) {
                    imageConfig.stretchX = uiImage.config.stretchX
                    imageConfig.stretchY = uiImage.config.stretchY
                    defaultImageConfig.stretchX = uiImage.config.stretchX
                    defaultImageConfig.stretchY = uiImage.config.stretchY
                }

                var image = scene.create(imageConfig)

                postEffects.forEach(applyEffectFunction)

                // when the image is loaded call all the callbacks that may have been added by the 
                // individual effect function before invoking the final callback defined by the Callee
                return image.ready.then(function(image){

                    uiImage['image'] = image 

                    // we determine the containers scale here, to avoid re-calculating it when
                    // applying callbacks for all the effects
                    var scale = (container.sx<container.sy)?container.sx:container.sy;

                    callbackList.forEach(function(element,index,array){
                        element(uiImage,scale)
                    })
                    if (callback != null) {
                        callback(uiImage)
                    }

                }).catch( function(err){
                    if (err.resource.loadStatus.httpStatusCode = 404) {

                        // if there is a url load issue then replace this with a placeholder

                        console.log('Error loading image ' + err.url + ' assigning default image with container - ' + uiImage['container'])
                        defaultImageConfig.t = 'rect'
                        defaultImageConfig.url = null
                        var defaultImage = scene.create(defaultImageConfig)

                        uiImage['image'] = defaultImage
                        
                        if (callback != null) {
                            callback(uiImage)
                        }
                        return defaultImage
                    } else {
                        console.error("Error in image on load ")
                        console.log(err)
                    }
                })
            }
        }
    }
}).catch( function(err){
    console.error("Error in Image Renderer: ")
    console.log(err)
});
