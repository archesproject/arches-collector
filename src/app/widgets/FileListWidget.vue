<template>
    <div v-if="context=='editor'">
        <div class="editor widget-label file-widget">{{widget.label}}</div>
        <ons-row class="file-widget">
            <ons-col v-if="!value">No images yet collected</ons-col>
            <ons-col v-if="value">
                <ons-row v-for="file in value.files">
                    <ons-col>{{file.name}}</ons-col>
                    <ons-col>{{file.type}}</ons-col>
                </ons-row>
            </ons-col>
        </ons-row>
        <ons-row class="file-widget">
            <ons-col><v-ons-button @click="takePhoto"><v-ons-icon class="camera-icon" icon="ion-camera"></v-ons-icon><span class="btn-text">Take Photo</span></v-ons-button></ons-col>
            <ons-col><v-ons-button @click="selectPhoto"><v-ons-icon class="folder-icon" icon="ion-folder"></v-ons-icon><span class="btn-text">Select Photo</span></v-ons-button></ons-col>
        </ons-row>
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
    mounted() {
        this.init()
    },
    methods: {
        init: function(){
            console.log(this.value);
        },
        updateList: function() {
            this.$emit('update:value', ret);
        },
        takePhoto: function() {
            var options = this.setOptions(Camera.PictureSourceType.CAMERA, true);
            this.getPhoto(options);
        },
        selectPhoto: function() {
            var options = this.setOptions(Camera.PictureSourceType.PHOTOLIBRARY, false);
            this.getPhoto(options);
        },
        getPhoto: function(options) {
            var self = this;
            navigator.camera.getPicture(function cameraSuccess(imageUri) {
                console.log('here we do something with our file', imageUri);
                self.attachImage(imageUri);
                navigator.camera.cleanup(self.onCleanupSuccess, self.onCleanupFail);
            }, function cameraError(error) {
                console.debug("Unable to obtain picture: " + error, "app");
            }, options);
        },
        attachImage: function(imgUri) {
            var image = {
                name: "some photo.jpg",
                type: "image/jpeg"
            };
            if (this.value) {
                this.value.files.push(image);
            } else {
                this.value = {files:[image]}
            }
            console.log(JSON.parse(JSON.stringify(this.value)));
            console.log(this.tile);
        },
        setOptions(srcType, saveToAlbum) {
            var options = {
                quality: 50,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: srcType,
                encodingType: Camera.EncodingType.JPEG,
                mediaType: Camera.MediaType.PICTURE,
                saveToPhotoAlbum: saveToAlbum,
                allowEdit: false,
                correctOrientation: true
            }
            return options;
        },
        onCleanupSuccess() {
            console.log("Camera cleanup success.")
        },
        onCleanupFail(message) {
            console.log('Failed because: ' + message);
        }
    },
    computed: {
    }
};
/*
{
    "41d064e3-f367-11e8-b0d1-c4b301baab9f": [
        {
            "url": "/files/uploadedfiles/Photo_on_3-16-18_at_11.49_AM_2_keJCgpc.jpg",
            "name": "Photo on 3-16-18 at 11.49 AM #2.jpg",
            "size": 168641,
            "type": "image/jpeg",
            "index": 0,
            "width": 1080,
            "height": 720,
            "status": "uploaded",
            "content": "blob:http://localhost:8000/96d93563-4953-4f83-aa1a-4a3c24f08ba9",
            "file_id": "309989c7-f420-11e8-9771-c4b301baab9f",
            "accepted": true,
            "lastModified": 1521226186044
        }
    ]
}
*/
</script>

<style scoped>
.file-widget {
    padding-top: 5px;
    padding-bottom: 5px;
}
.btn-text {
    padding-left: 5px;
}
</style>
