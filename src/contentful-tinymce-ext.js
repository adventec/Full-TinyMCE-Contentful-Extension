window.contentfulExtension.init(function (api) {
    const apiKey = api.parameters.installation.apiKey;
    const channel = api.parameters.installation.channel;
    const spaceId = api.ids.space;
    const environmentId = api.ids.environment;
    const accessToken = api.parameters.installation.cmaToken;
    const sub = location.host == "contentful.staging.tiny.cloud" ? "cloud-staging" : "cloud";
    // const tinymceUrl = "https://" + sub + ".tinymce.com/" + channel + "/tinymce.min.js?apiKey=" + apiKey;
    const tinymceUrl = "https://cdn.tiny.cloud/1/" + apiKey + "/tinymce/" + channel + "/tinymce.min.js";

    /**
     * This function imports tinymce script including in the url the token 
     * @param {*} src 
     * @param {*} onload 
     */
    function loadScript(src, onload) {
        let script = document.createElement('script');
        script.setAttribute('src', src);
        script.setAttribute('referrerpolicy', "origin");
        script.onload = onload;
        document.body.appendChild(script);
    }

    loadScript(tinymceUrl, function () {
        tinymceForContentful(api);
    });
    
    function tinymceForContentful(api) {
        api.window.startAutoResizer();
        const toolbar1 = tweak(api.parameters.instance.toolbar1);
        const toolbar2 = tweak(api.parameters.instance.toolbar2);
        const menubar = tweak(api.parameters.instance.menubar);
        
        let fileName = '';
        let contentType = '';
        let assetUrl = "";

        function tweak(param) {
            var t = param.trim();
            if (t === "false") {
                return false;
            } else if (t === "") {
                return undefined;
            } else {
                return t;
            }
        }

        tinymce.init({
            selector: "#editor",
            plugins: api.parameters.instance.plugins,
            toolbar_mode: 'sliding',
            toolbar: [ toolbar1, toolbar2 ],
            menubar: menubar,
            max_height: 500,
            min_height: 300,
            autoresize_bottom_margin: 15,
            resize: false,
            file_picker_types: 'image',
            image_title: true,
            image_caption: true,            
            automatic_uploads: true, // Allows drag images into editor
            images_upload_url: "/some.js", // Set a value for images_upload_url and the "Upload tab" will be showed to pick an image from your system*/
            images_upload_base_path: "/some", // Shows a button to upload images
            file_picker_callback: function (success, value, meta) {
                /* When a function is assigned to this parameter, an "upload" button appears close to the file url field 
                   that gives the option of picking a file from the system to be uploaded. */
                /* Use the success callback to fill the fields (url, title, alt) */

                var input = document.createElement('input');
                input.setAttribute('type', 'file');
                input.setAttribute('accept', 'image/*');
                input.onchange = function () {
                    var file = this.files[0];
                    var reader = new FileReader();
                    reader.onload = function () {

                        /* Note: Now we need to register the blob in TinyMCEs image blob registry. 
                        In the next release this part hopefully won't be necessary, as we are looking to handle it internally. */

                        var id = 'blobid' + (new Date()).getTime();
                        var blobCache = tinymce.activeEditor.editorUpload.blobCache;
                        var base64 = reader.result.split(',')[1];
         
                        var blobInfoPicker = blobCache.create(id, file, base64);
                        blobCache.add(blobInfoPicker);

                        contentType = blobInfoPicker.blob().type;
                        fileName = file.name;
                        assetUrl="";

                        /* Upload the file and use the success callback to fill the fields (url, title, alt) */
                        upload(blobInfoPicker.blob(),success);
                    };
                    reader.readAsDataURL(file);
                };

                input.click();
            },
            images_upload_handler: function imagesUploadHandler(blobInfo, success, failure) {
                /* This function replaces the native default tiny mce upload function */
                /* Use the success callback to fill the fields (url, title, alt) */
                
                contentType = blobInfo.blob().type;
                fileName = blobInfo.filename();
                upload(blobInfo.blob(),success)
            },
            init_instance_callback: function (editor) {
                var listening = true;

                function getEditorContent() {
                    return editor.getContent() || '';
                }

                function getApiContent() {
                    return api.field.getValue() || '';
                }

                function setContent(x) {
                    var apiContent = x || '';
                    var editorContent = getEditorContent();
                    if (apiContent !== editorContent) {
                        //console.log('Setting editor content to: [' + apiContent + ']');
                        editor.setContent(apiContent);
                    }
                }

                setContent(api.field.getValue());

                api.field.onValueChanged(function (x) {
                    if (listening) {
                        setContent(x);
                    }
                });

                function onEditorChange() {
                    var editorContent = getEditorContent();
                    var apiContent = getApiContent();

                    if (editorContent !== apiContent) {
                        //console.log('Setting content in api to: [' + editorContent + ']');
                        listening = false;
                        api.field.setValue(editorContent).then(function () {
                            listening = true;
                        }).catch(function (err) {
                            console.log("Error setting content", err);
                            listening = true;
                        });
                    }
                }

                var throttled = _.throttle(onEditorChange, 500, { leading: true });
                editor.on('change keyup setcontent blur', throttled);
            }
        });
        
        function upload (blobInfo, success){
            const client = contentfulManagement.createClient({
                accessToken: accessToken
            });

            console.log('uploading image...');
            client.getSpace(spaceId)
            .then((space) => space.getEnvironment(environmentId))
            .then((environment) => environment.createAssetFromFiles({
                fields: {
                    title: {
                        'es': fileName.split('.').slice(0, -1).join('.')
                    }, 
                    description: {
                        'es': 'descripción'
                    },
                    file: {
                        'es': {
                            contentType: contentType,
                            fileName: fileName,
                            file: blobInfo
                        }
                    }
                }
            }))
            .then((asset) => asset.processForAllLocales())
            .then((asset) => asset.publish())
            .then((asset) => {
                assetUrl = asset.fields.file.es.url;
                console.log ("image uploaded")
                console.log ("assetUrl:  " + assetUrl )
                console.log('asset:' , asset)
                return true
            })
            .then(() => {
                console.log("image processed")
                success(assetUrl,{title: fileName, alt: fileName})
            })
            .catch(console.error)
        }
    }
});