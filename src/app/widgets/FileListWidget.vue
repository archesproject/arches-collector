<template>
    <div v-if="context=='editor'">
        <div class="editor-panel">
            <div class="editor widget-label">{{widget.label}}</div>
            <v-ons-col class="widget-value" v-if="!value">No image selected yet</v-ons-col>
            <v-ons-list class="photo-list">
                <v-ons-list-item v-for="file in value" :key="file.file_id">
                    <div class="left">
                      <img class="image-thumbnail" v-bind:alt="file.name" v-bind:src="images[file.file_id]"></img>
                    </div>
                    <div class="center">
                        <input class="photo-name" underbar placeholder="Photo name" v-on:keyup="updateImages" v-model="file.name"></input>
                    </div>
                    <div class="right">
                        <v-ons-col width="10%"><v-ons-button @click="removePhoto(file)" class="right warning"><v-ons-icon class="fa5 fa-trash" icon="fa-trash"></v-ons-icon></v-ons-button></v-ons-col>
                    </div>
                </v-ons-list-item>
            </v-ons-list>

            <div class="button-panel">
                <v-ons-button class="file-button relative select-photo" @click="selectPhoto">
                    <div class="icon-circle"></div>
                    <v-ons-icon class="folder-icon" icon="fa-folder-open-o"></v-ons-icon>
                    <span class="btn-text">Select Photo</span>
                </v-ons-button>
                <v-ons-button class="file-button relative take-photo" @click="takePhoto">
                    <div class="icon-circle"></div>
                    <v-ons-icon class="camera-icon" icon="fa-camera"></v-ons-icon>
                    <span class="btn-text">Take Photo</span>
                </v-ons-button>
            </div>

        </div>

    </div>

    <v-ons-row class="report-widget" v-else-if="context=='report'">
        <v-ons-list class="photo-list">
            <v-ons-list-item v-for="file in value" :key="file.file_id">
              <v-ons-col>
                <img class="image-thumbnail" alt="star" v-bind:src="images[file.file_id]"></img>
              </v-ons-col>
              <v-ons-col class="" style="margin-left: -40px; padding-right: 10px; color: #777;">{{file.name}}</v-ons-col>
            </v-ons-list-item>
        </v-ons-list>
    </v-ons-row>
    <span class="flex tile-data" v-else-if="context=='nav'">
        <div class="flex">
            <template v-if="value.length > 0">
                <span style="display: inline;" v-for="(file, index) in value" :key="file.file_id">
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
import * as blobUtil from 'blob-util';
export default {
    name: 'FileListWidget',
    props: ['value', 'widget', 'context', 'tile', 'node'],
    data() {
        return {
            activeServer: this.$store.getters.activeServer,
            activeProject: this.$store.getters.activeProject,
            images: {}
        };
    },
    mounted() {
        this.init();
    },
    methods: {
        init: function() {
            var self = this;
            if (self.tile._attachments) {
                self.$store.dispatch('getAttachments', self.tile).then(function(attachments) {
                    var cachedAttachments = {};
                    attachments.forEach(function(attachment) {
                        cachedAttachments[attachment[0]] = attachment[1];
                    });
                    self.value.forEach(function(photo) {
                        var blob = cachedAttachments[photo.file_id];
                        blobUtil.blobToBase64String(blob).then(function(base64String) {
                            setTimeout(function() {
                                if (self.value.length > 0) {
                                    self.value[0].name = self.value[0].name + ' ';
                                    self.value[0].name = self.value[0].name.trimRight();
                                    self.images[photo.file_id] = 'data:image/jpeg;base64,' + base64String;
                                }
                            }, self.value.length * 100);
                        }).catch(function(err) {
                            console.log(err);
                        });
                    });
                });
            }
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
                console.debug('Unable to obtain picture: ' + error, 'app');
            }, options);
        },
        attachImage: function(imgUri) {
            var self = this;
            var image = {
                name: '' + '.jpg',
                type: 'image/jpeg',
                file_id: uuidv4()
            };

            var thumbnailSize = this.activeProject.image_size_limits.thumb;
            var fullsizeImageLimit = this.activeProject.image_size_limits.full;

            this.resizeImage(false, thumbnailSize, imgUri)
                .then(function(resizedImg) {
                    var parts = self.dataURItoParts(resizedImg);
                    if (!self.tile._attachments) {
                        self.tile._attachments = {};
                    }
                    self.tile._attachments[image.file_id] = {
                        content_type: 'image/jpg',
                        data: parts.base64Data
                    };
                    return self.resizeImage(fullsizeImageLimit, false, imgUri);
                })
                .then(function(resizedFullImg) {
                    var parts = self.dataURItoParts(resizedFullImg);
                    if (self.value) {
                        image.name = (self.value.length + 1) + image.name;
                        self.value.push(image);
                    } else {
                        image.name = '1' + image.name;
                        self.value = [image];
                    }

                    if (!self.tile._fullSizeAttachments) {
                        self.tile._fullSizeAttachments = {};
                    }
                    self.tile._fullSizeAttachments[image.file_id] = {
                        _attachments: {},
                        nodeid: self.node.nodeid,
                        tileid: self.tile.tileid,
                        file_id: image.file_id,
                        file_name: image.name,
                        _id: image.file_id
                    };
                    self.tile._fullSizeAttachments[image.file_id]._attachments[image.file_id] = {
                        content_type: 'image/jpg',
                        data: parts.base64Data
                    };

                    self.$emit('update:value', self.value);
                });
        },
        removePhoto: function(image) {
            var i = this.value.findIndex(function(item) { return item.file_id === image.file_id; });
            this.value.splice(i, 1);
            delete this.tile._attachments[image.file_id];
            this.$store.dispatch('removeFullSizeImage', image.file_id);
            this.$emit('update:value', this.value);
        },
        setOptions(srcType, saveToAlbum) {
            var options = {
                quality: 100,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: srcType,
                encodingType: Camera.EncodingType.JPEG,
                mediaType: Camera.MediaType.PICTURE,
                saveToPhotoAlbum: saveToAlbum,
                allowEdit: false,
                correctOrientation: true
            };
            return options;
        },
        resizeImage(targetImageSize, longSideMax, imgUri) {
            // inspired from https://www.zyxware.com/articles/5130/resizing-image-taken-using-camera-in-cordovaphonegap-app
            var self = this;
            return new Promise(
                function(resolve, reject) {
                    var tempImg = new Image();
                    tempImg.src = imgUri;
                    tempImg.onload = function() {
                        var drawScaledImage = function() {
                            // Get image size and aspect ratio.
                            var targetWidth, targetHeight;
                            var aspect = tempImg.width / tempImg.height;

                            // Calculate shorter side length, keeping aspect ratio on image.
                            // If source image size is less than given longSideMax, then it need to be
                            // considered instead.
                            if (tempImg.width > tempImg.height) {
                                longSideMax = Math.min(tempImg.width, longSideMax);
                                targetWidth = longSideMax;
                                targetHeight = longSideMax / aspect;
                            } else {
                                longSideMax = Math.min(tempImg.height, longSideMax);
                                targetHeight = longSideMax;
                                targetWidth = longSideMax * aspect;
                            }

                            // Create canvas of required size.
                            var canvas = document.createElement('canvas');
                            canvas.width = targetWidth;
                            canvas.height = targetHeight;

                            var ctx = canvas.getContext('2d');
                            // Take image from top left corner to bottom right corner and draw the image
                            // on canvas to completely fill into.
                            ctx.drawImage(tempImg, 0, 0, targetWidth, targetHeight);
                            resolve(canvas.toDataURL('image/jpeg', 1.0));
                        };

                        if (targetImageSize) {
                            targetImageSize = targetImageSize / 1.3;
                            longSideMax = Math.max(tempImg.width, tempImg.height);
                            self.getImageSize(imgUri)
                                .then(function(imageSize) {
                                    // re calc longSideMax if the image needs to be reduced
                                    if (imageSize > targetImageSize) {
                                        var f = Math.sqrt(targetImageSize / imageSize);
                                        longSideMax = Math.max(f * tempImg.width, f * tempImg.height);
                                    }
                                    drawScaledImage();
                                })
                                .catch(function() {
                                    // if there's an error then just draw the image at original size
                                    drawScaledImage();
                                });
                        } else {
                            drawScaledImage();
                        }
                    };
                }
            );
        },
        getImageSize: function(imgUri) {
            return new Promise(
                function(resolve, reject) {
                    var tempImg = new Image();
                    tempImg.src = imgUri;
                    tempImg.onload = function() {
                        try {
                            var canvas = document.createElement('canvas');
                            canvas.width = tempImg.width;
                            canvas.height = tempImg.height;

                            var ctx = canvas.getContext('2d');
                            ctx.drawImage(tempImg, 0, 0, tempImg.width, tempImg.height);
                            canvas.toBlob(function(blob) {
                                resolve(blob.size);
                            }, 'image/jpeg', 1);
                        } catch (err) {
                            reject(err);
                        }
                    };
                }
            );
        },
        dataURItoParts(dataURI) {
            return {
                mimeString: dataURI.split(',')[0].split(':')[1].split(';')[0],
                base64Data: dataURI.split(',')[1]
            };
        },
        dataURItoBlob(dataURI) {
            // https://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata/5100158#5100158
            // convert base64/URLEncoded data component to raw binary data held in a string
            var parts = this.dataURItoParts(dataURI);
            var byteString;
            if (parts.base64Data.split(',')[0].indexOf('base64') >= 0) {
                byteString = atob(parts.base64Data.split(',')[1]);
            } else {
                byteString = unescape(parts.base64Data.split(',')[1]);
            }

            // write the bytes of the string to a typed array
            var ia = new Uint8Array(byteString.length);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            return new Blob([ia], {type: parts.mimeString});
        },
        onCleanupSuccess() {
            console.log('Camera cleanup success.');
        },
        onCleanupFail(message) {
            console.log('Failed because: ' + message);
        },
        updateImages() {
            this.$emit('update:value', this.value);
        }
    },
    watch: {
        value: function(val) {
            var self = this;
            self.value.forEach(function(photo) {
                if (self.tile._attachments && self.tile._attachments[photo.file_id] && self.tile._attachments[photo.file_id].data) {
                    self.images[photo.file_id] = 'data:image/jpeg;base64,' + self.tile._attachments[photo.file_id].data;
                }
            });
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
  color: #bbb;
}
.widget-label {
  font-weight: 400;
  color: #fbfbfb;
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
    background: #2d3c4b;
}

.button-panel {
    /* margin-left: -5px; */
    /* margin-right: -15px; */
    margin-left: -17px;
    margin-right: -7px;
    top: 86px;
    min-height: 180px;
    position: relative;
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
    background: rgba(28,47,66, .6);
    border-top: 1px solid #0E2031;
    border-radius: 0px;
    box-shadow: none;
}

.button--material .btn-text {
    font-weight: 600;
}

.file-button:last-child {
    border-bottom: 1px solid #0E2031;
    margin-bottom: 20px;
}

.widget > .editor-panel {
    margin-left: -15px;
    margin-right: -15px;
    margin-bottom: -15px;
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
    color: #ddd;
}

.icon-circle {
    box-sizing: border-box;
    border: solid 1px #0E2031;
    border-radius: 50%;
    height: 40px;
    width: 40px;
    background: #A8EEE9;
}

.select-photo .icon-circle {
    background: #60CBF9;
    border: solid 1px #0E2031;
}

.select-photo .folder-icon {
    color: #0173A4;
}

.take-photo .icon-circle {
    margin-top: -2px;
}

.take-photo .btn-text {
    top: 10px;
}

.tile-data {
    background: #fafafa;
    color: #888;
    margin-left: -5px;
    padding-left: 5px;
}

.tile-data .widget-label {
    color: #271F4C;
    font-size: 13px;
    padding-bottom: 10px;
}
</style>
