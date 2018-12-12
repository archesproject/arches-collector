<template>
    <div v-if="context=='editor'">
        <div class="editor widget-label">{{widget.label}}</div>
            <ons-col v-if="!value">No images yet collected</ons-col>
            <ons-list class="photo-list">
                <ons-list-item v-for="file in value">
                  <div class="left">
                    <img class="list-item__thumbnail" v-bind:src="thumbnails[file.file_id]"></img>
                  </div>
                  <div class="center">
                      <v-ons-input underbar placeholder="Photo name" v-on:keyup="updateImages" v-model="file.name"></v-ons-input>
                  </div>
                  <div class="right">
                      <ons-col width="10%"><v-ons-button @click="removePhoto(file)" class="right"><v-ons-icon class="fa5 fa-trash" icon="fa-trash"></v-ons-icon></v-ons-button></ons-col>
                  </div>
                </ons-list-item>
            </ons-list>
        <ons-row class="file-widget">
            <ons-col><v-ons-button @click="selectPhoto"><v-ons-icon class="folder-icon" icon="ion-folder"></v-ons-icon><span class="btn-text">Select Photo</span></v-ons-button></ons-col>
            <ons-col><v-ons-button @click="getPhoto"><v-ons-icon class="camera-icon" icon="ion-camera"></v-ons-icon><span class="btn-text">Take Photo</span></v-ons-button></ons-col>
        </ons-row>

    </div>
    <ons-row class="report-widget" v-else-if="context=='report'">
        <ons-list class="photo-list">
            <ons-list-item v-for="file in value">
              <div class="left">
                <img class="list-item__thumbnail" v-bind:src="thumbnails[file.file_id]"></img>
              </div>
              <div class="center" style="padding-left: 15px">{{file.name}}</div>
            </ons-list-item>
        </ons-list>
    </ons-row>
</template>


<script>
import uuidv4 from 'uuid/v4';
export default {
    name: 'FileListWidget',
    props: ['value', 'widget', 'context', 'tile'],
    data() {
        return {
            activeServer: this.$store.getters.activeServer
        };
    },
    mounted() {
        this.init()
    },
    methods: {
        init: function(){
            console.log(this.value)
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
                self.attachImage(imageUri);
                navigator.camera.cleanup(self.onCleanupSuccess, self.onCleanupFail);
            }, function cameraError(error) {
                console.debug("Unable to obtain picture: " + error, "app");
            }, options);
        },
        attachImage: function(imgUri) {
            var image = {
                name: "" + ".jpg",
                type: "image/jpeg",
                file_id: uuidv4()
            };
            if (this.value) {
                image.name = (this.value.length + 1) + image.name
                this.value.push(image);
            } else {
                image.name = "1" + image.name;
                this.value = [image]
            }
            if (!this.tile._attachments) {
                this.tile._attachments = {};
            }
            this.tile._attachments[image.file_id] = {
                content_type: 'image/jpg',
                data: imgUri
            };
            this.$emit('update:value', this.value);
        },
        removePhoto: function(image) {
            console.log('deleting', image);
            var i = this.value.findIndex(function(item) {return item.file_id === image.file_id});
            this.value.splice(i, 1);
            if (this.tile._attachments[image.file_id]) {
                delete this.tile._attachments[image.file_id]
            } else if (this.tile._attachments[image.name]) {
                delete this.tile._attachments[image.file_id]
            } else {
                console.log('no attachments')
            }
            this.$emit('update:value', this.value);
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
        },
        updateImages() {
            this.$emit('update:value', this.value);
        }
    },
    computed: {
        thumbnails: function(){
            var res = {}
            var self = this;
            this.value.forEach(function(photo){
                if (self.tile._attachments && self.tile._attachments[photo.file_id] && self.tile._attachments[photo.file_id].data) {
                    res[photo.file_id] = "data:image/png;base64," + self.tile._attachments[photo.file_id].data
                } else {
                    res[photo.file_id] = self.activeServer.url + photo.url;
                }
            })
            return res
        }
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
    padding-top: 20px;
    padding-bottom: 5px;
}
.btn-text {
    padding-left: 5px;
}
.photo-list {
    width: 100%;
    background: none;
}
</style>
