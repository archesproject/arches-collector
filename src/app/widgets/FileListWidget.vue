<template>
    <div v-if="context=='editor'">
        <div class="editor-panel">
            <div class="editor widget-label">{{widget.label}}</div>
            <ons-col class="widget-value" v-if="!value">No image selected yet</ons-col>
            <ons-list class="photo-list">
                <ons-list-item v-for="file in value">
                    <div class="left">
                      <img class="image-thumbnail-input" v-bind:src="thumbnails[file.file_id]"></img>
                    </div>
                    <div class="center">
                        <v-ons-input class="photo-name" underbar placeholder="Photo name" v-on:keyup="updateImages" v-model="file.name"></v-ons-input>
                    </div>
                    <div class="right">
                        <ons-col width="10%"><v-ons-button @click="removePhoto(file)" class="right warning"><v-ons-icon class="fa5 fa-trash" icon="fa-trash"></v-ons-icon></v-ons-button></ons-col>
                    </div>
                </ons-list-item>
            </ons-list>
        </div>

        <!-- <ons-row class="file-widget" style="display: none;">
            <ons-col class="button-column"><v-ons-button class="file-button btn-mint" @click="selectPhoto"><v-ons-icon class="folder-icon" icon="ion-folder"></v-ons-icon><span class="btn-text">Select Photo</span></v-ons-button></ons-col>
            <ons-col class="button-column"><v-ons-button class="file-button btn-mint" @click="takePhoto"><v-ons-icon class="camera-icon" icon="ion-camera"></v-ons-icon><span class="btn-text">Take Photo</span></v-ons-button></ons-col>
        </ons-row> -->

        <div class="button-panel">
            <v-ons-button class="file-button relative select-photo" @click="selectPhoto">
                <div class="icon-circle"></div>
                <v-ons-icon class="folder-icon" icon="ion-folder"></v-ons-icon>
                <span class="btn-text">Select Photo</span>
            </v-ons-button>
            <v-ons-button class="file-button relative take-photo" @click="takePhoto">
                <div class="icon-circle"></div>
                <v-ons-icon class="camera-icon" icon="ion-camera"></v-ons-icon>
                <span class="btn-text">Take Photo</span>
            </v-ons-button>
        </div>
    </div>

    <ons-row class="report-widget" v-else-if="context=='report'">
        <ons-list class="photo-list">
            <ons-list-item v-for="file in value">
              <ons-col>
                <img class="image-thumbnail" v-bind:src="thumbnails[file.file_id]"></img>
              </ons-col>
              <ons-col class="" style="margin-left: -40px; padding-right: 10px; color: #777;">{{file.name}}</ons-col>
            </ons-list-item>
        </ons-list>
    </ons-row>
    <span class="flex tile-data" v-else-if="context=='nav'">
        <div class="flex">
            <template v-if="value.length > 0">
                <span style="display: inline;" v-for="(file, index) in value">
                    <span v-if="index < 2"><span v-if="index > 0 && index < 2">, </span>{{file.name}}</span>
                    <span v-else-if="index == 2">, ...</span>
                </span>
            </template>
            <div v-else>no data</div>
        </div>
        <div class="widget-label">{{widget.label}}</div>
    </span>
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

</script>

<style scoped>
.list-item--material__center .photo-name {
    padding-left: 15px;
    width: calc(100% - 10px);
}
.photo-name {
    width: calc(100% - 10px);
}
.widget-value {
  color: #999;
}
.widget-label {
  font-weight: 400;
  color: #271F4C;
  padding-right: 5px;
}
.button-column {
    padding-left: 5px;
    padding-right: 5px;
}
.file-button {
    width: 100%;
    text-align: center;
}

.warning {
  background: red;
}
.btn-mint {
  background: #29b2a6;
}
.file-widget {
    padding-top: 20px;
    padding-bottom: 5px;
}

.photo-list {
    width: 100%;
    background: none;
}
.image-thumbnail {
    border-radius: 1px;
    height: 100px;
    width: auto;
    margin-left: -20px;
    padding: 5px 0 0 0;
}
.image-thumbnail-input {
    border-radius: 1px;
    height: 60px;
    width: auto;
    margin-left: -20px;
    padding: 5px 0 0 0;
}



.editor-panel {
    margin-top: -15px;
    /* margin-left: -15px;
    margin-right: -15px; */
    padding: 20px 10px 30px 20px;
    background: #fbfbfb;
}

.button-panel {
    margin-left: -5px;
    /* margin-right: -15px; */
}

.file-button {
    float: right;
    height: 60px;
    color: #2E9C94;
    font-weight: 500;
    text-transform: capitalize;
    text-align: left;
    padding: 10px 20px;
    /* background: #DEFBF9; */
    background: #fff;
    border-top: 1px solid #78D9D2;
    border-radius: 0px;
    box-shadow: none;
}

.button--material .btn-text {
    font-weight: 600;
}

.file-button:last-child {
    border-bottom: 1px solid #78D9D2;
}

.widget > .editor-panel {
    margin-left: -15px;
    margin-right: -15px;
}

.widget > .button-panel {
    margin-left: -15px;
    margin-right: -15px;
}

.relative {
    position: relative;
}

.folder-icon {
    position: absolute;
    top: 17px;
    left: 32px;
}

.camera-icon {
    position: absolute;
    top: 15px;
    left: 31px;
}

.btn-text {
    position: absolute;
    font-size: 15px;
    top: 12px;;
    left: 70px;
}

.icon-circle {
    box-sizing: border-box;
    border: solid 1px #78D9D2;
    border-radius: 50%;
    height: 40px;
    width: 40px;
    background: #A8EEE9;
}

.take-photo .icon-circle {
    margin-top: -2px;
}

.take-photo .btn-text {
    top: 10px;
}


</style>
