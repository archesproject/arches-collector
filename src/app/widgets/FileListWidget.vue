<template>
    <div v-if="context=='editor'">
        <div class="editor widget-label">{{widget.label}}</div>
        <div class="done-btn"><v-ons-button @click="openCamera"><v-ons-icon class="camera-icon resource-header" icon="ion-camera"></v-ons-icon></v-ons-button></div>
    </div>
    <ons-row class="report-widget" v-else-if="context=='report'">
        <ons-col class="report widget-label">{{widget.label}}</ons-col>
        <ons-col class="report widget-value">{{value}}</ons-col>
    </ons-row>
</template>


<script>
export default {
    name: 'FileListWidget',
    props: ['value', 'widget', 'context'],
    data() {
        return {};
    },
    methods: {
        updateList: function() {
            this.$emit('update:value', ret);
        },
        openCamera: function() {
            console.log("new attempt")
            console.log(navigator.camera);
            var srcType = Camera.PictureSourceType.CAMERA;
            var options = this.setOptions(srcType);
            // var func = createNewFileEntry;
            navigator.camera.getPicture(function cameraSuccess(imageUri) {
                displayImage(imageUri);
                func(imageUri);
            }, function cameraError(error) {
                console.debug("Unable to obtain picture: " + error, "app");
            }, options);
        },
        displayImage(imgUri) {
            var elem = document.getElementById('imageFile');
            elem.src = imgUri;
        },
        setOptions(srcType) {
            var options = {
                // Some common settings are 20, 50, and 100
                quality: 50,
                destinationType: Camera.DestinationType.FILE_URI,
                // In this app, dynamically set the picture source, Camera or photo gallery
                sourceType: srcType,
                encodingType: Camera.EncodingType.JPEG,
                mediaType: Camera.MediaType.PICTURE,
                allowEdit: true,
                correctOrientation: true  //Corrects Android orientation quirks
            }
            return options;
        },
        onSuccess() {
            console.log("Camera cleanup success.")
        },
        onFail() {
            console.log('Failed because: ' + message);
        }
    },
    computed: {
    }
};
</script>

<style scoped>
</style>
